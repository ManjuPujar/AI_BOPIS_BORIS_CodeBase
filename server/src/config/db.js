const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = config.MONGO_URI;

    if (config.USE_MEMORY_DB === 'true' || !config.MONGO_URI || config.MONGO_URI.includes('xxxxx')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      logger.info('Using in-memory MongoDB instance');
    }

    await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const getMongoServer = () => mongoServer;

module.exports = connectDB;
module.exports.getMongoServer = getMongoServer;
