import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(authenticate);

router.get('/me', authController.getProfile);
router.put('/profile', validate(schemas.updateProfile), authController.updateProfile);
router.put('/change-password', validate(schemas.changePassword), authController.changePassword);
router.post('/logout', authController.logout);

export default router;
