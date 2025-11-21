import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';
import { env } from '../config/environment';
import { UserRole, UserStatus, ContactMethod } from '../types';

interface UserAttributes {
  id: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  oauth_provider: string | null;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  preferred_contact_method: ContactMethod;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_expires: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  refresh_token_hash: string | null;
  last_login: Date | null;
  failed_login_attempts: number;
  account_locked_until: Date | null;
  // Agent-specific fields
  is_online: boolean;
  skills: string[] | null;
  rating: number | null;
  total_deliveries: number;
  // Timestamps
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'password_hash'
    | 'google_id'
    | 'oauth_provider'
    | 'phone'
    | 'avatar'
    | 'email_verified'
    | 'email_verification_token'
    | 'email_verification_expires'
    | 'password_reset_token'
    | 'password_reset_expires'
    | 'refresh_token_hash'
    | 'last_login'
    | 'failed_login_attempts'
    | 'account_locked_until'
    | 'is_online'
    | 'skills'
    | 'rating'
    | 'total_deliveries'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
  > {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string | null;
  public google_id!: string | null;
  public oauth_provider!: string | null;
  public name!: string;
  public phone!: string | null;
  public avatar!: string | null;
  public role!: UserRole;
  public status!: UserStatus;
  public preferred_contact_method!: ContactMethod;
  public email_verified!: boolean;
  public email_verification_token!: string | null;
  public email_verification_expires!: Date | null;
  public password_reset_token!: string | null;
  public password_reset_expires!: Date | null;
  public refresh_token_hash!: string | null;
  public last_login!: Date | null;
  public failed_login_attempts!: number;
  public account_locked_until!: Date | null;
  public is_online!: boolean;
  public skills!: string[] | null;
  public rating!: number | null;
  public total_deliveries!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at!: Date | null;

  // Instance methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password_hash) return false;
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  async incrementFailedLoginAttempts(): Promise<void> {
    this.failed_login_attempts += 1;
    if (this.failed_login_attempts >= 5) {
      this.account_locked_until = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }
    await this.save();
  }

  async resetFailedLoginAttempts(): Promise<void> {
    this.failed_login_attempts = 0;
    this.account_locked_until = null;
    this.last_login = new Date();
    await this.save();
  }

  isAccountLocked(): boolean {
    if (!this.account_locked_until) return false;
    return this.account_locked_until > new Date();
  }

  toSafeObject() {
    const { password_hash, refresh_token_hash, password_reset_token, email_verification_token, ...safeUser } = this.toJSON();
    return safeUser;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true, // Null for Google OAuth users
    },
    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    oauth_provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.CUSTOMER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      defaultValue: UserStatus.ACTIVE,
      allowNull: false,
    },
    preferred_contact_method: {
      type: DataTypes.ENUM(...Object.values(ContactMethod)),
      defaultValue: ContactMethod.EMAIL,
      allowNull: false,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refresh_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    account_locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
    total_deliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Soft deletes
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['google_id'] },
      { fields: ['role'] },
      { fields: ['status'] },
      { fields: ['is_online'] },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(parseInt(env.BCRYPT_ROUNDS));
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password_hash') && user.password_hash) {
          const salt = await bcrypt.genSalt(parseInt(env.BCRYPT_ROUNDS));
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  }
);

export default User;
