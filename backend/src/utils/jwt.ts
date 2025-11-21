import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/environment';
import { JwtPayload, TokenPair } from '../types';
import { AuthenticationError } from './errors';
import User from '../models/User';

export class JwtService {
  private static accessTokenSecret = env.JWT_ACCESS_SECRET;
  private static refreshTokenSecret = env.JWT_REFRESH_SECRET;
  private static accessTokenExpiry = env.JWT_ACCESS_EXPIRY;
  private static refreshTokenExpiry = env.JWT_REFRESH_EXPIRY;

  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry as string,
    } as SignOptions);
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry as string,
    } as SignOptions);
  }

  static async generateTokenPair(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refresh_token_hash = refreshTokenHash;
    await user.save();

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  static async validateRefreshToken(token: string, user: User): Promise<boolean> {
    if (!user.refresh_token_hash) {
      return false;
    }

    try {
      this.verifyRefreshToken(token);
      return await bcrypt.compare(token, user.refresh_token_hash);
    } catch {
      return false;
    }
  }

  static async revokeRefreshToken(user: User): Promise<void> {
    user.refresh_token_hash = null;
    await user.save();
  }

  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async setEmailVerificationToken(user: User): Promise<string> {
    const token = this.generateEmailVerificationToken();
    user.email_verification_token = token;
    user.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();
    return token;
  }

  static async setPasswordResetToken(user: User): Promise<string> {
    const token = this.generatePasswordResetToken();
    user.password_reset_token = token;
    user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    return token;
  }

  static async verifyEmailToken(token: string): Promise<User> {
    const user = await User.findOne({
      where: {
        email_verification_token: token,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired verification token');
    }

    if (user.email_verification_expires && user.email_verification_expires < new Date()) {
      throw new AuthenticationError('Verification token has expired');
    }

    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    await user.save();

    return user;
  }

  static async verifyPasswordResetToken(token: string): Promise<User> {
    const user = await User.findOne({
      where: {
        password_reset_token: token,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    if (user.password_reset_expires && user.password_reset_expires < new Date()) {
      throw new AuthenticationError('Reset token has expired');
    }

    return user;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.verifyPasswordResetToken(token);

    user.password_hash = newPassword; // Will be hashed by the beforeUpdate hook
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();
  }
}

export default JwtService;
