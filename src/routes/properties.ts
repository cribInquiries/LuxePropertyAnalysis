import express from 'express';
import { PropertyController } from '@/controllers/PropertyController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { validate, validateQuery, validateParams, schemas } from '@/middleware/validation';

const router = express.Router();
const propertyController = new PropertyController();

// Public routes
router.get('/', validateQuery(schemas.propertySearch), propertyController.getProperties);
router.get('/:id', validateParams(schemas.id), propertyController.getProperty);
router.get('/:id/analyses', validateParams(schemas.id), propertyController.getPropertyAnalyses);

// Protected routes
router.use(authenticate);

router.post('/', validate(schemas.createProperty), propertyController.createProperty);
router.put('/:id', validateParams(schemas.id), validate(schemas.updateProperty), propertyController.updateProperty);
router.delete('/:id', validateParams(schemas.id), propertyController.deleteProperty);
router.post('/:id/favorite', validateParams(schemas.id), propertyController.toggleFavorite);
router.post('/:id/inquiry', validateParams(schemas.id), propertyController.createInquiry);
router.get('/:id/messages', validateParams(schemas.id), propertyController.getPropertyMessages);

// Agent/Admin routes
router.get('/my/properties', propertyController.getMyProperties);
router.get('/my/favorites', propertyController.getMyFavorites);

export default router;
