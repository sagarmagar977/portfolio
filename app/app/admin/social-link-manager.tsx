"use client";

import { useMemo, useState } from "react";
import { deleteSocialLinkAction, reorderSocialLinksAction, upsertSocialLinkAction } from "./actions";
import { AdminDragHandleButton } from "./admin-drag-handle-button";
import { useAdminDragReorder } from "./use-admin-drag-reorder";
import type { PortfolioData } from "@/lib/portfolio";
import { getSocialPlatformMeta, SOCIAL_PLATFORM_OPTIONS } from "@/lib/social-links";

type SocialLinkItem = PortfolioData["socialLinks"][number];

type SocialLinkManagerProps = {
  profileId: string;
  socialLinks: SocialLinkItem[];
};

type DraftState = {
  id?: string;
  platform: string;
  url: string;
  sortOrder?: number;
};

export function SocialLinkManager({ profileId, socialLinks }: SocialLinkManagerProps) {
  const orderedLinksFromProps = useMemo(
    () => [...socialLinks].sort((a, b) => a.sortOrder - b.sortOrder),
    [socialLinks],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);
  const { orderedItems: orderedLinks, draggedItemId, getRowDragProps, isSavingOrder } = useAdminDragReorder(
    orderedLinksFromProps,
    reorderSocialLinksAction,
  );

  const openAddModal = () => {
    setDraft({ platform: "", url: "" });
  };

  const openEditModal = (socialLink: SocialLinkItem) => {
    setDraft({
      id: socialLink.id,
      platform: socialLink.platform,
      url: socialLink.url,
      sortOrder: socialLink.sortOrder,
    });
  };

  const closeModal = () => {
    setDraft(null);
  };

  const selectedPlatformMeta = draft ? getSocialPlatformMeta(draft.platform) : null;

  return (
    <div className="row g-4">
      {draft ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-shell">
            <div className="admin-modal-card">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                <div>
                  <h3 className="h4 mb-1">{draft.id ? "Edit Social Link" : "Add Social Link"}</h3>
                  <p className="admin-muted mb-0">Update footer social platforms and URLs.</p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  Close
                </button>
              </div>

              <form action={upsertSocialLinkAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedLinks.length + 1} />

                <div className="col-md-4">
                  <label className="form-label">Platform</label>
                  <select
                    className="form-control"
                    name="platform"
                    required
                    value={draft.platform}
                    onChange={(event) =>
                      setDraft((current) => (current ? { ...current, platform: event.target.value } : current))
                    }
                  >
                    <option value="" disabled>
                      Select a platform
                    </option>
                    {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedPlatformMeta ? (
                    <div className="admin-social-preview">
                      <span className="admin-social-preview__icon" aria-hidden="true">
                        <i className={selectedPlatformMeta.iconClassName} />
                      </span>
                      <span>{selectedPlatformMeta.label}</span>
                    </div>
                  ) : null}
                </div>

                <div className="col-md-8">
                  <label className="form-label">URL</label>
                  <input
                    className="form-control"
                    name="url"
                    required
                    value={draft.url}
                    onChange={(event) => setDraft((current) => (current ? { ...current, url: event.target.value } : current))}
                  />
                </div>

                <div className="col-12 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-brand">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {orderedLinks.map((socialLink) => (
        <div className="col-12" key={socialLink.id}>
          <div
            className={[
              "admin-entity-row",
              "admin-entity-row-draggable",
              draggedItemId === socialLink.id ? "admin-entity-row-dragging" : "",
              isSavingOrder ? "admin-entity-row-saving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getRowDragProps(socialLink.id)}
          >
            <div className="admin-entity-summary">
              <div className="admin-social-summary">
                <span className="admin-social-summary__icon" aria-hidden="true">
                  <i className={getSocialPlatformMeta(socialLink.platform).iconClassName} />
                </span>
                <h3 className="h5 mb-0">{getSocialPlatformMeta(socialLink.platform).label}</h3>
              </div>
              <p className="mb-0 admin-project-link">{socialLink.url}</p>
            </div>

            <div className="admin-entity-actions">
              <AdminDragHandleButton label={getSocialPlatformMeta(socialLink.platform).label} disabled={isSavingOrder} />

              <button type="button" className="btn btn-brand" onClick={() => openEditModal(socialLink)} disabled={isSavingOrder}>
                Edit
              </button>

              <form action={deleteSocialLinkAction}>
                <input type="hidden" name="id" value={socialLink.id} />
                <button type="submit" className="btn btn-outline-danger" disabled={isSavingOrder}>
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12">
        <button type="button" className="btn btn-brand admin-add-button" onClick={openAddModal} disabled={isSavingOrder}>
          + Add Social Link
        </button>
      </div>
    </div>
  );
}
