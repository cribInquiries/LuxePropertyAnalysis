import { Request, Response, NextFunction } from 'express';
import { DatabaseService as prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AnalysisController {
  public createAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analysisData = {
        ...req.body,
        analyst_id: req.user!.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if property exists
      const { data: property, error: propertyError } = await prisma.getPropertyById(req.body.propertyId);

      if (propertyError || !property) {
        throw new CustomError('Property not found', 404);
      }

      const { data: analysis, error } = await prisma.createAnalysis(analysisData);

      if (error) {
        throw new CustomError('Failed to create analysis', 500);
      }

      logger.info(`Analysis created: ${analysis.id} by user: ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Analysis created successfully',
        data: { analysis },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: analysis, error } = await prisma.getAnalysisById(id);

      if (error || !analysis) {
        throw new CustomError('Analysis not found', 404);
      }

      // Check if user can view this analysis
      const authReq = req as AuthRequest;
      if (!analysis.is_public && authReq.user?.id !== analysis.analyst_id && authReq.user?.role !== 'ADMIN') {
        throw new CustomError('Not authorized to view this analysis', 403);
      }

      res.json({
        success: true,
        data: { analysis },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if analysis exists and user has permission
      const { data: existingAnalysis, error: fetchError } = await prisma.getAnalysisById(id);

      if (fetchError || !existingAnalysis) {
        throw new CustomError('Analysis not found', 404);
      }

      if (existingAnalysis.analyst_id !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new CustomError('Not authorized to update this analysis', 403);
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString(),
      };

      const { data: analysis, error } = await prisma.updateAnalysis(id, updateData);

      if (error) {
        throw new CustomError('Failed to update analysis', 500);
      }

      logger.info(`Analysis updated: ${analysis.id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Analysis updated successfully',
        data: { analysis },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if analysis exists and user has permission
      const { data: existingAnalysis, error: fetchError } = await prisma.getAnalysisById(id);

      if (fetchError || !existingAnalysis) {
        throw new CustomError('Analysis not found', 404);
      }

      if (existingAnalysis.analyst_id !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new CustomError('Not authorized to delete this analysis', 403);
      }

      const { error } = await prisma.deleteAnalysis(id);

      if (error) {
        throw new CustomError('Failed to delete analysis', 500);
      }

      logger.info(`Analysis deleted: ${id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Analysis deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyAnalyses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, analysisType } = req.query;

      const filters: any = { analyst_id: req.user!.id };
      if (analysisType) {
        filters.analysis_type = analysisType;
      }

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: analyses, error, count } = await prisma.getAnalyses(filters, pagination);

      if (error) {
        throw new CustomError('Failed to fetch analyses', 500);
      }

      res.json({
        success: true,
        data: {
          analyses: analyses || [],
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

  public getPublicAnalyses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, analysisType, propertyType } = req.query;

      const filters: any = { is_public: true };
      if (analysisType) {
        filters.analysis_type = analysisType;
      }

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: analyses, error, count } = await prisma.getAnalyses(filters, pagination);

      if (error) {
        throw new CustomError('Failed to fetch analyses', 500);
      }

      res.json({
        success: true,
        data: {
          analyses: analyses || [],
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

  public getAllAnalyses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, analysisType, isPublic } = req.query;

      const filters: any = {};
      if (analysisType) {
        filters.analysis_type = analysisType;
      }
      if (isPublic !== undefined) {
        filters.is_public = isPublic === 'true';
      }

      const pagination = {
        page: Number(page),
        limit: Number(limit),
      };

      const { data: analyses, error, count } = await prisma.getAnalyses(filters, pagination);

      if (error) {
        throw new CustomError('Failed to fetch analyses', 500);
      }

      res.json({
        success: true,
        data: {
          analyses: analyses || [],
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

  public shareAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if analysis exists and user has permission
      const { data: existingAnalysis, error: fetchError } = await prisma.getAnalysisById(id);

      if (fetchError || !existingAnalysis) {
        throw new CustomError('Analysis not found', 404);
      }

      if (existingAnalysis.analyst_id !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new CustomError('Not authorized to share this analysis', 403);
      }

      const { data: analysis, error } = await prisma.updateAnalysis(id, { 
        is_public: true,
        updated_at: new Date().toISOString()
      });

      if (error) {
        throw new CustomError('Failed to share analysis', 500);
      }

      logger.info(`Analysis shared: ${analysis.id} by user: ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Analysis shared successfully',
        data: { analysis },
      });
    } catch (error) {
      next(error);
    }
  };
}