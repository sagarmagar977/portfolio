"use client";

import { useEffect, useRef, useState } from "react";
import { updateProfileAction } from "./actions";
import { SlugSettings } from "./slug-settings";
import {
  PORTFOLIO_ROLE_LIMIT,
  PORTFOLIO_ROLES,
  type PortfolioRole,
} from "@/lib/portfolio-config";
import type { PortfolioData } from "@/lib/portfolio";

type ProfileSettingsProps = {
  profile: PortfolioData;
  selectedRoles: PortfolioRole[];
  onSelectedRolesChange: (roles: PortfolioRole[]) => void;
};

function ProfileSettingsComponent({
  profile,
  selectedRoles,
  onSelectedRolesChange,
}: ProfileSettingsProps) {
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!roleMenuRef.current?.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsRoleMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function toggleRole(roleValue: PortfolioRole) {
    if (selectedRoles.includes(roleValue)) {
      onSelectedRolesChange(selectedRoles.filter((value) => value !== roleValue));
      return;
    }

    if (selectedRoles.length >= PORTFOLIO_ROLE_LIMIT) {
      return;
    }

    onSelectedRolesChange([...selectedRoles, roleValue]);
  }

  const selectedRoleMeta = PORTFOLIO_ROLES.filter((role) => selectedRoles.includes(role.value));

  return (
    <div className="row g-4">
      <div className="col-12">
        <form action={updateProfileAction} className="row g-3">
          <input type="hidden" name="profileId" value={profile.id} />
          {selectedRoles.map((role) => (
            <input key={role} type="hidden" name="roles" value={role} />
          ))}

          <div className="col-12">
            <label className="form-label">Portfolio Roles</label>
            <p className="admin-muted mb-3">
              Choose up to {PORTFOLIO_ROLE_LIMIT} roles. This controls which content managers appear below.
            </p>

            <div className="admin-role-picker" ref={roleMenuRef}>
              <button
                type="button"
                className={`admin-role-picker-trigger${isRoleMenuOpen ? " admin-role-picker-trigger-active" : ""}`}
                onClick={() => setIsRoleMenuOpen((current) => !current)}
                aria-expanded={isRoleMenuOpen}
              >
                <span className="fw-semibold">Choose Roles</span>
                <span className="admin-muted small">
                  {selectedRoles.length}/{PORTFOLIO_ROLE_LIMIT} selected
                </span>
              </button>

              {isRoleMenuOpen ? (
                <div className="admin-role-picker-menu">
                  <div className="admin-role-list">
                    {PORTFOLIO_ROLES.map((role) => {
                      const isSelected = selectedRoles.includes(role.value);
                      const isDisabled = !isSelected && selectedRoles.length >= PORTFOLIO_ROLE_LIMIT;

                      return (
                        <button
                          key={role.value}
                          type="button"
                          className={`admin-role-list-item${isSelected ? " admin-role-list-item-active" : ""}`}
                          onClick={() => toggleRole(role.value)}
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                        >
                          <span className="admin-role-list-main">
                            <span className="iconbox rounded-4 admin-role-icon admin-role-icon-small">
                              <i className={role.iconName} />
                            </span>
                            <span className="admin-role-list-label fw-semibold">{role.label}</span>
                          </span>
                          <span className="admin-role-list-check">
                            <span className={`admin-role-checkmark${isSelected ? " admin-role-checkmark-active" : ""}`} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="portfolio-role-list mt-2">
              {selectedRoleMeta.map((role) => (
                <span key={role.value} className="portfolio-role-pill">
                  {role.label}
                </span>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Full Name</label>
            <input className="form-control" name="fullName" defaultValue={profile.fullName} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Location</label>
            <input className="form-control" name="location" defaultValue={profile.location ?? ""} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Hero Prefix</label>
            <input className="form-control" name="heroTitlePrefix" defaultValue={profile.heroTitlePrefix ?? ""} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Hero Highlight</label>
            <input className="form-control" name="heroHighlight" defaultValue={profile.heroHighlight ?? ""} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Hero Suffix</label>
            <input className="form-control" name="heroTitleSuffix" defaultValue={profile.heroTitleSuffix ?? ""} />
          </div>
          <div className="col-12">
            <label className="form-label">Hero Description</label>
            <textarea className="form-control" name="heroDescription" rows={3} defaultValue={profile.heroDescription ?? ""} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Upload Profile Image</label>
            <input className="form-control" type="file" name="profileImageFile" accept="image/*" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Upload CV PDF</label>
            <input className="form-control" type="file" name="cvFile" accept="application/pdf,.pdf" />
          </div>
          <div className="col-md-6">
            <label className="form-label">About Section Title</label>
            <input className="form-control" name="aboutSectionTitle" defaultValue={profile.aboutSectionTitle ?? ""} />
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-brand">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const ProfileSettings = Object.assign(ProfileSettingsComponent, {
  SlugOnly: SlugSettings,
});
