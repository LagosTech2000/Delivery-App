import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export class UserController {
  static getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const user = await UserService.getProfile(userId);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      email_verified: user.email_verified,
      preferred_contact_method: user.preferred_contact_method,
      last_login: user.last_login,
      created_at: user.created_at,
    };

    ResponseHandler.success(res, { user: userResponse }, 'Profile retrieved successfully', 200);
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const { name, phone, preferred_contact_method, avatar } = req.body;

    const user = await UserService.updateProfile(userId, {
      name,
      phone,
      preferred_contact_method,
      avatar,
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      email_verified: user.email_verified,
      preferred_contact_method: user.preferred_contact_method,
      last_login: user.last_login,
      updated_at: user.updated_at,
    };

    ResponseHandler.success(res, { user: userResponse }, 'Profile updated successfully', 200);
  });

  static changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    await UserService.changePassword(userId, currentPassword, newPassword);

    ResponseHandler.success(res, null, 'Password changed successfully', 200);
  });

  static updatePreferences = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const { preferred_contact_method } = req.body;

    const user = await UserService.updatePreferences(userId, {
      preferred_contact_method,
    });

    const userResponse = {
      id: user.id,
      preferred_contact_method: user.preferred_contact_method,
      updated_at: user.updated_at,
    };

    ResponseHandler.success(res, { user: userResponse }, 'Preferences updated successfully', 200);
  });

  static deleteAccount = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    await UserService.deleteAccount(userId);

    ResponseHandler.success(res, null, 'Account deleted successfully', 200);
  });
}

export default UserController;
