"use client";

import { useMemo, useState } from "react";
import { deleteArtworkAction, reorderArtworksAction, upsertArtworkAction } from "./actions";
import { AdminDragHandleButton } from "./admin-drag-handle-button";
import { useAdminDragReorder } from "./use-admin-drag-reorder";
import type { PortfolioData } from "@/lib/portfolio";

type ArtworkItem = PortfolioData["artworks"][number];

type ArtworkManagerProps = {
  profileId: string;
  artworks: ArtworkItem[];
};

type DraftState = {
  id?: string;
  title: string;
  medium: string;
  description: string;
  collectionUrl: string;
  sortOrder?: number;
};

export function ArtworkManager({ profileId, artworks }: ArtworkManagerProps) {
  const orderedArtworksFromProps = useMemo(
    () => [...artworks].sort((a, b) => a.sortOrder - b.sortOrder),
    [artworks],
  );
  const [draft, setDraft] = useState<DraftState | null>(null);
  const { orderedItems: orderedArtworks, draggedItemId, getRowDragProps, isSavingOrder } = useAdminDragReorder(
    orderedArtworksFromProps,
    reorderArtworksAction,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Artwork" : "Add Artwork"}</h3>
                  <p className="admin-muted mb-0">Add the artwork image, medium, story, and optional collection link.</p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>Close</button>
              </div>

              <form action={upsertArtworkAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedArtworks.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input className="form-control" name="title" required value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Medium / Type</label>
                  <input className="form-control" name="medium" value={draft.medium} onChange={(event) => setDraft((current) => current ? { ...current, medium: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Collection Link</label>
                  <input className="form-control" name="collectionUrl" value={draft.collectionUrl} onChange={(event) => setDraft((current) => current ? { ...current, collectionUrl: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload Image</label>
                  <input className="form-control" type="file" name="imageFile" accept="image/*" />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
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

      {orderedArtworks.map((artwork) => (
        <div className="col-12" key={artwork.id}>
          <div
            className={[
              "admin-entity-row",
              "admin-entity-row-draggable",
              draggedItemId === artwork.id ? "admin-entity-row-dragging" : "",
              isSavingOrder ? "admin-entity-row-saving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getRowDragProps(artwork.id)}
          >
            <div className="admin-entity-summary">
              <div className="d-flex align-items-start gap-3 flex-wrap">
                {artwork.imageUrl ? (
                  <img src={artwork.imageUrl} alt={artwork.title} className="admin-project-thumb rounded-3" />
                ) : (
                  <div className="admin-project-thumb admin-project-thumb-empty rounded-3">No image</div>
                )}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h3 className="h5 mb-0">{artwork.title}</h3>
                    {artwork.medium ? <span className="admin-service-badge">{artwork.medium}</span> : null}
                  </div>
                  <p className="mb-2 admin-entity-description">{artwork.description}</p>
                  {artwork.collectionUrl ? <a href={artwork.collectionUrl} target="_blank" rel="noreferrer" className="admin-project-link">{artwork.collectionUrl}</a> : null}
                </div>
              </div>
            </div>

            <div className="admin-entity-actions">
              <AdminDragHandleButton label={artwork.title} disabled={isSavingOrder} />

              <button
                type="button"
                className="btn btn-brand"
                onClick={() =>
                  setDraft({
                    id: artwork.id,
                    title: artwork.title,
                    medium: artwork.medium ?? "",
                    description: artwork.description,
                    collectionUrl: artwork.collectionUrl ?? "",
                    sortOrder: artwork.sortOrder,
                  })
                }
                disabled={isSavingOrder}
              >
                Edit
              </button>

              <form action={deleteArtworkAction}>
                <input type="hidden" name="id" value={artwork.id} />
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
          onClick={() => setDraft({ title: "", medium: "", description: "", collectionUrl: "" })}
          disabled={isSavingOrder}
        >
          + Add Artwork
        </button>
      </div>
    </div>
  );
}
