import Link from "next/link";
import {
  deleteBeatAction,
  deleteEducationAction,
  deleteExperienceAction,
  deleteProjectAction,
  deleteServiceAction,
  deleteSocialLinkAction,
  logoutAction,
  updateContactInfoAction,
  updateProfileAction,
  upsertBeatAction,
  upsertEducationAction,
  upsertExperienceAction,
  upsertProjectAction,
  upsertServiceAction,
  upsertSocialLinkAction,
} from "./actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getPortfolioData } from "@/lib/portfolio";

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
  const profile = await getPortfolioData();

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
          <div className="row g-4">
            {profile.services.map((service) => (
              <div className="col-12" key={service.id}>
                <form action={upsertServiceAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                  <HiddenIds id={service.id} profileId={profile.id} />
                  <div className="col-md-3"><input className="form-control" name="title" defaultValue={service.title} placeholder="Title" required /></div>
                  <div className="col-md-2"><input className="form-control" name="iconName" defaultValue={service.iconName ?? ""} placeholder="Icon class" /></div>
                  <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={service.sortOrder} placeholder="Order" /></div>
                  <div className="col-md-5"><textarea className="form-control" name="description" rows={2} defaultValue={service.description} placeholder="Description" required /></div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-brand">Save</button>
                    <button formAction={deleteServiceAction} className="btn btn-outline-danger">Delete</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="col-12">
              <form action={upsertServiceAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                <HiddenIds profileId={profile.id} />
                <div className="col-12"><h3 className="h5 mb-0">Add Service</h3></div>
                <div className="col-md-3"><input className="form-control" name="title" placeholder="Title" required /></div>
                <div className="col-md-2"><input className="form-control" name="iconName" placeholder="Icon class" /></div>
                <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={0} placeholder="Order" /></div>
                <div className="col-md-5"><textarea className="form-control" name="description" rows={2} placeholder="Description" required /></div>
                <div className="col-12 d-flex justify-content-end"><button type="submit" className="btn btn-brand">Add Service</button></div>
              </form>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Projects" description="Update the project cards shown in the work section.">
          <div className="row g-4">
            {profile.projects.map((project) => (
              <div className="col-12" key={project.id}>
                <form action={upsertProjectAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3" encType="multipart/form-data">
                  <HiddenIds id={project.id} profileId={profile.id} />
                  <div className="col-md-4"><input className="form-control" name="title" defaultValue={project.title} placeholder="Title" required /></div>
                  <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={project.sortOrder} placeholder="Order" /></div>
                  <div className="col-md-6"><input className="form-control" name="liveUrl" defaultValue={project.liveUrl ?? ""} placeholder="Live URL" /></div>
                  <div className="col-md-6"><input className="form-control" name="imageUrl" defaultValue={project.imageUrl ?? ""} placeholder="Image URL" /></div>
                  <div className="col-md-6"><input className="form-control" type="file" name="imageFile" accept="image/*" /></div>
                  <div className="col-12"><textarea className="form-control" name="description" rows={2} defaultValue={project.description} placeholder="Description" required /></div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-brand">Save</button>
                    <button formAction={deleteProjectAction} className="btn btn-outline-danger">Delete</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="col-12">
              <form action={upsertProjectAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3" encType="multipart/form-data">
                <HiddenIds profileId={profile.id} />
                <div className="col-12"><h3 className="h5 mb-0">Add Project</h3></div>
                <div className="col-md-4"><input className="form-control" name="title" placeholder="Title" required /></div>
                <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={0} placeholder="Order" /></div>
                <div className="col-md-6"><input className="form-control" name="liveUrl" placeholder="Live URL" /></div>
                <div className="col-md-6"><input className="form-control" name="imageUrl" placeholder="Image URL" /></div>
                <div className="col-md-6"><input className="form-control" type="file" name="imageFile" accept="image/*" /></div>
                <div className="col-12"><textarea className="form-control" name="description" rows={2} placeholder="Description" required /></div>
                <div className="col-12 d-flex justify-content-end"><button type="submit" className="btn btn-brand">Add Project</button></div>
              </form>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Beats" description="Manage the music items shown in the work section.">
          <div className="row g-4">
            {profile.beats.map((beat) => (
              <div className="col-12" key={beat.id}>
                <form action={upsertBeatAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3" encType="multipart/form-data">
                  <HiddenIds id={beat.id} profileId={profile.id} />
                  <div className="col-md-4"><input className="form-control" name="title" defaultValue={beat.title} placeholder="Title" required /></div>
                  <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={beat.sortOrder} placeholder="Order" /></div>
                  <div className="col-md-3"><input className="form-control" name="coverImageUrl" defaultValue={beat.coverImageUrl ?? ""} placeholder="Cover image URL" /></div>
                  <div className="col-md-3"><input className="form-control" name="audioUrl" defaultValue={beat.audioUrl ?? ""} placeholder="Audio URL" /></div>
                  <div className="col-md-6"><input className="form-control" type="file" name="coverImageFile" accept="image/*" /></div>
                  <div className="col-md-6"><input className="form-control" type="file" name="audioFile" accept="audio/*" /></div>
                  <div className="col-12"><textarea className="form-control" name="description" rows={2} defaultValue={beat.description} placeholder="Description" required /></div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-brand">Save</button>
                    <button formAction={deleteBeatAction} className="btn btn-outline-danger">Delete</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="col-12">
              <form action={upsertBeatAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3" encType="multipart/form-data">
                <HiddenIds profileId={profile.id} />
                <div className="col-12"><h3 className="h5 mb-0">Add Beat</h3></div>
                <div className="col-md-4"><input className="form-control" name="title" placeholder="Title" required /></div>
                <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={0} placeholder="Order" /></div>
                <div className="col-md-3"><input className="form-control" name="coverImageUrl" placeholder="Cover image URL" /></div>
                <div className="col-md-3"><input className="form-control" name="audioUrl" placeholder="Audio URL" /></div>
                <div className="col-md-6"><input className="form-control" type="file" name="coverImageFile" accept="image/*" /></div>
                <div className="col-md-6"><input className="form-control" type="file" name="audioFile" accept="audio/*" /></div>
                <div className="col-12"><textarea className="form-control" name="description" rows={2} placeholder="Description" required /></div>
                <div className="col-12 d-flex justify-content-end"><button type="submit" className="btn btn-brand">Add Beat</button></div>
              </form>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Education" description="Manage education timeline entries.">
          <div className="row g-4">
            {profile.educations.map((education) => (
              <div className="col-12" key={education.id}>
                <form action={upsertEducationAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                  <HiddenIds id={education.id} profileId={profile.id} />
                  <div className="col-md-4"><input className="form-control" name="degree" defaultValue={education.degree} placeholder="Degree" required /></div>
                  <div className="col-md-4"><input className="form-control" name="institution" defaultValue={education.institution} placeholder="Institution" required /></div>
                  <div className="col-md-2"><input className="form-control" name="period" defaultValue={education.period} placeholder="Period" required /></div>
                  <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={education.sortOrder} placeholder="Order" /></div>
                  <div className="col-12"><textarea className="form-control" name="description" rows={2} defaultValue={education.description ?? ""} placeholder="Description" /></div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-brand">Save</button>
                    <button formAction={deleteEducationAction} className="btn btn-outline-danger">Delete</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="col-12">
              <form action={upsertEducationAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                <HiddenIds profileId={profile.id} />
                <div className="col-12"><h3 className="h5 mb-0">Add Education</h3></div>
                <div className="col-md-4"><input className="form-control" name="degree" placeholder="Degree" required /></div>
                <div className="col-md-4"><input className="form-control" name="institution" placeholder="Institution" required /></div>
                <div className="col-md-2"><input className="form-control" name="period" placeholder="Period" required /></div>
                <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={0} placeholder="Order" /></div>
                <div className="col-12"><textarea className="form-control" name="description" rows={2} placeholder="Description" /></div>
                <div className="col-12 d-flex justify-content-end"><button type="submit" className="btn btn-brand">Add Education</button></div>
              </form>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Experience" description="Manage experience timeline entries.">
          <div className="row g-4">
            {profile.experiences.map((experience) => (
              <div className="col-12" key={experience.id}>
                <form action={upsertExperienceAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                  <HiddenIds id={experience.id} profileId={profile.id} />
                  <div className="col-md-4"><input className="form-control" name="role" defaultValue={experience.role} placeholder="Role" required /></div>
                  <div className="col-md-4"><input className="form-control" name="company" defaultValue={experience.company} placeholder="Company" required /></div>
                  <div className="col-md-2"><input className="form-control" name="period" defaultValue={experience.period} placeholder="Period" required /></div>
                  <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={experience.sortOrder} placeholder="Order" /></div>
                  <div className="col-12"><textarea className="form-control" name="description" rows={2} defaultValue={experience.description ?? ""} placeholder="Description" /></div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-brand">Save</button>
                    <button formAction={deleteExperienceAction} className="btn btn-outline-danger">Delete</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="col-12">
              <form action={upsertExperienceAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                <HiddenIds profileId={profile.id} />
                <div className="col-12"><h3 className="h5 mb-0">Add Experience</h3></div>
                <div className="col-md-4"><input className="form-control" name="role" placeholder="Role" required /></div>
                <div className="col-md-4"><input className="form-control" name="company" placeholder="Company" required /></div>
                <div className="col-md-2"><input className="form-control" name="period" placeholder="Period" required /></div>
                <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={0} placeholder="Order" /></div>
                <div className="col-12"><textarea className="form-control" name="description" rows={2} placeholder="Description" /></div>
                <div className="col-12 d-flex justify-content-end"><button type="submit" className="btn btn-brand">Add Experience</button></div>
              </form>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Social Links" description="Update footer social links.">
          <div className="row g-4">
            {profile.socialLinks.map((socialLink) => (
              <div className="col-12" key={socialLink.id}>
                <form action={upsertSocialLinkAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                  <HiddenIds id={socialLink.id} profileId={profile.id} />
                  <div className="col-md-4"><input className="form-control" name="platform" defaultValue={socialLink.platform} placeholder="Platform" required /></div>
                  <div className="col-md-6"><input className="form-control" name="url" defaultValue={socialLink.url} placeholder="URL" required /></div>
                  <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={socialLink.sortOrder} placeholder="Order" /></div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-brand">Save</button>
                    <button formAction={deleteSocialLinkAction} className="btn btn-outline-danger">Delete</button>
                  </div>
                </form>
              </div>
            ))}
            <div className="col-12">
              <form action={upsertSocialLinkAction} className="admin-item-form row g-3 border border-light border-opacity-10 rounded-4 p-3">
                <HiddenIds profileId={profile.id} />
                <div className="col-12"><h3 className="h5 mb-0">Add Social Link</h3></div>
                <div className="col-md-4"><input className="form-control" name="platform" placeholder="Platform" required /></div>
                <div className="col-md-6"><input className="form-control" name="url" placeholder="URL" required /></div>
                <div className="col-md-2"><input className="form-control" type="number" name="sortOrder" defaultValue={0} placeholder="Order" /></div>
                <div className="col-12 d-flex justify-content-end"><button type="submit" className="btn btn-brand">Add Social Link</button></div>
              </form>
            </div>
          </div>
        </AdminCard>
      </div>
    </main>
  );
}

