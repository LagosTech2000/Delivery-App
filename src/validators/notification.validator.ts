import { body, param, query } from 'express-validator';
import { NotificationType, NotificationStatus } from '../types';

export const createNotificationValidator = [
  body('type')
    .isIn(Object.values(NotificationType))
    .withMessage('Invalid notification type'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  body('body')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Body must be between 1 and 5000 characters'),
  body('html_content')
    .optional()
    .isString()
    .withMessage('HTML content must be a string'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
];

export const listNotificationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage('Invalid notification type'),
  query('status')
    .optional()
    .isIn(Object.values(NotificationStatus))
    .withMessage('Invalid notification status'),
];

export const notificationIdValidator = [
  param('id').isUUID().withMessage('Invalid notification ID'),
];

export const retryNotificationValidator = [
  param('id').isUUID().withMessage('Invalid notification ID'),
];
