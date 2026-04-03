"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContactFormAction } from "./actions";
import { initialContactFormState } from "./contact-form-state";

export function ContactForm({ profileId }: { profileId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [state, formAction, isPending] = useActionState(
    submitContactFormAction,
    initialContactFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setShowSuccessMessage(true);

      const timeoutId = window.setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      return () => window.clearTimeout(timeoutId);
    }

    setShowSuccessMessage(false);
  }, [state.status]);

  const shouldShowFeedback = state.status === "error" || showSuccessMessage;

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="profileId" value={profileId} />
      <div>
        <input type="text" className="form-control" name="name" placeholder="Enter your name" required />
      </div>
      <div>
        <input type="email" className="form-control" name="email" placeholder="Enter your email" required />
      </div>
      <div className="md:col-span-2">
        <input type="text" className="form-control" name="subject" placeholder="Enter subject" required />
      </div>
      <div className="md:col-span-2">
        <textarea rows={4} className="form-control" name="message" placeholder="Enter your message" required />
      </div>
      {shouldShowFeedback ? (
        <div className="md:col-span-2">
          <div
            className={
              state.status === "success"
                ? "admin-contact-feedback admin-contact-feedback-success"
                : "admin-contact-feedback admin-contact-feedback-error"
            }
          >
            {state.message}
          </div>
        </div>
      ) : null}
      <div className="grid md:col-span-2">
        <button
          type="submit"
          className="btn btn-brand inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
        >
          <span className={isPending ? "contact-submit-label contact-submit-label-pending" : "contact-submit-label"}>
            {isPending ? "Sending..." : "Contact me"}
          </span>
        </button>
      </div>
    </form>
  );
}
