import { param, query, body } from 'express-validator';
import { UserRole, UserStatus, RequestStatus } from '../types';

export const listUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage('Invalid status'),
];

export const updateUserStatusValidator = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('status')
    .isIn(Object.values(UserStatus))
    .withMessage('Invalid status'),
];

export const updateUserRoleValidator = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
];

export const listRequestsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(Object.values(RequestStatus))
    .withMessage('Invalid status'),
];
