import { body, param } from 'express-validator';

export const createResolutionValidator = [
  body('request_id')
    .isUUID()
    .withMessage('Valid request ID is required'),
  body('quote_breakdown')
    .isObject()
    .withMessage('Quote breakdown must be an object'),
  body('quote_breakdown.baseCost')
    .isFloat({ min: 0 })
    .withMessage('Base cost must be a positive number'),
  body('quote_breakdown.weightCost')
    .isFloat({ min: 0 })
    .withMessage('Weight cost must be a positive number'),
  body('quote_breakdown.distanceCost')
    .isFloat({ min: 0 })
    .withMessage('Distance cost must be a positive number'),
  body('quote_breakdown.total')
    .isFloat({ min: 0 })
    .withMessage('Total cost must be a positive number'),
  body('estimated_delivery_days')
    .isInt({ min: 1, max: 365 })
    .withMessage('Estimated delivery days must be between 1 and 365'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('internal_notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Internal notes must not exceed 1000 characters'),
];

export const updateResolutionValidator = [
  param('id').isUUID().withMessage('Valid resolution ID is required'),
  body('quote_breakdown')
    .optional()
    .isObject()
    .withMessage('Quote breakdown must be an object'),
  body('estimated_delivery_days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Estimated delivery days must be between 1 and 365'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('internal_notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Internal notes must not exceed 1000 characters'),
];

export const acceptResolutionValidator = [
  param('id').isUUID().withMessage('Valid resolution ID is required'),
  body('customer_response_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Customer response notes must not exceed 500 characters'),
];

export const rejectResolutionValidator = [
  param('id').isUUID().withMessage('Valid resolution ID is required'),
  body('customer_response_notes')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Please provide a reason for rejection (10-500 characters)'),
];

export const getResolutionValidator = [
  param('id').isUUID().withMessage('Valid resolution ID is required'),
];
