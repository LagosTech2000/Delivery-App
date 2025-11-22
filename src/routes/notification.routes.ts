import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createNotificationValidator,
  listNotificationsValidator,
  notificationIdValidator,
  retryNotificationValidator,
} from '../validators/notification.validator';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// User notification endpoints
router.get(
  '/',
  listNotificationsValidator,
  validate,
  NotificationController.getMyNotifications
);

router.get(
  '/stats',
  NotificationController.getNotificationStats
);

router.get(
  '/:id',
  notificationIdValidator,
  validate,
  NotificationController.getNotification
);

router.post(
  '/:id/retry',
  retryNotificationValidator,
  validate,
  NotificationController.retryNotification
);

router.delete(
  '/:id',
  notificationIdValidator,
  validate,
  NotificationController.deleteNotification
);

// Admin endpoints
router.post(
  '/create',
  isAdmin,
  createNotificationValidator,
  validate,
  NotificationController.createNotification
);

router.post(
  '/process',
  isAdmin,
  NotificationController.processPendingNotifications
);

export default router;
