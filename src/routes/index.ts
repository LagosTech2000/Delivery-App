import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import requestRoutes from './request.routes';
import resolutionRoutes from './resolution.routes';
import pricingRoutes from './pricing.routes';
import fileRoutes from './file.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/requests', requestRoutes);
router.use('/resolutions', resolutionRoutes);
router.use('/pricing', pricingRoutes);
router.use('/files', fileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
