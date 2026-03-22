const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

const startServer = async () => {
  await connectDB();

  app.listen(config.PORT, () => {
    logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  });
};

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
