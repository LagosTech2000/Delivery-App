import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('preferred_contact_method')
    .optional()
    .isIn(['email', 'whatsapp', 'both'])
    .withMessage('Contact method must be email, whatsapp, or both'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const updatePreferencesValidator = [
  body('preferred_contact_method')
    .optional()
    .isIn(['email', 'whatsapp', 'both'])
    .withMessage('Contact method must be email, whatsapp, or both'),
];
