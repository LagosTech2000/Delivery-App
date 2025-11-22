import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export class PricingController {
  static calculateCost = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { weight, distance, shipping_type, request_type, quantity } = req.body;

    const breakdown = await PricingService.calculateCost({
      weight,
      distance,
      shipping_type,
      request_type,
      quantity,
    });

    ResponseHandler.success(
      res,
      { breakdown },
      'Cost calculated successfully',
      200
    );
  });

  static createPricingRule = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const {
      base_rate_national,
      base_rate_international,
      weight_tiers,
      distance_zones,
      type_multipliers,
      is_active,
    } = req.body;

    const rule = await PricingService.createPricingRule(userId, {
      base_rate_national,
      base_rate_international,
      weight_tiers,
      distance_zones,
      type_multipliers,
      is_active,
    });

    ResponseHandler.success(
      res,
      { rule },
      'Pricing rule created successfully',
      201
    );
  });

  static updatePricingRule = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ruleId = req.params.id;
    const {
      base_rate_national,
      base_rate_international,
      weight_tiers,
      distance_zones,
      type_multipliers,
      is_active,
    } = req.body;

    const rule = await PricingService.updatePricingRule(ruleId, {
      base_rate_national,
      base_rate_international,
      weight_tiers,
      distance_zones,
      type_multipliers,
      is_active,
    });

    ResponseHandler.success(
      res,
      { rule },
      'Pricing rule updated successfully',
      200
    );
  });

  static getAllPricingRules = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const rules = await PricingService.getAllPricingRules();

    ResponseHandler.success(
      res,
      { rules },
      'Pricing rules retrieved successfully',
      200
    );
  });

  static deletePricingRule = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const ruleId = req.params.id;

    await PricingService.deletePricingRule(ruleId);

    ResponseHandler.success(
      res,
      null,
      'Pricing rule deleted successfully',
      200
    );
  });
}

export default PricingController;
