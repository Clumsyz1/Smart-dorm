import type {
  Announcement,
  AppRoute,
  AppState,
  Bill,
  PageMeta,
  Role,
  Room,
  RouteDefinition,
  User,
} from "./types";

export const STORAGE_KEY = "smart-dorm-react-state-v2";
export const SESSION_KEY = "smart-dorm-react-session-v1";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const WATER_RATE = 18;
export const ELECTRIC_RATE = 8;

export const routeDefinitions: Record<Role, RouteDefinition[]> = {
  tenant: [
    { key: "dashboard", label: "แดชบอร์ด", emoji: "🏠" },
    { key: "bills", label: "บิลและการชำระเงิน", emoji: "💳" },
    { key: "maintenance", label: "แจ้งซ่อม", emoji: "🛠️" },
    { key: "announcements", label: "ประกาศ", emoji: "📣" },
  ],
  admin: [
    { key: "dashboard", label: "แดชบอร์ด", emoji: "📊" },
    { key: "occupancy", label: "ห้องพักและผู้เช่า", emoji: "🏢" },
    { key: "billing", label: "มิเตอร์และบิล", emoji: "🧾" },
    { key: "maintenance", label: "จัดการงานซ่อม", emoji: "🧰" },
    { key: "announcements", label: "ประกาศ", emoji: "📢" },
  ],
};

export const pageTitleMap: Record<Role, Record<AppRoute, PageMeta>> = {
  tenant: {
    dashboard: {
      title: "Tenant Dashboard",
      description:
        "ดูยอดค้างชำระ ข่าวประกาศล่าสุด และสถานะคำร้องของห้องพักคุณได้ในหน้าเดียว",
    },
    bills: {
      title: "บิลและการชำระเงิน",
      description:
        "ตรวจสอบบิลย้อนหลัง ดูยอดปัจจุบัน และอัปโหลดหลักฐานการชำระเงินผ่านหน้าเว็บ",
    },
    maintenance: {
      title: "แจ้งซ่อมและติดตามสถานะ",
      description:
        "สร้างรายการแจ้งซ่อม แนบรูปภาพ และติดตามสถานะการดำเนินงานของเจ้าหน้าที่",
    },
    announcements: {
      title: "ประกาศจากผู้ดูแลอาคาร",
      description: "รับข่าวสารและการแจ้งเตือนสำคัญที่ส่งถึงผู้เช่าทุกคนในระบบ",
    },
    occupancy: { title: "", description: "" },
    billing: { title: "", description: "" },
  },
  admin: {
    dashboard: {
      title: "Admin Dashboard",
      description:
        "สรุปรายรับ ประสิทธิภาพการชำระเงิน และสถานะภาพรวมของหอพักแบบเรียลไทม์",
    },
    occupancy: {
      title: "ห้องพักและผู้เช่า",
      description:
        "เพิ่ม แก้ไข และลบข้อมูลห้องพัก รวมถึงจัดการการเข้าพักของผู้เช่า",
    },
    billing: {
      title: "มิเตอร์และออกบิล",
      description:
        "บันทึกเลขมิเตอร์ สร้างบิลรายเดือน และตรวจสอบสลิปการชำระเงินจากผู้เช่า",
    },
    maintenance: {
      title: "จัดการงานซ่อม",
      description:
        "รับเรื่องแจ้งซ่อม อัปเดตสถานะ มอบหมายงาน และปิดงานด้วยรูปยืนยัน",
    },
    announcements: {
      title: "ระบบประกาศ",
      description: "โพสต์ข่าวสารสำคัญและแจ้งเตือนไปยังผู้เช่าทุกคนในระบบ",
    },
    bills: { title: "", description: "" },
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function addDays(baseDate: Date, amount: number) {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function addMonths(baseDate: Date, amount: number) {
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
}

export function toDateInput(dateValue: Date | string) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toMonthValue(dateValue: Date | string) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export const today = new Date();
export const currentMonth = toMonthValue(today);
export const previousMonth = toMonthValue(addMonths(today, -1));
export const twoMonthsAgo = toMonthValue(addMonths(today, -2));

export function createInitialState(): AppState {
  return {
    users: [
      {
        id: "admin-1",
        username: "admin",
        password: "admin123",
        fullName: "ฝ่ายบริหารอาคาร Smart Dorm",
        phone: "02-000-0000",
        role: "admin",
        roomId: "",
      },
      {
        id: "tenant-1",
        username: "6605094",
        password: "tenant123",
        fullName: "นายสุภทัต ตรีสมุทร",
        phone: "081-245-7781",
        role: "tenant",
        roomId: "room-101",
      },
      {
        id: "tenant-2",
        username: "6605875",
        password: "tenant123",
        fullName: "นางสาวพิณลดา แจ้งจิตร์",
        phone: "081-245-7782",
        role: "tenant",
        roomId: "room-102",
      },
      {
        id: "tenant-3",
        username: "6605974",
        password: "tenant123",
        fullName: "นางสาวชัญญา เขียวภักดี",
        phone: "081-245-7783",
        role: "tenant",
        roomId: "room-201",
      },
    ],
    rooms: [
      {
        id: "room-101",
        number: "A-101",
        type: "Studio",
        status: "available",
        baseRent: 3500,
        tenantId: "tenant-1",
      },
      {
        id: "room-102",
        number: "A-102",
        type: "Deluxe",
        status: "available",
        baseRent: 3900,
        tenantId: "tenant-2",
      },
      {
        id: "room-201",
        number: "B-201",
        type: "Studio",
        status: "available",
        baseRent: 3600,
        tenantId: "tenant-3",
      },
      {
        id: "room-202",
        number: "B-202",
        type: "Suite",
        status: "maintenance",
        baseRent: 4500,
        tenantId: "",
      },
      {
        id: "room-203",
        number: "B-203",
        type: "Studio",
        status: "available",
        baseRent: 3400,
        tenantId: "",
      },
    ],
    announcements: [
      {
        id: "ann-1",
        title: "ปิดปรับปรุงพื้นที่ส่วนกลางชั่วคราว",
        message:
          "พื้นที่นั่งเล่นชั้นล่างจะปิดปรับปรุงในวันเสาร์นี้ เวลา 09:00 - 16:00 น. ขออภัยในความไม่สะดวก",
        priority: "high",
        createdAt: addDays(today, -2).toISOString(),
        createdBy: "ฝ่ายบริหารอาคาร Smart Dorm",
      },
      {
        id: "ann-2",
        title: "แจ้งรอบบันทึกมิเตอร์ประจำเดือน",
        message:
          "เจ้าหน้าที่จะเข้าตรวจสอบมิเตอร์น้ำและไฟในวันที่ 25 ของทุกเดือน กรุณาอำนวยความสะดวกในการเข้าพื้นที่",
        priority: "medium",
        createdAt: addDays(today, -5).toISOString(),
        createdBy: "ฝ่ายบริหารอาคาร Smart Dorm",
      },
      {
        id: "ann-3",
        title: "ช่องทางชำระเงินใหม่พร้อม Dynamic QR",
        message:
          "ระบบรองรับการอัปโหลดสลิปและตรวจสอบสถานะการชำระเงินผ่านหน้าเว็บได้ทันที",
        priority: "low",
        createdAt: addDays(today, -10).toISOString(),
        createdBy: "ฝ่ายบริหารอาคาร Smart Dorm",
      },
    ],
    bills: [
      {
        id: "bill-101-current",
        roomId: "room-101",
        tenantId: "tenant-1",
        month: currentMonth,
        baseRent: 3500,
        waterUnits: 12,
        electricityUnits: 96,
        total: 4484,
        status: "pending",
        dueDate: toDateInput(addDays(today, 7)),
        qrReference: "SDM-A101-CURRENT",
        slipImage: "",
        createdAt: addDays(today, -1).toISOString(),
        paidAt: "",
        submittedAt: "",
      },
      {
        id: "bill-101-previous",
        roomId: "room-101",
        tenantId: "tenant-1",
        month: previousMonth,
        baseRent: 3500,
        waterUnits: 11,
        electricityUnits: 90,
        total: 4418,
        status: "paid",
        dueDate: toDateInput(addDays(addMonths(today, -1), 7)),
        qrReference: "SDM-A101-PREV",
        slipImage: "",
        createdAt: addDays(addMonths(today, -1), -1).toISOString(),
        paidAt: addDays(addMonths(today, -1), 4).toISOString(),
        submittedAt: addDays(addMonths(today, -1), 3).toISOString(),
      },
      {
        id: "bill-102-current",
        roomId: "room-102",
        tenantId: "tenant-2",
        month: currentMonth,
        baseRent: 3900,
        waterUnits: 14,
        electricityUnits: 102,
        total: 4972,
        status: "paid",
        dueDate: toDateInput(addDays(today, 7)),
        qrReference: "SDM-A102-CURRENT",
        slipImage: "",
        createdAt: addDays(today, -2).toISOString(),
        paidAt: addDays(today, -1).toISOString(),
        submittedAt: addDays(today, -1).toISOString(),
      },
      {
        id: "bill-201-current",
        roomId: "room-201",
        tenantId: "tenant-3",
        month: currentMonth,
        baseRent: 3600,
        waterUnits: 10,
        electricityUnits: 88,
        total: 4484,
        status: "submitted",
        dueDate: toDateInput(addDays(today, 5)),
        qrReference: "SDM-B201-CURRENT",
        slipImage: "",
        createdAt: addDays(today, -3).toISOString(),
        paidAt: "",
        submittedAt: addDays(today, -1).toISOString(),
      },
      {
        id: "bill-201-previous",
        roomId: "room-201",
        tenantId: "tenant-3",
        month: twoMonthsAgo,
        baseRent: 3600,
        waterUnits: 9,
        electricityUnits: 80,
        total: 4382,
        status: "paid",
        dueDate: toDateInput(addDays(addMonths(today, -2), 7)),
        qrReference: "SDM-B201-OLDER",
        slipImage: "",
        createdAt: addDays(addMonths(today, -2), -1).toISOString(),
        paidAt: addDays(addMonths(today, -2), 3).toISOString(),
        submittedAt: addDays(addMonths(today, -2), 2).toISOString(),
      },
    ],
    maintenanceRequests: [
      {
        id: "mnt-1",
        tenantId: "tenant-1",
        roomId: "room-101",
        title: "แอร์ไม่เย็น",
        category: "ไฟฟ้า",
        description:
          "เครื่องปรับอากาศทำงานแต่ลมไม่เย็นตั้งแต่เมื่อคืน ต้องการให้เข้าตรวจสอบ",
        status: "in_progress",
        createdAt: addDays(today, -3).toISOString(),
        updatedAt: addDays(today, -1).toISOString(),
        assignee: "ช่างอาคาร",
        adminNote: "รับเรื่องแล้วและนัดเข้าตรวจสอบช่วงบ่าย",
        residentImage: "",
        completionImage: "",
      },
      {
        id: "mnt-2",
        tenantId: "tenant-2",
        roomId: "room-102",
        title: "ก๊อกน้ำรั่ว",
        category: "ประปา",
        description: "บริเวณอ่างล้างหน้ามีน้ำหยดตลอดเวลา",
        status: "open",
        createdAt: addDays(today, -1).toISOString(),
        updatedAt: addDays(today, -1).toISOString(),
        assignee: "",
        adminNote: "",
        residentImage: "",
        completionImage: "",
      },
      {
        id: "mnt-3",
        tenantId: "tenant-3",
        roomId: "room-201",
        title: "หลอดไฟหน้าห้องดับ",
        category: "ไฟฟ้า",
        description: "หลอดไฟทางเดินหน้าห้องดับ ทำให้มืดในช่วงกลางคืน",
        status: "resolved",
        createdAt: addDays(today, -12).toISOString(),
        updatedAt: addDays(today, -10).toISOString(),
        assignee: "ช่างอาคาร",
        adminNote: "เปลี่ยนหลอดไฟและตรวจสอบระบบไฟเรียบร้อยแล้ว",
        residentImage: "",
        completionImage: "",
      },
    ],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialState();
    }
    return JSON.parse(raw) as AppState;
  } catch {
    return createInitialState();
  }
}

export function loadSessionUserId() {
  return localStorage.getItem(SESSION_KEY) || "";
}

export function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state)) as AppState;
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value: string, includeTime = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(
    "th-TH",
    includeTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" },
  ).format(date);
}

export function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: "รอดำเนินการ",
    in_progress: "กำลังดำเนินการ",
    resolved: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
    pending: "รอชำระ",
    submitted: "รอตรวจสอบ",
    paid: "ชำระแล้ว",
    overdue: "เกินกำหนด",
    available: "ห้องว่าง",
    occupied: "มีผู้พัก",
    maintenance: "ปิดซ่อม",
    low: "ทั่วไป",
    medium: "สำคัญ",
    high: "ด่วน",
  };
  return labels[status] || status;
}

export function getToneClass(status: string) {
  const tones: Record<string, string> = {
    open: "warning",
    in_progress: "info",
    resolved: "success",
    cancelled: "neutral",
    pending: "warning",
    submitted: "info",
    paid: "success",
    overdue: "danger",
    available: "success",
    occupied: "info",
    maintenance: "danger",
    low: "neutral",
    medium: "warning",
    high: "danger",
  };
  return tones[status] || "neutral";
}

export function getRoleLabel(role: Role) {
  return role === "admin" ? "ผู้ดูแลอาคาร" : "ผู้เช่า";
}

export function getBillTotal(bill: Bill) {
  return (
    bill.total ??
    bill.baseRent +
      bill.waterUnits * WATER_RATE +
      bill.electricityUnits * ELECTRIC_RATE
  );
}

export function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SD";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function sortByCreatedDescending<
  T extends { createdAt: string; updatedAt?: string },
>(left: T, right: T) {
  return (
    new Date(right.updatedAt || right.createdAt).getTime() -
    new Date(left.updatedAt || left.createdAt).getTime()
  );
}

export function sortBillsDescending(left: Bill, right: Bill) {
  if (right.month !== left.month) return right.month.localeCompare(left.month);
  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export async function readImageFile(file: File | null) {
  if (!file) return "";
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("ไฟล์ภาพต้องมีขนาดไม่เกิน 5 MB");
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ภาพได้"));
    reader.readAsDataURL(file);
  });
}

export function getRoomById(state: AppState, roomId: string) {
  return state.rooms.find((room) => room.id === roomId) || null;
}

export function getUserById(state: AppState, userId: string) {
  return state.users.find((user) => user.id === userId) || null;
}

export function getBillById(state: AppState, billId: string) {
  return state.bills.find((bill) => bill.id === billId) || null;
}

export function getMaintenanceById(state: AppState, requestId: string) {
  return (
    state.maintenanceRequests.find((request) => request.id === requestId) ||
    null
  );
}

export function getRoomName(state: AppState, roomId: string) {
  return getRoomById(state, roomId)?.number || "-";
}

export function getUserName(state: AppState, userId: string) {
  return getUserById(state, userId)?.fullName || "ผู้ใช้งานเดิม";
}

export function getTenantUsers(state: AppState) {
  return state.users.filter((user) => user.role === "tenant");
}

export function getBillsForTenant(state: AppState, tenantId: string) {
  return state.bills
    .filter((bill) => bill.tenantId === tenantId)
    .sort(sortBillsDescending);
}

export function getMaintenanceForTenant(state: AppState, tenantId: string) {
  return state.maintenanceRequests
    .filter((request) => request.tenantId === tenantId)
    .sort(sortByCreatedDescending);
}

export function getLatestAnnouncements(state: AppState, limit = 10) {
  return [...state.announcements].sort(sortByCreatedDescending).slice(0, limit);
}

export function getRoomDisplayStatus(room: Room) {
  return room.tenantId ? "occupied" : room.status;
}

export function getTenantOutstandingAmount(state: AppState, tenantId: string) {
  return getBillsForTenant(state, tenantId)
    .filter((bill) => bill.status !== "paid")
    .reduce((sum, bill) => sum + getBillTotal(bill), 0);
}

export function getAssignableRoomsForTenant(state: AppState, tenantId = "") {
  return state.rooms.filter(
    (room) =>
      (room.status !== "maintenance" || room.tenantId === tenantId) &&
      (!room.tenantId || room.tenantId === tenantId),
  );
}

export function syncRoomAssignment(
  nextState: AppState,
  tenantId: string,
  nextRoomId: string,
) {
  nextState.rooms.forEach((room) => {
    if (room.tenantId === tenantId && room.id !== nextRoomId) {
      room.tenantId = "";
    }
  });

  const tenant = nextState.users.find((user) => user.id === tenantId);
  if (tenant) {
    tenant.roomId = nextRoomId || "";
  }

  if (!nextRoomId) {
    return;
  }

  const room = nextState.rooms.find((item) => item.id === nextRoomId);
  if (!room) {
    return;
  }

  if (room.tenantId && room.tenantId !== tenantId) {
    const previousTenant = nextState.users.find(
      (user) => user.id === room.tenantId,
    );
    if (previousTenant) {
      previousTenant.roomId = "";
    }
  }

  room.tenantId = tenantId;
}

export function sumBills(bills: Bill[]) {
  return bills.reduce((sum, bill) => sum + getBillTotal(bill), 0);
}

export function getTenantRoom(state: AppState, tenant: User | null) {
  if (!tenant) return null;
  return getRoomById(state, tenant.roomId);
}

export function getPendingCounts(state: AppState) {
  return {
    pendingRequests: state.maintenanceRequests.filter(
      (request) => request.status !== "resolved",
    ).length,
    pendingBills: state.bills.filter((bill) => bill.status !== "paid").length,
  };
}

export function getAnnouncementsPreview(state: AppState): Announcement[] {
  return getLatestAnnouncements(state, 50);
}
