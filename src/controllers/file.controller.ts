import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/file.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';
import path from 'path';
import { env } from '../config/environment';

export class FileController {
  static uploadSingle = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    if (!req.file) {
      ResponseHandler.error(res, 'No file uploaded', 400);
      return;
    }

    const { file_type, related_to_request_id, related_to_resolution_id } = req.body;

    const file = await FileService.uploadFile(userId, req.file, {
      file_type,
      related_to_request_id,
      related_to_resolution_id,
    });

    ResponseHandler.success(
      res,
      { file },
      'File uploaded successfully',
      201
    );
  });

  static uploadMultiple = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      ResponseHandler.error(res, 'No files uploaded', 400);
      return;
    }

    const { file_type, related_to_request_id, related_to_resolution_id } = req.body;

    const files = await FileService.uploadMultipleFiles(userId, req.files, {
      file_type,
      related_to_request_id,
      related_to_resolution_id,
    });

    ResponseHandler.success(
      res,
      { files },
      `${files.length} file(s) uploaded successfully`,
      201
    );
  });

  static getFile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const fileId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const file = await FileService.getFileById(fileId, userId, userRole);

    ResponseHandler.success(res, { file }, 'File retrieved successfully', 200);
  });

  static downloadFile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const fileId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    const file = await FileService.getFileById(fileId, userId, userRole);

    // Send file for download
    const filePath = path.join(process.cwd(), env.UPLOAD_DIR, file.filename);
    res.download(filePath, file.original_name);
  });

  static deleteFile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const fileId = req.params.id;

    if (!userId || !userRole) {
      ResponseHandler.error(res, 'User not authenticated', 401);
      return;
    }

    await FileService.deleteFile(fileId, userId, userRole);

    ResponseHandler.success(res, null, 'File deleted successfully', 200);
  });
}

export default FileController;
