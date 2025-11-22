require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'postgres';

const sqliteConfig = {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
};

const postgresConfig = (env) => ({
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME + (env === 'test' ? '_test' : '') || 'delivery_app',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
});

module.exports = {
  development: dialect === 'sqlite' ? sqliteConfig : postgresConfig('development'),
  test: dialect === 'sqlite' ? sqliteConfig : postgresConfig('test'),
  production: dialect === 'sqlite' ? sqliteConfig : postgresConfig('production'),
};
