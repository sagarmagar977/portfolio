"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactFormAction } from "./actions";
import { initialContactFormState } from "./contact-form-state";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitContactFormAction,
    initialContactFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="row g-lg-3 gy-3">
      <div className="form-group col-md-6">
        <input type="text" className="form-control" name="name" placeholder="Enter your name" required />
      </div>
      <div className="form-group col-md-6">
        <input type="email" className="form-control" name="email" placeholder="Enter your email" required />
      </div>
      <div className="form-group col-12">
        <input type="text" className="form-control" name="subject" placeholder="Enter subject" required />
      </div>
      <div className="form-group col-12">
        <textarea rows={4} className="form-control" name="message" placeholder="Enter your message" required />
      </div>
      {state.status !== "idle" ? (
        <div className="col-12">
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
      <div className="form-group col-12 d-grid">
        <button type="submit" className="btn btn-brand" disabled={isPending}>
          <span className={isPending ? "contact-submit-label contact-submit-label-pending" : "contact-submit-label"}>
            {isPending ? "Sending..." : "Contact me"}
          </span>
        </button>
      </div>
    </form>
  );
}
