import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FileAttributes {
  id: string;
  uploaded_by_user_id: string;
  related_to_request_id: string | null;
  related_to_resolution_id: string | null;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  file_path: string;
  public_url: string | null;
  file_type: 'product_image' | 'proof_of_delivery' | 'document' | 'other';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface FileCreationAttributes
  extends Optional<
    FileAttributes,
    | 'id'
    | 'related_to_request_id'
    | 'related_to_resolution_id'
    | 'public_url'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
  > {}

class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: string;
  public uploaded_by_user_id!: string;
  public related_to_request_id!: string | null;
  public related_to_resolution_id!: string | null;
  public filename!: string;
  public original_name!: string;
  public mimetype!: string;
  public size!: number;
  public file_path!: string;
  public public_url!: string | null;
  public file_type!: 'product_image' | 'proof_of_delivery' | 'document' | 'other';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at!: Date | null;

  isImage(): boolean {
    return this.mimetype.startsWith('image/');
  }

  isPDF(): boolean {
    return this.mimetype === 'application/pdf';
  }

  getSizeInMB(): number {
    return this.size / (1024 * 1024);
  }
}

File.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    uploaded_by_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    related_to_request_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'requests',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    related_to_resolution_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'resolutions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    file_path: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    public_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    file_type: {
      type: DataTypes.ENUM('product_image', 'proof_of_delivery', 'document', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
  },
  {
    sequelize,
    tableName: 'files',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      { fields: ['uploaded_by_user_id'] },
      { fields: ['related_to_request_id'] },
      { fields: ['related_to_resolution_id'] },
      { fields: ['file_type'] },
      { fields: ['created_at'] },
    ],
  }
);

export default File;
