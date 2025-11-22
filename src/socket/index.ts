import { Server as HttpServer } from 'http';
import { Server, Socket, RemoteSocket } from 'socket.io';
import { JwtService } from '../utils/jwt';
import { JwtPayload } from '../types';
import logger from '../utils/logger';
import { env } from '../config/environment';

export class SocketService {
  private io: Server | null = null;

  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.FRONTEND_URL,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token as string;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const payload = JwtService.verifyAccessToken(token) as JwtPayload;

        // Attach user data to socket
        socket.data.user = payload;

        logger.info('Socket authenticated', {
          userId: payload.userId,
          socketId: socket.id,
        });

        next();
      } catch (error) {
        logger.error('Socket authentication failed', { error });
        next(new Error('Authentication failed'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user as JwtPayload;

      logger.info('Socket connected', {
        userId: user.userId,
        email: user.email,
        role: user.role,
        socketId: socket.id,
      });

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Join role-based rooms
      if (user.role === 'agent') {
        socket.join('agent-room');
      } else if (user.role === 'admin') {
        socket.join('admin-room');
      }

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info('Socket disconnected', {
          userId: user.userId,
          socketId: socket.id,
          reason,
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error('Socket error', {
          userId: user.userId,
          socketId: socket.id,
          error,
        });
      });
    });

    logger.info('Socket.io server initialized');

    return this.io;
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io not initialized. Call initialize() first');
    }
    return this.io;
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any): void {
    this.getIO().to(`user:${userId}`).emit(event, data);
  }

  // Emit to all agents
  emitToAgents(event: string, data: any): void {
    this.getIO().to('agent-room').emit(event, data);
  }

  // Emit to all admins
  emitToAdmins(event: string, data: any): void {
    this.getIO().to('admin-room').emit(event, data);
  }

  // Emit to everyone
  emitToAll(event: string, data: any): void {
    this.getIO().emit(event, data);
  }

  // Get connected sockets for a user
  async getUserSockets(userId: string): Promise<RemoteSocket<any, any>[]> {
    const sockets = await this.getIO().in(`user:${userId}`).fetchSockets();
    return sockets;
  }

  // Check if user is connected
  async isUserConnected(userId: string): Promise<boolean> {
    const sockets = await this.getUserSockets(userId);
    return sockets.length > 0;
  }

  // Get count of online agents
  async getOnlineAgentCount(): Promise<number> {
    const sockets = await this.getIO().in('agent-room').fetchSockets();
    const uniqueUserIds = new Set(
      sockets.map((socket) => (socket.data.user as JwtPayload).userId)
    );
    return uniqueUserIds.size;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
