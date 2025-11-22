import { Request, Response, NextFunction } from 'express';
import { ResolutionService } from '../services/resolution.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';

export class ResolutionController {
  static createResolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const {
      request_id,
      quote_breakdown,
      estimated_delivery_days,
      notes,
      internal_notes,
    } = req.body;

    const resolution = await ResolutionService.createResolution(userId, {
      request_id,
      quote_breakdown,
      estimated_delivery_days,
      notes,
      internal_notes,
    });

    ResponseHandler.success(
      res,
      { resolution },
      'Resolution created successfully',
      201
    );
  });

  static getResolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const resolutionId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const resolution = await ResolutionService.getResolutionById(
      resolutionId,
      userId,
      userRole
    );

    ResponseHandler.success(res, { resolution }, 'Resolution retrieved successfully', 200);
  });

  static listResolutionsForRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const requestId = req.query.request_id as string;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    if (!requestId) {
      ResponseHandler.error(res, 'Request ID is required', 400);
      return;
    }

    const resolutions = await ResolutionService.listResolutionsForRequest(
      requestId,
      userId,
      userRole
    );

    ResponseHandler.success(
      res,
      { resolutions },
      'Resolutions retrieved successfully',
      200
    );
  });

  static updateResolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const resolutionId = req.params.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const {
      quote_breakdown,
      estimated_delivery_days,
      notes,
      internal_notes,
    } = req.body;

    const resolution = await ResolutionService.updateResolution(resolutionId, userId, {
      quote_breakdown,
      estimated_delivery_days,
      notes,
      internal_notes,
    });

    ResponseHandler.success(res, { resolution }, 'Resolution updated successfully', 200);
  });

  static acceptResolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const resolutionId = req.params.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const { customer_response_notes } = req.body;

    const resolution = await ResolutionService.acceptResolution(
      resolutionId,
      userId,
      customer_response_notes
    );

    ResponseHandler.success(
      res,
      { resolution },
      'Resolution accepted successfully. The agent will proceed with the delivery.',
      200
    );
  });

  static rejectResolution = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const resolutionId = req.params.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const { customer_response_notes } = req.body;

    const resolution = await ResolutionService.rejectResolution(
      resolutionId,
      userId,
      customer_response_notes
    );

    ResponseHandler.success(
      res,
      { resolution },
      'Resolution rejected. The agent has been notified.',
      200
    );
  });
}

export default ResolutionController;
