import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';
import { NotificationType } from '../types';

export class NotificationController {
  // Create a notification (admin only)
  static createNotification = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { user_id, type, subject, body, html_content, metadata } =
        req.body;

      const notification = await NotificationService.createNotification({
        user_id,
        type: type as NotificationType,
        subject,
        body,
        html_content,
        metadata,
      });

      ResponseHandler.success(
        res,
        { notification },
        'Notification created successfully',
        201
      );
    }
  );

  // Get all notifications for the authenticated user
  static getMyNotifications = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user!.id;
      const { page, limit, type, status } = req.query;

      const result = await NotificationService.getUserNotifications(
        userId,
        {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          type: type as any,
          status: status as any,
        }
      );

      ResponseHandler.paginated(
        res,
        result.notifications,
        result.page,
        result.limit,
        result.total,
        'Notifications retrieved successfully'
      );
    }
  );

  // Get a single notification
  static getNotification = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user!.id;
      const { id } = req.params;

      const notification = await NotificationService.getNotificationById(
        id,
        userId
      );

      ResponseHandler.success(
        res,
        { notification },
        'Notification retrieved successfully',
        200
      );
    }
  );

  // Retry a failed notification
  static retryNotification = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user!.id;
      const { id } = req.params;

      const notification = await NotificationService.retryNotification(
        id,
        userId
      );

      ResponseHandler.success(
        res,
        { notification },
        'Notification queued for retry',
        200
      );
    }
  );

  // Delete a notification
  static deleteNotification = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user!.id;
      const { id } = req.params;

      await NotificationService.deleteNotification(id, userId);

      ResponseHandler.success(
        res,
        null,
        'Notification deleted successfully',
        200
      );
    }
  );

  // Get notification statistics
  static getNotificationStats = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const userId = req.user!.id;

      const stats = await NotificationService.getUserNotificationStats(
        userId
      );

      ResponseHandler.success(
        res,
        { stats },
        'Notification stats retrieved successfully',
        200
      );
    }
  );

  // Process pending notifications (admin/cron only)
  static processPendingNotifications = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      await NotificationService.processPendingNotifications();

      ResponseHandler.success(
        res,
        null,
        'Pending notifications processed successfully',
        200
      );
    }
  );
}

export default NotificationController;
