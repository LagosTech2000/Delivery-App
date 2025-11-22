import PricingRule from '../models/PricingRule';
import User from '../models/User';
import { UserRole, RequestType } from '../types';
import logger from '../utils/logger';

export const seedPricing = async (): Promise<void> => {
  try {
    // Check if pricing rules already exist
    const existingRules = await PricingRule.count();
    if (existingRules > 0) {
      logger.info('Pricing rules already exist, skipping seed');
      return;
    }

    // Get admin user to set as creator
    const admin = await User.findOne({ where: { role: UserRole.ADMIN } });
    if (!admin) {
      throw new Error('Admin user not found. Run user seeder first.');
    }

    // Create default pricing rule
    await PricingRule.create({
      created_by: admin.id,
      base_rate_national: 10.0,
      base_rate_international: 30.0,
      weight_tiers: [
        { minWeight: 0, maxWeight: 1, pricePerKg: 2.0 },
        { minWeight: 1, maxWeight: 5, pricePerKg: 1.5 },
        { minWeight: 5, maxWeight: 10, pricePerKg: 1.2 },
        { minWeight: 10, maxWeight: 999, pricePerKg: 1.0 },
      ],
      distance_zones: [
        { name: 'Local', minDistance: 0, maxDistance: 50, multiplier: 1.0 },
        { name: 'Regional', minDistance: 50, maxDistance: 200, multiplier: 1.5 },
        { name: 'National', minDistance: 200, maxDistance: 1000, multiplier: 2.0 },
        { name: 'International', minDistance: 1000, maxDistance: 99999, multiplier: 3.0 },
      ],
      type_multipliers: {
        [RequestType.PRODUCT_DELIVERY]: 1.0,
        [RequestType.DOCUMENT]: 0.8,
        [RequestType.PACKAGE]: 1.2,
        [RequestType.CUSTOM]: 1.5,
      },
      is_active: true,
    });

    logger.info('Pricing rules seeded successfully');
  } catch (error) {
    logger.error('Failed to seed pricing rules', { error });
    throw error;
  }
};

export default seedPricing;
