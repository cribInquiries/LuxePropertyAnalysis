import { Request, Response, NextFunction } from 'express';
import { DatabaseService as prisma } from '@/config/database';
import { AuthRequest } from '@/middleware/auth';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class PropertyController {
  public getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search,
        propertyType,
        status,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        city,
        state,
        zipCode,
      } = req.query;

      const filters = {
        search: search as string,
        property_type: propertyType as string,
        status: status as string,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        city: city as string,
        state: state as string,
        zip_code: zipCode as string,
        sort_by: sortBy as string,
        sort_order: sortOrder as string,
      };

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: properties, error, count } = await prisma.getProperties(filters, pagination);

      if (error) {
        throw new CustomError('Failed to fetch properties', 500);
      }

      res.json({
        success: true,
        data: {
          properties: properties || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            pages: Math.ceil((count || 0) / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: property, error } = await prisma.getPropertyById(id);

      if (error || !property) {
        throw new CustomError('Property not found', 404);
      }

      // Increment view count
      await prisma.updateProperty(id, { views: (property.views || 0) + 1 });

      res.json({
        success: true,
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  };

  public createProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyData = {
        ...req.body,
        owner_id: req.user!.id,
        is_active: true,
        is_featured: false,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: property, error } = await prisma.createProperty(propertyData);

      if (error) {
        throw new CustomError('Failed to create property', 500);
      }

      logger.info(`Property created: ${property.id} by user: ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if property exists and user has permission
      const { data: existingProperty, error: fetchError } = await prisma.getPropertyById(id);

      if (fetchError || !existingProperty) {
        throw new CustomError('Property not found', 404);
      }

      if (existingProperty.owner_id !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new CustomError('Not authorized to update this property', 403);
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString(),
      };

      const { data: property, error } = await prisma.updateProperty(id, updateData);

      if (error) {
        throw new CustomError('Failed to update property', 500);
      }

      logger.info(`Property updated: ${property.id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Property updated successfully',
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if property exists and user has permission
      const { data: existingProperty, error: fetchError } = await prisma.getPropertyById(id);

      if (fetchError || !existingProperty) {
        throw new CustomError('Property not found', 404);
      }

      if (existingProperty.owner_id !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new CustomError('Not authorized to delete this property', 403);
      }

      // Soft delete
      const { error } = await prisma.deleteProperty(id);

      if (error) {
        throw new CustomError('Failed to delete property', 500);
      }

      logger.info(`Property deleted: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Property deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if property exists
      const { data: property, error: propertyError } = await prisma.getPropertyById(id);

      if (propertyError || !property) {
        throw new CustomError('Property not found', 404);
      }

      const { data: result, error } = await prisma.toggleFavorite(userId, id);

      if (error) {
        throw new CustomError('Failed to toggle favorite', 500);
      }

      res.json({
        success: true,
        message: result?.isFavorited ? 'Property added to favorites' : 'Property removed from favorites',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public createInquiry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { message, phone, email } = req.body;

      // Check if property exists
      const { data: property, error: propertyError } = await prisma.getPropertyById(id);

      if (propertyError || !property) {
        throw new CustomError('Property not found', 404);
      }

      const inquiryData = {
        property_id: id,
        user_id: req.user!.id,
        message,
        phone: phone || '',
        email: email || req.user!.email,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inquiry, error } = await prisma.createInquiry(inquiryData);

      if (error) {
        throw new CustomError('Failed to create inquiry', 500);
      }

      logger.info(`Inquiry created for property: ${id} by user: ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Inquiry submitted successfully',
        data: { inquiry },
      });
    } catch (error) {
      next(error);
    }
  };

  public getPropertyAnalyses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: analyses, error } = await prisma.getAnalyses(
        { property_id: id, is_public: true },
        { page: 1, limit: 100 }
      );

      if (error) {
        throw new CustomError('Failed to fetch analyses', 500);
      }

      res.json({
        success: true,
        data: { analyses: analyses || [] },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyProperties = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const filters = {
        owner_id: req.user!.id,
      };

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: properties, error, count } = await prisma.getProperties(filters, pagination);

      if (error) {
        throw new CustomError('Failed to fetch properties', 500);
      }

      res.json({
        success: true,
        data: {
          properties: properties || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            pages: Math.ceil((count || 0) / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: favorites, error, count } = await prisma.getFavorites(req.user!.id, pagination);

      if (error) {
        throw new CustomError('Failed to fetch favorites', 500);
      }

      res.json({
        success: true,
        data: {
          favorites: favorites || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            pages: Math.ceil((count || 0) / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getPropertyMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user has permission to view messages
      const { data: property, error: propertyError } = await prisma.getPropertyById(id);

      if (propertyError || !property) {
        throw new CustomError('Property not found', 404);
      }

      if (property.owner_id !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new CustomError('Not authorized to view these messages', 403);
      }

      const { data: messages, error } = await prisma.getMessages(req.user!.id, { page: 1, limit: 100 });

      if (error) {
        throw new CustomError('Failed to fetch messages', 500);
      }

      res.json({
        success: true,
        data: { messages: messages || [] },
      });
    } catch (error) {
      next(error);
    }
  };
}