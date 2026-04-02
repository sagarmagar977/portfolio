"use client";

import { useMemo, useState } from "react";
import {
  deleteBeatAction,
  moveBeatAction,
  upsertBeatAction,
} from "./actions";
import type { PortfolioData } from "@/lib/portfolio";

type BeatItem = PortfolioData["beats"][number];

type BeatManagerProps = {
  profileId: string;
  beats: BeatItem[];
};

type DraftState = {
  id?: string;
  title: string;
  description: string;
  coverImageUrl: string;
  audioUrl: string;
  sortOrder?: number;
};

export function BeatManager({ profileId, beats }: BeatManagerProps) {
  const orderedBeats = useMemo(
    () => [...beats].sort((a, b) => a.sortOrder - b.sortOrder),
    [beats],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);

  const openAddModal = () => {
    setDraft({
      title: "",
      description: "",
      coverImageUrl: "",
      audioUrl: "",
    });
  };

  const openEditModal = (beat: BeatItem) => {
    setDraft({
      id: beat.id,
      title: beat.title,
      description: beat.description,
      coverImageUrl: beat.coverImageUrl ?? "",
      audioUrl: beat.audioUrl ?? "",
      sortOrder: beat.sortOrder,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Beat" : "Add Beat"}</h3>
                  <p className="admin-muted mb-0">
                    Update the beat info, media links, and uploads.
                  </p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  Close
                </button>
              </div>

              <form action={upsertBeatAction} className="row g-3" encType="multipart/form-data">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedBeats.length + 1} />

                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input className="form-control" name="title" required value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Cover Image URL</label>
                  <input className="form-control" name="coverImageUrl" value={draft.coverImageUrl} onChange={(event) => setDraft((current) => current ? { ...current, coverImageUrl: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Audio URL</label>
                  <input className="form-control" name="audioUrl" value={draft.audioUrl} onChange={(event) => setDraft((current) => current ? { ...current, audioUrl: event.target.value } : current)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload Cover Image</label>
                  <input className="form-control" type="file" name="coverImageFile" accept="image/*" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload Audio</label>
                  <input className="form-control" type="file" name="audioFile" accept="audio/*" />
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

      {orderedBeats.map((beat, index) => (
        <div className="col-12" key={beat.id}>
          <div className="admin-entity-row">
            <div className="admin-entity-summary">
              <div className="d-flex align-items-start gap-3 flex-wrap">
                {beat.coverImageUrl ? (
                  <img src={beat.coverImageUrl} alt={beat.title} className="admin-project-thumb rounded-3" />
                ) : (
                  <div className="admin-project-thumb admin-project-thumb-empty rounded-3">No cover</div>
                )}
                <div>
                  <h3 className="h5 mb-1">{beat.title}</h3>
                  <p className="mb-2 admin-entity-description">{beat.description}</p>
                  {beat.audioUrl ? <p className="mb-0 admin-project-link">{beat.audioUrl}</p> : null}
                </div>
              </div>
            </div>

            <div className="admin-entity-actions">
              <form action={moveBeatAction}>
                <input type="hidden" name="id" value={beat.id} />
                <input type="hidden" name="direction" value="up" />
                <button type="submit" className="btn btn-outline-light" disabled={index === 0}>Up</button>
              </form>

              <form action={moveBeatAction}>
                <input type="hidden" name="id" value={beat.id} />
                <input type="hidden" name="direction" value="down" />
                <button type="submit" className="btn btn-outline-light" disabled={index === orderedBeats.length - 1}>Down</button>
              </form>

              <button type="button" className="btn btn-brand" onClick={() => openEditModal(beat)}>Edit</button>

              <form action={deleteBeatAction}>
                <input type="hidden" name="id" value={beat.id} />
                <button type="submit" className="btn btn-outline-danger">Delete</button>
              </form>
            </div>
          </div>
        </div>
      ))}

      <div className="col-12">
        <button type="button" className="btn btn-brand admin-add-button" onClick={openAddModal}>
          + Add Beat
        </button>
      </div>
    </div>
  );
}
