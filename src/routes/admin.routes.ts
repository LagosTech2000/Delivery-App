import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  listUsersValidator,
  updateUserStatusValidator,
  updateUserRoleValidator,
  listRequestsValidator,
} from '../validators/admin.validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Dashboard analytics
router.get('/dashboard', AdminController.getDashboardStats);

// User management
router.get('/users', listUsersValidator, validate, AdminController.getAllUsers);
router.put('/users/:id/status', updateUserStatusValidator, validate, AdminController.updateUserStatus);
router.put('/users/:id/role', updateUserRoleValidator, validate, AdminController.updateUserRole);

// Request management
router.get('/requests', listRequestsValidator, validate, AdminController.getAllRequests);

export default router;
