import Resolution from '../models/Resolution';
import Request from '../models/Request';
import User from '../models/User';
import { EmailService } from '../config/email';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '../utils/errors';
import { ResolutionStatus, RequestStatus, UserRole } from '../types';
import logger from '../utils/logger';
import {
  emitResolutionProvided,
  emitResolutionAccepted,
  emitResolutionRejected,
} from '../socket/events';

export class ResolutionService {
  static async createResolution(
    agentId: string,
    data: {
      request_id: string;
      quote_breakdown: any;
      estimated_delivery_days: number;
      notes?: string;
      internal_notes?: string;
    }
  ): Promise<Resolution> {
    try {
      // Verify request exists and agent has claimed it
      const request = await Request.findByPk(data.request_id, {
        include: [{ model: User, as: 'customer' }],
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      if (request.claimed_by_agent_id !== agentId) {
        throw new AuthorizationError('You can only create resolutions for your claimed requests');
      }

      if (request.status !== RequestStatus.CLAIMED && request.status !== RequestStatus.IN_PROGRESS) {
        throw new ValidationError('Request must be claimed or in progress to provide a resolution');
      }

      // Create resolution
      const resolution = await Resolution.create({
        request_id: data.request_id,
        agent_id: agentId,
        quote_breakdown: data.quote_breakdown,
        estimated_delivery_days: data.estimated_delivery_days,
        notes: data.notes,
        internal_notes: data.internal_notes,
        status: ResolutionStatus.PENDING,
      });

      // Update request status
      request.status = RequestStatus.RESOLUTION_PROVIDED;
      await request.save();

      // Send notification to customer
      const customer = request.get('customer') as User;
      if (customer) {
        await EmailService.sendResolutionProvidedEmail(
          customer.email,
          customer.name || 'Customer',
          request.product_name,
          data.quote_breakdown.total,
          data.estimated_delivery_days
        );
      }

      logger.info('Resolution created successfully', {
        resolutionId: resolution.id,
        requestId: data.request_id,
        agentId,
      });

      // Emit real-time event to customer
      emitResolutionProvided(request.customer_id, resolution.toJSON());

      return resolution;
    } catch (error) {
      logger.error('Create resolution failed', { error, agentId, data });
      throw error;
    }
  }

  static async getResolutionById(
    resolutionId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Resolution> {
    try {
      const resolution = await Resolution.findByPk(resolutionId, {
        include: [
          { model: Request, as: 'request', include: [{ model: User, as: 'customer' }] },
          { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'rating'] },
        ],
      });

      if (!resolution) {
        throw new NotFoundError('Resolution not found');
      }

      const request = resolution.get('request') as Request;

      // Authorization checks
      if (userRole === UserRole.CUSTOMER && request.customer_id !== userId) {
        throw new AuthorizationError('You can only view resolutions for your own requests');
      }

      if (userRole === UserRole.AGENT && resolution.agent_id !== userId) {
        throw new AuthorizationError('You can only view your own resolutions');
      }

      return resolution;
    } catch (error) {
      logger.error('Get resolution failed', { error, resolutionId, userId });
      throw error;
    }
  }

  static async listResolutionsForRequest(
    requestId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Resolution[]> {
    try {
      // Verify user has access to this request
      const request = await Request.findByPk(requestId);
      if (!request) {
        throw new NotFoundError('Request not found');
      }

      if (userRole === UserRole.CUSTOMER && request.customer_id !== userId) {
        throw new AuthorizationError('You can only view resolutions for your own requests');
      }

      if (userRole === UserRole.AGENT && request.claimed_by_agent_id !== userId) {
        throw new AuthorizationError('You can only view resolutions for your claimed requests');
      }

      const resolutions = await Resolution.findAll({
        where: { request_id: requestId },
        include: [
          { model: User, as: 'agent', attributes: ['id', 'name', 'rating'] },
        ],
        order: [['created_at', 'DESC']],
      });

      return resolutions;
    } catch (error) {
      logger.error('List resolutions failed', { error, requestId, userId });
      throw error;
    }
  }

  static async updateResolution(
    resolutionId: string,
    agentId: string,
    data: {
      quote_breakdown?: any;
      estimated_delivery_days?: number;
      notes?: string;
      internal_notes?: string;
    }
  ): Promise<Resolution> {
    try {
      const resolution = await Resolution.findByPk(resolutionId);
      if (!resolution) {
        throw new NotFoundError('Resolution not found');
      }

      // Only the agent who created it can update
      if (resolution.agent_id !== agentId) {
        throw new AuthorizationError('You can only update your own resolutions');
      }

      // Can only update pending resolutions
      if (resolution.status !== ResolutionStatus.PENDING) {
        throw new ValidationError('Can only update pending resolutions');
      }

      // Update fields
      if (data.quote_breakdown !== undefined) resolution.quote_breakdown = data.quote_breakdown;
      if (data.estimated_delivery_days !== undefined) {
        resolution.estimated_delivery_days = data.estimated_delivery_days;
      }
      if (data.notes !== undefined) resolution.notes = data.notes;
      if (data.internal_notes !== undefined) resolution.internal_notes = data.internal_notes;

      await resolution.save();

      logger.info('Resolution updated successfully', { resolutionId, agentId });

      return resolution;
    } catch (error) {
      logger.error('Update resolution failed', { error, resolutionId, agentId });
      throw error;
    }
  }

  static async acceptResolution(
    resolutionId: string,
    customerId: string,
    customerResponseNotes?: string
  ): Promise<Resolution> {
    try {
      const resolution = await Resolution.findByPk(resolutionId, {
        include: [
          {
            model: Request,
            as: 'request',
            include: [{ model: User, as: 'customer' }]
          },
          { model: User, as: 'agent' },
        ],
      });

      if (!resolution) {
        throw new NotFoundError('Resolution not found');
      }

      const request = resolution.get('request') as Request;

      // Verify customer owns the request
      if (request.customer_id !== customerId) {
        throw new AuthorizationError('You can only accept resolutions for your own requests');
      }

      // Accept the resolution
      await resolution.accept(customerResponseNotes);

      // Update request status
      request.status = RequestStatus.ACCEPTED;
      await request.save();

      // Send notification to agent
      const agent = resolution.get('agent') as User;

      if (agent) {
        await EmailService.sendResolutionAcceptedEmail(
          agent.email,
          agent.name || 'Agent',
          request.product_name
        );
      }

      logger.info('Resolution accepted successfully', { resolutionId, customerId });

      // Emit real-time event to agent
      emitResolutionAccepted(resolution.agent_id, resolution.toJSON());

      return resolution;
    } catch (error) {
      logger.error('Accept resolution failed', { error, resolutionId, customerId });
      throw error;
    }
  }

  static async rejectResolution(
    resolutionId: string,
    customerId: string,
    customerResponseNotes: string
  ): Promise<Resolution> {
    try {
      const resolution = await Resolution.findByPk(resolutionId, {
        include: [
          {
            model: Request,
            as: 'request',
            include: [{ model: User, as: 'customer' }]
          },
          { model: User, as: 'agent' },
        ],
      });

      if (!resolution) {
        throw new NotFoundError('Resolution not found');
      }

      const request = resolution.get('request') as Request;

      // Verify customer owns the request
      if (request.customer_id !== customerId) {
        throw new AuthorizationError('You can only reject resolutions for your own requests');
      }

      // Reject the resolution
      await resolution.reject(customerResponseNotes);

      // Update request status back to claimed so agent can provide another resolution
      request.status = RequestStatus.CLAIMED;
      await request.save();

      // Send notification to agent
      const agent = resolution.get('agent') as User;

      if (agent) {
        await EmailService.sendResolutionRejectedEmail(
          agent.email,
          agent.name || 'Agent',
          request.product_name,
          customerResponseNotes
        );
      }

      logger.info('Resolution rejected successfully', { resolutionId, customerId });

      // Emit real-time event to agent
      emitResolutionRejected(resolution.agent_id, resolution.toJSON());

      return resolution;
    } catch (error) {
      logger.error('Reject resolution failed', { error, resolutionId, customerId });
      throw error;
    }
  }
}

export default ResolutionService;
