import User from '../models/User';
import { AuthenticationError, NotFoundError } from '../utils/errors';
import { ContactMethod } from '../types';
import logger from '../utils/logger';

export class UserService {
  static async getProfile(userId: string): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get profile failed', { error, userId });
      throw error;
    }
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      preferred_contact_method?: ContactMethod;
      avatar?: string;
    }
  ): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update fields
      if (data.name !== undefined) user.name = data.name;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.preferred_contact_method !== undefined) {
        user.preferred_contact_method = data.preferred_contact_method;
      }
      if (data.avatar !== undefined) user.avatar = data.avatar;

      await user.save();

      logger.info('Profile updated successfully', { userId: user.id });

      return user;
    } catch (error) {
      logger.error('Update profile failed', { error, userId });
      throw error;
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user has a password (OAuth users don't)
      if (!user.password_hash) {
        throw new AuthenticationError('Cannot change password for OAuth users');
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password (will be hashed by beforeUpdate hook)
      user.password_hash = newPassword;
      await user.save();

      logger.info('Password changed successfully', { userId: user.id });
    } catch (error) {
      logger.error('Change password failed', { error, userId });
      throw error;
    }
  }

  static async updatePreferences(
    userId: string,
    data: {
      preferred_contact_method?: ContactMethod;
    }
  ): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (data.preferred_contact_method !== undefined) {
        user.preferred_contact_method = data.preferred_contact_method;
      }

      await user.save();

      logger.info('Preferences updated successfully', { userId: user.id });

      return user;
    } catch (error) {
      logger.error('Update preferences failed', { error, userId });
      throw error;
    }
  }

  static async deleteAccount(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Soft delete
      await user.destroy();

      logger.info('Account deleted successfully', { userId: user.id });
    } catch (error) {
      logger.error('Delete account failed', { error, userId });
      throw error;
    }
  }
}

export default UserService;
