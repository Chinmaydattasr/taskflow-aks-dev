const { Pool } = require('pg');

const pool = new Pool({
  host: your-postgres-server.postgres.database.azure.com,
  port: Number(process.env.DB_PORT || 5432),
  user: taskadmin,
  password:"1234512345@a",
  database: taskdb,
  ssl:  'true' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
