import File from '../models/File';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { FileType, UserRole } from '../types';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { env } from '../config/environment';

export class FileService {
  static async uploadFile(
    userId: string,
    file: Express.Multer.File,
    data: {
      file_type: FileType;
      related_to_request_id?: string;
      related_to_resolution_id?: string;
    }
  ): Promise<File> {
    try {
      const fileRecord = await File.create({
        uploaded_by_user_id: userId,
        related_to_request_id: data.related_to_request_id || null,
        related_to_resolution_id: data.related_to_resolution_id || null,
        filename: file.filename,
        original_name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        file_path: file.path,
        public_url: null, // Can be set when migrating to cloud storage
        file_type: data.file_type,
      });

      logger.info('File uploaded successfully', {
        fileId: fileRecord.id,
        userId,
        filename: file.filename,
      });

      return fileRecord;
    } catch (error) {
      // Clean up file if database operation fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      logger.error('File upload failed', { error, userId, filename: file.filename });
      throw error;
    }
  }

  static async uploadMultipleFiles(
    userId: string,
    files: Express.Multer.File[],
    data: {
      file_type: FileType;
      related_to_request_id?: string;
      related_to_resolution_id?: string;
    }
  ): Promise<File[]> {
    try {
      const fileRecords = await Promise.all(
        files.map((file) =>
          File.create({
            uploaded_by_user_id: userId,
            related_to_request_id: data.related_to_request_id || null,
            related_to_resolution_id: data.related_to_resolution_id || null,
            filename: file.filename,
            original_name: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            file_path: file.path,
            public_url: null,
            file_type: data.file_type,
          })
        )
      );

      logger.info('Multiple files uploaded successfully', {
        userId,
        count: files.length,
      });

      return fileRecords;
    } catch (error) {
      // Clean up files if database operation fails
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      logger.error('Multiple file upload failed', { error, userId });
      throw error;
    }
  }

  static async getFileById(
    fileId: string,
    userId: string,
    userRole: UserRole
  ): Promise<File> {
    try {
      const file = await File.findByPk(fileId);

      if (!file) {
        throw new NotFoundError('File not found');
      }

      // Authorization: users can only access their own files or files they're authorized to see
      // Admins can see all files
      if (userRole !== UserRole.ADMIN && file.uploaded_by_user_id !== userId) {
        // TODO: Add more sophisticated authorization based on request/resolution ownership
        throw new AuthorizationError('You do not have permission to access this file');
      }

      return file;
    } catch (error) {
      logger.error('Get file failed', { error, fileId, userId });
      throw error;
    }
  }

  static async deleteFile(
    fileId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    try {
      const file = await File.findByPk(fileId);

      if (!file) {
        throw new NotFoundError('File not found');
      }

      // Only file owner or admin can delete
      if (userRole !== UserRole.ADMIN && file.uploaded_by_user_id !== userId) {
        throw new AuthorizationError('You can only delete your own files');
      }

      // Delete physical file
      const filePath = path.join(process.cwd(), env.UPLOAD_DIR, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record (soft delete)
      await file.destroy();

      logger.info('File deleted successfully', { fileId, userId });
    } catch (error) {
      logger.error('Delete file failed', { error, fileId, userId });
      throw error;
    }
  }

  static async getFilesByRequest(requestId: string): Promise<File[]> {
    try {
      const files = await File.findAll({
        where: { related_to_request_id: requestId },
        order: [['created_at', 'DESC']],
      });

      return files;
    } catch (error) {
      logger.error('Get files by request failed', { error, requestId });
      throw error;
    }
  }

  static async getFilesByResolution(resolutionId: string): Promise<File[]> {
    try {
      const files = await File.findAll({
        where: { related_to_resolution_id: resolutionId },
        order: [['created_at', 'DESC']],
      });

      return files;
    } catch (error) {
      logger.error('Get files by resolution failed', { error, resolutionId });
      throw error;
    }
  }
}

export default FileService;
