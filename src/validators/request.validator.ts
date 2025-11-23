import { body, param, query } from 'express-validator';

export const createRequestValidator = [
  body('product_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('product_description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Product description must not exceed 2000 characters'),
  body('product_url')
    .optional()
    .isURL()
    .withMessage('Product URL must be a valid URL'),
  body('type')
    .isIn(['product_delivery', 'document', 'package', 'custom'])
    .withMessage('Type must be product_delivery, document, package, or custom'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Source must not exceed 100 characters'),
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Weight must be between 0.1 and 10000 kg'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('shipping_type')
    .isIn(['national', 'international'])
    .withMessage('Shipping type must be national or international'),
  body('pickup_location')
    .notEmpty()
    .withMessage('Pickup location is required')
    .isObject()
    .withMessage('Pickup location must be an object'),
  body('pickup_location.address')
    .notEmpty()
    .withMessage('Pickup address is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Pickup address must be between 5 and 500 characters'),
  body('pickup_location.city')
    .notEmpty()
    .withMessage('Pickup city is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Pickup city must be between 2 and 100 characters'),
  body('pickup_location.country')
    .notEmpty()
    .withMessage('Pickup country is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Pickup country must be between 2 and 100 characters'),
  body('delivery_location')
    .notEmpty()
    .withMessage('Delivery location is required')
    .isObject()
    .withMessage('Delivery location must be an object'),
  body('delivery_location.address')
    .notEmpty()
    .withMessage('Delivery address is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Delivery address must be between 5 and 500 characters'),
  body('delivery_location.city')
    .notEmpty()
    .withMessage('Delivery city is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Delivery city must be between 2 and 100 characters'),
  body('delivery_location.country')
    .notEmpty()
    .withMessage('Delivery country is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Delivery country must be between 2 and 100 characters'),
  body('preferred_contact_method')
    .optional()
    .isIn(['email', 'whatsapp', 'both'])
    .withMessage('Contact method must be email, whatsapp, or both'),
  body('customer_phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

export const updateRequestValidator = [
  param('id').isUUID().withMessage('Valid request ID is required'),
  body('product_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('product_description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Product description must not exceed 2000 characters'),
  body('product_url')
    .optional()
    .isURL()
    .withMessage('Product URL must be a valid URL'),
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Weight must be between 0.1 and 10000 kg'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

export const getRequestValidator = [
  param('id').isUUID().withMessage('Valid request ID is required'),
];

export const deleteRequestValidator = [
  param('id').isUUID().withMessage('Valid request ID is required'),
];

export const claimRequestValidator = [
  param('id').isUUID().withMessage('Valid request ID is required'),
];

export const unclaimRequestValidator = [
  param('id').isUUID().withMessage('Valid request ID is required'),
];

export const updateStatusValidator = [
  param('id').isUUID().withMessage('Valid request ID is required'),
  body('status')
    .isIn([
      'pending',
      'available',
      'claimed',
      'in_progress',
      'resolution_provided',
      'accepted',
      'rejected',
      'completed',
      'cancelled',
    ])
    .withMessage('Invalid status'),
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
    .isIn([
      'pending',
      'available',
      'claimed',
      'in_progress',
      'resolution_provided',
      'accepted',
      'rejected',
      'completed',
      'cancelled',
    ])
    .withMessage('Invalid status'),
  query('type')
    .optional()
    .isIn(['product_delivery', 'document', 'package', 'custom'])
    .withMessage('Invalid type'),
  query('shipping_type')
    .optional()
    .isIn(['national', 'international'])
    .withMessage('Invalid shipping type'),
];
