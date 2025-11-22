import PricingRule from '../models/PricingRule';
import { NotFoundError } from '../utils/errors';
import { RequestType, ShippingType } from '../types';
import { PricingBreakdown } from '../types';
import logger from '../utils/logger';

export class PricingService {
  /**
   * Get the active pricing rule
   */
  static async getActivePricingRule(): Promise<PricingRule> {
    const rule = await PricingRule.findOne({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
    });

    if (!rule) {
      throw new NotFoundError('No active pricing rule found');
    }

    return rule;
  }

  /**
   * Calculate shipping cost for a delivery request
   */
  static async calculateCost(data: {
    weight: number;
    distance: number;
    shipping_type: ShippingType;
    request_type: RequestType;
    quantity?: number;
  }): Promise<PricingBreakdown> {
    try {
      const rule = await this.getActivePricingRule();
      const quantity = data.quantity || 1;

      // Base cost based on shipping type
      const baseCost =
        data.shipping_type === ShippingType.NATIONAL
          ? rule.base_rate_national
          : rule.base_rate_international;

      // Weight cost
      const weightCost = rule.getWeightCost(data.weight) * quantity;

      // Distance cost with base cost multiplier
      const distanceCost = rule.getDistanceCost(data.distance, baseCost) - baseCost;

      // Type multiplier (returns cost, not multiplier)
      const typeMultipliedCost = rule.getTypeCost(data.request_type, baseCost + weightCost + distanceCost);

      // Calculate total
      const subtotal = baseCost + weightCost + distanceCost;
      const typeMultiplier = rule.type_multipliers[data.request_type] || 1;
      const total = typeMultipliedCost;

      const breakdown: PricingBreakdown = {
        baseCost,
        weightCost,
        distanceCost,
        typeMultiplier,
        subtotal,
        total: Math.round(total * 100) / 100, // Round to 2 decimal places
      };

      logger.info('Pricing calculated successfully', { breakdown, data });

      return breakdown;
    } catch (error) {
      logger.error('Pricing calculation failed', { error, data });
      throw error;
    }
  }

  /**
   * Create a new pricing rule (admin only)
   */
  static async createPricingRule(
    adminId: string,
    data: {
      base_rate_national?: number;
      base_rate_international?: number;
      weight_tiers?: any[];
      distance_zones?: any[];
      type_multipliers?: any;
      is_active?: boolean;
    }
  ): Promise<PricingRule> {
    try {
      // If setting as active, deactivate all other rules
      if (data.is_active) {
        await PricingRule.update(
          { is_active: false },
          { where: { is_active: true } }
        );
      }

      const rule = await PricingRule.create({
        base_rate_national: data.base_rate_national !== undefined ? data.base_rate_national : 10.0,
        base_rate_international: data.base_rate_international !== undefined ? data.base_rate_international : 30.0,
        weight_tiers: data.weight_tiers || [],
        distance_zones: data.distance_zones || [],
        type_multipliers: data.type_multipliers || {},
        is_active: data.is_active !== undefined ? data.is_active : false,
        created_by: adminId,
      });

      logger.info('Pricing rule created successfully', {
        ruleId: rule.id,
        adminId,
      });

      return rule;
    } catch (error) {
      logger.error('Create pricing rule failed', { error, adminId });
      throw error;
    }
  }

  /**
   * Update a pricing rule (admin only)
   */
  static async updatePricingRule(
    ruleId: string,
    data: {
      base_rate_national?: number;
      base_rate_international?: number;
      weight_tiers?: any[];
      distance_zones?: any[];
      type_multipliers?: any;
      is_active?: boolean;
    }
  ): Promise<PricingRule> {
    try {
      const rule = await PricingRule.findByPk(ruleId);
      if (!rule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // If setting as active, deactivate all other rules
      if (data.is_active && !rule.is_active) {
        await PricingRule.update(
          { is_active: false },
          { where: { is_active: true } }
        );
      }

      // Update fields
      if (data.base_rate_national !== undefined)
        rule.base_rate_national = data.base_rate_national;
      if (data.base_rate_international !== undefined)
        rule.base_rate_international = data.base_rate_international;
      if (data.weight_tiers !== undefined)
        rule.weight_tiers = data.weight_tiers;
      if (data.distance_zones !== undefined)
        rule.distance_zones = data.distance_zones;
      if (data.type_multipliers !== undefined)
        rule.type_multipliers = data.type_multipliers;
      if (data.is_active !== undefined) rule.is_active = data.is_active;

      await rule.save();

      logger.info('Pricing rule updated successfully', { ruleId });

      return rule;
    } catch (error) {
      logger.error('Update pricing rule failed', { error, ruleId });
      throw error;
    }
  }

  /**
   * Get all pricing rules (admin only)
   */
  static async getAllPricingRules(): Promise<PricingRule[]> {
    try {
      const rules = await PricingRule.findAll({
        order: [['created_at', 'DESC']],
      });

      return rules;
    } catch (error) {
      logger.error('Get all pricing rules failed', { error });
      throw error;
    }
  }

  /**
   * Delete a pricing rule (admin only)
   */
  static async deletePricingRule(ruleId: string): Promise<void> {
    try {
      const rule = await PricingRule.findByPk(ruleId);
      if (!rule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Cannot delete active rule
      if (rule.is_active) {
        throw new Error(
          'Cannot delete active pricing rule. Please activate another rule first.'
        );
      }

      await rule.destroy();

      logger.info('Pricing rule deleted successfully', { ruleId });
    } catch (error) {
      logger.error('Delete pricing rule failed', { error, ruleId });
      throw error;
    }
  }
}

export default PricingService;
