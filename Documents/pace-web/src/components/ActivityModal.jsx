// src/components/ActivityModal.jsx
import { useEffect } from "react";
import "./styles/ActivityModal.css";

export default function ActivityModal({
  open,
  onClose,
  activity,
  meta,
  started,
  onStart,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <h3 className="modal-title">{activity?.label}</h3>
        {meta?.desc && <p className="modal-desc">{meta.desc}</p>}

        <div className="modal-meta">
          {meta?.rewardText && <div><strong>Reward:</strong> {meta.rewardText}</div>}
          {meta?.points != null && <div><strong>Points:</strong> {meta.points}</div>}
        </div>

        {!started ? (
          <button className="modal-start" onClick={onStart}>Start</button>
        ) : (
          <div className="modal-qr-block">
            <div className="modal-qr-title">
              Scan through the mobile app to complete this activity.
            </div>
            <div className="modal-waiting">Waiting for completion…</div>
          </div>
        )}
      </div>
    </div>
  );
}
