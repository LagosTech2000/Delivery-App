import User from '../models/User';
import Request from '../models/Request';
import Resolution from '../models/Resolution';
import { UserRole, UserStatus, RequestStatus } from '../types';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export class AdminService {
  static async getDashboardStats(): Promise<any> {
    try {
      // Count users by role
      const totalUsers = await User.count();
      const customers = await User.count({ where: { role: UserRole.CUSTOMER } });
      const agents = await User.count({ where: { role: UserRole.AGENT } });
      const onlineAgents = await User.count({
        where: { role: UserRole.AGENT, is_online: true },
      });

      // Count requests by status
      const totalRequests = await Request.count();
      const pendingRequests = await Request.count({
        where: { status: RequestStatus.PENDING },
      });
      const availableRequests = await Request.count({
        where: { status: RequestStatus.AVAILABLE },
      });
      const claimedRequests = await Request.count({
        where: { status: RequestStatus.CLAIMED },
      });
      const completedRequests = await Request.count({
        where: { status: RequestStatus.COMPLETED },
      });

      // Count resolutions
      const totalResolutions = await Resolution.count();
      const pendingResolutions = await Resolution.count({
        where: { status: 'pending' },
      });

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUsers = await User.count({
        where: { created_at: { [Op.gte]: sevenDaysAgo } },
      });
      const recentRequests = await Request.count({
        where: { created_at: { [Op.gte]: sevenDaysAgo } },
      });

      const stats = {
        users: {
          total: totalUsers,
          customers,
          agents,
          onlineAgents,
          recentSignups: recentUsers,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          available: availableRequests,
          claimed: claimedRequests,
          completed: completedRequests,
          recent: recentRequests,
        },
        resolutions: {
          total: totalResolutions,
          pending: pendingResolutions,
        },
      };

      logger.info('Dashboard stats retrieved successfully');

      return stats;
    } catch (error) {
      logger.error('Get dashboard stats failed', { error });
      throw error;
    }
  }

  static async getAllUsers(filters: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      const where: any = {};
      if (filters.role) where.role = filters.role;
      if (filters.status) where.status = filters.status;

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        attributes: {
          exclude: ['password_hash', 'refresh_token_hash'],
        },
      });

      return { users, total, page, limit };
    } catch (error) {
      logger.error('Get all users failed', { error });
      throw error;
    }
  }

  static async updateUserStatus(
    userId: string,
    status: UserStatus
  ): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.status = status;
      await user.save();

      logger.info('User status updated', { userId, status });

      return user;
    } catch (error) {
      logger.error('Update user status failed', { error, userId });
      throw error;
    }
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.role = role;
      await user.save();

      logger.info('User role updated', { userId, role });

      return user;
    } catch (error) {
      logger.error('Update user role failed', { error, userId });
      throw error;
    }
  }

  static async getAllRequests(filters: {
    page?: number;
    limit?: number;
    status?: RequestStatus;
  }): Promise<{ requests: Request[]; total: number; page: number; limit: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      const where: any = {};
      if (filters.status) where.status = filters.status;

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

      return { requests, total, page, limit };
    } catch (error) {
      logger.error('Get all requests failed', { error });
      throw error;
    }
  }
}

export default AdminService;
