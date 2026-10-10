import app from './app';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  await connectDatabase();

  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`==================================================`);
    logger.info(` REXBEBE REST API Server running on port ${PORT}`);
    logger.info(` Health Check: http://localhost:${PORT}/api/health`);
    logger.info(` Environment:  ${config.nodeEnv}`);
    logger.info(`==================================================`);
  });
};

startServer();
