# Smart Dormitory Management System
  
 Web Application ต้นแบบจาก requirement ในรายงานโครงงาน โดยพัฒนาเป็น Frontend ด้วย React + TypeScript + Vite สำหรับ 2 บทบาทหลักคือผู้เช่าและนิติบุคคล

 ## ความสามารถหลัก

 - ระบบเข้าสู่ระบบตามบทบาทผู้ใช้งาน
- แดชบอร์ดสำหรับผู้เช่าและนิติบุคคล
- ระบบจัดการบิลค่าน้ำค่าไฟและการอัปโหลดหลักฐานการชำระเงิน
- ระบบแจ้งซ่อมพร้อมแนบรูปภาพ
- ระบบจัดการห้องพัก ผู้เช่า และประกาศ
  - การเก็บข้อมูลเดโมไว้ใน localStorage เพื่อให้ทดลองใช้งานได้ทันที

 ## วิธีรัน

 ```bash
 npm install
 npm run dev
  ```

 จากนั้นเปิด:

 ```text
  http://127.0.0.1:5173
  ```

 ## วิธี build

 ```bash
 npm run build
 ```

 ไฟล์ production จะถูกสร้างในโฟลเดอร์ `dist`

 ## บัญชีทดลอง

 - ผู้ดูแลระบบ
  - Username: `admin`
  - Password: `admin123`
- ผู้เช่า
  - Username: `6605094`
  - Password: `tenant123`

 ## ไฟล์ต้นฉบับ

  - รายงานโครงงาน: `Smart Dormitory Management System_2.pdf`
  - React entry: `src/main.tsx`
 - React app root: `src/app/RootApp.tsx`
 - Components และ views: `src/app/components`, `src/app/views`
 - Types และ utilities: `src/app/types.ts`, `src/app/core.ts`
  - Styles: `app.css`
  - Config: `package.json`, `tsconfig.json`, `vite.config.ts`

 ## หมายเหตุ

 เวอร์ชันนี้เป็น MVP ฝั่ง Frontend ที่จำลองฐานข้อมูลด้วย localStorage เพื่อให้ใช้งานและเดโม flow ของระบบได้ในเครื่องทันที
