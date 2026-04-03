"use client";

import { useMemo, useState } from "react";
import { deleteBusinessAction, reorderBusinessesAction, upsertBusinessAction } from "./actions";
import { AdminDragHandleButton } from "./admin-drag-handle-button";
import { useAdminDragReorder } from "./use-admin-drag-reorder";
import type { PortfolioData } from "@/lib/portfolio";

type BusinessItem = PortfolioData["businesses"][number];

type BusinessManagerProps = {
  profileId: string;
  businesses: BusinessItem[];
};

type DraftState = {
  id?: string;
  name: string;
  businessType: string;
  description: string;
  websiteUrl: string;
  sortOrder?: number;
};

export function BusinessManager({ profileId, businesses }: BusinessManagerProps) {
  const orderedBusinessesFromProps = useMemo(
    () => [...businesses].sort((a, b) => a.sortOrder - b.sortOrder),
    [businesses],
  );
  const [draft, setDraft] = useState<DraftState | null>(null);
  const { orderedItems: orderedBusinesses, draggedItemId, getRowDragProps, isSavingOrder } = useAdminDragReorder(
    orderedBusinessesFromProps,
    reorderBusinessesAction,
  );

  const closeModal = () => setDraft(null);

  return (
    <div className="row g-4">
      {draft ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-shell">
            <div className="admin-modal-card">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                <div>
                  <h3 className="h4 mb-1">{draft.id ? "Edit Venture" : "Add Venture"}</h3>
                  <p className="admin-muted mb-0">Add the company details, summary, image, and website.</p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>Close</button>
              </div>

              <form action={upsertBusinessAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedBusinesses.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Business Name</label>
                  <input className="form-control" name="name" required value={draft.name} onChange={(event) => setDraft((current) => current ? { ...current, name: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Business Type</label>
                  <input className="form-control" name="businessType" value={draft.businessType} onChange={(event) => setDraft((current) => current ? { ...current, businessType: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Website</label>
                  <input className="form-control" name="websiteUrl" value={draft.websiteUrl} onChange={(event) => setDraft((current) => current ? { ...current, websiteUrl: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload Logo / Image</label>
                  <input className="form-control" type="file" name="imageFile" accept="image/*" />
                </div>

                <div className="col-12">
                  <label className="form-label">Summary</label>
                  <textarea className="form-control" name="description" rows={4} required value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} />
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

      {orderedBusinesses.map((business) => (
        <div className="col-12" key={business.id}>
          <div
            className={[
              "admin-entity-row",
              "admin-entity-row-draggable",
              draggedItemId === business.id ? "admin-entity-row-dragging" : "",
              isSavingOrder ? "admin-entity-row-saving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getRowDragProps(business.id)}
          >
            <div className="admin-entity-summary">
              <div className="d-flex align-items-start gap-3 flex-wrap">
                {business.imageUrl ? (
                  <img src={business.imageUrl} alt={business.name} className="admin-project-thumb rounded-3" />
                ) : (
                  <div className="admin-project-thumb admin-project-thumb-empty rounded-3">No image</div>
                )}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h3 className="h5 mb-0">{business.name}</h3>
                    {business.businessType ? <span className="admin-service-badge">{business.businessType}</span> : null}
                  </div>
                  <p className="mb-2 admin-entity-description">{business.description}</p>
                  {business.websiteUrl ? <a href={business.websiteUrl} target="_blank" rel="noreferrer" className="admin-project-link">{business.websiteUrl}</a> : null}
                </div>
              </div>
            </div>

            <div className="admin-entity-actions">
              <AdminDragHandleButton label={business.name} disabled={isSavingOrder} />

              <button
                type="button"
                className="btn btn-brand"
                onClick={() =>
                  setDraft({
                    id: business.id,
                    name: business.name,
                    businessType: business.businessType ?? "",
                    description: business.description,
                    websiteUrl: business.websiteUrl ?? "",
                    sortOrder: business.sortOrder,
                  })
                }
                disabled={isSavingOrder}
              >
                Edit
              </button>

              <form action={deleteBusinessAction}>
                <input type="hidden" name="id" value={business.id} />
                <button type="submit" className="btn btn-outline-danger" disabled={isSavingOrder}>Delete</button>
              </form>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12">
        <button
          type="button"
          className="btn btn-brand admin-add-button"
          onClick={() => setDraft({ name: "", businessType: "", description: "", websiteUrl: "" })}
          disabled={isSavingOrder}
        >
          + Add Venture
        </button>
      </div>
    </div>
  );
}
