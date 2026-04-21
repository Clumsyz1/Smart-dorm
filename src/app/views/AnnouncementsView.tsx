import type { FormEventHandler } from "react";
import { EmptyState, StatusBadge } from "../components/ui";
import { formatDate } from "../core";
import type { Announcement } from "../types";

type AnnouncementsViewProps = {
  adminTools: boolean;
  announcements: Announcement[];
  deletingAnnouncementId: string;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDelete: (announcementId: string) => void;
};

export function AnnouncementsView({
  adminTools,
  announcements,
  deletingAnnouncementId,
  isSubmitting,
  onSubmit,
  onDelete,
}: AnnouncementsViewProps) {
  return (
    <>
      {adminTools && (
        <section className="stack-list">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">Broadcast</span>
                <h2>สร้างประกาศใหม่</h2>
              </div>
            </div>
            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                <span>หัวข้อประกาศ</span>
                <input
                  name="title"
                  type="text"
                  placeholder="หัวข้อประกาศ"
                  required
                  disabled={isSubmitting}
                />
              </label>
              <label>
                <span>ระดับความสำคัญ</span>
                <select
                  name="priority"
                  defaultValue="low"
                  disabled={isSubmitting}
                >
                  <option value="low">ทั่วไป</option>
                  <option value="medium">สำคัญ</option>
                  <option value="high">ด่วน</option>
                </select>
              </label>
              <label className="full-span">
                <span>รายละเอียด</span>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="ระบุรายละเอียดประกาศที่ต้องการส่งถึงผู้เช่าทุกคน"
                  required
                  disabled={isSubmitting}
                />
              </label>
              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังเผยแพร่..." : "เผยแพร่ประกาศ"}
              </button>
            </form>
          </article>
        </section>
      )}

      <section className="stack-list">
        {announcements.length ? (
          announcements.map((announcement) => (
            <article className="announcement-card panel" key={announcement.id}>
              <div className="announcement-top wrap-mobile">
                <div className="badge-cluster">
                  <StatusBadge status={announcement.priority} />
                  <small>{formatDate(announcement.createdAt, true)}</small>
                </div>
                {adminTools ? (
                  <button
                    className="ghost-button compact"
                    type="button"
                    onClick={() => onDelete(announcement.id)}
                    disabled={deletingAnnouncementId === announcement.id}
                  >
                    ลบประกาศ
                  </button>
                ) : null}
              </div>
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              <small>ประกาศโดย {announcement.createdBy}</small>
            </article>
          ))
        ) : (
          <EmptyState
            title="ยังไม่มีประกาศ"
            description="ระบบยังไม่มีข่าวสารหรือประกาศในขณะนี้"
          />
        )}
      </section>
    </>
  );
}
