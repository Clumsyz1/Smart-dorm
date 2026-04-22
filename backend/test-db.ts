import pool from "./db.js";

async function testConn() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully:", res.rows[0]);
    
    const userRes = await pool.query("SELECT count(*) FROM users");
    console.log("👥 Users in database:", userRes.rows[0].count);
    
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Database test failed:", err.message);
    process.exit(1);
  }
}

testConn();
