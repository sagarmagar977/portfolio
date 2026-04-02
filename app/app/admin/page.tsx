import Link from "next/link";
import {
  logoutAction,
  updateContactInfoAction,
  updateProfileAction,
} from "./actions";
import { BeatManager } from "./beat-manager";
import { requireAdmin } from "@/lib/admin-auth";
import { getPortfolioData, type PortfolioData } from "@/lib/portfolio";
import { EducationManager } from "./education-manager";
import { ExperienceManager } from "./experience-manager";
import { ProjectManager } from "./project-manager";
import { ServiceManager } from "./service-manager";
import { SocialLinkManager } from "./social-link-manager";

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

function HiddenIds({ id, profileId }: { id?: string; profileId: string }) {
  return (
    <>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="profileId" value={profileId} />
    </>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const profile: PortfolioData | null = await getPortfolioData();

  if (!profile) {
    return (
      <main className="full-height px-4 text-center d-flex align-items-center justify-content-center">
        <div>
          <h1>No portfolio data found</h1>
          <p>Run the seed script to create the initial portfolio record.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-panel px-3 px-lg-4 py-5" style={{ backgroundColor: "var(--color-base2)", minHeight: "100vh" }}>
      <div className="container-xl">
        <div className="admin-intro d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <p className="text-brand text-uppercase fw-semibold mb-1">Admin Panel</p>
            <h1 className="mb-1">Manage Portfolio Content</h1>
            <p className="admin-muted mb-0">
              Edit only the same sections that appear on the public portfolio.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/" className="btn btn-outline-light">View Site</Link>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-brand">Log Out</button>
            </form>
          </div>
        </div>

        <AdminCard title="Profile" description="Home section, hero text, profile image, CV, and footer credit.">
          <form action={updateProfileAction} className="row g-3" encType="multipart/form-data">
            <input type="hidden" name="profileId" value={profile.id} />
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
              <label className="form-label">Profile Image URL</label>
              <input className="form-control" name="profileImageUrl" defaultValue={profile.profileImageUrl ?? ""} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Upload Profile Image</label>
              <input className="form-control" type="file" name="profileImageFile" accept="image/*" />
            </div>
            <div className="col-md-6">
              <label className="form-label">CV File URL</label>
              <input className="form-control" name="cvFileUrl" defaultValue={profile.cvFileUrl ?? ""} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Upload CV PDF</label>
              <input className="form-control" type="file" name="cvFile" accept="application/pdf,.pdf" />
            </div>
            <div className="col-md-6">
              <label className="form-label">About Section Title</label>
              <input className="form-control" name="aboutSectionTitle" defaultValue={profile.aboutSectionTitle ?? ""} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Footer Credit Text</label>
              <input className="form-control" name="footerCreditText" defaultValue={profile.footerCreditText ?? ""} />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-brand">Save Profile</button>
            </div>
          </form>
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

        <AdminCard title="Services" description="Manage the service cards and their order.">
          <ServiceManager profileId={profile.id} services={profile.services} />
        </AdminCard>

        <AdminCard title="Projects" description="Update the project cards shown in the work section.">
          <ProjectManager profileId={profile.id} projects={profile.projects} />
        </AdminCard>

        <AdminCard title="Beats" description="Manage the music items shown in the work section.">
          <BeatManager profileId={profile.id} beats={profile.beats} />
        </AdminCard>

        <AdminCard title="Education" description="Manage education timeline entries.">
          <EducationManager profileId={profile.id} educations={profile.educations} />
        </AdminCard>

        <AdminCard title="Experience" description="Manage experience timeline entries.">
          <ExperienceManager profileId={profile.id} experiences={profile.experiences} />
        </AdminCard>

        <AdminCard title="Social Links" description="Update footer social links.">
          <SocialLinkManager profileId={profile.id} socialLinks={profile.socialLinks} />
        </AdminCard>
      </div>
    </main>
  );
}

