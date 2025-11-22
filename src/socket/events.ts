import { Socket } from 'socket.io';
import { socketService } from './index';
import { JwtPayload } from '../types';
import User from '../models/User';
import logger from '../utils/logger';

export class SocketEvents {
  static registerEvents(socket: Socket): void {
    const user = socket.data.user as JwtPayload;

    // Agent-specific events
    if (user.role === 'agent') {
      socket.on('agent:online', () => this.handleAgentOnline(socket));
      socket.on('agent:offline', () => this.handleAgentOffline(socket));
    }

    // Request events (both customers and agents)
    socket.on('request:subscribe', (requestId: string) =>
      this.handleRequestSubscribe(socket, requestId)
    );
    socket.on('request:unsubscribe', (requestId: string) =>
      this.handleRequestUnsubscribe(socket, requestId)
    );

    // Typing indicators
    socket.on('typing:start', (data: { requestId: string }) =>
      this.handleTypingStart(socket, data.requestId)
    );
    socket.on('typing:stop', (data: { requestId: string }) =>
      this.handleTypingStop(socket, data.requestId)
    );
  }

  // Agent comes online
  private static async handleAgentOnline(socket: Socket): Promise<void> {
    try {
      const user = socket.data.user as JwtPayload;

      // Update database
      await User.update(
        { is_online: true },
        { where: { id: user.userId } }
      );

      logger.info('Agent came online', { userId: user.userId });

      // Notify admins about online agent count
      const onlineCount = await socketService.getOnlineAgentCount();
      socketService.emitToAdmins('agent:count', {
        count: onlineCount,
        timestamp: new Date().toISOString(),
      });

      // Acknowledge to the agent
      socket.emit('agent:online:success', {
        message: 'You are now online',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to set agent online', { error });
      socket.emit('agent:online:error', {
        error: 'Failed to set online status',
      });
    }
  }

  // Agent goes offline
  private static async handleAgentOffline(socket: Socket): Promise<void> {
    try {
      const user = socket.data.user as JwtPayload;

      // Update database
      await User.update(
        { is_online: false },
        { where: { id: user.userId } }
      );

      logger.info('Agent went offline', { userId: user.userId });

      // Notify admins about online agent count
      const onlineCount = await socketService.getOnlineAgentCount();
      socketService.emitToAdmins('agent:count', {
        count: onlineCount,
        timestamp: new Date().toISOString(),
      });

      // Acknowledge to the agent
      socket.emit('agent:offline:success', {
        message: 'You are now offline',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to set agent offline', { error });
      socket.emit('agent:offline:error', {
        error: 'Failed to set offline status',
      });
    }
  }

  // Subscribe to request updates
  private static handleRequestSubscribe(
    socket: Socket,
    requestId: string
  ): void {
    const user = socket.data.user as JwtPayload;

    // Join request-specific room
    socket.join(`request:${requestId}`);

    logger.info('User subscribed to request updates', {
      userId: user.userId,
      requestId,
    });

    socket.emit('request:subscribed', {
      requestId,
      message: 'Subscribed to request updates',
    });
  }

  // Unsubscribe from request updates
  private static handleRequestUnsubscribe(
    socket: Socket,
    requestId: string
  ): void {
    const user = socket.data.user as JwtPayload;

    // Leave request-specific room
    socket.leave(`request:${requestId}`);

    logger.info('User unsubscribed from request updates', {
      userId: user.userId,
      requestId,
    });

    socket.emit('request:unsubscribed', {
      requestId,
      message: 'Unsubscribed from request updates',
    });
  }

  // Handle typing start
  private static handleTypingStart(socket: Socket, requestId: string): void {
    const user = socket.data.user as JwtPayload;

    // Broadcast to others in the request room
    socket.to(`request:${requestId}`).emit('typing:start', {
      requestId,
      userId: user.userId,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle typing stop
  private static handleTypingStop(socket: Socket, requestId: string): void {
    const user = socket.data.user as JwtPayload;

    // Broadcast to others in the request room
    socket.to(`request:${requestId}`).emit('typing:stop', {
      requestId,
      userId: user.userId,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
    });
  }
}

// Helper functions to emit events from services

export const emitRequestCreated = (requestData: any): void => {
  // Notify all online agents
  socketService.emitToAgents('request:new', {
    request: requestData,
    timestamp: new Date().toISOString(),
  });
};

export const emitRequestClaimed = (
  customerId: string,
  requestData: any
): void => {
  // Notify customer
  socketService.emitToUser(customerId, 'request:claimed', {
    request: requestData,
    timestamp: new Date().toISOString(),
  });

  // Notify request room
  socketService.getIO().to(`request:${requestData.id}`).emit('request:updated', {
    request: requestData,
    event: 'claimed',
    timestamp: new Date().toISOString(),
  });
};

export const emitRequestUnclaimed = (requestData: any): void => {
  // Notify all agents again
  socketService.emitToAgents('request:available', {
    request: requestData,
    timestamp: new Date().toISOString(),
  });

  // Notify request room
  socketService.getIO().to(`request:${requestData.id}`).emit('request:updated', {
    request: requestData,
    event: 'unclaimed',
    timestamp: new Date().toISOString(),
  });
};

export const emitRequestUpdated = (requestData: any): void => {
  // Notify customer
  if (requestData.customer_id) {
    socketService.emitToUser(requestData.customer_id, 'request:updated', {
      request: requestData,
      timestamp: new Date().toISOString(),
    });
  }

  // Notify agent
  if (requestData.claimed_by_agent_id) {
    socketService.emitToUser(
      requestData.claimed_by_agent_id,
      'request:updated',
      {
        request: requestData,
        timestamp: new Date().toISOString(),
      }
    );
  }

  // Notify request room
  socketService.getIO().to(`request:${requestData.id}`).emit('request:updated', {
    request: requestData,
    timestamp: new Date().toISOString(),
  });
};

export const emitResolutionProvided = (
  customerId: string,
  resolutionData: any
): void => {
  // Notify customer
  socketService.emitToUser(customerId, 'resolution:provided', {
    resolution: resolutionData,
    timestamp: new Date().toISOString(),
  });

  // Notify request room
  if (resolutionData.request_id) {
    socketService.getIO().to(`request:${resolutionData.request_id}`).emit('resolution:new', {
      resolution: resolutionData,
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitResolutionAccepted = (
  agentId: string,
  resolutionData: any
): void => {
  // Notify agent
  socketService.emitToUser(agentId, 'resolution:accepted', {
    resolution: resolutionData,
    timestamp: new Date().toISOString(),
  });

  // Notify request room
  if (resolutionData.request_id) {
    socketService.getIO().to(`request:${resolutionData.request_id}`).emit('resolution:updated', {
      resolution: resolutionData,
      event: 'accepted',
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitResolutionRejected = (
  agentId: string,
  resolutionData: any
): void => {
  // Notify agent
  socketService.emitToUser(agentId, 'resolution:rejected', {
    resolution: resolutionData,
    timestamp: new Date().toISOString(),
  });

  // Notify request room
  if (resolutionData.request_id) {
    socketService.getIO().to(`request:${resolutionData.request_id}`).emit('resolution:updated', {
      resolution: resolutionData,
      event: 'rejected',
      timestamp: new Date().toISOString(),
    });
  }
};

export default SocketEvents;
