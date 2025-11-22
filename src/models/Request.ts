import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { RequestType, RequestSource, ShippingType, RequestStatus, ContactMethod, Location } from '../types';

interface RequestAttributes {
  id: string;
  customer_id: string;
  claimed_by_agent_id: string | null;
  type: RequestType;
  source: RequestSource;
  product_name: string;
  product_description: string | null;
  product_url: string | null;
  product_images: string[];
  weight: number | null;
  quantity: number;
  shipping_type: ShippingType;
  pickup_location: Location;
  delivery_location: Location;
  status: RequestStatus;
  preferred_contact_method: ContactMethod;
  customer_phone: string | null;
  notes: string | null;
  claimed_at: Date | null;
  completed_at: Date | null;
  cancelled_reason: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface RequestCreationAttributes
  extends Optional<
    RequestAttributes,
    | 'id'
    | 'claimed_by_agent_id'
    | 'product_description'
    | 'product_url'
    | 'product_images'
    | 'weight'
    | 'notes'
    | 'customer_phone'
    | 'claimed_at'
    | 'completed_at'
    | 'cancelled_reason'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
  > {}

class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
  public id!: string;
  public customer_id!: string;
  public claimed_by_agent_id!: string | null;
  public type!: RequestType;
  public source!: RequestSource;
  public product_name!: string;
  public product_description!: string | null;
  public product_url!: string | null;
  public product_images!: string[];
  public weight!: number | null;
  public quantity!: number;
  public shipping_type!: ShippingType;
  public pickup_location!: Location;
  public delivery_location!: Location;
  public status!: RequestStatus;
  public preferred_contact_method!: ContactMethod;
  public customer_phone!: string | null;
  public notes!: string | null;
  public claimed_at!: Date | null;
  public completed_at!: Date | null;
  public cancelled_reason!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at!: Date | null;

  // Instance methods
  canBeClaimed(): boolean {
    return this.status === RequestStatus.AVAILABLE && !this.claimed_by_agent_id;
  }

  canBeUpdatedByAgent(agentId: string): boolean {
    return this.claimed_by_agent_id === agentId;
  }

  canBeUpdatedByCustomer(customerId: string): boolean {
    return this.customer_id === customerId && [RequestStatus.PENDING, RequestStatus.AVAILABLE].includes(this.status);
  }

  async claimByAgent(agentId: string): Promise<void> {
    this.claimed_by_agent_id = agentId;
    this.status = RequestStatus.CLAIMED;
    this.claimed_at = new Date();
    await this.save();
  }

  async markAsCompleted(): Promise<void> {
    this.status = RequestStatus.COMPLETED;
    this.completed_at = new Date();
    await this.save();
  }

  async cancel(reason?: string): Promise<void> {
    this.status = RequestStatus.CANCELLED;
    this.cancelled_reason = reason || null;
    await this.save();
  }
}

Request.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    claimed_by_agent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(RequestType)),
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(RequestSource)),
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    product_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    product_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    product_images: {
      type: sequelize.options.dialect === 'sqlite'
        ? DataTypes.TEXT
        : DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: sequelize.options.dialect === 'sqlite' ? '[]' : [],
      get() {
        const raw = this.getDataValue('product_images');
        if (sequelize.options.dialect === 'sqlite') {
          return raw ? JSON.parse(raw as any) : [];
        }
        return raw || [];
      },
      set(value: string[]) {
        if (sequelize.options.dialect === 'sqlite') {
          this.setDataValue('product_images', JSON.stringify(value) as any);
        } else {
          this.setDataValue('product_images', value as any);
        }
      },
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    shipping_type: {
      type: DataTypes.ENUM(...Object.values(ShippingType)),
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    delivery_location: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      defaultValue: RequestStatus.PENDING,
      allowNull: false,
    },
    preferred_contact_method: {
      type: DataTypes.ENUM(...Object.values(ContactMethod)),
      defaultValue: ContactMethod.EMAIL,
      allowNull: false,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    claimed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'requests',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['claimed_by_agent_id'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['shipping_type'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Request;
