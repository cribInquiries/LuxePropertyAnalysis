import { Request, Response, NextFunction } from 'express';
import { DatabaseService as prisma } from '@/config/database';
import { AuthRequest } from '@/middleware/auth';
import { CustomError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class UserController {
  public getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data: user, error } = await prisma.getUserById(req.user!.id);

      if (error || !user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, phone, bio, avatar } = req.body;

      const { data: user, error } = await prisma.updateUser(req.user!.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        bio,
        avatar,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new CustomError('Failed to update profile', 500);
      }

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public getFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

  public getInquiries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const filters: any = { user_id: req.user!.id };
      if (status) {
        filters.status = status;
      }

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: inquiries, error, count } = await prisma.getInquiries(req.user!.id, filters, pagination);

      if (error) {
        throw new CustomError('Failed to fetch inquiries', 500);
      }

      res.json({
        success: true,
        data: {
          inquiries: inquiries || [],
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

  public getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: messages, error, count } = await prisma.getMessages(req.user!.id, pagination);

      if (error) {
        throw new CustomError('Failed to fetch messages', 500);
      }

      res.json({
        success: true,
        data: {
          messages: messages || [],
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

  // Admin methods
  public getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, role } = req.query;

      // For admin users, we need to implement a getUsers method in DatabaseService
      // For now, we'll use a simple approach
      const filters: any = {};
      if (search) {
        // This would need to be implemented in DatabaseService
        filters.search = search as string;
      }
      if (role) {
        filters.role = role as string;
      }

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      // Note: This would need to be implemented in DatabaseService
      // For now, return empty result
      res.json({
        success: true,
        data: {
          users: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: user, error } = await prisma.getUserById(id);

      if (error || !user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, bio, avatar, role, isActive } = req.body;

      const { data: user, error } = await prisma.updateUser(id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        bio,
        avatar,
        role,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new CustomError('Failed to update user', 500);
      }

      logger.info(`User updated by admin: ${user.email}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user exists
      const { data: user, error: fetchError } = await prisma.getUserById(id);

      if (fetchError || !user) {
        throw new CustomError('User not found', 404);
      }

      // Soft delete
      const { error } = await prisma.updateUser(id, { is_active: false });

      if (error) {
        throw new CustomError('Failed to deactivate user', 500);
      }

      logger.info(`User deactivated by admin: ${user.email}`);

      res.json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}