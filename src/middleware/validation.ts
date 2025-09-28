import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { CustomError } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(`Validation error: ${errorMessage}`, 400);
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(`Query validation error: ${errorMessage}`, 400);
    }
    
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new CustomError(`Parameter validation error: ${errorMessage}`, 400);
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('USER', 'ADMIN', 'AGENT').default('USER'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().optional(),
    bio: Joi.string().max(500).optional(),
    avatar: Joi.string().uri().optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),

  // Property schemas
  createProperty: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    price: Joi.number().positive().required(),
    propertyType: Joi.string().valid('HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL').required(),
    status: Joi.string().valid('FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED').default('FOR_SALE'),
    bedrooms: Joi.number().integer().min(0).optional(),
    bathrooms: Joi.number().integer().min(0).optional(),
    squareFeet: Joi.number().positive().optional(),
    lotSize: Joi.number().positive().optional(),
    yearBuilt: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('US'),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
      }).optional(),
    }).required(),
    features: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    virtualTour: Joi.string().uri().optional(),
    agentId: Joi.string().uuid().optional(),
  }),

  updateProperty: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    price: Joi.number().positive().optional(),
    propertyType: Joi.string().valid('HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL').optional(),
    status: Joi.string().valid('FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED').optional(),
    bedrooms: Joi.number().integer().min(0).optional(),
    bathrooms: Joi.number().integer().min(0).optional(),
    squareFeet: Joi.number().positive().optional(),
    lotSize: Joi.number().positive().optional(),
    yearBuilt: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
      }).optional(),
    }).optional(),
    features: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    virtualTour: Joi.string().uri().optional(),
    agentId: Joi.string().uuid().optional(),
  }),

  // Analysis schemas
  createAnalysis: Joi.object({
    propertyId: Joi.string().uuid().required(),
    analysisType: Joi.string().valid('MARKET', 'INVESTMENT', 'COMPARATIVE', 'FORECAST').required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(2000).optional(),
    data: Joi.object().required(),
    insights: Joi.array().items(Joi.string()).optional(),
    recommendations: Joi.array().items(Joi.string()).optional(),
    confidence: Joi.number().min(0).max(1).optional(),
  }),

  // Query schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  propertySearch: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().optional(),
    propertyType: Joi.string().valid('HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL').optional(),
    status: Joi.string().valid('FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED').optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    bedrooms: Joi.number().integer().min(0).optional(),
    bathrooms: Joi.number().integer().min(0).optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  // ID parameter schema
  id: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
