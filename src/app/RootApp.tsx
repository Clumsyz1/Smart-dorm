import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AuthScreen } from './components/AuthScreen';
import { FlashMessage } from './components/ui';
import { useTheme } from './useTheme';
import {
  cloneState,
  createId,
  currentMonth,
  getAssignableRoomsForTenant,
  getBillsForTenant,
  getLatestAnnouncements,
  getMaintenanceForTenant,
  getRoomById,
  getRoomDisplayStatus,
  getRoomName,
  getTenantOutstandingAmount,
  getTenantRoom,
  getTenantUsers,
  getUserById,
  getUserName,
  loadSessionUserId,
  loadState,
  pageTitleMap,
  readImageFile,
  routeDefinitions,
  SESSION_KEY,
  STORAGE_KEY,
  syncRoomAssignment,
  formatCurrency,
  getBillTotal,
  getRoleLabel,
  getBillById,
  getMaintenanceById,
  toDateInput,
  today,
  WATER_RATE,
  ELECTRIC_RATE
} from './core';
import { AnnouncementsView } from './views/AnnouncementsView';
import { AdminBillingView, AdminDashboardView, AdminMaintenanceView, AdminOccupancyView } from './views/AdminViews';
import { TenantBillsView, TenantDashboardView, TenantMaintenanceView } from './views/TenantViews';
import type { AppRoute, AppState, BillStatus, FlashState, MaintenanceStatus, Priority, RoomStatus, User } from './types';

function RootApp() {
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [state, setState] = useState<AppState>(() => loadState());
  const [sessionUserId, setSessionUserId] = useState<string>(() => loadSessionUserId());
  const [route, setRoute] = useState<AppRoute>('dashboard');
  const [editingTenantId, setEditingTenantId] = useState('');
  const [editingRoomId, setEditingRoomId] = useState('');
  const [flash, setFlash] = useState<FlashState>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmittingTenantMaintenance, setIsSubmittingTenantMaintenance] = useState(false);
  const [payingBillId, setPayingBillId] = useState('');
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState('');
  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState('');
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState('');
  const [isSubmittingGenerateBill, setIsSubmittingGenerateBill] = useState(false);
  const [updatingBillId, setUpdatingBillId] = useState('');
  const [updatingRequestId, setUpdatingRequestId] = useState('');

  const currentUser = useMemo(() => state.users.find((user) => user.id === sessionUserId) || null, [state.users, sessionUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (sessionUserId) {
      localStorage.setItem(SESSION_KEY, sessionUserId);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [sessionUserId]);

  useEffect(() => {
    document.body.className = currentUser ? 'app-mode' : 'auth-mode';
    document.title = currentUser ? `Smart Dorm | ${pageTitleMap[currentUser.role][route].title}` : 'Smart Dorm | Sign In';
  }, [currentUser, route]);

  useEffect(() => {
    if (!flash) return undefined;
    const timeout = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  useEffect(() => {
    if (!currentUser) {
      setRoute('dashboard');
      return;
    }
    const allowedRoutes = routeDefinitions[currentUser.role].map((item) => item.key);
    if (!allowedRoutes.includes(route)) {
      setRoute(allowedRoutes[0]);
    }
  }, [currentUser, route]);

  const showFlash = (message: string, tone: 'success' | 'info' | 'danger' = 'info') => {
    setFlash({ message, tone });
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '').trim();
    const matchedUser = state.users.find((user) => user.username === username && user.password === password);
    if (!matchedUser) {
      showFlash('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'danger');
      setIsLoggingIn(false);
      return;
    }
    setSessionUserId(matchedUser.id);
    setRoute(routeDefinitions[matchedUser.role][0].key);
    showFlash(`เข้าสู่ระบบในบทบาท${getRoleLabel(matchedUser.role)}สำเร็จ`, 'success');
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    if (!window.confirm('ต้องการออกจากระบบใช่หรือไม่?')) {
      return;
    }
    setSessionUserId('');
    setEditingRoomId('');
    setEditingTenantId('');
  };

  const handleTenantMaintenance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;
    const room = getRoomById(state, currentUser.roomId);
    if (!room) {
      showFlash('บัญชีนี้ยังไม่ได้ผูกกับห้องพัก จึงยังไม่สามารถส่งคำร้องแจ้งซ่อมได้', 'danger');
      return;
    }
    setIsSubmittingTenantMaintenance(true);
    try {
      const formData = new FormData(event.currentTarget);
      const residentImage = await readImageFile((event.currentTarget.elements.namedItem('residentImage') as HTMLInputElement)?.files?.[0] || null);
      const nextState = cloneState(state);
      nextState.maintenanceRequests.unshift({
        id: createId('mnt'),
        tenantId: currentUser.id,
        roomId: currentUser.roomId,
        title: String(formData.get('title') || '').trim(),
        category: String(formData.get('category') || '').trim(),
        description: String(formData.get('description') || '').trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignee: '',
        adminNote: '',
        residentImage,
        completionImage: ''
      });
      setState(nextState);
      event.currentTarget.reset();
      showFlash('ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว', 'success');
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด', 'danger');
    } finally {
      setIsSubmittingTenantMaintenance(false);
    }
  };

  const handlePayBill = async (event: FormEvent<HTMLFormElement>, billId: string) => {
    event.preventDefault();
    setPayingBillId(billId);
    try {
      const fileInput = event.currentTarget.elements.namedItem('slipImage') as HTMLInputElement;
      const slipImage = await readImageFile(fileInput.files?.[0] || null);
      if (!slipImage) {
        showFlash('กรุณาแนบสลิปการชำระเงิน', 'danger');
        return;
      }
      const nextState = cloneState(state);
      const bill = getBillById(nextState, billId);
      if (!bill || !currentUser || bill.tenantId !== currentUser.id) {
        showFlash('ไม่พบบิลที่ต้องการอัปเดต', 'danger');
        return;
      }
      if (bill.status === 'submitted' || bill.status === 'paid') {
        showFlash('บิลนี้ไม่สามารถอัปโหลดสลิปซ้ำได้', 'info');
        return;
      }
      bill.status = 'submitted';
      bill.slipImage = slipImage;
      bill.submittedAt = new Date().toISOString();
      setState(nextState);
      showFlash('อัปโหลดหลักฐานการชำระเงินเรียบร้อย', 'success');
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด', 'danger');
    } finally {
      setPayingBillId('');
    }
  };

  const handleAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingAnnouncement(true);
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const message = String(formData.get('message') || '').trim();
    if (!title || !message) {
      showFlash('กรุณากรอกหัวข้อและรายละเอียดประกาศให้ครบถ้วน', 'danger');
      setIsSubmittingAnnouncement(false);
      return;
    }
    const nextState = cloneState(state);
    nextState.announcements.unshift({
      id: createId('ann'),
      title,
      message,
      priority: String(formData.get('priority') || 'low') as Priority,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.fullName || 'ผู้ดูแลอาคาร'
    });
    setState(nextState);
    event.currentTarget.reset();
    showFlash('เผยแพร่ประกาศเรียบร้อยแล้ว', 'success');
    setIsSubmittingAnnouncement(false);
  };

  const handleTenantUpsert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingTenant(true);
    const formData = new FormData(event.currentTarget);
    const tenantId = String(formData.get('tenantId') || '');
    const username = String(formData.get('username') || '').trim();
    const fullName = String(formData.get('fullName') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const roomId = String(formData.get('roomId') || '').trim();
    const duplicateUser = state.users.find((user) => user.username === username && user.id !== tenantId);
    if (duplicateUser) {
      showFlash('Username นี้ถูกใช้งานแล้ว', 'danger');
      setIsSubmittingTenant(false);
      return;
    }
    const assignedRoom = roomId ? getRoomById(state, roomId) : null;
    if (assignedRoom && assignedRoom.status === 'maintenance' && assignedRoom.tenantId !== tenantId) {
      showFlash('ไม่สามารถกำหนดผู้เช่าเข้าห้องที่ปิดซ่อมอยู่ได้', 'danger');
      setIsSubmittingTenant(false);
      return;
    }
    const nextState = cloneState(state);
    if (tenantId) {
      const tenant = nextState.users.find((user) => user.id === tenantId);
      if (!tenant) {
        setIsSubmittingTenant(false);
        return;
      }
      tenant.username = username;
      tenant.fullName = fullName;
      tenant.phone = phone;
      syncRoomAssignment(nextState, tenant.id, roomId);
      setEditingTenantId('');
      setState(nextState);
      showFlash('อัปเดตข้อมูลผู้เช่าเรียบร้อย', 'success');
      setIsSubmittingTenant(false);
      return;
    }
    const newTenant: User = { id: createId('tenant'), username, password: 'tenant123', fullName, phone, role: 'tenant', roomId: '' };
    nextState.users.push(newTenant);
    syncRoomAssignment(nextState, newTenant.id, roomId);
    setState(nextState);
    event.currentTarget.reset();
    showFlash('เพิ่มผู้เช่าใหม่เรียบร้อย', 'success');
    setIsSubmittingTenant(false);
  };

  const handleRoomUpsert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingRoom(true);
    const formData = new FormData(event.currentTarget);
    const roomId = String(formData.get('roomId') || '');
    const number = String(formData.get('number') || '').trim();
    const type = String(formData.get('type') || '').trim();
    const status = String(formData.get('status') || 'available') as RoomStatus;
    const baseRent = Number(formData.get('baseRent') || 0);
    const duplicateRoom = state.rooms.find((room) => room.number === number && room.id !== roomId);
    if (duplicateRoom) {
      showFlash('เลขห้องนี้มีอยู่แล้วในระบบ', 'danger');
      setIsSubmittingRoom(false);
      return;
    }
    if (baseRent <= 0) {
      showFlash('กรุณาระบุค่าเช่าพื้นฐานให้มากกว่า 0', 'danger');
      setIsSubmittingRoom(false);
      return;
    }
    const nextState = cloneState(state);
    if (roomId) {
      const room = nextState.rooms.find((item) => item.id === roomId);
      if (!room) {
        setIsSubmittingRoom(false);
        return;
      }
      if (room.tenantId && status === 'maintenance') {
        showFlash('ไม่สามารถเปลี่ยนเป็นปิดซ่อมในขณะที่มีผู้พักอยู่', 'danger');
        setIsSubmittingRoom(false);
        return;
      }
      room.number = number;
      room.type = type;
      room.status = status;
      room.baseRent = baseRent;
      setEditingRoomId('');
      setState(nextState);
      showFlash('อัปเดตข้อมูลห้องพักเรียบร้อย', 'success');
      setIsSubmittingRoom(false);
      return;
    }
    nextState.rooms.push({ id: createId('room'), number, type, status, baseRent, tenantId: '' });
    setState(nextState);
    event.currentTarget.reset();
    showFlash('เพิ่มห้องพักเรียบร้อย', 'success');
    setIsSubmittingRoom(false);
  };

  const handleGenerateBill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingGenerateBill(true);
    const formData = new FormData(event.currentTarget);
    const roomId = String(formData.get('roomId') || '');
    const month = String(formData.get('month') || currentMonth);
    const waterUnits = Number(formData.get('waterUnits') || 0);
    const electricityUnits = Number(formData.get('electricityUnits') || 0);
    const dueDate = String(formData.get('dueDate') || toDateInput(today));
    const room = getRoomById(state, roomId);
    if (!room || !room.tenantId) {
      showFlash('กรุณาเลือกห้องที่มีผู้เช่าอยู่', 'danger');
      setIsSubmittingGenerateBill(false);
      return;
    }
    if (waterUnits < 0 || electricityUnits < 0) {
      showFlash('เลขมิเตอร์น้ำและไฟต้องมีค่าเป็น 0 หรือมากกว่า', 'danger');
      setIsSubmittingGenerateBill(false);
      return;
    }
    const duplicate = state.bills.find((bill) => bill.roomId === roomId && bill.month === month);
    if (duplicate) {
      showFlash('ห้องนี้มีบิลสำหรับเดือนที่เลือกแล้ว', 'danger');
      setIsSubmittingGenerateBill(false);
      return;
    }
    const nextState = cloneState(state);
    nextState.bills.unshift({
      id: createId('bill'),
      roomId,
      tenantId: room.tenantId,
      month,
      baseRent: room.baseRent,
      waterUnits,
      electricityUnits,
      total: room.baseRent + waterUnits * WATER_RATE + electricityUnits * ELECTRIC_RATE,
      status: 'pending',
      dueDate,
      qrReference: `SDM-${room.number}-${month.replace('-', '')}`,
      slipImage: '',
      createdAt: new Date().toISOString(),
      paidAt: '',
      submittedAt: ''
    });
    setState(nextState);
    event.currentTarget.reset();
    showFlash('ออกบิลและส่งให้ผู้เช่าเรียบร้อย', 'success');
    setIsSubmittingGenerateBill(false);
  };

  const handleAdminBillStatus = (event: FormEvent<HTMLFormElement>, billId: string) => {
    event.preventDefault();
    setUpdatingBillId(billId);
    const nextStatus = String(new FormData(event.currentTarget).get('status') || 'pending') as BillStatus;
    const nextState = cloneState(state);
    const bill = getBillById(nextState, billId);
    if (!bill) {
      setUpdatingBillId('');
      return;
    }
    if (bill.status === nextStatus) {
      showFlash('ยังไม่มีการเปลี่ยนแปลงสถานะบิล', 'info');
      setUpdatingBillId('');
      return;
    }
    bill.status = nextStatus;
    bill.paidAt = nextStatus === 'paid' ? new Date().toISOString() : '';
    setState(nextState);
    showFlash('อัปเดตสถานะบิลเรียบร้อย', 'success');
    setUpdatingBillId('');
  };

  const handleMaintenanceUpdate = async (event: FormEvent<HTMLFormElement>, requestId: string) => {
    event.preventDefault();
    setUpdatingRequestId(requestId);
    try {
      const formData = new FormData(event.currentTarget);
      const completionImage = await readImageFile((event.currentTarget.elements.namedItem('completionImage') as HTMLInputElement)?.files?.[0] || null);
      const nextState = cloneState(state);
      const request = getMaintenanceById(nextState, requestId);
      if (!request) return;
      const nextStatus = String(formData.get('status') || request.status) as MaintenanceStatus;
      const assignee = String(formData.get('assignee') || '').trim();
      const adminNote = String(formData.get('adminNote') || '').trim();
      if ((nextStatus === 'in_progress' || nextStatus === 'resolved') && !assignee) {
        showFlash('กรุณาระบุผู้รับผิดชอบก่อนอัปเดตสถานะงานซ่อม', 'danger');
        return;
      }
      if (nextStatus === 'resolved' && !completionImage && !request.completionImage) {
        showFlash('กรุณาแนบรูปยืนยันหลังซ่อมก่อนปิดงาน', 'danger');
        return;
      }
      request.status = nextStatus;
      request.assignee = assignee;
      request.adminNote = adminNote;
      request.updatedAt = new Date().toISOString();
      if (completionImage) request.completionImage = completionImage;
      setState(nextState);
      showFlash('อัปเดตคำร้องแจ้งซ่อมเรียบร้อย', 'success');
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด', 'danger');
    } finally {
      setUpdatingRequestId('');
    }
  };

  const deleteAnnouncement = (announcementId: string) => {
    if (!window.confirm('ต้องการลบประกาศนี้ใช่หรือไม่?')) {
      return;
    }
    setDeletingAnnouncementId(announcementId);
    setState((prev) => ({ ...prev, announcements: prev.announcements.filter((announcement) => announcement.id !== announcementId) }));
    showFlash('ลบประกาศเรียบร้อย', 'success');
    setDeletingAnnouncementId('');
  };

  const deleteTenant = (tenantId: string) => {
    const relatedBills = state.bills.some((bill) => bill.tenantId === tenantId);
    const relatedRequests = state.maintenanceRequests.some((request) => request.tenantId === tenantId);
    if (relatedBills || relatedRequests) {
      showFlash('ไม่สามารถลบผู้เช่าที่มีประวัติบิลหรือคำร้องแจ้งซ่อมในระบบได้', 'danger');
      return;
    }
    if (!window.confirm('ต้องการลบข้อมูลผู้เช่ารายการนี้ใช่หรือไม่?')) {
      return;
    }
    setDeletingTenantId(tenantId);
    const nextState = cloneState(state);
    nextState.users = nextState.users.filter((user) => user.id !== tenantId);
    nextState.rooms.forEach((room) => {
      if (room.tenantId === tenantId) room.tenantId = '';
    });
    if (sessionUserId === tenantId) setSessionUserId('');
    setEditingTenantId('');
    setState(nextState);
    showFlash('ลบข้อมูลผู้เช่าเรียบร้อย', 'success');
    setDeletingTenantId('');
  };

  const deleteRoom = (roomId: string) => {
    const room = getRoomById(state, roomId);
    if (room?.tenantId) {
      showFlash('ไม่สามารถลบห้องที่มีผู้พักอยู่ได้', 'danger');
      return;
    }
    const relatedBills = state.bills.some((bill) => bill.roomId === roomId);
    const relatedRequests = state.maintenanceRequests.some((request) => request.roomId === roomId);
    if (relatedBills || relatedRequests) {
      showFlash('ไม่สามารถลบห้องที่มีประวัติการใช้งานในระบบได้', 'danger');
      return;
    }
    if (!window.confirm('ต้องการลบห้องพักรายการนี้ใช่หรือไม่?')) {
      return;
    }
    setDeletingRoomId(roomId);
    setState((prev) => ({ ...prev, rooms: prev.rooms.filter((item) => item.id !== roomId) }));
    setEditingRoomId('');
    showFlash('ลบข้อมูลห้องพักเรียบร้อย', 'success');
    setDeletingRoomId('');
  };

  const flashNode = <FlashMessage flash={flash} />;

  if (!currentUser) {
    return (
      <AuthScreen
        flash={flashNode}
        onLogin={handleLogin}
        isSubmitting={isLoggingIn}
        themeMode={themeMode}
        onSetTheme={setThemeMode}
      />
    );
  }

  const allowedRoutes = routeDefinitions[currentUser.role];
  const latestAnnouncements = getLatestAnnouncements(state, 50);
  const currentRoom = getTenantRoom(state, currentUser);
  const tenantBills = getBillsForTenant(state, currentUser.id);
  const tenantRequests = getMaintenanceForTenant(state, currentUser.id);
  const overviewCards = currentUser.role === 'tenant'
    ? [
        { label: 'ยอดค้างชำระปัจจุบัน', value: formatCurrency(getTenantOutstandingAmount(state, currentUser.id)), description: 'รวมบิลที่ยังไม่ถูกปิดสถานะทั้งหมด' },
        { label: 'ห้องพัก', value: currentRoom?.number || 'ยังไม่ผูกห้อง', description: currentRoom ? `${currentRoom.type} | ค่าเช่าพื้นฐาน ${formatCurrency(currentRoom.baseRent)}` : 'สามารถกำหนดผ่านฝั่งผู้ดูแลอาคารได้' },
        { label: 'คำร้องที่ยังไม่เสร็จ', value: String(tenantRequests.filter((request) => request.status !== 'resolved').length), description: 'ติดตามสถานะงานซ่อมได้จากหน้าแจ้งซ่อม' },
        { label: 'ประวัติบิลทั้งหมด', value: String(tenantBills.length), description: 'รองรับการดูย้อนหลังและอัปโหลดสลิปการโอนเงิน' }
      ]
    : [
        { label: 'รายรับเดือนปัจจุบัน', value: formatCurrency(state.bills.filter((bill) => bill.month === currentMonth && bill.status === 'paid').reduce((sum, bill) => sum + getBillTotal(bill), 0)), description: 'คำนวณจากบิลที่ชำระแล้วในเดือนนี้' },
        { label: 'บิลที่ยังไม่ปิด', value: String(state.bills.filter((bill) => bill.month === currentMonth && bill.status !== 'paid').length), description: 'รวมบิลรอชำระ รอตรวจสอบ และเกินกำหนด' },
        { label: 'ห้องที่มีผู้พัก', value: `${state.rooms.filter((room) => room.tenantId).length}/${state.rooms.length}`, description: 'ภาพรวมอัตราการเข้าพักในหอพัก' },
        { label: 'งานซ่อมที่ยังค้าง', value: String(state.maintenanceRequests.filter((request) => request.status !== 'resolved').length), description: 'ช่วยติดตาม SLA ของทีมช่างและผู้ดูแลอาคาร' }
      ];

  let content: ReactNode = null;
  if (currentUser.role === 'tenant') {
    if (route === 'dashboard') {
      content = <TenantDashboardView room={currentRoom} bills={tenantBills} requests={tenantRequests} latestAnnouncement={getLatestAnnouncements(state, 1)[0] || null} getRoomName={(roomId) => getRoomName(state, roomId)} onNavigateBills={() => setRoute('bills')} onNavigateMaintenance={() => setRoute('maintenance')} onNavigateAnnouncements={() => setRoute('announcements')} />;
    } else if (route === 'bills') {
      content = <TenantBillsView bills={tenantBills} getRoomName={(roomId) => getRoomName(state, roomId)} payingBillId={payingBillId} onPayBill={handlePayBill} />;
    } else if (route === 'maintenance') {
      content = <TenantMaintenanceView room={currentRoom} requests={tenantRequests} isSubmitting={isSubmittingTenantMaintenance} onSubmit={handleTenantMaintenance} />;
    } else {
      content = <AnnouncementsView adminTools={false} announcements={latestAnnouncements} deletingAnnouncementId={deletingAnnouncementId} isSubmitting={isSubmittingAnnouncement} onSubmit={handleAnnouncement} onDelete={deleteAnnouncement} />;
    }
  } else if (route === 'dashboard') {
    content = <AdminDashboardView state={state} />;
  } else if (route === 'occupancy') {
    content = <AdminOccupancyView rooms={[...state.rooms].sort((left, right) => left.number.localeCompare(right.number))} tenants={getTenantUsers(state).sort((left, right) => left.fullName.localeCompare(right.fullName, 'th'))} editingRoom={editingRoomId ? getRoomById(state, editingRoomId) : null} editingTenant={editingTenantId ? getUserById(state, editingTenantId) : null} deletingRoomId={deletingRoomId} deletingTenantId={deletingTenantId} getAssignableRoomsForTenant={(tenantId) => getAssignableRoomsForTenant(state, tenantId)} getRoomName={(roomId) => getRoomName(state, roomId)} getRoomDisplayStatus={getRoomDisplayStatus} getUserName={(userId) => getUserName(state, userId)} isSubmittingRoom={isSubmittingRoom} isSubmittingTenant={isSubmittingTenant} onSubmitTenant={handleTenantUpsert} onSubmitRoom={handleRoomUpsert} onEditTenant={setEditingTenantId} onDeleteTenant={deleteTenant} onEditRoom={setEditingRoomId} onDeleteRoom={deleteRoom} onClearTenantForm={() => setEditingTenantId('')} onClearRoomForm={() => setEditingRoomId('')} />;
  } else if (route === 'billing') {
    content = <AdminBillingView state={state} getUserName={(userId) => getUserName(state, userId)} getRoomName={(roomId) => getRoomName(state, roomId)} isSubmittingGenerateBill={isSubmittingGenerateBill} updatingBillId={updatingBillId} onSubmitGenerateBill={handleGenerateBill} onSubmitBillStatus={handleAdminBillStatus} />;
  } else if (route === 'maintenance') {
    content = <AdminMaintenanceView requests={state.maintenanceRequests} getRoomName={(roomId) => getRoomName(state, roomId)} getUserName={(userId) => getUserName(state, userId)} updatingRequestId={updatingRequestId} onSubmit={handleMaintenanceUpdate} />;
  } else {
    content = <AnnouncementsView adminTools announcements={latestAnnouncements} deletingAnnouncementId={deletingAnnouncementId} isSubmitting={isSubmittingAnnouncement} onSubmit={handleAnnouncement} onDelete={deleteAnnouncement} />;
  }

  return (
    <AppShell
      currentUser={currentUser}
      route={route}
      allowedRoutes={allowedRoutes}
      pageMeta={pageTitleMap[currentUser.role][route]}
      overviewCards={overviewCards}
      flash={flashNode}
      themeMode={themeMode}
      onNavigate={setRoute}
      onLogout={handleLogout}
      onSetTheme={setThemeMode}
    >
      {content}
    </AppShell>
  );
}

export default RootApp;
