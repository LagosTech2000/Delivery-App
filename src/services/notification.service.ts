import Notification from '../models/Notification';
import { NotificationType, NotificationStatus } from '../types';
import { EmailService } from '../config/email';
import User from '../models/User';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class NotificationService {
  // Create a notification in the queue
  static async createNotification(data: {
    user_id: string;
    type: NotificationType;
    subject: string;
    body: string;
    html_content?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    try {
      const notification = await Notification.create({
        user_id: data.user_id,
        type: data.type,
        subject: data.subject,
        body: data.body,
        html_content: data.html_content,
        status: NotificationStatus.PENDING,
        metadata: data.metadata || {},
        retry_count: 0,
      });

      logger.info('Notification created', {
        notificationId: notification.id,
        userId: data.user_id,
        type: data.type,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error });
      throw error;
    }
  }

  // Process pending notifications
  static async processPendingNotifications(limit: number = 10): Promise<void> {
    try {
      // Get pending notifications
      const notifications = await Notification.findAll({
        where: {
          status: NotificationStatus.PENDING,
          retry_count: { [Op.lt]: 3 }, // Max 3 retries
        },
        limit,
        order: [['created_at', 'ASC']],
      });

      logger.info(`Processing ${notifications.length} pending notifications`);

      for (const notification of notifications) {
        await this.processNotification(notification);
      }
    } catch (error) {
      logger.error('Failed to process pending notifications', { error });
      throw error;
    }
  }

  // Process a single notification
  static async processNotification(notification: Notification): Promise<void> {
    try {
      if (notification.type === NotificationType.EMAIL) {
        // Get user email
        const user = await User.findByPk(notification.user_id);
        if (!user) {
          throw new Error('User not found');
        }

        // Send email via SendGrid
        await EmailService.send({
          to: user.email,
          subject: notification.subject,
          text: notification.body,
          html: notification.html_content || notification.body,
        });

        // Mark as sent
        notification.status = NotificationStatus.SENT;
        notification.sent_at = new Date();
        await notification.save();

        logger.info('Notification sent successfully', {
          notificationId: notification.id,
        });
      } else if (notification.type === NotificationType.WHATSAPP_PENDING) {
        // WhatsApp integration not implemented yet
        // For now, just log it
        logger.info('WhatsApp notification queued (not implemented)', {
          notificationId: notification.id,
        });

        // Keep it as pending for manual processing
        notification.status = NotificationStatus.PENDING;
        await notification.save();
      }
    } catch (error) {
      logger.error('Failed to process notification', {
        notificationId: notification.id,
        error,
      });

      // Increment retry count
      notification.retry_count += 1;
      notification.failed_reason = error instanceof Error ? error.message : 'Unknown error';

      if (notification.retry_count >= 3) {
        notification.status = NotificationStatus.FAILED;
      }

      await notification.save();
    }
  }

  // Get notifications for a user
  static async getUserNotifications(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      type?: NotificationType;
      status?: NotificationStatus;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      const where: any = { user_id: userId };
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;

      const { rows: notifications, count: total } =
        await Notification.findAndCountAll({
          where,
          limit,
          offset,
          order: [['created_at', 'DESC']],
        });

      return { notifications, total, page, limit };
    } catch (error) {
      logger.error('Failed to get user notifications', { error, userId });
      throw error;
    }
  }

  // Get notification by ID
  static async getNotificationById(
    notificationId: string,
    userId: string
  ): Promise<Notification> {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      logger.error('Failed to get notification', {
        error,
        notificationId,
        userId,
      });
      throw error;
    }
  }

  // Retry a failed notification
  static async retryNotification(
    notificationId: string,
    userId: string
  ): Promise<Notification> {
    try {
      const notification = await this.getNotificationById(
        notificationId,
        userId
      );

      if (notification.status !== NotificationStatus.FAILED) {
        throw new Error('Only failed notifications can be retried');
      }

      notification.status = NotificationStatus.PENDING;
      notification.retry_count = 0;
      notification.failed_reason = null;
      await notification.save();

      logger.info('Notification queued for retry', { notificationId });

      return notification;
    } catch (error) {
      logger.error('Failed to retry notification', { error, notificationId });
      throw error;
    }
  }

  // Delete a notification
  static async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      const notification = await this.getNotificationById(
        notificationId,
        userId
      );

      await notification.destroy();

      logger.info('Notification deleted', { notificationId });
    } catch (error) {
      logger.error('Failed to delete notification', { error, notificationId });
      throw error;
    }
  }

  // Get notification statistics for a user
  static async getUserNotificationStats(userId: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
  }> {
    try {
      const total = await Notification.count({ where: { user_id: userId } });
      const pending = await Notification.count({
        where: { user_id: userId, status: NotificationStatus.PENDING },
      });
      const sent = await Notification.count({
        where: { user_id: userId, status: NotificationStatus.SENT },
      });
      const failed = await Notification.count({
        where: { user_id: userId, status: NotificationStatus.FAILED },
      });

      return { total, pending, sent, failed };
    } catch (error) {
      logger.error('Failed to get notification stats', { error, userId });
      throw error;
    }
  }
}

export default NotificationService;
