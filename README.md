# 🏢 Smart Dormitory Management System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

![Smart Dorm Hero](./assets/hero.png)

ระบบบริหารจัดการหอพักอัจฉริยะ (Smart Dorm) ที่ออกแบบมาเพื่อยกระดับการจัดการหอพักให้มีความเป็นมืออาชีพ สะดวก และรวดเร็ว ทั้งสำหรับผู้เช่าและผู้ดูแลระบบ

---

## ✨ Features | ความสามารถของระบบ

### 👤 For Tenants (ผู้เช่า)
- **Personal Dashboard:** ตรวจสอบสถานะห้องพักและข่าวสารล่าสุด
- **Billing System:** ดูบิลค่าน้ำ-ค่าไฟ และอัปโหลดหลักฐานการโอนเงินได้ทันที
- **Maintenance Request:** แจ้งซ่อมพร้อมแนบรูปภาพ และติดตามสถานะการดำเนินการ
- **Profile Management:** จัดการข้อมูลส่วนตัวและรหัสผ่าน

### 🛠️ For Admin (ผู้ดูแลระบบ/นิติบุคคล)
- **Room Management:** จัดการข้อมูลห้องพัก สถานะการว่าง และข้อมูลผู้เช่า
- **Billing Management:** ออกบิลค่าน้ำ-ค่าไฟ และตรวจสอบหลักฐานการชำระเงิน
- **Maintenance Tracking:** รับเรื่องแจ้งซ่อม อัปเดตสถานะ และมอบหมายงาน
- **Announcements:** ประกาศข่าวสารสำคัญให้กับผู้เช่าทุกคนทราบ

---

## 🚀 Tech Stack | เทคโนโลยีที่เลือกใช้

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + Lucide React (Icons)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (with `pg` driver)
- **Authentication:** JSON Web Token (JWT) + BcryptJS
- **Infrastructure:** Docker & Docker Compose
- **Deployment:** Ready for Netlify (Functions supported)

---

## 🛠️ Getting Started | วิธีการติดตั้งและใช้งาน

### Prerequisites
- Node.js (v18 หรือใหม่กว่า)
- Docker Desktop (สำหรับฐานข้อมูล)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/clumsyz/smart-dorm.git
cd smart-dorm
npm install
```

### 2. Database Setup (Docker)
```bash
# เริ่มทำงาน Docker สำหรับ PostgreSQL
npm run docker:up

# ติดตั้ง Schema และ Seed ข้อมูลเบื้องต้น
npm run setup:db
```

### 3. Start Development Server
```bash
# รัน Frontend (Vite)
npm run dev

# รัน Backend (API)
npm run dev:api
```

เปิด Browser ไปที่ [http://localhost:5173](http://localhost:5173)

---

## 🔐 Demo Accounts | บัญชีสำหรับทดลองใช้งาน

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Tenant** | `6605094` | `tenant123` |

---

## 📂 Project Structure | โครงสร้างโปรเจกต์

```text
├── backend/            # Backend logic & Database schemas
│   ├── routes/         # Express routes
│   ├── middleware/     # Auth & Error middlewares
│   └── setup-db.ts     # DB initialization script
├── src/                # Frontend application
│   ├── app/            # Core logic, types & views
│   │   ├── components/ # Reusable UI components
│   │   └── views/      # Page-level components
│   └── main.tsx        # Entry point
├── assets/             # Images & static assets
├── docker-compose.yml  # Docker infrastructure
└── package.json        # Project dependencies
```

---

## 📝 License
โปรเจกต์นี้เป็นส่วนหนึ่งของรายงานโครงงาน (Smart Dormitory Management System) พัฒนาเพื่อการศึกษาและเป็นตัวอย่าง MVP

---
Developed with ❤️ by [ClumsyZ](https://github.com/clumsyz)
