"use client";

import { useMemo, useState } from "react";
import {
  deleteServiceAction,
  moveServiceAction,
  upsertServiceAction,
} from "./actions";
import {
  SERVICE_OPTIONS,
  inferServiceOptionFromTitle,
} from "@/lib/service-options";
import type { PortfolioData } from "@/lib/portfolio";

type ServiceItem = PortfolioData["services"][number];

type ServiceManagerProps = {
  profileId: string;
  services: ServiceItem[];
};

type DraftState = {
  id?: string;
  serviceType: string;
  description: string;
  sortOrder?: number;
};

function ServiceTypeBadge({ service }: { service: ServiceItem }) {
  const option = inferServiceOptionFromTitle(service.title);

  return (
    <span className="admin-service-badge">
      {option?.label ?? service.title}
    </span>
  );
}

export function ServiceManager({ profileId, services }: ServiceManagerProps) {
  const orderedServices = useMemo(
    () => [...services].sort((a, b) => a.sortOrder - b.sortOrder),
    [services],
  );

  const [draft, setDraft] = useState<DraftState | null>(null);

  const openAddModal = () => {
    setDraft({
      serviceType: SERVICE_OPTIONS[0]?.value ?? "frontend",
      description: "",
    });
  };

  const openEditModal = (service: ServiceItem) => {
    setDraft({
      id: service.id,
      serviceType:
        inferServiceOptionFromTitle(service.title)?.value ??
        SERVICE_OPTIONS[0]?.value ??
        "frontend",
      description: service.description,
      sortOrder: service.sortOrder,
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
                  <h3 className="h4 mb-1">{draft.id ? "Edit Service" : "Add Service"}</h3>
                  <p className="admin-muted mb-0">
                    Choose a service type and update the description.
                  </p>
                </div>
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  Close
                </button>
              </div>

              <form action={upsertServiceAction} className="row g-3">
                {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="sortOrder" value={draft.sortOrder ?? orderedServices.length + 1} />

                <div className="col-md-4">
                  <label className="form-label">Service</label>
                  <select
                    className="form-control"
                    name="serviceType"
                    value={draft.serviceType}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              serviceType: event.target.value,
                            }
                          : current,
                      )
                    }
                  >
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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

      {orderedServices.map((service, index) => (
        <div className="col-12" key={service.id}>
          <div className="admin-service-row">
            <div className="admin-service-summary">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="iconbox rounded-4 admin-service-icon">
                  <i className={service.iconName ?? "las la-star"} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h3 className="h5 mb-0">{service.title}</h3>
                    <ServiceTypeBadge service={service} />
                  </div>
                  <p className="mb-0 admin-service-description">{service.description}</p>
                </div>
              </div>
            </div>

            <div className="admin-service-actions">
              <form action={moveServiceAction}>
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={index === 0}
                  aria-label={`Move ${service.title} up`}
                >
                  Up
                </button>
              </form>

              <form action={moveServiceAction}>
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={index === orderedServices.length - 1}
                  aria-label={`Move ${service.title} down`}
                >
                  Down
                </button>
              </form>

              <button
                type="button"
                className="btn btn-brand"
                onClick={() => openEditModal(service)}
              >
                Edit
              </button>

              <form action={deleteServiceAction}>
                <input type="hidden" name="id" value={service.id} />
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
          + Add Service
        </button>
      </div>
    </div>
  );
}
