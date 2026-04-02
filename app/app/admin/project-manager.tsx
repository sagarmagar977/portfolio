"use client";

import { useMemo, useState } from "react";
import {
  deleteProjectAction,
  moveProjectAction,
  upsertProjectAction,
} from "./actions";
import type { PortfolioData } from "@/lib/portfolio";

type ProjectItem = PortfolioData["projects"][number];

type ProjectManagerProps = {
  profileId: string;
  projects: ProjectItem[];
};

type DraftState = {
  id?: string;
  title: string;
  description: string;
  liveUrl: string;
  imageUrl: string;
  sortOrder?: number;
};

export function ProjectManager({ profileId, projects }: ProjectManagerProps) {
  const orderedProjects = useMemo(
    () => [...projects].sort((a, b) => a.sortOrder - b.sortOrder),
    [projects],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);

  const openAddModal = () => {
    setDraft({
      title: "",
      description: "",
      liveUrl: "",
      imageUrl: "",
    });
  };

  const openEditModal = (project: ProjectItem) => {
    setDraft({
      id: project.id,
      title: project.title,
      description: project.description,
      liveUrl: project.liveUrl ?? "",
      imageUrl: project.imageUrl ?? "",
      sortOrder: project.sortOrder,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Project" : "Add Project"}</h3>
                  <p className="admin-muted mb-0">
                    Update the project details, links, and image.
                  </p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  Close
                </button>
              </div>

              <form action={upsertProjectAction} className="row g-3" encType="multipart/form-data">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedProjects.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    required
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              title: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Live URL</label>
                  <input
                    className="form-control"
                    name="liveUrl"
                    value={draft.liveUrl}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              liveUrl: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Image URL</label>
                  <input
                    className="form-control"
                    name="imageUrl"
                    value={draft.imageUrl}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              imageUrl: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload Image</label>
                  <input className="form-control" type="file" name="imageFile" accept="image/*" />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows={4}
                    required
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

      {orderedProjects.map((project, index) => (
        <div className="col-12" key={project.id}>
          <div className="admin-entity-row">
            <div className="admin-entity-summary">
              <div className="d-flex align-items-start gap-3 flex-wrap">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="admin-project-thumb rounded-3"
                  />
                ) : (
                  <div className="admin-project-thumb admin-project-thumb-empty rounded-3">
                    No image
                  </div>
                )}

                <div>
                  <h3 className="h5 mb-1">{project.title}</h3>
                  <p className="mb-2 admin-entity-description">{project.description}</p>
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="admin-project-link">
                      {project.liveUrl}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="admin-entity-actions">
              <form action={moveProjectAction}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={index === 0}
                  aria-label={`Move ${project.title} up`}
                >
                  Up
                </button>
              </form>

              <form action={moveProjectAction}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={index === orderedProjects.length - 1}
                  aria-label={`Move ${project.title} down`}
                >
                  Down
                </button>
              </form>

              <button
                type="button"
                className="btn btn-brand"
                onClick={() => openEditModal(project)}
              >
                Edit
              </button>

              <form action={deleteProjectAction}>
                <input type="hidden" name="id" value={project.id} />
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
          + Add Project
        </button>
      </div>
    </div>
  );
}
