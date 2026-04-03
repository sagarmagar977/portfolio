"use client";

import React from "react";
import Link from "next/link";
import {
  logoutAction,
  publishPortfolioAction,
  unpublishPortfolioAction,
  updateContactInfoAction,
} from "./actions";
import { AdminSaveNotice } from "./admin-save-notice";
import { BeatManager } from "./beat-manager";
import { BusinessManager } from "./business-manager";
import { ProfileSettings } from "./profile-settings";
import type { PortfolioData } from "@/lib/portfolio";
import { ArtworkManager } from "./artwork-manager";
import { EducationManager } from "./education-manager";
import { ExperienceManager } from "./experience-manager";
import { MotionProjectManager } from "./motion-project-manager";
import { PhotoProjectManager } from "./photo-project-manager";
import { ProjectManager } from "./project-manager";
import { ServiceManager } from "./service-manager";
import { SocialLinkManager } from "./social-link-manager";
import {
  type PortfolioRole,
} from "@/lib/portfolio-config";

function AdminCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card bg-base rounded-4 p-4 shadow-effect mb-4">
      <div className="mb-4">
        <h2 className="h3 mb-1">{title}</h2>
        {description ? <p className="admin-muted mb-0">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

const savedMessageMap: Record<string, string> = {
  slug: "Public slug saved.",
  profile: "Profile saved.",
  contact: "Contact details saved.",
  service: "Service saved.",
  project: "Project saved.",
  beat: "Beat saved.",
  business: "Venture saved.",
  photo: "Photo story saved.",
  motion: "Motion piece saved.",
  artwork: "Artwork saved.",
  education: "Education entry saved.",
  experience: "Experience entry saved.",
  social: "Social link saved.",
  publish: "Portfolio published to the public site.",
  unpublish: "Portfolio hidden from the public site.",
};

type AdminSectionKey =
  | "services"
  | "projects"
  | "beats"
  | "businesses"
  | "photoProjects"
  | "motionProjects"
  | "artworks"
  | "educations"
  | "experiences";

const ROLE_SECTION_MAP: Record<PortfolioRole, AdminSectionKey[]> = {
  developer: ["services", "projects", "educations", "experiences"],
  designer: ["services", "projects", "photoProjects", "motionProjects", "artworks"],
  beatmaker: ["beats"],
  photographer: ["photoProjects"],
  artist: ["artworks"],
  "three-d": ["motionProjects"],
  business: ["services", "businesses", "educations", "experiences"],
  creator: ["services", "beats", "photoProjects", "motionProjects", "artworks", "businesses"],
};

export function AdminPanelClient({
  adminEmail,
  adminDisplayName,
  profile,
  error,
  saved,
}: {
  adminEmail: string;
  adminDisplayName: string;
  profile: PortfolioData;
  error?: string;
  saved?: string;
}) {
  const [selectedRoles, setSelectedRoles] = React.useState<PortfolioRole[]>(
    profile.roles as PortfolioRole[],
  );
  const savedMessage = saved ? savedMessageMap[saved] : null;
  const visibleSections = new Set<AdminSectionKey>(
    selectedRoles.flatMap((role) => ROLE_SECTION_MAP[role] ?? []),
  );

  const showServices = visibleSections.has("services");
  const showProjects = visibleSections.has("projects");
  const showBeats = visibleSections.has("beats");
  const showBusinesses = visibleSections.has("businesses");
  const showPhotoProjects = visibleSections.has("photoProjects");
  const showMotionProjects = visibleSections.has("motionProjects");
  const showArtworks = visibleSections.has("artworks");
  const showEducations = visibleSections.has("educations");
  const showExperiences = visibleSections.has("experiences");
  const publishedAtLabel = profile.publishedAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(profile.publishedAt))
    : null;

  return (
    <main className="admin-panel px-3 px-lg-4 py-5" style={{ backgroundColor: "var(--color-base2)", minHeight: "100vh" }}>
      <div className="container-xl">
        <div className="admin-intro d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <p className="text-brand text-uppercase fw-semibold mb-1">Admin Panel</p>
            <h1 className="mb-1">Manage Your Portfolio</h1>
            <p className="admin-muted mb-0">
              Signed in as {adminDisplayName} ({adminEmail}). Only your own portfolio content is editable here.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {profile.isPublished && profile.publishedSlug ? (
              <Link href={`/u/${profile.publishedSlug}`} target="_blank" rel="noreferrer" className="btn btn-outline-light">View Public Portfolio</Link>
            ) : (
              <span className="btn btn-outline-light" aria-disabled="true">Not Published Yet</span>
            )}
            <form action={logoutAction}>
              <button type="submit" className="btn btn-brand">Log Out</button>
            </form>
          </div>
        </div>

        {savedMessage ? <AdminSaveNotice message={savedMessage} /> : null}

        {error === "slug" ? (
          <div className="alert alert-danger mb-4" role="alert">
            That slug is invalid, already taken, or still being used by another published portfolio.
          </div>
        ) : null}

        <AdminCard
          title="Publishing"
          description="Save draft changes freely. Only the published snapshot is visible on the public site."
        >
          <div className="admin-publish-card">
            <div className="admin-publish-status">
              <span className={`admin-publish-badge${profile.isPublished ? " admin-publish-badge-live" : ""}`}>
                {profile.isPublished ? "Live" : "Draft"}
              </span>
              <div>
                <h3 className="h4 mb-2">
                  {profile.isPublished
                    ? "Your public portfolio is currently published."
                    : "Your portfolio is private until you publish it."}
                </h3>
                <p className="admin-muted mb-0">
                  {profile.isPublished && profile.publishedSlug
                    ? `Public URL: /u/${profile.publishedSlug}${publishedAtLabel ? ` • Last published ${publishedAtLabel}` : ""}`
                    : "You can keep editing and saving privately. Visitors will not see anything until you press Publish."}
                </p>
              </div>
            </div>

            <div className="admin-publish-actions">
              <form action={publishPortfolioAction}>
                <button type="submit" className="btn btn-brand">Publish Portfolio</button>
              </form>
              {profile.isPublished ? (
                <form action={unpublishPortfolioAction}>
                  <button type="submit" className="btn btn-outline-danger">Unpublish</button>
                </form>
              ) : null}
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Public Slug" description="Edit the public link for your portfolio in a separate simple card.">
          <ProfileSettings.SlugOnly profileId={profile.id} currentSlug={profile.slug} />
        </AdminCard>

        <AdminCard title="Profile" description="Choose roles, then customize your hero content and uploads.">
          <ProfileSettings
            profile={profile}
            selectedRoles={selectedRoles}
            onSelectedRolesChange={setSelectedRoles}
          />
        </AdminCard>

        <AdminCard title="Contact" description="Contact heading, phone, email, and section label.">
          <form action={updateContactInfoAction} className="row g-3">
            <input type="hidden" name="contactInfoId" value={profile.contactInfo?.id ?? ""} />
            <input type="hidden" name="profileId" value={profile.id} />
            <div className="col-md-4">
              <label className="form-label">Section Label</label>
              <input className="form-control" name="sectionLabel" defaultValue={profile.contactInfo?.sectionLabel ?? ""} />
            </div>
            <div className="col-md-8">
              <label className="form-label">Heading</label>
              <input className="form-control" name="heading" defaultValue={profile.contactInfo?.heading ?? ""} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" defaultValue={profile.contactInfo?.phone ?? ""} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" name="email" defaultValue={profile.contactInfo?.email ?? ""} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" rows={2} defaultValue={profile.contactInfo?.description ?? ""} />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-brand">Save Contact</button>
            </div>
          </form>
        </AdminCard>

        {showServices ? (
          <AdminCard title="Services" description="Manage the service cards and their order.">
            <ServiceManager profileId={profile.id} services={profile.services} selectedRoles={selectedRoles} />
          </AdminCard>
        ) : null}

        {showProjects ? (
          <AdminCard title="Projects" description="Update the project cards shown in the work section.">
            <ProjectManager profileId={profile.id} projects={profile.projects} />
          </AdminCard>
        ) : null}

        {showBeats ? (
          <AdminCard title="Beats" description="Manage track uploads, cover art, and music links.">
            <BeatManager profileId={profile.id} beats={profile.beats} />
          </AdminCard>
        ) : null}

        {showBusinesses ? (
          <AdminCard title="Ventures" description="Highlight businesses, startups, or service brands with images and website links.">
            <BusinessManager profileId={profile.id} businesses={profile.businesses} />
          </AdminCard>
        ) : null}

        {showPhotoProjects ? (
          <AdminCard title="Photography" description="Showcase gallery collections and featured photo stories.">
            <PhotoProjectManager profileId={profile.id} photoProjects={profile.photoProjects} />
          </AdminCard>
        ) : null}

        {showMotionProjects ? (
          <AdminCard title="3D / Motion" description="Add motion pieces with image, GIF, or video previews.">
            <MotionProjectManager profileId={profile.id} motionProjects={profile.motionProjects} />
          </AdminCard>
        ) : null}

        {showArtworks ? (
          <AdminCard title="Artworks" description="Curate paintings, illustrations, and other visual art pieces.">
            <ArtworkManager profileId={profile.id} artworks={profile.artworks} />
          </AdminCard>
        ) : null}

        {showEducations ? (
          <AdminCard title="Education" description="Manage education timeline entries.">
            <EducationManager profileId={profile.id} educations={profile.educations} />
          </AdminCard>
        ) : null}

        {showExperiences ? (
          <AdminCard title="Experience" description="Manage experience timeline entries.">
            <ExperienceManager profileId={profile.id} experiences={profile.experiences} />
          </AdminCard>
        ) : null}

        <AdminCard title="Social Links" description="Update footer social links.">
          <SocialLinkManager profileId={profile.id} socialLinks={profile.socialLinks} />
        </AdminCard>
      </div>
    </main>
  );
}
