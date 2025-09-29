import express from 'express';
import { UploadController } from '../controllers/UploadController';
import { authenticate } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = express.Router();
const uploadController = new UploadController();

// Protected routes
router.use(authenticate);

router.post('/image', uploadMiddleware.single('image'), uploadController.uploadImage);
router.post('/images', uploadMiddleware.array('images', 10), uploadController.uploadImages);
router.post('/document', uploadMiddleware.single('document'), uploadController.uploadDocument);
router.delete('/:publicId', uploadController.deleteFile);

export default router;
