import User from '../models/User';
import { JwtService } from '../utils/jwt';
import { EmailService } from '../config/email';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { TokenPair, UserRole, UserStatus, ContactMethod } from '../types';
import logger from '../utils/logger';
import bcrypt from 'bcrypt';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    preferred_contact_method?: ContactMethod;
  }): Promise<{ user: User; tokens: TokenPair }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await User.create({
        email: data.email,
        password_hash: hashedPassword,
        name: data.name,
        phone: data.phone || null,
        preferred_contact_method: data.preferred_contact_method || ContactMethod.EMAIL,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        oauth_provider: 'local',
      });

      // Generate email verification token
      const verificationToken = await JwtService.setEmailVerificationToken(user);

      // Send welcome and verification emails
      await EmailService.sendWelcomeEmail(user.email, user.name || 'User');
      await EmailService.sendVerificationEmail(
        user.email,
        user.name || 'User',
        verificationToken
      );

      // Generate JWT tokens
      const tokens = await JwtService.generateTokenPair(user);

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return { user, tokens };
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    try {
      // Find user by email (explicitly include password_hash)
      const user = await User.findOne({
        where: { email },
        attributes: { include: ['password_hash'] }
      });
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        throw new AuthenticationError('Account is temporarily locked due to failed login attempts');
      }

      // Check if user is OAuth-only (no password)
      logger.debug('Login check', {
        email,
        hasPassword: !!user.password_hash,
        passwordHashLength: user.password_hash?.length
      });

      if (!user.password_hash) {
        throw new AuthenticationError('Please sign in with Google');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        user.failed_login_attempts += 1;

        // Lock account after 5 failed attempts
        if (user.failed_login_attempts >= 5) {
          user.account_locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          logger.warn('Account locked due to failed login attempts', { userId: user.id });
        }

        await user.save();
        throw new AuthenticationError('Invalid email or password');
      }

      // Check account status
      if (user.status !== UserStatus.ACTIVE) {
        throw new AuthenticationError('Account is not active');
      }

      // Reset failed login attempts
      user.failed_login_attempts = 0;
      user.account_locked_until = null;
      user.last_login = new Date();
      await user.save();

      // Generate JWT tokens
      const tokens = await JwtService.generateTokenPair(user);

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return { user, tokens };
    } catch (error) {
      logger.error('Login failed', { error, email });
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findByPk(payload.userId);
      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Validate refresh token against stored hash
      const isValid = await JwtService.validateRefreshToken(refreshToken, user);
      if (!isValid) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new token pair (token rotation)
      const tokens = await JwtService.generateTokenPair(user);

      logger.info('Token refreshed successfully', { userId: user.id });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  static async logout(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Revoke refresh token
      await JwtService.revokeRefreshToken(user);

      logger.info('User logged out successfully', { userId: user.id });
    } catch (error) {
      logger.error('Logout failed', { error, userId });
      throw error;
    }
  }

  static async verifyEmail(token: string): Promise<User> {
    try {
      const user = await JwtService.verifyEmailToken(token);

      logger.info('Email verified successfully', { userId: user.id, email: user.email });

      return user;
    } catch (error) {
      logger.error('Email verification failed', { error });
      throw error;
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    try {
      const user = await User.findOne({ where: { email } });

      // Don't reveal if user exists (security best practice)
      if (!user) {
        logger.info('Password reset requested for non-existent email', { email });
        return;
      }

      // Check if user is OAuth-only
      if (!user.password_hash) {
        logger.info('Password reset requested for OAuth user', { userId: user.id });
        return; // Don't send reset email for OAuth users
      }

      // Generate reset token
      const resetToken = await JwtService.setPasswordResetToken(user);

      // Send password reset email
      await EmailService.sendPasswordResetEmail(user.email, user.name || 'User', resetToken);

      logger.info('Password reset email sent', { userId: user.id, email: user.email });
    } catch (error) {
      logger.error('Forgot password failed', { error, email });
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await JwtService.resetPassword(token, newPassword);

      logger.info('Password reset successfully');
    } catch (error) {
      logger.error('Password reset failed', { error });
      throw error;
    }
  }

  static async getCurrentUser(userId: string): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get current user failed', { error, userId });
      throw error;
    }
  }
}

export default AuthService;
