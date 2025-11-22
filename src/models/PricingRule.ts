import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { WeightTier, DistanceZone } from '../types';

interface PricingRuleAttributes {
  id: string;
  base_rate_national: number;
  base_rate_international: number;
  weight_tiers: WeightTier[];
  distance_zones: DistanceZone[];
  type_multipliers: Record<string, number>;
  is_active: boolean;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

interface PricingRuleCreationAttributes
  extends Optional<PricingRuleAttributes, 'id' | 'created_by' | 'created_at' | 'updated_at'> {}

class PricingRule
  extends Model<PricingRuleAttributes, PricingRuleCreationAttributes>
  implements PricingRuleAttributes
{
  public id!: string;
  public base_rate_national!: number;
  public base_rate_international!: number;
  public weight_tiers!: WeightTier[];
  public distance_zones!: DistanceZone[];
  public type_multipliers!: Record<string, number>;
  public is_active!: boolean;
  public created_by!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  getWeightCost(weight: number): number {
    const tier = this.weight_tiers.find(
      (t) => weight >= t.minWeight && (t.maxWeight === null || weight <= t.maxWeight)
    );
    return tier ? tier.pricePerKg * weight : 0;
  }

  getDistanceCost(distance: number, baseCost: number): number {
    const zone = this.distance_zones.find(
      (z) => distance >= z.minDistance && (z.maxDistance === null || distance <= z.maxDistance)
    );
    return zone ? baseCost * zone.multiplier : baseCost;
  }

  getTypeCost(type: string, baseCost: number): number {
    const multiplier = this.type_multipliers[type] || 1;
    return baseCost * multiplier;
  }
}

PricingRule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    base_rate_national: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10.0,
      validate: {
        min: 0,
      },
    },
    base_rate_international: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50.0,
      validate: {
        min: 0,
      },
    },
    weight_tiers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [
        { minWeight: 0, maxWeight: 5, pricePerKg: 2.0 },
        { minWeight: 5, maxWeight: 20, pricePerKg: 1.5 },
        { minWeight: 20, maxWeight: null, pricePerKg: 1.0 },
      ],
    },
    distance_zones: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [
        { name: 'Local', minDistance: 0, maxDistance: 50, multiplier: 1.0 },
        { name: 'Regional', minDistance: 50, maxDistance: 200, multiplier: 1.5 },
        { name: 'Long Distance', minDistance: 200, maxDistance: null, multiplier: 2.0 },
      ],
    },
    type_multipliers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        product_delivery: 1.0,
        document: 0.8,
        package: 1.2,
        custom: 1.5,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'pricing_rules',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['is_active'] }, { fields: ['created_at'] }],
  }
);

export default PricingRule;
