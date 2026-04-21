import { useState, type FormEvent } from "react";
import { EmptyState, StatusBadge, SummaryCard } from "../components/ui";
import {
  addDays,
  currentMonth,
  ELECTRIC_RATE,
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getBillTotal,
  previousMonth,
  sortBillsDescending,
  sortByCreatedDescending,
  sumBills,
  toDateInput,
  today,
  WATER_RATE,
} from "../core";
import type { AppState, MaintenanceRequest, Room, User } from "../types";

type AdminDashboardViewProps = { state: AppState };

export function AdminDashboardView({ state }: AdminDashboardViewProps) {
  const currentMonthBills = state.bills.filter(
    (bill) => bill.month === currentMonth,
  );
  const previousMonthBills = state.bills.filter(
    (bill) => bill.month === previousMonth,
  );
  const paidRevenue = sumBills(
    currentMonthBills.filter((bill) => bill.status === "paid"),
  );
  const totalGenerated = sumBills(currentMonthBills) || 1;
  const occupancyRate = state.rooms.length
    ? Math.round(
        (state.rooms.filter((room) => room.tenantId).length /
          state.rooms.length) *
          100,
      )
    : 0;
  const maintenanceResolvedRate = state.maintenanceRequests.length
    ? Math.round(
        (state.maintenanceRequests.filter(
          (request) => request.status === "resolved",
        ).length /
          state.maintenanceRequests.length) *
          100,
      )
    : 0;

  return (
    <>
      <section className="content-grid three-columns">
        <SummaryCard
          label="รายรับเดือนนี้"
          value={formatCurrency(paidRevenue)}
          description="ยอดที่ได้รับการยืนยันการชำระแล้ว"
        />
        <SummaryCard
          label="เทียบเดือนก่อน"
          value={formatCurrency(
            sumBills(
              previousMonthBills.filter((bill) => bill.status === "paid"),
            ),
          )}
          description="สำหรับเปรียบเทียบแนวโน้มรายรับ"
        />
        <SummaryCard
          label="คำร้องคงค้าง"
          value={String(
            state.maintenanceRequests.filter(
              (request) => request.status !== "resolved",
            ).length,
          )}
          description="ต้องติดตามและอัปเดตสถานะอย่างต่อเนื่อง"
        />
      </section>
      <section className="content-grid two-columns align-start">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Performance</span>
              <h2>ตัวชี้วัดภาพรวม</h2>
            </div>
          </div>
          <div className="progress-stack">
            <div className="progress-block">
              <div className="detail-row">
                <span>อัตราการจัดเก็บรายรับ</span>
                <strong>
                  {Math.round((paidRevenue / totalGenerated) * 100)}%
                </strong>
              </div>
              <div className="progress-bar">
                <span
                  style={{
                    width: `${Math.round((paidRevenue / totalGenerated) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="progress-block">
              <div className="detail-row">
                <span>อัตราการเข้าพัก</span>
                <strong>{occupancyRate}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${occupancyRate}%` }} />
              </div>
            </div>
            <div className="progress-block">
              <div className="detail-row">
                <span>อัตราปิดงานซ่อม</span>
                <strong>{maintenanceResolvedRate}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${maintenanceResolvedRate}%` }} />
              </div>
            </div>
          </div>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Immediate Actions</span>
              <h2>รายการที่ควรติดตาม</h2>
            </div>
          </div>
          <div className="list-item">
            <div>
              <strong>บิลรอการตรวจสอบ</strong>
              <p>ผู้เช่าส่งสลิปแล้วและกำลังรอการยืนยัน</p>
            </div>
            <div className="list-item-meta">
              <StatusBadge status="submitted" />
              <strong>
                {
                  state.bills.filter((bill) => bill.status === "submitted")
                    .length
                }
              </strong>
            </div>
          </div>
          <div className="list-item">
            <div>
              <strong>คำร้องที่ยังไม่รับเรื่อง</strong>
              <p>ตรวจสอบคำร้องใหม่และมอบหมายช่างให้เหมาะสม</p>
            </div>
            <div className="list-item-meta">
              <StatusBadge status="open" />
              <strong>
                {
                  state.maintenanceRequests.filter(
                    (request) => request.status === "open",
                  ).length
                }
              </strong>
            </div>
          </div>
          <div className="list-item">
            <div>
              <strong>ประกาศล่าสุด</strong>
              <p>อัปเดตข่าวสารเพื่อสื่อสารกับผู้เช่าได้ทันที</p>
            </div>
            <div className="list-item-meta">
              <StatusBadge status="high" />
              <strong>{state.announcements.length}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

type AdminOccupancyViewProps = {
  rooms: Room[];
  tenants: User[];
  editingRoom: Room | null;
  editingTenant: User | null;
  deletingRoomId: string;
  deletingTenantId: string;
  getAssignableRoomsForTenant: (tenantId?: string) => Room[];
  getRoomName: (roomId: string) => string;
  getRoomDisplayStatus: (room: Room) => string;
  getUserName: (userId: string) => string;
  isSubmittingRoom: boolean;
  isSubmittingTenant: boolean;
  onSubmitTenant: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitRoom: (event: FormEvent<HTMLFormElement>) => void;
  onEditTenant: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
  onEditRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onClearTenantForm: () => void;
  onClearRoomForm: () => void;
};

export function AdminOccupancyView(props: AdminOccupancyViewProps) {
  const {
    rooms,
    tenants,
    editingRoom,
    editingTenant,
    deletingRoomId,
    deletingTenantId,
    getAssignableRoomsForTenant,
    getRoomName,
    getRoomDisplayStatus,
    getUserName,
    isSubmittingRoom,
    isSubmittingTenant,
    onSubmitTenant,
    onSubmitRoom,
    onEditTenant,
    onDeleteTenant,
    onEditRoom,
    onDeleteRoom,
    onClearTenantForm,
    onClearRoomForm,
  } = props;

  const [activeTab, setActiveTab] = useState<"tenants" | "rooms">("tenants");

  return (
    <>
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "tenants" ? "is-active" : ""}`}
          onClick={() => setActiveTab("tenants")}
        >
          👨‍👩‍👧‍👦 จัดการผู้เช่า
        </button>
        <button
          className={`tab-button ${activeTab === "rooms" ? "is-active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          🚪 จัดการห้องพัก
        </button>
      </div>

      <section className="content-grid two-columns align-start">
        {/* Tenants Column (Shows when tab is tenants or on large screens where tabs could be hidden, but we'll just show based on activeTab for all screens) */}
        {activeTab === "tenants" && (
          <div className="tab-pane-content">
            <article className="panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">Tenant Management</span>
                  <h2>
                    {editingTenant ? "แก้ไขข้อมูลผู้เช่า" : "เพิ่มผู้เช่าใหม่"}
                  </h2>
                </div>
                {editingTenant ? (
                  <button
                    className="ghost-button compact"
                    type="button"
                    onClick={onClearTenantForm}
                    disabled={isSubmittingTenant}
                  >
                    ล้างฟอร์ม
                  </button>
                ) : null}
              </div>
              <form
                key={editingTenant?.id || "new-tenant"}
                className="form-grid"
                onSubmit={onSubmitTenant}
              >
                <input
                  name="tenantId"
                  type="hidden"
                  defaultValue={editingTenant?.id || ""}
                />
                <label>
                  <span>ชื่อ - นามสกุล</span>
                  <input
                    name="fullName"
                    type="text"
                    defaultValue={editingTenant?.fullName || ""}
                    placeholder="ชื่อผู้เช่า"
                    required
                    disabled={isSubmittingTenant}
                  />
                </label>
                <label>
                  <span>รหัสผ่าน</span>
                  <input
                    name="password"
                    type="text"
                    placeholder={
                      editingTenant
                        ? "เว้นว่างถ้าใช้รหัสเดิม"
                        : "ตั้งค่ารหัสใหม่ (หรือใช้ tenant123)"
                    }
                    disabled={isSubmittingTenant}
                  />
                </label>
                <label>
                  <span>เบอร์โทรศัพท์</span>
                  <input
                    name="phone"
                    type="text"
                    defaultValue={editingTenant?.phone || ""}
                    placeholder="08x-xxx-xxxx"
                    required
                    disabled={isSubmittingTenant}
                  />
                </label>
                <label>
                  <span>กำหนดห้องพัก</span>
                  <select
                    name="roomId"
                    defaultValue={editingTenant?.roomId || ""}
                    required
                    disabled={isSubmittingTenant}
                  >
                    <option value="">-- กรุณาเลือกห้องพัก --</option>
                    {getAssignableRoomsForTenant(editingTenant?.id || "").map(
                      (room) => (
                        <option key={room.id} value={room.id}>
                          {room.number} · {room.type}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <button
                  className="primary-button full-span"
                  type="submit"
                  disabled={isSubmittingTenant}
                >
                  {isSubmittingTenant
                    ? "กำลังบันทึก..."
                    : editingTenant
                      ? "บันทึกการแก้ไขผู้เช่า"
                      : "เพิ่มผู้เช่า"}
                </button>
              </form>
              <div className="helper-note">
                ผู้เช่าใหม่จะใช้รหัสผ่านเริ่มต้นเป็น <strong>tenant123</strong>
              </div>
            </article>

            <article className="panel" style={{ marginTop: "14px" }}>
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">Tenant List</span>
                  <h2>ผู้เช่าในระบบ</h2>
                </div>
              </div>
              {tenants.length ? (
                tenants.map((tenant) => (
                  <div className="list-item align-start" key={tenant.id}>
                    <div>
                      <strong>{tenant.fullName}</strong>
                      <p>
                        👤 {tenant.username} (เชื่อมกับรหัสห้อง) · 📞{" "}
                        {tenant.phone}
                      </p>
                      <small>
                        {tenant.roomId
                          ? getRoomName(tenant.roomId)
                          : "ไม่มีห้องพัก"}
                      </small>
                    </div>
                    <div className="list-item-meta vertical-align">
                      <button
                        className="ghost-button compact"
                        type="button"
                        onClick={() => onEditTenant(tenant.id)}
                        disabled={
                          isSubmittingTenant || deletingTenantId === tenant.id
                        }
                      >
                        แก้ไข
                      </button>
                      <button
                        className="ghost-button compact danger-text"
                        type="button"
                        onClick={() => onDeleteTenant(tenant.id)}
                        disabled={
                          isSubmittingTenant || deletingTenantId === tenant.id
                        }
                      >
                        {deletingTenantId === tenant.id ? "กำลังลบ..." : "ลบ"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="ยังไม่มีผู้เช่า"
                  description="สามารถเพิ่มข้อมูลผู้เช่าได้จากฟอร์มด้านบน"
                />
              )}
            </article>
          </div>
        )}

        {/* Rooms Column */}
        {activeTab === "rooms" && (
          <div className="tab-pane-content">
            <article className="panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">Room Management</span>
                  <h2>
                    {editingRoom ? "แก้ไขข้อมูลห้องพัก" : "เพิ่มห้องพักใหม่"}
                  </h2>
                </div>
                {editingRoom ? (
                  <button
                    className="ghost-button compact"
                    type="button"
                    onClick={onClearRoomForm}
                    disabled={isSubmittingRoom}
                  >
                    ล้างฟอร์ม
                  </button>
                ) : null}
              </div>
              <form
                key={editingRoom?.id || "new-room"}
                className="form-grid"
                onSubmit={onSubmitRoom}
              >
                <input
                  name="roomId"
                  type="hidden"
                  defaultValue={editingRoom?.id || ""}
                />
                <label>
                  <span>เลขห้อง</span>
                  <input
                    name="number"
                    type="text"
                    defaultValue={editingRoom?.number || ""}
                    placeholder="เช่น A-201"
                    required
                    disabled={isSubmittingRoom}
                  />
                </label>
                <label>
                  <span>ประเภทห้อง</span>
                  <input
                    name="type"
                    type="text"
                    defaultValue={editingRoom?.type || ""}
                    placeholder="Studio / Deluxe / Suite"
                    required
                    disabled={isSubmittingRoom}
                  />
                </label>
                <label>
                  <span>ค่าเช่าพื้นฐาน</span>
                  <input
                    name="baseRent"
                    type="number"
                    min="0"
                    step="100"
                    defaultValue={editingRoom?.baseRent || ""}
                    required
                    disabled={isSubmittingRoom}
                  />
                </label>
                <label>
                  <span>สถานะห้อง</span>
                  <select
                    name="status"
                    defaultValue={editingRoom?.status || "available"}
                    disabled={isSubmittingRoom}
                  >
                    <option value="available">ห้องว่าง</option>
                    <option value="maintenance">ปิดซ่อม</option>
                  </select>
                </label>
                <button
                  className="primary-button full-span"
                  type="submit"
                  disabled={isSubmittingRoom}
                >
                  {isSubmittingRoom
                    ? "กำลังบันทึก..."
                    : editingRoom
                      ? "บันทึกการแก้ไขห้องพัก"
                      : "เพิ่มห้องพัก"}
                </button>
              </form>
            </article>

            <article className="panel" style={{ marginTop: "14px" }}>
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">Room Inventory</span>
                  <h2>ห้องพักทั้งหมด</h2>
                </div>
              </div>
              {rooms.length ? (
                rooms.map((room) => (
                  <div className="list-item align-start" key={room.id}>
                    <div>
                      <strong>
                        {room.number} · {room.type}
                      </strong>
                      <p>ค่าเช่าพื้นฐาน {formatCurrency(room.baseRent)}</p>
                      <small>
                        {room.tenantId
                          ? getUserName(room.tenantId)
                          : "ยังไม่มีผู้เช่า"}
                      </small>
                    </div>
                    <div className="list-item-meta vertical-align">
                      <StatusBadge status={getRoomDisplayStatus(room)} />
                      <button
                        className="ghost-button compact"
                        type="button"
                        onClick={() => onEditRoom(room.id)}
                        disabled={
                          isSubmittingRoom || deletingRoomId === room.id
                        }
                      >
                        แก้ไข
                      </button>
                      <button
                        className="ghost-button compact danger-text"
                        type="button"
                        onClick={() => onDeleteRoom(room.id)}
                        disabled={
                          isSubmittingRoom || deletingRoomId === room.id
                        }
                      >
                        {deletingRoomId === room.id ? "กำลังลบ..." : "ลบ"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="ยังไม่มีห้องพัก"
                  description="เริ่มต้นเพิ่มข้อมูลห้องพักได้จากฟอร์มด้านบน"
                />
              )}
            </article>
          </div>
        )}
      </section>
    </>
  );
}

type AdminBillingViewProps = {
  state: AppState;
  getUserName: (userId: string) => string;
  getRoomName: (roomId: string) => string;
  isSubmittingGenerateBill: boolean;
  updatingBillId: string;
  onSubmitGenerateBill: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitBillStatus: (
    event: FormEvent<HTMLFormElement>,
    billId: string,
  ) => void;
};

export function AdminBillingView({
  state,
  getUserName,
  getRoomName,
  isSubmittingGenerateBill,
  updatingBillId,
  onSubmitGenerateBill,
  onSubmitBillStatus,
}: AdminBillingViewProps) {
  const occupiedRooms = state.rooms.filter((room) => room.tenantId);
  const bills = [...state.bills].sort(sortBillsDescending);

  return (
    <>
      <section className="content-grid two-columns align-start">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Meter Entry</span>
              <h2>สร้างบิลรายเดือน</h2>
            </div>
          </div>
          {occupiedRooms.length ? (
            <form className="form-grid" onSubmit={onSubmitGenerateBill}>
              <label>
                <span>เลือกห้องพัก</span>
                <select
                  name="roomId"
                  defaultValue={occupiedRooms[0].id}
                  disabled={isSubmittingGenerateBill}
                >
                  {occupiedRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.number} · {getUserName(room.tenantId)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>ประจำเดือน</span>
                <input
                  name="month"
                  type="month"
                  defaultValue={currentMonth}
                  required
                  disabled={isSubmittingGenerateBill}
                />
              </label>
              <label>
                <span>เลขมิเตอร์น้ำ</span>
                <input
                  name="waterUnits"
                  type="number"
                  min="0"
                  step="1"
                  required
                  disabled={isSubmittingGenerateBill}
                />
              </label>
              <label>
                <span>เลขมิเตอร์ไฟ</span>
                <input
                  name="electricityUnits"
                  type="number"
                  min="0"
                  step="1"
                  required
                  disabled={isSubmittingGenerateBill}
                />
              </label>
              <label className="full-span">
                <span>ครบกำหนดชำระ</span>
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={toDateInput(addDays(today, 7))}
                  required
                  disabled={isSubmittingGenerateBill}
                />
              </label>
              <button
                className="primary-button"
                type="submit"
                disabled={isSubmittingGenerateBill}
              >
                {isSubmittingGenerateBill
                  ? "กำลังออกบิล..."
                  : "ออกบิลและส่งให้ผู้เช่า"}
              </button>
            </form>
          ) : (
            <EmptyState
              title="ยังไม่มีห้องที่มีผู้พัก"
              description="เพิ่มผู้เช่าและผูกกับห้องก่อนออกบิล"
            />
          )}
          <div className="helper-note">
            ระบบจะดึงค่าเช่าพื้นฐานจากข้อมูลห้อง
            และคำนวณค่าน้ำ/ค่าไฟตามอัตราที่กำหนดไว้ในระบบ
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Billing Summary</span>
              <h2>สถานะบิลของเดือนนี้</h2>
            </div>
          </div>
          <div className="list-item">
            <div>
              <strong>ชำระแล้ว</strong>
              <p>บิลที่ถูกยืนยันการชำระเรียบร้อย</p>
            </div>
            <div className="list-item-meta">
              <StatusBadge status="paid" />
              <strong>
                {
                  state.bills.filter(
                    (bill) =>
                      bill.month === currentMonth && bill.status === "paid",
                  ).length
                }
              </strong>
            </div>
          </div>
          <div className="list-item">
            <div>
              <strong>รอตรวจสอบสลิป</strong>
              <p>ผู้เช่าส่งหลักฐานการชำระเงินเข้ามาแล้ว</p>
            </div>
            <div className="list-item-meta">
              <StatusBadge status="submitted" />
              <strong>
                {
                  state.bills.filter(
                    (bill) =>
                      bill.month === currentMonth &&
                      bill.status === "submitted",
                  ).length
                }
              </strong>
            </div>
          </div>
          <div className="list-item">
            <div>
              <strong>ยังไม่ชำระ</strong>
              <p>รวมบิลที่ยังต้องติดตาม</p>
            </div>
            <div className="list-item-meta">
              <StatusBadge status="pending" />
              <strong>
                {
                  state.bills.filter(
                    (bill) =>
                      bill.month === currentMonth && bill.status === "pending",
                  ).length
                }
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section className="stack-list">
        {bills.length ? (
          bills.map((bill) => (
            <article className="panel bill-card" key={bill.id}>
              <div className="panel-heading wrap-mobile">
                <div>
                  <span className="section-kicker">
                    {formatMonthLabel(bill.month)}
                  </span>
                  <h2>
                    {getRoomName(bill.roomId)} · {getUserName(bill.tenantId)}
                  </h2>
                </div>
                <div className="badge-cluster">
                  <StatusBadge status={bill.status} />
                  <strong>{formatCurrency(getBillTotal(bill))}</strong>
                </div>
              </div>
              <div className="content-grid two-columns tight-gap">
                <div className="detail-card subtle-card">
                  <div className="detail-row">
                    <span>ค่าเช่าพื้นฐาน</span>
                    <strong>{formatCurrency(bill.baseRent)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>ค่าน้ำ ({bill.waterUnits} หน่วย)</span>
                    <strong>
                      {formatCurrency(bill.waterUnits * WATER_RATE)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>ค่าไฟ ({bill.electricityUnits} หน่วย)</span>
                    <strong>
                      {formatCurrency(bill.electricityUnits * ELECTRIC_RATE)}
                    </strong>
                  </div>
                  <div className="detail-row emphasis">
                    <span>รวมสุทธิ</span>
                    <strong>{formatCurrency(getBillTotal(bill))}</strong>
                  </div>
                  <div className="detail-row">
                    <span>ครบกำหนด</span>
                    <strong>{formatDate(bill.dueDate)}</strong>
                  </div>
                </div>
                <div className="detail-card subtle-card">
                  <div className="detail-row">
                    <span>QR Reference</span>
                    <strong>{bill.qrReference}</strong>
                  </div>
                  {bill.slipImage ? (
                    <div className="image-preview">
                      <img src={bill.slipImage} alt="Slip preview" />
                    </div>
                  ) : (
                    <div className="helper-note">ยังไม่มีสลิปจากผู้เช่า</div>
                  )}
                </div>
              </div>
              <form
                className="inline-form two-column-inline"
                onSubmit={(event) => onSubmitBillStatus(event, bill.id)}
              >
                <label>
                  <span>สถานะบิล</span>
                  <select
                    name="status"
                    defaultValue={bill.status}
                    disabled={updatingBillId === bill.id}
                  >
                    <option value="pending">รอชำระ</option>
                    <option value="submitted">รอตรวจสอบ</option>
                    <option value="paid">ชำระแล้ว</option>
                    <option value="overdue">เกินกำหนด</option>
                  </select>
                </label>
                <button
                  className="secondary-button compact"
                  type="submit"
                  disabled={updatingBillId === bill.id}
                >
                  {updatingBillId === bill.id
                    ? "กำลังบันทึก..."
                    : "บันทึกสถานะ"}
                </button>
              </form>
            </article>
          ))
        ) : (
          <EmptyState
            title="ยังไม่มีบิล"
            description="ออกบิลรายการแรกของระบบได้จากฟอร์มด้านบน"
          />
        )}
      </section>
    </>
  );
}

type AdminMaintenanceViewProps = {
  requests: MaintenanceRequest[];
  getRoomName: (roomId: string) => string;
  getUserName: (userId: string) => string;
  updatingRequestId: string;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    requestId: string,
  ) => void | Promise<void>;
};

export function AdminMaintenanceView({
  requests,
  getRoomName,
  getUserName,
  updatingRequestId,
  onSubmit,
}: AdminMaintenanceViewProps) {
  const sortedRequests = [...requests].sort(sortByCreatedDescending);

  return (
    <>
      <section className="content-grid three-columns">
        <SummaryCard
          label="รอดำเนินการ"
          value={String(
            sortedRequests.filter((request) => request.status === "open")
              .length,
          )}
          description="คำร้องใหม่ที่ยังไม่รับเรื่อง"
        />
        <SummaryCard
          label="กำลังดำเนินการ"
          value={String(
            sortedRequests.filter((request) => request.status === "in_progress")
              .length,
          )}
          description="คำร้องที่กำลังอยู่ระหว่างซ่อม"
        />
        <SummaryCard
          label="ปิดงานแล้ว"
          value={String(
            sortedRequests.filter((request) => request.status === "resolved")
              .length,
          )}
          description="คำร้องที่ส่งมอบและปิดงานเรียบร้อย"
        />
      </section>
      <section className="stack-list">
        {sortedRequests.length ? (
          sortedRequests.map((request) => (
            <article className="panel request-card" key={request.id}>
              <div className="panel-heading wrap-mobile">
                <div>
                  <span className="section-kicker">{request.category}</span>
                  <h2>{request.title}</h2>
                  <p>
                    {getUserName(request.tenantId)} · ห้อง{" "}
                    {getRoomName(request.roomId)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p>{request.description}</p>
              <div className="content-grid two-columns tight-gap">
                <div className="detail-card subtle-card">
                  <div className="detail-row">
                    <span>วันที่แจ้ง</span>
                    <strong>{formatDate(request.createdAt, true)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>อัปเดตล่าสุด</span>
                    <strong>{formatDate(request.updatedAt, true)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>ผู้รับผิดชอบ</span>
                    <strong>{request.assignee || "ยังไม่มอบหมาย"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>หมายเหตุ</span>
                    <strong>{request.adminNote || "ยังไม่มีหมายเหตุ"}</strong>
                  </div>
                </div>
                <div className="detail-card subtle-card media-stack">
                  {request.residentImage ? (
                    <div className="image-preview">
                      <img src={request.residentImage} alt="Resident upload" />
                    </div>
                  ) : (
                    <div className="helper-note">ไม่มีรูปจากผู้เช่า</div>
                  )}
                  {request.completionImage ? (
                    <div className="image-preview">
                      <img
                        src={request.completionImage}
                        alt="Completion upload"
                      />
                    </div>
                  ) : (
                    <div className="helper-note">ยังไม่มีรูปยืนยันหลังซ่อม</div>
                  )}
                </div>
              </div>
              <form
                className="form-grid compact-form"
                onSubmit={(event) => void onSubmit(event, request.id)}
              >
                <label>
                  <span>สถานะ</span>
                  <select
                    name="status"
                    defaultValue={request.status}
                    disabled={updatingRequestId === request.id}
                  >
                    <option value="open">รอดำเนินการ</option>
                    <option value="in_progress">กำลังดำเนินการ</option>
                    <option value="resolved">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </label>
                <label>
                  <span>มอบหมายให้</span>
                  <input
                    name="assignee"
                    type="text"
                    defaultValue={request.assignee}
                    placeholder="ชื่อผู้รับผิดชอบ"
                    disabled={updatingRequestId === request.id}
                  />
                </label>
                <label className="full-span">
                  <span>หมายเหตุจากผู้ดูแลอาคาร</span>
                  <textarea
                    name="adminNote"
                    rows={3}
                    defaultValue={request.adminNote}
                    placeholder="เช่น นัดเข้าซ่อมเวลา 15:00 น."
                    disabled={updatingRequestId === request.id}
                  />
                </label>
                <label className="full-span">
                  <span>รูปยืนยันหลังซ่อม</span>
                  <input
                    name="completionImage"
                    type="file"
                    accept="image/*"
                    disabled={updatingRequestId === request.id}
                  />
                </label>
                <button
                  className="secondary-button"
                  type="submit"
                  disabled={updatingRequestId === request.id}
                >
                  {updatingRequestId === request.id
                    ? "กำลังบันทึก..."
                    : "อัปเดตคำร้อง"}
                </button>
              </form>
            </article>
          ))
        ) : (
          <EmptyState
            title="ยังไม่มีคำร้องแจ้งซ่อม"
            description="เมื่อผู้เช่าแจ้งซ่อม รายการจะปรากฏที่นี่"
          />
        )}
      </section>
    </>
  );
}
