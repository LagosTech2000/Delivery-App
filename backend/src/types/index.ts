export enum UserRole {
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum RequestType {
  PRODUCT_DELIVERY = 'product_delivery',
  DOCUMENT = 'document',
  PACKAGE = 'package',
  CUSTOM = 'custom',
}

export enum RequestSource {
  AMAZON = 'amazon',
  EBAY = 'ebay',
  NATIONAL_STORE = 'national_store',
  INTERNATIONAL_STORE = 'international_store',
  OTHER = 'other',
}

export enum ShippingType {
  NATIONAL = 'national',
  INTERNATIONAL = 'international',
}

export enum RequestStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  CLAIMED = 'claimed',
  IN_PROGRESS = 'in_progress',
  RESOLUTION_PROVIDED = 'resolution_provided',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ResolutionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum ContactMethod {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum NotificationType {
  EMAIL = 'email',
  WHATSAPP_PENDING = 'whatsapp_pending',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PricingBreakdown {
  baseCost: number;
  weightCost: number;
  distanceCost: number;
  typeCost: number;
  total: number;
}

export interface WeightTier {
  minWeight: number;
  maxWeight: number;
  pricePerKg: number;
}

export interface DistanceZone {
  name: string;
  minDistance: number;
  maxDistance: number;
  multiplier: number;
}

export interface Location {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RequestFilters {
  status?: RequestStatus;
  type?: RequestType;
  source?: RequestSource;
  shippingType?: ShippingType;
  customerId?: string;
  agentId?: string;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}
