"use client";

import { useEffect, useState } from "react";
import { updateSlugAction } from "./actions";
import { normalizeSlug } from "@/lib/slug";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function SlugSettings({
  profileId,
  currentSlug,
}: {
  profileId: string;
  currentSlug: string;
}) {
  const [slug, setSlug] = useState(currentSlug);
  const normalizedSlug = normalizeSlug(slug);
  const [asyncStatus, setAsyncStatus] = useState<SlugStatus>("idle");
  const [isEditing, setIsEditing] = useState(false);
  const [lastCheckedSlug, setLastCheckedSlug] = useState(currentSlug);
  const immediateStatus: SlugStatus =
    !normalizedSlug ? "invalid" : normalizedSlug === currentSlug ? "idle" : asyncStatus;

  useEffect(() => {
    setSlug(currentSlug);
    setAsyncStatus("idle");
    setLastCheckedSlug(currentSlug);
    setIsEditing(false);
  }, [currentSlug]);

  async function handleCheck() {
    if (!normalizedSlug) {
      setAsyncStatus("invalid");
      return;
    }

    if (normalizedSlug === currentSlug) {
      setLastCheckedSlug(normalizedSlug);
      setAsyncStatus("idle");
      return;
    }

    setAsyncStatus("checking");

    try {
      const response = await fetch(
        `/api/slug?value=${encodeURIComponent(normalizedSlug)}&excludeProfileId=${encodeURIComponent(profileId)}`,
      );

      if (!response.ok) {
        setAsyncStatus("invalid");
        return;
      }

      const result = (await response.json()) as { available: boolean; valid: boolean; slug: string };
      setLastCheckedSlug(result.slug);
      setAsyncStatus(!result.valid ? "invalid" : result.available ? "available" : "taken");
    } catch {
      setAsyncStatus("invalid");
    }
  }

  function handleCancel() {
    setSlug(currentSlug);
    setAsyncStatus("idle");
    setLastCheckedSlug(currentSlug);
    setIsEditing(false);
  }

  const canSave =
    normalizedSlug === currentSlug ||
    (normalizedSlug === lastCheckedSlug && asyncStatus === "available");

  return (
    <div className="admin-inline-panel">
      <div className="admin-inline-panel-header">
        <div>
          <p className="form-label mb-1">Public Slug</p>
          <p className="admin-muted mb-0">
            Your public portfolio lives at <span className="admin-slug-preview">/u/{currentSlug}</span>
          </p>
        </div>
        {!isEditing ? (
          <button type="button" className="btn btn-outline-light" onClick={() => setIsEditing(true)}>
            Edit Slug
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <form action={updateSlugAction} className="row g-3 mt-2">
          <input type="hidden" name="profileId" value={profileId} />

          <div className="col-md-7">
            <label className="form-label">Slug</label>
            <div className="d-flex gap-2">
              <input
                className="form-control"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setAsyncStatus("idle");
                  setLastCheckedSlug(currentSlug);
                }}
                placeholder="your-name"
                autoComplete="off"
                required
              />
              <button type="button" className="btn btn-outline-light" onClick={handleCheck} disabled={!normalizedSlug || asyncStatus === "checking"}>
                {asyncStatus === "checking" ? "Checking..." : "Check"}
              </button>
            </div>
          </div>

          <div className="col-md-5">
            <label className="form-label">Public Preview</label>
            <div className="form-control d-flex align-items-center text-white-50">
              /u/{normalizedSlug || "your-slug"}
            </div>
          </div>

          <div className="col-12">
            <p className="mb-0 admin-muted">
              {immediateStatus === "checking" ? "Checking availability..." : null}
              {immediateStatus === "available" ? "This slug is available. You can save it now." : null}
              {immediateStatus === "taken" ? "This slug is already taken." : null}
              {immediateStatus === "invalid" ? "Use lowercase letters, numbers, and hyphens only." : null}
              {immediateStatus === "idle" ? "Use Check first, then save once the slug is available." : null}
            </p>
          </div>

          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-light" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-brand"
              disabled={!normalizedSlug || immediateStatus === "taken" || immediateStatus === "invalid" || !canSave}
            >
              Save Slug
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
