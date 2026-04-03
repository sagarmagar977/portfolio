import type { PortfolioData } from "@/lib/portfolio";
import { roleHasAny, type PortfolioRole, type PortfolioTemplateKey } from "@/lib/portfolio-config";

export type PortfolioSection = {
  id: string;
  label: string;
  title: string;
  intro?: string;
};

export type PortfolioPresentation = {
  roles: PortfolioRole[];
  templateKey: PortfolioTemplateKey;
  navItems: Array<{ href: string; label: string }>;
  showServices: boolean;
  showDeveloperWork: boolean;
  showBeats: boolean;
  showBusinesses: boolean;
  showPhotography: boolean;
  showMotion: boolean;
  showArtworks: boolean;
  visibleSections: PortfolioSection[];
  featuredRoleLabels: string[];
};

export function buildPortfolioPresentation(profile: PortfolioData): PortfolioPresentation {
  const roles = profile.roles as PortfolioRole[];
  const sections: PortfolioSection[] = [
    { id: "home", label: "Home", title: "Home" },
  ];

  const showServices = profile.services.length > 0 && roleHasAny(roles, ["developer", "designer", "creator"]);
  const showDeveloperWork = profile.projects.length > 0 && roleHasAny(roles, ["developer", "designer", "creator"]);
  const showBeats = profile.beats.length > 0 && roleHasAny(roles, ["beatmaker", "creator"]);
  const showBusinesses = profile.businesses.length > 0 && roleHasAny(roles, ["business", "creator"]);
  const showPhotography = profile.photoProjects.length > 0 && roleHasAny(roles, ["photographer", "creator", "designer"]);
  const showMotion = profile.motionProjects.length > 0 && roleHasAny(roles, ["three-d", "creator", "designer"]);
  const showArtworks = profile.artworks.length > 0 && roleHasAny(roles, ["artist", "creator", "designer"]);
  const showAbout = profile.educations.length > 0 || profile.experiences.length > 0;

  if (showServices) {
    sections.push({ id: "services", label: "Services", title: "Services That I Provide" });
  }

  if (showDeveloperWork || showBeats || showBusinesses || showPhotography || showMotion || showArtworks) {
    sections.push({ id: "work", label: "Work", title: "Featured Work" });
  }

  if (showAbout) {
    sections.push({ id: "about", label: "About", title: profile.aboutSectionTitle ?? "My Education & Experience" });
  }

  sections.push({ id: "contact", label: "Contact", title: profile.contactInfo?.heading ?? "Interested in working together? Let's talk" });

  return {
    roles,
    templateKey: profile.templateKey as PortfolioTemplateKey,
    navItems: sections.map((section) => ({ href: `#${section.id}`, label: section.label })),
    showServices,
    showDeveloperWork,
    showBeats,
    showBusinesses,
    showPhotography,
    showMotion,
    showArtworks,
    visibleSections: sections,
    featuredRoleLabels: roles.map((role) => roleLabelMap[role]).filter(Boolean),
  };
}

const roleLabelMap: Record<PortfolioRole, string> = {
  developer: "Developer",
  designer: "Designer",
  beatmaker: "Beatmaker",
  photographer: "Photographer",
  artist: "Artist",
  "three-d": "3D / Motion",
  business: "Business",
  creator: "Creator",
};
