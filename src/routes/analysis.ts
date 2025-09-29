import express from 'express';
import { AnalysisController } from '../controllers/AnalysisController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';

const router = express.Router();
const analysisController = new AnalysisController();

// Public routes
router.get('/public', validateQuery(schemas.pagination), analysisController.getPublicAnalyses);

// Protected routes
router.use(authenticate);

router.post('/', validate(schemas.createAnalysis), analysisController.createAnalysis);
router.get('/my', validateQuery(schemas.pagination), analysisController.getMyAnalyses);
router.get('/:id', validateParams(schemas.id), analysisController.getAnalysis);
router.put('/:id', validateParams(schemas.id), analysisController.updateAnalysis);
router.delete('/:id', validateParams(schemas.id), analysisController.deleteAnalysis);
router.post('/:id/share', validateParams(schemas.id), analysisController.shareAnalysis);

// Admin routes
router.get('/', authorize('ADMIN'), validateQuery(schemas.pagination), analysisController.getAllAnalyses);

export default router;
