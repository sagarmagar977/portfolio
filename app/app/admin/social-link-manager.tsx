"use client";

import { useMemo, useState } from "react";
import {
  deleteSocialLinkAction,
  moveSocialLinkAction,
  upsertSocialLinkAction,
} from "./actions";
import type { PortfolioData } from "@/lib/portfolio";

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
  const orderedLinks = useMemo(
    () => [...socialLinks].sort((a, b) => a.sortOrder - b.sortOrder),
    [socialLinks],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);

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
                  <p className="admin-muted mb-0">
                    Update footer social platforms and URLs.
                  </p>
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
                  <input className="form-control" name="platform" required value={draft.platform} onChange={(event) => setDraft((current) => current ? { ...current, platform: event.target.value } : current)} />
                </div>

                <div className="col-md-8">
                  <label className="form-label">URL</label>
                  <input className="form-control" name="url" required value={draft.url} onChange={(event) => setDraft((current) => current ? { ...current, url: event.target.value } : current)} />
                </div>

                <div className="col-12 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-light" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-brand">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {orderedLinks.map((socialLink, index) => (
        <div className="col-12" key={socialLink.id}>
          <div className="admin-entity-row">
            <div className="admin-entity-summary">
              <h3 className="h5 mb-1 text-capitalize">{socialLink.platform}</h3>
              <p className="mb-0 admin-project-link">{socialLink.url}</p>
            </div>

            <div className="admin-entity-actions">
              <form action={moveSocialLinkAction}>
                <input type="hidden" name="id" value={socialLink.id} />
                <input type="hidden" name="direction" value="up" />
                <button type="submit" className="btn btn-outline-light" disabled={index === 0}>Up</button>
              </form>

              <form action={moveSocialLinkAction}>
                <input type="hidden" name="id" value={socialLink.id} />
                <input type="hidden" name="direction" value="down" />
                <button type="submit" className="btn btn-outline-light" disabled={index === orderedLinks.length - 1}>Down</button>
              </form>

              <button type="button" className="btn btn-brand" onClick={() => openEditModal(socialLink)}>Edit</button>

              <form action={deleteSocialLinkAction}>
                <input type="hidden" name="id" value={socialLink.id} />
                <button type="submit" className="btn btn-outline-danger">Delete</button>
              </form>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12">
        <button type="button" className="btn btn-brand admin-add-button" onClick={openAddModal}>
          + Add Social Link
        </button>
      </div>
    </div>
  );
}
