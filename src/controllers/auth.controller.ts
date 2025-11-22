import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, name, phone, preferred_contact_method } = req.body;

    const { user, tokens } = await AuthService.register({
      email,
      password,
      name,
      phone,
      preferred_contact_method,
    });

    // Remove sensitive fields from response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      email_verified: user.email_verified,
      preferred_contact_method: user.preferred_contact_method,
      created_at: user.created_at,
    };

    ResponseHandler.success(
      res,
      {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Registration successful. Please check your email to verify your account.',
      201
    );
  });

  static login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    const { user, tokens } = await AuthService.login(email, password);

    // Remove sensitive fields from response
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      email_verified: user.email_verified,
      preferred_contact_method: user.preferred_contact_method,
      last_login: user.last_login,
    };

    ResponseHandler.success(
      res,
      {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Login successful',
      200
    );
  });

  static googleCallback = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // User is already authenticated by Passport
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
    }

    // Generate JWT tokens
    const tokens = await AuthService.refreshToken(user.refresh_token_hash || '');

    // Redirect to frontend with tokens (you might want to use a different approach in production)
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    ResponseHandler.success(
      res,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Token refreshed successfully',
      200
    );
  });

  static logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    await AuthService.logout(userId);

    ResponseHandler.success(res, null, 'Logout successful', 200);
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { token } = req.body;

    const user = await AuthService.verifyEmail(token);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      email_verified: user.email_verified,
    };

    ResponseHandler.success(
      res,
      { user: userResponse },
      'Email verified successfully',
      200
    );
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    await AuthService.forgotPassword(email);

    ResponseHandler.success(
      res,
      null,
      'If an account exists with this email, a password reset link has been sent',
      200
    );
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { token, password } = req.body;

    await AuthService.resetPassword(token, password);

    ResponseHandler.success(
      res,
      null,
      'Password reset successful. You can now login with your new password.',
      200
    );
  });

  static getCurrentUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const user = await AuthService.getCurrentUser(userId);

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

    ResponseHandler.success(res, { user: userResponse }, 'User retrieved successfully', 200);
  });
}

export default AuthController;
