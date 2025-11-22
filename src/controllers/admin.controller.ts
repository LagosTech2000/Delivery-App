import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export class AdminController {
  static getDashboardStats = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await AdminService.getDashboardStats();

    ResponseHandler.success(res, { stats }, 'Dashboard stats retrieved successfully', 200);
  });

  static getAllUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, role, status } = req.query;

    const result = await AdminService.getAllUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      role: role as any,
      status: status as any,
    });

    ResponseHandler.paginated(
      res,
      result.users,
      result.page,
      result.limit,
      result.total,
      'Users retrieved successfully'
    );
  });

  static updateUserStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.params.id;
    const { status } = req.body;

    const user = await AdminService.updateUserStatus(userId, status);

    ResponseHandler.success(
      res,
      { user },
      'User status updated successfully',
      200
    );
  });

  static updateUserRole = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.params.id;
    const { role } = req.body;

    const user = await AdminService.updateUserRole(userId, role);

    ResponseHandler.success(
      res,
      { user },
      'User role updated successfully',
      200
    );
  });

  static getAllRequests = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, status } = req.query;

    const result = await AdminService.getAllRequests({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as any,
    });

    ResponseHandler.paginated(
      res,
      result.requests,
      result.page,
      result.limit,
      result.total,
      'Requests retrieved successfully'
    );
  });
}

export default AdminController;
