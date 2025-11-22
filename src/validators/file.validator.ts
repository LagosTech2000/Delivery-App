import { body, param, query } from 'express-validator';
import { FileType } from '../types';

export const uploadFileValidator = [
  body('file_type')
    .isIn(Object.values(FileType))
    .withMessage('Invalid file type'),
  body('related_to_request_id')
    .optional()
    .isUUID()
    .withMessage('Invalid request ID'),
  body('related_to_resolution_id')
    .optional()
    .isUUID()
    .withMessage('Invalid resolution ID'),
];

export const fileIdValidator = [
  param('id').isUUID().withMessage('Invalid file ID'),
];

export const listFilesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('file_type')
    .optional()
    .isIn(Object.values(FileType))
    .withMessage('Invalid file type'),
];
