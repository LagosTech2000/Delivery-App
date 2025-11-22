import { createServer } from 'http';
import app from './app';
import sequelize from './config/database';
import { env } from './config/environment';
import logger from './utils/logger';
import { socketService } from './socket';
import { SocketEvents } from './socket/events';

const PORT = env.PORT || 5000;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Close Socket.io connections
    const io = socketService.getIO();
    io.close(() => {
      logger.info('Socket.io server closed');
    });

    // Close database connection
    await sequelize.close();
    logger.info('Database connection closed');

    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models (ONLY in development with env flag)
    if (env.NODE_ENV === 'development' && env.DB_SYNC === 'true') {
      logger.warn('Database sync is enabled - this should NOT be used in production!');
      await sequelize.sync();
      logger.info('Database models synchronized');
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    const io = socketService.initialize(httpServer);

    // Register Socket.io events
    io.on('connection', (socket) => {
      SocketEvents.registerEvents(socket);
    });

    logger.info('Socket.io initialized and event handlers registered');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
      logger.info(`API available at: http://localhost:${PORT}/api/v1`);
      logger.info(`WebSocket server ready for connections`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    return httpServer;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
