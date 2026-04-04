"use client";

import { useEffect } from "react";

function getSubmitButton(form: HTMLFormElement) {
  return form.querySelector<HTMLButtonElement | HTMLInputElement>(
    'button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])',
  );
}

function getTargetForm() {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    const activeForm = activeElement.closest("form");
    if (activeForm instanceof HTMLFormElement) {
      return activeForm;
    }
  }

  const modalForm = document.querySelector<HTMLFormElement>(".admin-modal-card form");
  if (modalForm) {
    return modalForm;
  }

  return null;
}

export function AdminSaveShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const wantsSave = (event.altKey && event.key.toLowerCase() === "s")
        || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s");

      if (!wantsSave || event.defaultPrevented) {
        return;
      }

      const targetForm = getTargetForm();
      if (!targetForm) {
        return;
      }

      const submitButton = getSubmitButton(targetForm);
      if (!submitButton) {
        return;
      }

      event.preventDefault();
      targetForm.requestSubmit(submitButton);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
