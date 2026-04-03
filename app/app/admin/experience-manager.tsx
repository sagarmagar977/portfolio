"use client";

import { useMemo, useState } from "react";
import { deleteExperienceAction, reorderExperiencesAction, upsertExperienceAction } from "./actions";
import { AdminDragHandleButton } from "./admin-drag-handle-button";
import { useAdminDragReorder } from "./use-admin-drag-reorder";
import type { PortfolioData } from "@/lib/portfolio";

type ExperienceItem = PortfolioData["experiences"][number];

type ExperienceManagerProps = {
  profileId: string;
  experiences: ExperienceItem[];
};

type DraftState = {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  sortOrder?: number;
};

export function ExperienceManager({ profileId, experiences }: ExperienceManagerProps) {
  const orderedExperiencesFromProps = useMemo(
    () => [...experiences].sort((a, b) => a.sortOrder - b.sortOrder),
    [experiences],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);
  const { orderedItems: orderedExperiences, draggedItemId, getRowDragProps, isSavingOrder } = useAdminDragReorder(
    orderedExperiencesFromProps,
    reorderExperiencesAction,
  );

  const openAddModal = () => {
    setDraft({ role: "", company: "", period: "", description: "" });
  };

  const openEditModal = (experience: ExperienceItem) => {
    setDraft({
      id: experience.id,
      role: experience.role,
      company: experience.company,
      period: experience.period,
      description: experience.description ?? "",
      sortOrder: experience.sortOrder,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Experience" : "Add Experience"}</h3>
                  <p className="admin-muted mb-0">Update the work experience details shown on the portfolio.</p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  Close
                </button>
              </div>

              <form action={upsertExperienceAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedExperiences.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <input className="form-control" name="role" required value={draft.role} onChange={(event) => setDraft((current) => (current ? { ...current, role: event.target.value } : current))} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Company</label>
                  <input className="form-control" name="company" required value={draft.company} onChange={(event) => setDraft((current) => (current ? { ...current, company: event.target.value } : current))} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Period</label>
                  <input className="form-control" name="period" required value={draft.period} onChange={(event) => setDraft((current) => (current ? { ...current, period: event.target.value } : current))} />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" rows={4} value={draft.description} onChange={(event) => setDraft((current) => (current ? { ...current, description: event.target.value } : current))} />
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

      {orderedExperiences.map((experience) => (
        <div className="col-12" key={experience.id}>
          <div
            className={[
              "admin-entity-row",
              "admin-entity-row-draggable",
              draggedItemId === experience.id ? "admin-entity-row-dragging" : "",
              isSavingOrder ? "admin-entity-row-saving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getRowDragProps(experience.id)}
          >
            <div className="admin-entity-summary">
              <h3 className="h5 mb-1">{experience.role}</h3>
              <p className="mb-1">{experience.company}</p>
              <p className="mb-2 admin-muted">{experience.period}</p>
              {experience.description ? <p className="mb-0 admin-entity-description">{experience.description}</p> : null}
            </div>

            <div className="admin-entity-actions">
              <AdminDragHandleButton label={experience.role} disabled={isSavingOrder} />

              <button type="button" className="btn btn-brand" onClick={() => openEditModal(experience)} disabled={isSavingOrder}>
                Edit
              </button>

              <form action={deleteExperienceAction}>
                <input type="hidden" name="id" value={experience.id} />
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
          + Add Experience
        </button>
      </div>
    </div>
  );
}
