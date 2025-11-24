import { body, param } from 'express-validator';

export const createResolutionValidator = [
  body('request_id')
    .isUUID()
    .withMessage('Valid request ID is required'),
  body('quote_breakdown')
    .isObject()
    .withMessage('Quote breakdown must be an object'),
  body('quote_breakdown.product_cost')
    .isFloat({ min: 0 })
    .withMessage('Product cost must be a positive number'),
  body('quote_breakdown.service_fee')
    .isFloat({ min: 0 })
    .withMessage('Service fee must be a positive number'),
  body('quote_breakdown.taxes')
    .isFloat({ min: 0 })
    .withMessage('Taxes must be a positive number'),
  body('shipping_cost')
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a positive number'),
  body('product_details')
    .isObject()
    .withMessage('Product details must be an object'),
  body('product_details.name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('product_details.store')
    .trim()
    .notEmpty()
    .withMessage('Product store is required'),
  body('product_details.price')
    .isFloat({ min: 0 })
    .withMessage('Product price must be a positive number'),
  body('store_info')
    .isObject()
    .withMessage('Store info must be an object'),
  body('store_info.name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required'),
  body('store_info.location')
    .trim()
    .notEmpty()
    .withMessage('Store location is required'),
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('allowed_payment_methods')
    .isArray({ min: 1 })
    .withMessage('At least one payment method must be allowed'),
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
