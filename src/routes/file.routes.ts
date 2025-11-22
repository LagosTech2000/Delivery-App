import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';
import { validate } from '../middleware/validation.middleware';
import { fileIdValidator } from '../validators/file.validator';

const router = Router();

// All file routes require authentication
router.use(authenticate);

// File upload endpoints
router.post('/upload/single', uploadSingle('file'), FileController.uploadSingle);
router.post('/upload/multiple', uploadMultiple('files', 5), FileController.uploadMultiple);

// File management
router.get('/:id', fileIdValidator, validate, FileController.getFile);
router.get('/:id/download', fileIdValidator, validate, FileController.downloadFile);
router.delete('/:id', fileIdValidator, validate, FileController.deleteFile);

export default router;
