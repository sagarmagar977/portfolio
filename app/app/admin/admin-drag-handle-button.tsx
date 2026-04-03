"use client";

type AdminDragHandleButtonProps = {
  label: string;
  disabled?: boolean;
};

export function AdminDragHandleButton({ label, disabled = false }: AdminDragHandleButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-outline-light admin-drag-handle"
      aria-label={`Drag to reorder ${label}`}
      title="Drag to reorder"
      disabled={disabled}
    >
      <span className="admin-drag-handle-grip" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      Drag
    </button>
  );
}
