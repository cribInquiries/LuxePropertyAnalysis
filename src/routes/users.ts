import express from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';

const router = express.Router();
const userController = new UserController();

// Protected routes
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(schemas.updateProfile), userController.updateProfile);
router.get('/favorites', userController.getFavorites);
router.get('/inquiries', userController.getInquiries);
router.get('/messages', userController.getMessages);

// Admin routes
router.get('/', authorize('ADMIN'), validateQuery(schemas.pagination), userController.getUsers);
router.get('/:id', authorize('ADMIN'), validateParams(schemas.id), userController.getUser);
router.put('/:id', authorize('ADMIN'), validateParams(schemas.id), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), validateParams(schemas.id), userController.deleteUser);

export default router;
