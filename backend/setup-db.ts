import bcrypt from "bcryptjs";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://smartdorm:smartdorm123@localhost:5433/smartdorm",
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false,
});

async function setupDatabase() {
  console.log("🔧 Setting up Smart Dorm database...\n");

  // Run schema
  console.log("📐 Creating tables...");
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schema);
  console.log("✅ Tables created\n");

  // Hash passwords
  const adminHash = await bcrypt.hash("admin123", 10);
  const tenantHash = await bcrypt.hash("tenant123", 10);

  console.log("👤 Seeding users...");
  // Users
  const users = [
    ["admin-1", "admin", adminHash, "ฝ่ายบริหารอาคาร Smart Dorm", "02-000-0000", "admin", null],
    ["tenant-1", "6605094", tenantHash, "นายสุภทัต ตรีสมุทร", "081-245-7781", "tenant", "room-101"],
    ["tenant-2", "6605875", tenantHash, "นางสาวพิณลดา แจ้งจิตร์", "081-245-7782", "tenant", "room-102"],
    ["tenant-3", "6605974", tenantHash, "นางสาวชัญญา เขียวภักดี", "081-245-7783", "tenant", "room-201"],
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, username, password_hash, full_name, phone, role, room_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET password_hash = $3`,
      u
    );
  }
  console.log("✅ Users seeded\n");

  // Rooms
  console.log("🏢 Seeding rooms...");
  const rooms = [
    ["room-101", "A-101", "Studio", "available", 3500, "tenant-1"],
    ["room-102", "A-102", "Deluxe", "available", 3900, "tenant-2"],
    ["room-201", "B-201", "Studio", "available", 3600, "tenant-3"],
    ["room-202", "B-202", "Suite", "maintenance", 4500, null],
    ["room-203", "B-203", "Studio", "available", 3400, null],
  ];

  for (const r of rooms) {
    await pool.query(
      `INSERT INTO rooms (id, number, type, status, base_rent, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      r
    );
  }
  console.log("✅ Rooms seeded\n");

  // Announcements
  console.log("📢 Seeding announcements...");
  await pool.query(
    `INSERT INTO announcements (id, title, message, priority, created_by, created_at) VALUES
     ('ann-1', 'ปิดปรับปรุงพื้นที่ส่วนกลางชั่วคราว', 'พื้นที่นั่งเล่นชั้นล่างจะปิดปรับปรุงในวันเสาร์นี้ เวลา 09:00 - 16:00 น. ขออภัยในความไม่สะดวก', 'high', 'admin-1', NOW() - INTERVAL '2 days'),
     ('ann-2', 'แจ้งรอบบันทึกมิเตอร์ประจำเดือน', 'เจ้าหน้าที่จะเข้าตรวจสอบมิเตอร์น้ำและไฟในวันที่ 25 ของทุกเดือน กรุณาอำนวยความสะดวกในการเข้าพื้นที่', 'medium', 'admin-1', NOW() - INTERVAL '5 days'),
     ('ann-3', 'ช่องทางชำระเงินใหม่พร้อม Dynamic QR', 'ระบบรองรับการอัปโหลดสลิปและตรวจสอบสถานะการชำระเงินผ่านหน้าเว็บได้ทันที', 'low', 'admin-1', NOW() - INTERVAL '10 days')
     ON CONFLICT (id) DO NOTHING`
  );
  console.log("✅ Announcements seeded\n");

  // Bills
  console.log("💳 Seeding bills...");
  await pool.query(
    `INSERT INTO bills (id, room_id, tenant_id, month, base_rent, water_units, electricity_units, total, status, due_date, qr_reference, created_at, paid_at, submitted_at) VALUES
     ('bill-101-current', 'room-101', 'tenant-1', TO_CHAR(NOW(), 'YYYY-MM'), 3500, 12, 96, 4484, 'pending', (CURRENT_DATE + 7)::date, 'SDM-A101-CURRENT', NOW() - INTERVAL '1 day', NULL, NULL),
     ('bill-101-previous', 'room-101', 'tenant-1', TO_CHAR(NOW() - INTERVAL '1 month', 'YYYY-MM'), 3500, 11, 90, 4418, 'paid', (CURRENT_DATE - 23)::date, 'SDM-A101-PREV', NOW() - INTERVAL '31 days', NOW() - INTERVAL '26 days', NOW() - INTERVAL '27 days'),
     ('bill-102-current', 'room-102', 'tenant-2', TO_CHAR(NOW(), 'YYYY-MM'), 3900, 14, 102, 4972, 'paid', (CURRENT_DATE + 7)::date, 'SDM-A102-CURRENT', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
     ('bill-201-current', 'room-201', 'tenant-3', TO_CHAR(NOW(), 'YYYY-MM'), 3600, 10, 88, 4484, 'submitted', (CURRENT_DATE + 5)::date, 'SDM-B201-CURRENT', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '1 day'),
     ('bill-201-previous', 'room-201', 'tenant-3', TO_CHAR(NOW() - INTERVAL '2 months', 'YYYY-MM'), 3600, 9, 80, 4382, 'paid', (CURRENT_DATE - 53)::date, 'SDM-B201-OLDER', NOW() - INTERVAL '61 days', NOW() - INTERVAL '57 days', NOW() - INTERVAL '58 days')
     ON CONFLICT (id) DO NOTHING`
  );
  console.log("✅ Bills seeded\n");

  // Maintenance
  console.log("🛠️ Seeding maintenance requests...");
  await pool.query(
    `INSERT INTO maintenance_requests (id, tenant_id, room_id, title, category, description, status, assignee, admin_note, created_at, updated_at) VALUES
     ('mnt-1', 'tenant-1', 'room-101', 'แอร์ไม่เย็น', 'ไฟฟ้า', 'เครื่องปรับอากาศทำงานแต่ลมไม่เย็นตั้งแต่เมื่อคืน ต้องการให้เข้าตรวจสอบ', 'in_progress', 'ช่างอาคาร', 'รับเรื่องแล้วและนัดเข้าตรวจสอบช่วงบ่าย', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
     ('mnt-2', 'tenant-2', 'room-102', 'ก๊อกน้ำรั่ว', 'ประปา', 'บริเวณอ่างล้างหน้ามีน้ำหยดตลอดเวลา', 'open', '', '', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
     ('mnt-3', 'tenant-3', 'room-201', 'หลอดไฟหน้าห้องดับ', 'ไฟฟ้า', 'หลอดไฟทางเดินหน้าห้องดับ ทำให้มืดในช่วงกลางคืน', 'resolved', 'ช่างอาคาร', 'เปลี่ยนหลอดไฟและตรวจสอบระบบไฟเรียบร้อยแล้ว', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days')
     ON CONFLICT (id) DO NOTHING`
  );
  console.log("✅ Maintenance requests seeded\n");

  console.log("🎉 Database setup complete!");
  console.log("─".repeat(40));
  console.log("Admin login:   admin / admin123");
  console.log("Tenant login:  6605094 / tenant123");
  console.log("─".repeat(40));

  await pool.end();
}

setupDatabase().catch((err) => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
