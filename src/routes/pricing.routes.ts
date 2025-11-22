import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  calculateCostValidator,
  createPricingRuleValidator,
  updatePricingRuleValidator,
  deletePricingRuleValidator,
} from '../validators/pricing.validator';

const router = Router();

// Public endpoint for cost calculation (authenticated users)
router.post(
  '/calculate',
  authenticate,
  calculateCostValidator,
  validate,
  PricingController.calculateCost
);

// Admin-only pricing rule management
router.get('/rules', authenticate, isAdmin, PricingController.getAllPricingRules);
router.post(
  '/rules',
  authenticate,
  isAdmin,
  createPricingRuleValidator,
  validate,
  PricingController.createPricingRule
);
router.put(
  '/rules/:id',
  authenticate,
  isAdmin,
  updatePricingRuleValidator,
  validate,
  PricingController.updatePricingRule
);
router.delete(
  '/rules/:id',
  authenticate,
  isAdmin,
  deletePricingRuleValidator,
  validate,
  PricingController.deletePricingRule
);

export default router;
