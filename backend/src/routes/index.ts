import { Router } from 'express';
import authRoutes from './auth.routes.js';
import elderlyRoutes from './elderly.routes.js';
import medicationRoutes from './medication.routes.js';
import appointmentRoutes from './appointment.routes.js';
import recordRoutes from './record.routes.js';
import activityRoutes from './activity.routes.js';
import alertRoutes from './alert.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import circleRoutes from './circle.routes.js';
import vaultRoutes from './vault.routes.js';
import notificationRoutes from './notification.routes.js';
import analyticsRoutes from './analytics.routes.js';
import assistantRoutes from './assistant.routes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CareNest Health Ecosystem API',
    version: '1.0.0'
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/elderly', elderlyRoutes);
apiRouter.use('/circle', circleRoutes);
apiRouter.use('/vault', vaultRoutes);
apiRouter.use('/medications', medicationRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/records', recordRoutes);
apiRouter.use('/activities', activityRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/assistant', assistantRoutes);

export default apiRouter;

