import { Request, Response, NextFunction } from 'express';
import { DatabaseService as prisma } from '@/config/database';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UploadController {
  public uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new CustomError('No image file provided', 400);
      }

      const fileName = `images/${Date.now()}-${req.file.originalname}`;
      const { data, error } = await prisma.uploadFile(
        'luxe-property',
        fileName,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          upsert: false,
        }
      );

      if (error) {
        throw new CustomError('Failed to upload image', 500);
      }

      const publicUrl = prisma.getPublicUrl('luxe-property', fileName);

      logger.info(`Image uploaded: ${fileName}`);

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          publicId: fileName,
          url: publicUrl,
          path: fileName,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new CustomError('No image files provided', 400);
      }

      const uploadPromises = req.files.map(async (file, index) => {
        const fileName = `images/${Date.now()}-${index}-${file.originalname}`;
        const { data, error } = await prisma.uploadFile(
          'luxe-property',
          fileName,
          file.buffer,
          {
            contentType: file.mimetype,
            upsert: false,
          }
        );

        if (error) {
          throw new CustomError(`Failed to upload image ${index + 1}`, 500);
        }

        const publicUrl = prisma.getPublicUrl('luxe-property', fileName);

        return {
          publicId: fileName,
          url: publicUrl,
          path: fileName,
        };
      });

      const results = await Promise.all(uploadPromises);

      logger.info(`${results.length} images uploaded`);

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          images: results,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new CustomError('No document file provided', 400);
      }

      const fileName = `documents/${Date.now()}-${req.file.originalname}`;
      const { data, error } = await prisma.uploadFile(
        'luxe-property',
        fileName,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          upsert: false,
        }
      );

      if (error) {
        throw new CustomError('Failed to upload document', 500);
      }

      const publicUrl = prisma.getPublicUrl('luxe-property', fileName);

      logger.info(`Document uploaded: ${fileName}`);

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          publicId: fileName,
          url: publicUrl,
          path: fileName,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new CustomError('Public ID is required', 400);
      }

      const { data, error } = await prisma.deleteFile('luxe-property', publicId);

      if (error) {
        throw new CustomError('Failed to delete file', 400);
      }

      logger.info(`File deleted: ${publicId}`);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
