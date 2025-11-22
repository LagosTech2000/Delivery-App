import { Router } from 'express';
import { ResolutionController } from '../controllers/resolution.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, isAgent, isCustomer } from '../middleware/auth.middleware';
import {
  createResolutionValidator,
  updateResolutionValidator,
  acceptResolutionValidator,
  rejectResolutionValidator,
  getResolutionValidator,
} from '../validators/resolution.validator';

const router = Router();

// All resolution routes require authentication
router.use(authenticate);

// Agent creates and updates resolutions
router.post('/', isAgent, createResolutionValidator, validate, ResolutionController.createResolution);
router.put('/:id', isAgent, updateResolutionValidator, validate, ResolutionController.updateResolution);

// Both agents and customers can view resolutions
router.get('/', ResolutionController.listResolutionsForRequest); // ?request_id=xxx
router.get('/:id', getResolutionValidator, validate, ResolutionController.getResolution);

// Customers accept or reject resolutions
router.post('/:id/accept', isCustomer, acceptResolutionValidator, validate, ResolutionController.acceptResolution);
router.post('/:id/reject', isCustomer, rejectResolutionValidator, validate, ResolutionController.rejectResolution);

export default router;
