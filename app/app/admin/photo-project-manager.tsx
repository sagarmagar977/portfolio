"use client";

import { useMemo, useState } from "react";
import { deletePhotoProjectAction, reorderPhotoProjectsAction, upsertPhotoProjectAction } from "./actions";
import { AdminDragHandleButton } from "./admin-drag-handle-button";
import { useAdminDragReorder } from "./use-admin-drag-reorder";
import type { PortfolioData } from "@/lib/portfolio";

type PhotoProjectItem = PortfolioData["photoProjects"][number];

type PhotoProjectManagerProps = {
  profileId: string;
  photoProjects: PhotoProjectItem[];
};

type DraftState = {
  id?: string;
  title: string;
  collection: string;
  description: string;
  projectUrl: string;
  sortOrder?: number;
};

export function PhotoProjectManager({ profileId, photoProjects }: PhotoProjectManagerProps) {
  const orderedProjectsFromProps = useMemo(
    () => [...photoProjects].sort((a, b) => a.sortOrder - b.sortOrder),
    [photoProjects],
  );
  const [draft, setDraft] = useState<DraftState | null>(null);
  const { orderedItems: orderedProjects, draggedItemId, getRowDragProps, isSavingOrder } = useAdminDragReorder(
    orderedProjectsFromProps,
    reorderPhotoProjectsAction,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Photo Story" : "Add Photo Story"}</h3>
                  <p className="admin-muted mb-0">Add a cover image, collection name, description, and optional link.</p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>Close</button>
              </div>

              <form action={upsertPhotoProjectAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedProjects.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input className="form-control" name="title" required value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Collection</label>
                  <input className="form-control" name="collection" value={draft.collection} onChange={(event) => setDraft((current) => current ? { ...current, collection: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Project Link</label>
                  <input className="form-control" name="projectUrl" value={draft.projectUrl} onChange={(event) => setDraft((current) => current ? { ...current, projectUrl: event.target.value } : current)} />
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

      {orderedProjects.map((project) => (
        <div className="col-12" key={project.id}>
          <div
            className={[
              "admin-entity-row",
              "admin-entity-row-draggable",
              draggedItemId === project.id ? "admin-entity-row-dragging" : "",
              isSavingOrder ? "admin-entity-row-saving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getRowDragProps(project.id)}
          >
            <div className="admin-entity-summary">
              <div className="d-flex align-items-start gap-3 flex-wrap">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="admin-project-thumb rounded-3" />
                ) : (
                  <div className="admin-project-thumb admin-project-thumb-empty rounded-3">No photo</div>
                )}
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h3 className="h5 mb-0">{project.title}</h3>
                    {project.collection ? <span className="admin-service-badge">{project.collection}</span> : null}
                  </div>
                  <p className="mb-2 admin-entity-description">{project.description}</p>
                  {project.projectUrl ? <a href={project.projectUrl} target="_blank" rel="noreferrer" className="admin-project-link">{project.projectUrl}</a> : null}
                </div>
              </div>
            </div>

            <div className="admin-entity-actions">
              <AdminDragHandleButton label={project.title} disabled={isSavingOrder} />

              <button
                type="button"
                className="btn btn-brand"
                onClick={() =>
                  setDraft({
                    id: project.id,
                    title: project.title,
                    collection: project.collection ?? "",
                    description: project.description,
                    projectUrl: project.projectUrl ?? "",
                    sortOrder: project.sortOrder,
                  })
                }
                disabled={isSavingOrder}
              >
                Edit
              </button>

              <form action={deletePhotoProjectAction}>
                <input type="hidden" name="id" value={project.id} />
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
          onClick={() => setDraft({ title: "", collection: "", description: "", projectUrl: "" })}
          disabled={isSavingOrder}
        >
          + Add Photo Story
        </button>
      </div>
    </div>
  );
}
