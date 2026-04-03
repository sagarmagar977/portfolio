"use client";

import { useEffect, useState } from "react";

export function AdminSaveNotice({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, 2200);

    const cleanupId = window.setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has("saved")) {
        currentUrl.searchParams.delete("saved");
        window.history.replaceState({}, "", currentUrl.toString());
      }
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(cleanupId);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="admin-save-notice-wrap" aria-live="polite" aria-atomic="true">
      <div className="admin-save-notice" role="status">
        <span className="admin-save-notice-dot" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}
