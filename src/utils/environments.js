const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const enviroment = {
  TIME_ZONE: process.env.TIME_ZONE,
  DB_SQL_CLIENT: process.env.DB_SQL_CLIENT,
  DB_SQL_HOST: process.env.DB_SQL_HOST,
  DB_SQL_USER: process.env.DB_SQL_USER,
  DB_SQL_PASSWORD: process.env.DB_SQL_PASSWORD,
  DB_SQL_NAME: process.env.DB_SQL_NAME,
  DB_SQL_PORT: process.env.DB_SQL_PORT
};

module.exports = enviroment;