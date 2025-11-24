import { Router } from 'express';
import { RequestController } from '../controllers/request.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, isCustomer, isAgent } from '../middleware/auth.middleware';
import {
  createRequestValidator,
  updateRequestValidator,
  getRequestValidator,
  deleteRequestValidator,
  claimRequestValidator,
  unclaimRequestValidator,
  updateStatusValidator,
  listRequestsValidator,
} from '../validators/request.validator';

const router = Router();

// All request routes require authentication
router.use(authenticate);

// Request CRUD operations
router.post('/', isCustomer, createRequestValidator, validate, RequestController.createRequest);
router.get('/', listRequestsValidator, validate, RequestController.listRequests);
router.get('/:id', getRequestValidator, validate, RequestController.getRequest);
router.put('/:id', isCustomer, updateRequestValidator, validate, RequestController.updateRequest);
router.delete('/:id', isCustomer, deleteRequestValidator, validate, RequestController.deleteRequest);

// Agent operations
router.post('/:id/claim', isAgent, claimRequestValidator, validate, RequestController.claimRequest);
router.post('/:id/unclaim', isAgent, unclaimRequestValidator, validate, RequestController.unclaimRequest);

// Status updates (both customers and agents can update, but with different permissions)
router.put('/:id/status', updateStatusValidator, validate, RequestController.updateStatus);

// Payment operations
router.post('/:id/payment', isCustomer, RequestController.submitPayment);
router.post('/:id/payment/confirm', isAgent, RequestController.confirmPayment);

export default router;
