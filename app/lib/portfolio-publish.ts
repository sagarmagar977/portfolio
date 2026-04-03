import type { PortfolioData } from "@/lib/portfolio";

export function buildPublishedPortfolioSnapshot(profile: PortfolioData) {
  return {
    id: profile.id,
    adminUserId: profile.adminUserId,
    slug: profile.slug,
    publishedSlug: profile.slug,
    templateKey: profile.templateKey,
    roles: profile.roles,
    fullName: profile.fullName,
    heroTitlePrefix: profile.heroTitlePrefix,
    heroHighlight: profile.heroHighlight,
    heroTitleSuffix: profile.heroTitleSuffix,
    heroDescription: profile.heroDescription,
    location: profile.location,
    profileImageUrl: profile.profileImageUrl,
    cvFileUrl: profile.cvFileUrl,
    aboutSectionTitle: profile.aboutSectionTitle,
    services: profile.services,
    projects: profile.projects,
    beats: profile.beats,
    businesses: profile.businesses,
    photoProjects: profile.photoProjects,
    motionProjects: profile.motionProjects,
    artworks: profile.artworks,
    educations: profile.educations,
    experiences: profile.experiences,
    socialLinks: profile.socialLinks,
    contactInfo: profile.contactInfo,
  };
}
