import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  updateProfileValidator,
  changePasswordValidator,
  updatePreferencesValidator,
} from '../validators/user.validator';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile management
router.get('/me', UserController.getProfile);
router.put('/me', updateProfileValidator, validate, UserController.updateProfile);
router.delete('/me', UserController.deleteAccount);

// Password management
router.put('/me/password', changePasswordValidator, validate, UserController.changePassword);

// Preferences
router.put('/me/preferences', updatePreferencesValidator, validate, UserController.updatePreferences);

export default router;
