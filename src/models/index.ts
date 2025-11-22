import User from './User';
import Request from './Request';
import Resolution from './Resolution';
import PricingRule from './PricingRule';
import Notification from './Notification';
import File from './File';

// User <-> Request associations
User.hasMany(Request, {
  foreignKey: 'customer_id',
  as: 'customerRequests',
  onDelete: 'CASCADE',
});

Request.belongsTo(User, {
  foreignKey: 'customer_id',
  as: 'customer',
});

User.hasMany(Request, {
  foreignKey: 'claimed_by_agent_id',
  as: 'claimedRequests',
  onDelete: 'SET NULL',
});

Request.belongsTo(User, {
  foreignKey: 'claimed_by_agent_id',
  as: 'agent',
});

// Request <-> Resolution associations
Request.hasMany(Resolution, {
  foreignKey: 'request_id',
  as: 'resolutions',
  onDelete: 'CASCADE',
});

Resolution.belongsTo(Request, {
  foreignKey: 'request_id',
  as: 'request',
});

// User <-> Resolution associations
User.hasMany(Resolution, {
  foreignKey: 'agent_id',
  as: 'agentResolutions',
  onDelete: 'CASCADE',
});

Resolution.belongsTo(User, {
  foreignKey: 'agent_id',
  as: 'agent',
});

// User <-> Notification associations
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
  onDelete: 'CASCADE',
});

Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User <-> File associations
User.hasMany(File, {
  foreignKey: 'uploaded_by_user_id',
  as: 'uploadedFiles',
  onDelete: 'CASCADE',
});

File.belongsTo(User, {
  foreignKey: 'uploaded_by_user_id',
  as: 'uploader',
});

// Request <-> File associations
Request.hasMany(File, {
  foreignKey: 'related_to_request_id',
  as: 'files',
  onDelete: 'CASCADE',
});

File.belongsTo(Request, {
  foreignKey: 'related_to_request_id',
  as: 'request',
});

// Resolution <-> File associations
Resolution.hasMany(File, {
  foreignKey: 'related_to_resolution_id',
  as: 'files',
  onDelete: 'CASCADE',
});

File.belongsTo(Resolution, {
  foreignKey: 'related_to_resolution_id',
  as: 'resolution',
});

// PricingRule <-> User associations
User.hasMany(PricingRule, {
  foreignKey: 'created_by',
  as: 'createdPricingRules',
  onDelete: 'SET NULL',
});

PricingRule.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

export const models = {
  User,
  Request,
  Resolution,
  PricingRule,
  Notification,
  File,
};

export { User, Request, Resolution, PricingRule, Notification, File };

export default models;
