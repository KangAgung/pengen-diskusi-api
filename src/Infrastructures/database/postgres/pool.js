/* istanbul ignore file */
const { Pool } = require('pg');

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

const herokuConfig = {
  ssl: {
    rejectUnauthorized: false,
  },
};

const createPool = () => {
  if (process.env.NODE_ENV === 'production') return new Pool({ ...herokuConfig });
  if (process.env.NODE_ENV === 'test') return new Pool({ ...testConfig });
  if (process.env.NODE_ENV === 'development') return new Pool();
  return new Pool({ ...testConfig, ...herokuConfig });
};

const pool = createPool();

module.exports = pool;
