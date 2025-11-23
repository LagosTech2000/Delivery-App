import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ResolutionStatus, PricingBreakdown } from '../types';

interface ResolutionAttributes {
  id: string;
  request_id: string;
  agent_id: string;
  quote_breakdown: PricingBreakdown;
  estimated_delivery_days: number;
  notes: string | null;
  internal_notes: string | null;
  status: ResolutionStatus;
  customer_response_notes: string | null;
  responded_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface ResolutionCreationAttributes
  extends Optional<
    ResolutionAttributes,
    'id' | 'notes' | 'internal_notes' | 'customer_response_notes' | 'responded_at' | 'created_at' | 'updated_at' | 'deleted_at'
  > { }

class Resolution extends Model<ResolutionAttributes, ResolutionCreationAttributes> implements ResolutionAttributes {
  public id!: string;
  public request_id!: string;
  public agent_id!: string;
  public quote_breakdown!: PricingBreakdown;
  public estimated_delivery_days!: number;
  public notes!: string | null;
  public internal_notes!: string | null;
  public status!: ResolutionStatus;
  public customer_response_notes!: string | null;
  public responded_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at!: Date | null;

  async accept(customerNotes?: string): Promise<void> {
    this.status = ResolutionStatus.ACCEPTED;
    this.customer_response_notes = customerNotes || null;
    this.responded_at = new Date();
    await this.save();
  }

  async reject(customerNotes?: string): Promise<void> {
    this.status = ResolutionStatus.REJECTED;
    this.customer_response_notes = customerNotes || null;
    this.responded_at = new Date();
    await this.save();
  }

  isPending(): boolean {
    return this.status === ResolutionStatus.PENDING;
  }
}

Resolution.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'requests',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    agent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    quote_breakdown: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    estimated_delivery_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ResolutionStatus)),
      defaultValue: ResolutionStatus.PENDING,
      allowNull: false,
    },
    customer_response_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'resolutions',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['request_id'] },
      { fields: ['agent_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Resolution;
