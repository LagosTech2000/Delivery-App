import Request from '../models/Request';
import User from '../models/User';
import { EmailService } from '../config/email';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '../utils/errors';
import {
  RequestType,
  RequestStatus,
  RequestSource,
  ShippingType,
  ContactMethod,
  UserRole,
} from '../types';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class RequestService {
  static async createRequest(
    customerId: string,
    data: {
      product_name: string;
      product_description?: string;
      product_url?: string;
      product_images?: string[];
      type: RequestType;
      source?: RequestSource;
      weight?: number;
      quantity?: number;
      shipping_type: ShippingType;
      pickup_location: any;
      delivery_location: any;
      preferred_contact_method?: ContactMethod;
      customer_phone?: string;
      notes?: string;
    }
  ): Promise<Request> {
    try {
      // Get customer details for email
      const customer = await User.findByPk(customerId);
      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      // Create request
      const request = await Request.create({
        customer_id: customerId,
        product_name: data.product_name,
        product_description: data.product_description,
        product_url: data.product_url,
        product_images: data.product_images || [],
        type: data.type,
        source: data.source || RequestSource.OTHER,
        status: RequestStatus.PENDING,
        weight: data.weight,
        quantity: data.quantity || 1,
        shipping_type: data.shipping_type,
        pickup_location: data.pickup_location,
        delivery_location: data.delivery_location,
        preferred_contact_method: data.preferred_contact_method || customer.preferred_contact_method,
        customer_phone: data.customer_phone || customer.phone,
        notes: data.notes,
      });

      // Send confirmation email to customer
      await EmailService.sendRequestCreatedEmail(
        customer.email,
        customer.name || 'Customer',
        request.id,
        request.product_name
      );

      logger.info('Request created successfully', {
        requestId: request.id,
        customerId,
      });

      return request;
    } catch (error) {
      logger.error('Create request failed', { error, customerId });
      throw error;
    }
  }

  static async getRequestById(requestId: string, userId: string, userRole: UserRole): Promise<Request> {
    try {
      const request = await Request.findByPk(requestId, {
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
          { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'phone', 'rating'] },
        ],
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Authorization: customers can only see their own requests, agents can see claimed requests, admins see all
      if (userRole === UserRole.CUSTOMER && request.customer_id !== userId) {
        throw new AuthorizationError('You can only view your own requests');
      }

      if (
        userRole === UserRole.AGENT &&
        request.claimed_by_agent_id !== userId &&
        request.status !== RequestStatus.AVAILABLE
      ) {
        throw new AuthorizationError('You can only view available or your claimed requests');
      }

      return request;
    } catch (error) {
      logger.error('Get request failed', { error, requestId, userId });
      throw error;
    }
  }

  static async listRequests(
    userId: string,
    userRole: UserRole,
    filters: {
      page?: number;
      limit?: number;
      status?: RequestStatus;
      type?: RequestType;
      shipping_type?: ShippingType;
    }
  ): Promise<{ requests: Request[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      const where: any = {};

      // Role-based filtering
      if (userRole === UserRole.CUSTOMER) {
        where.customer_id = userId;
      } else if (userRole === UserRole.AGENT) {
        // Agents see available requests OR their claimed requests
        where[Op.or] = [
          { status: RequestStatus.AVAILABLE },
          { claimed_by_agent_id: userId },
        ];
      }
      // Admins see all requests (no filter)

      // Additional filters
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.shipping_type) {
        where.shipping_type = filters.shipping_type;
      }

      const { rows: requests, count: total } = await Request.findAndCountAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'agent', attributes: ['id', 'name', 'rating'] },
        ],
      });

      logger.info('Requests listed successfully', { userId, userRole, count: requests.length });

      return { requests, total, page, limit };
    } catch (error) {
      logger.error('List requests failed', { error, userId });
      throw error;
    }
  }

  static async updateRequest(
    requestId: string,
    userId: string,
    userRole: UserRole,
    data: {
      product_name?: string;
      product_description?: string;
      product_url?: string;
      weight?: number;
      quantity?: number;
      notes?: string;
    }
  ): Promise<Request> {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Only customer can update their own request, and only if not yet claimed
      if (userRole === UserRole.CUSTOMER && request.customer_id !== userId) {
        throw new AuthorizationError('You can only update your own requests');
      }

      if (request.status !== RequestStatus.PENDING && request.status !== RequestStatus.AVAILABLE) {
        throw new ValidationError('Cannot update request after it has been claimed');
      }

      // Update fields
      if (data.product_name !== undefined) request.product_name = data.product_name;
      if (data.product_description !== undefined) request.product_description = data.product_description;
      if (data.product_url !== undefined) request.product_url = data.product_url;
      if (data.weight !== undefined) request.weight = data.weight;
      if (data.quantity !== undefined) request.quantity = data.quantity;
      if (data.notes !== undefined) request.notes = data.notes;

      await request.save();

      logger.info('Request updated successfully', { requestId, userId });

      return request;
    } catch (error) {
      logger.error('Update request failed', { error, requestId, userId });
      throw error;
    }
  }

  static async deleteRequest(requestId: string, userId: string, userRole: UserRole): Promise<void> {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Only customer can delete their own request, and only if not claimed
      if (userRole === UserRole.CUSTOMER && request.customer_id !== userId) {
        throw new AuthorizationError('You can only delete your own requests');
      }

      if (request.status !== RequestStatus.PENDING && request.status !== RequestStatus.AVAILABLE) {
        throw new ValidationError('Cannot delete request after it has been claimed');
      }

      await request.destroy();

      logger.info('Request deleted successfully', { requestId, userId });
    } catch (error) {
      logger.error('Delete request failed', { error, requestId, userId });
      throw error;
    }
  }

  static async claimRequest(requestId: string, agentId: string): Promise<Request> {
    try {
      const request = await Request.findByPk(requestId, {
        include: [{ model: User, as: 'customer' }],
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      if (!request.canBeClaimed()) {
        throw new ValidationError('Request cannot be claimed (already claimed or not available)');
      }

      // Get agent details
      const agent = await User.findByPk(agentId);
      if (!agent) {
        throw new NotFoundError('Agent not found');
      }

      // Claim the request
      await request.claimByAgent(agentId);

      // Send notification to customer
      const customer = request.get('customer') as User;
      if (customer) {
        await EmailService.sendRequestClaimedEmail(
          customer.email,
          customer.name || 'Customer',
          agent.name || 'Agent',
          request.product_name
        );
      }

      logger.info('Request claimed successfully', { requestId, agentId });

      return request;
    } catch (error) {
      logger.error('Claim request failed', { error, requestId, agentId });
      throw error;
    }
  }

  static async unclaimRequest(requestId: string, agentId: string): Promise<Request> {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Verify agent is the one who claimed it
      if (request.claimed_by_agent_id !== agentId) {
        throw new AuthorizationError('You can only unclaim your own requests');
      }

      // Cannot unclaim if already quoted or in progress
      if (
        request.status !== RequestStatus.CLAIMED &&
        request.status !== RequestStatus.AVAILABLE
      ) {
        throw new ValidationError('Cannot unclaim request at this stage');
      }

      // Unclaim
      request.claimed_by_agent_id = null;
      request.status = RequestStatus.AVAILABLE;
      request.claimed_at = null;
      await request.save();

      logger.info('Request unclaimed successfully', { requestId, agentId });

      return request;
    } catch (error) {
      logger.error('Unclaim request failed', { error, requestId, agentId });
      throw error;
    }
  }

  static async updateStatus(
    requestId: string,
    status: RequestStatus,
    userId: string,
    userRole: UserRole
  ): Promise<Request> {
    try {
      const request = await Request.findByPk(requestId);
      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Authorization checks based on role
      if (userRole === UserRole.CUSTOMER && request.customer_id !== userId) {
        throw new AuthorizationError('You can only update status of your own requests');
      }

      if (userRole === UserRole.AGENT && request.claimed_by_agent_id !== userId) {
        throw new AuthorizationError('You can only update status of your claimed requests');
      }

      // Validate status transition
      const validTransitions: Record<RequestStatus, RequestStatus[]> = {
        [RequestStatus.PENDING]: [RequestStatus.AVAILABLE, RequestStatus.CANCELLED],
        [RequestStatus.AVAILABLE]: [RequestStatus.CLAIMED, RequestStatus.CANCELLED],
        [RequestStatus.CLAIMED]: [RequestStatus.IN_PROGRESS, RequestStatus.RESOLUTION_PROVIDED, RequestStatus.AVAILABLE, RequestStatus.CANCELLED],
        [RequestStatus.IN_PROGRESS]: [RequestStatus.RESOLUTION_PROVIDED, RequestStatus.CANCELLED],
        [RequestStatus.RESOLUTION_PROVIDED]: [RequestStatus.ACCEPTED, RequestStatus.REJECTED, RequestStatus.CANCELLED],
        [RequestStatus.ACCEPTED]: [RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED, RequestStatus.CANCELLED],
        [RequestStatus.REJECTED]: [RequestStatus.AVAILABLE, RequestStatus.CANCELLED],
        [RequestStatus.COMPLETED]: [],
        [RequestStatus.CANCELLED]: [],
      };

      if (!validTransitions[request.status]?.includes(status)) {
        throw new ValidationError(`Cannot transition from ${request.status} to ${status}`);
      }

      request.status = status;

      if (status === RequestStatus.COMPLETED || status === RequestStatus.CANCELLED) {
        request.completed_at = new Date();
      }

      await request.save();

      logger.info('Request status updated successfully', { requestId, status, userId });

      return request;
    } catch (error) {
      logger.error('Update status failed', { error, requestId, status, userId });
      throw error;
    }
  }
}

export default RequestService;
