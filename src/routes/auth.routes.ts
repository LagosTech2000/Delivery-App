import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator';

const router = Router();

// Email/Password Authentication
router.post('/register', registerValidator, validate, AuthController.register);
router.post('/login', loginValidator, validate, AuthController.login);
router.post('/refresh', refreshTokenValidator, validate, AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

// Email Verification
router.post('/verify-email', verifyEmailValidator, validate, AuthController.verifyEmail);

// Password Reset
router.post('/forgot-password', forgotPasswordValidator, validate, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, AuthController.resetPassword);

// Google OAuth 2.0
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/error`
  }),
  AuthController.googleCallback
);

// Get current user
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
