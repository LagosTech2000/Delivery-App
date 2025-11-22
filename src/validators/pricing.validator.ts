import { body, param } from 'express-validator';

export const calculateCostValidator = [
  body('weight')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Weight must be between 0.1 and 10000 kg'),
  body('distance')
    .isFloat({ min: 0.1, max: 50000 })
    .withMessage('Distance must be between 0.1 and 50000 km'),
  body('shipping_type')
    .isIn(['national', 'international'])
    .withMessage('Shipping type must be national or international'),
  body('request_type')
    .isIn(['product_delivery', 'document', 'package', 'custom'])
    .withMessage('Request type must be product_delivery, document, package, or custom'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
];

export const createPricingRuleValidator = [
  body('base_rate_national')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base rate national must be a positive number'),
  body('base_rate_international')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base rate international must be a positive number'),
  body('weight_tiers')
    .optional()
    .isArray()
    .withMessage('Weight tiers must be an array'),
  body('distance_zones')
    .optional()
    .isArray()
    .withMessage('Distance zones must be an array'),
  body('type_multipliers')
    .optional()
    .isObject()
    .withMessage('Type multipliers must be an object'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
];

export const updatePricingRuleValidator = [
  param('id').isUUID().withMessage('Valid pricing rule ID is required'),
  body('base_rate_national')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base rate national must be a positive number'),
  body('base_rate_international')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base rate international must be a positive number'),
  body('weight_tiers')
    .optional()
    .isArray()
    .withMessage('Weight tiers must be an array'),
  body('distance_zones')
    .optional()
    .isArray()
    .withMessage('Distance zones must be an array'),
  body('type_multipliers')
    .optional()
    .isObject()
    .withMessage('Type multipliers must be an object'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
];

export const deletePricingRuleValidator = [
  param('id').isUUID().withMessage('Valid pricing rule ID is required'),
];
