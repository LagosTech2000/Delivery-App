import { Sequelize, Options } from 'sequelize';
import { env } from './environment';
import logger from '../utils/logger';

const dbConfig: Options = {
  dialect: env.DB_DIALECT as any,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  pool: {
    max: parseInt(env.DB_POOL_MAX),
    min: parseInt(env.DB_POOL_MIN),
    acquire: parseInt(env.DB_POOL_ACQUIRE),
    idle: parseInt(env.DB_POOL_IDLE),
  },
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  timezone: '+00:00',
};

const sequelize = new Sequelize(dbConfig);

export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✓ Database connection established successfully');
    logger.info(`✓ Connected to ${env.DB_DIALECT} database: ${env.DB_NAME}`);
  } catch (error) {
    logger.error('✗ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;

// Export for Sequelize CLI
module.exports = dbConfig;
