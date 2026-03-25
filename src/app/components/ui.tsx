import type { FlashState } from '../types';
import { getStatusLabel, getToneClass } from '../core';

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge tone-${getToneClass(status)}`}>{getStatusLabel(status)}</span>;
}

export function SummaryCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <article className="summary-card panel">
      <span className="summary-label">{label}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state panel">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function FlashMessage({ flash }: { flash: FlashState }) {
  if (!flash) {
    return null;
  }

  return (
    <div className={`flash tone-${flash.tone}`}>
      <strong>{flash.message}</strong>
    </div>
  );
}

export function PseudoQr({ reference }: { reference: string }) {
  const cells = Array.from({ length: 121 }, (_, index) => {
    const charCode = reference.charCodeAt(index % reference.length);
    return (charCode + index * 7) % 5 < 2;
  });

  return (
    <div className="qr-wrapper">
      <div className="qr-grid">
        {cells.map((isFilled, index) => (
          <span key={`${reference}-${index}`} className={`qr-cell ${isFilled ? 'is-filled' : ''}`} />
        ))}
      </div>
      <small>{reference}</small>
    </div>
  );
}
