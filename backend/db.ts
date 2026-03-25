import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://smartdorm:smartdorm123@localhost:5433/smartdorm",
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;
