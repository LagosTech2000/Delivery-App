import { Request, Response, NextFunction } from 'express';
import { RequestService } from '../services/request.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';
import { RequestStatus } from '../types';

export class RequestController {
  static createRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const {
      product_name,
      product_description,
      product_url,
      product_images,
      type,
      source,
      weight,
      quantity,
      shipping_type,
      pickup_location,
      delivery_location,
      preferred_contact_method,
      customer_phone,
      notes,
    } = req.body;

    const request = await RequestService.createRequest(userId, {
      product_name,
      product_description,
      product_url,
      product_images,
      type,
      source,
      weight,
      quantity,
      shipping_type,
      pickup_location,
      delivery_location,
      preferred_contact_method,
      customer_phone,
      notes,
    });

    ResponseHandler.success(
      res,
      { request },
      'Request created successfully. An agent will review it soon.',
      201
    );
  });

  static getRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const requestId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const request = await RequestService.getRequestById(requestId, userId, userRole);

    ResponseHandler.success(res, { request }, 'Request retrieved successfully', 200);
  });

  static listRequests = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const { page, limit, status, type, shipping_type } = req.query;

    const result = await RequestService.listRequests(userId, userRole, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as RequestStatus | undefined,
      type: type as any,
      shipping_type: shipping_type as any,
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

  static updateRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const requestId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const {
      product_name,
      product_description,
      product_url,
      weight,
      quantity,
      notes,
    } = req.body;

    const request = await RequestService.updateRequest(requestId, userId, userRole, {
      product_name,
      product_description,
      product_url,
      weight,
      quantity,
      notes,
    });

    ResponseHandler.success(res, { request }, 'Request updated successfully', 200);
  });

  static deleteRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const requestId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    await RequestService.deleteRequest(requestId, userId, userRole);

    ResponseHandler.success(res, null, 'Request deleted successfully', 200);
  });

  static claimRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const request = await RequestService.claimRequest(requestId, userId);

    ResponseHandler.success(
      res,
      { request },
      'Request claimed successfully. You can now provide a resolution.',
      200
    );
  });

  static unclaimRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const request = await RequestService.unclaimRequest(requestId, userId);

    ResponseHandler.success(res, { request }, 'Request unclaimed successfully', 200);
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const requestId = req.params.id;
    const { status } = req.body;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const request = await RequestService.updateStatus(requestId, status, userId, userRole);

    ResponseHandler.success(res, { request }, 'Request status updated successfully', 200);
  });
}

export default RequestController;
