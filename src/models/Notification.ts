import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { NotificationType, NotificationStatus } from '../types';

interface NotificationAttributes {
  id: string;
  user_id: string;
  type: NotificationType;
  subject: string;
  body: string;
  html_content: string | null;
  status: NotificationStatus;
  sent_at: Date | null;
  failed_reason: string | null;
  retry_count: number;
  metadata: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    | 'id'
    | 'html_content'
    | 'sent_at'
    | 'failed_reason'
    | 'retry_count'
    | 'metadata'
    | 'created_at'
    | 'updated_at'
  > {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public user_id!: string;
  public type!: NotificationType;
  public subject!: string;
  public body!: string;
  public html_content!: string | null;
  public status!: NotificationStatus;
  public sent_at!: Date | null;
  public failed_reason!: string | null;
  public retry_count!: number;
  public metadata!: Record<string, any> | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  async markAsSent(): Promise<void> {
    this.status = NotificationStatus.SENT;
    this.sent_at = new Date();
    await this.save();
  }

  async markAsFailed(reason: string): Promise<void> {
    this.status = NotificationStatus.FAILED;
    this.failed_reason = reason;
    this.retry_count += 1;
    await this.save();
  }

  canRetry(): boolean {
    return this.retry_count < 3 && this.status === NotificationStatus.FAILED;
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    html_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(NotificationStatus)),
      defaultValue: NotificationStatus.PENDING,
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failed_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Notification;
