"use client";

import { useMemo, useState } from "react";
import { deleteServiceAction, reorderServicesAction, upsertServiceAction } from "./actions";
import { AdminDragHandleButton } from "./admin-drag-handle-button";
import { useAdminDragReorder } from "./use-admin-drag-reorder";
import { SERVICE_OPTIONS, getServiceOptionsForRoles, inferServiceOptionFromTitle } from "@/lib/service-options";
import type { PortfolioData } from "@/lib/portfolio";
import type { PortfolioRole } from "@/lib/portfolio-config";

type ServiceItem = PortfolioData["services"][number];

type ServiceManagerProps = {
  profileId: string;
  services: ServiceItem[];
  selectedRoles: PortfolioRole[];
};

type DraftState = {
  id?: string;
  serviceType: string;
  description: string;
  sortOrder?: number;
};

function ServiceTypeBadge({ service }: { service: ServiceItem }) {
  const option = inferServiceOptionFromTitle(service.title);

  return <span className="admin-service-badge">{option?.label ?? service.title}</span>;
}

export function ServiceManager({ profileId, services, selectedRoles }: ServiceManagerProps) {
  const orderedServicesFromProps = useMemo(
    () => [...services].sort((a, b) => a.sortOrder - b.sortOrder),
    [services],
  );
  const availableOptions = useMemo(() => {
    const options = getServiceOptionsForRoles(selectedRoles);
    return options.length > 0 ? options : SERVICE_OPTIONS;
  }, [selectedRoles]);

  const [draft, setDraft] = useState<DraftState | null>(null);
  const { orderedItems: orderedServices, draggedItemId, getRowDragProps, isSavingOrder } = useAdminDragReorder(
    orderedServicesFromProps,
    reorderServicesAction,
  );

  const openAddModal = () => {
    setDraft({
      serviceType: availableOptions[0]?.value ?? SERVICE_OPTIONS[0]?.value ?? "frontend",
      description: "",
    });
  };

  const openEditModal = (service: ServiceItem) => {
    setDraft({
      id: service.id,
      serviceType:
        inferServiceOptionFromTitle(service.title)?.value ??
        availableOptions[0]?.value ??
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
                  <p className="admin-muted mb-0">Choose a service type and update the description.</p>
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
                    {availableOptions.map((option) => (
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

      {orderedServices.map((service) => (
        <div className="col-12" key={service.id}>
          <div
            className={[
              "admin-service-row",
              "admin-service-row-draggable",
              draggedItemId === service.id ? "admin-service-row-dragging" : "",
              isSavingOrder ? "admin-service-row-saving" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getRowDragProps(service.id)}
          >
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
              <AdminDragHandleButton label={service.title} disabled={isSavingOrder} />

              <button type="button" className="btn btn-brand" onClick={() => openEditModal(service)} disabled={isSavingOrder}>
                Edit
              </button>

              <form action={deleteServiceAction}>
                <input type="hidden" name="id" value={service.id} />
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
          + Add Service
        </button>
      </div>
    </div>
  );
}
