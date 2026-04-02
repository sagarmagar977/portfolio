"use client";

import { useMemo, useState } from "react";
import {
  deleteEducationAction,
  moveEducationAction,
  upsertEducationAction,
} from "./actions";
import type { PortfolioData } from "@/lib/portfolio";

type EducationItem = PortfolioData["educations"][number];

type EducationManagerProps = {
  profileId: string;
  educations: EducationItem[];
};

type DraftState = {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  sortOrder?: number;
};

export function EducationManager({ profileId, educations }: EducationManagerProps) {
  const orderedEducations = useMemo(
    () => [...educations].sort((a, b) => a.sortOrder - b.sortOrder),
    [educations],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);

  const openAddModal = () => {
    setDraft({
      degree: "",
      institution: "",
      period: "",
      description: "",
    });
  };

  const openEditModal = (education: EducationItem) => {
    setDraft({
      id: education.id,
      degree: education.degree,
      institution: education.institution,
      period: education.period,
      description: education.description ?? "",
      sortOrder: education.sortOrder,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Education" : "Add Education"}</h3>
                  <p className="admin-muted mb-0">
                    Update the education details shown on the portfolio.
                  </p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  Close
                </button>
              </div>

              <form action={upsertEducationAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedEducations.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Degree</label>
                  <input
                    className="form-control"
                    name="degree"
                    required
                    value={draft.degree}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              degree: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Institution</label>
                  <input
                    className="form-control"
                    name="institution"
                    required
                    value={draft.institution}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              institution: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Period</label>
                  <input
                    className="form-control"
                    name="period"
                    required
                    value={draft.period}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              period: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows={4}
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              description: event.target.value,
                            }
                          : current,
                      )
                    }
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

      {orderedEducations.map((education, index) => (
        <div className="col-12" key={education.id}>
          <div className="admin-entity-row">
            <div className="admin-entity-summary">
              <h3 className="h5 mb-1">{education.degree}</h3>
              <p className="mb-1">{education.institution}</p>
              <p className="mb-2 admin-muted">{education.period}</p>
              {education.description ? (
                <p className="mb-0 admin-entity-description">{education.description}</p>
              ) : null}
            </div>

            <div className="admin-entity-actions">
              <form action={moveEducationAction}>
                <input type="hidden" name="id" value={education.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={index === 0}
                  aria-label={`Move ${education.degree} up`}
                >
                  Up
                </button>
              </form>

              <form action={moveEducationAction}>
                <input type="hidden" name="id" value={education.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={index === orderedEducations.length - 1}
                  aria-label={`Move ${education.degree} down`}
                >
                  Down
                </button>
              </form>

              <button
                type="button"
                className="btn btn-brand"
                onClick={() => openEditModal(education)}
              >
                Edit
              </button>

              <form action={deleteEducationAction}>
                <input type="hidden" name="id" value={education.id} />
                <button type="submit" className="btn btn-outline-danger">
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12">
        <button type="button" className="btn btn-brand admin-add-button" onClick={openAddModal}>
          + Add Education
        </button>
      </div>
    </div>
  );
}
