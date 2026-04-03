import { prisma } from "@/lib/prisma";
import {
  normalizePortfolioRoles,
  normalizeTemplateKey,
  type PortfolioRole,
  type PortfolioTemplateKey,
} from "@/lib/portfolio-config";

const prismaAny = prisma as unknown as {
  profile: {
    findUnique(args: unknown): Promise<Record<string, unknown> | null>;
    findMany(args: unknown): Promise<Record<string, unknown>[]>;
  };
};

export type PortfolioService = {
  id: string;
  title: string;
  description: string;
  iconName: string | null;
  sortOrder: number;
};

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  sortOrder: number;
};

export type PortfolioBeat = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  audioUrl: string | null;
  externalUrl: string | null;
  sortOrder: number;
};

export type PortfolioBusiness = {
  id: string;
  name: string;
  businessType: string | null;
  description: string;
  websiteUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type PortfolioPhotoProject = {
  id: string;
  title: string;
  collection: string | null;
  description: string;
  imageUrl: string | null;
  projectUrl: string | null;
  sortOrder: number;
};

export type PortfolioMotionProject = {
  id: string;
  title: string;
  toolName: string | null;
  description: string;
  previewImageUrl: string | null;
  previewGifUrl: string | null;
  previewVideoUrl: string | null;
  projectUrl: string | null;
  sortOrder: number;
};

export type PortfolioArtwork = {
  id: string;
  title: string;
  medium: string | null;
  description: string;
  imageUrl: string | null;
  collectionUrl: string | null;
  sortOrder: number;
};

export type PortfolioEducation = {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string | null;
  sortOrder: number;
};

export type PortfolioExperience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string | null;
  sortOrder: number;
};

export type PortfolioSocialLink = {
  id: string;
  platform: string;
  url: string;
  sortOrder: number;
};

export type PortfolioContactInfo = {
  id: string;
  sectionLabel: string | null;
  heading: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
};

export type PortfolioData = {
  id: string;
  adminUserId: string;
  slug: string;
  publishedSlug: string | null;
  templateKey: PortfolioTemplateKey;
  roles: PortfolioRole[];
  fullName: string;
  heroTitlePrefix: string | null;
  heroHighlight: string | null;
  heroTitleSuffix: string | null;
  heroDescription: string | null;
  location: string | null;
  profileImageUrl: string | null;
  cvFileUrl: string | null;
  aboutSectionTitle: string | null;
  services: PortfolioService[];
  projects: PortfolioProject[];
  beats: PortfolioBeat[];
  businesses: PortfolioBusiness[];
  photoProjects: PortfolioPhotoProject[];
  motionProjects: PortfolioMotionProject[];
  artworks: PortfolioArtwork[];
  educations: PortfolioEducation[];
  experiences: PortfolioExperience[];
  socialLinks: PortfolioSocialLink[];
  contactInfo: PortfolioContactInfo | null;
  isPublished: boolean;
  publishedAt: Date | null;
};

export type PublicPortfolioListItem = {
  id: string;
  slug: string;
  fullName: string;
  heroDescription: string | null;
  location: string | null;
  profileImageUrl: string | null;
  roles: PortfolioRole[];
  projectCount: number;
  serviceCount: number;
  socialLinkCount: number;
  publishedAt: Date | null;
};

const portfolioInclude = {
  services: { orderBy: { sortOrder: "asc" as const } },
  projects: { orderBy: { sortOrder: "asc" as const } },
  beats: { orderBy: { sortOrder: "asc" as const } },
  businesses: { orderBy: { sortOrder: "asc" as const } },
  photoProjects: { orderBy: { sortOrder: "asc" as const } },
  motionProjects: { orderBy: { sortOrder: "asc" as const } },
  artworks: { orderBy: { sortOrder: "asc" as const } },
  educations: { orderBy: { sortOrder: "asc" as const } },
  experiences: { orderBy: { sortOrder: "asc" as const } },
  socialLinks: { orderBy: { sortOrder: "asc" as const } },
  contactInfo: true,
};

function normalizeProfileRecord(record: Record<string, unknown> | null): PortfolioData | null {
  if (!record) {
    return null;
  }

  const profile = record as Partial<PortfolioData> & {
    roles?: string[];
    templateKey?: string;
  };

  return {
    id: profile.id ?? "",
    adminUserId: profile.adminUserId ?? "",
    slug: profile.slug ?? "",
    publishedSlug: (profile.publishedSlug as string | null | undefined) ?? null,
    templateKey: normalizeTemplateKey(profile.templateKey),
    roles: normalizePortfolioRoles(profile.roles ?? []) as PortfolioRole[],
    fullName: profile.fullName ?? "",
    heroTitlePrefix: profile.heroTitlePrefix ?? null,
    heroHighlight: profile.heroHighlight ?? null,
    heroTitleSuffix: profile.heroTitleSuffix ?? null,
    heroDescription: profile.heroDescription ?? null,
    location: profile.location ?? null,
    profileImageUrl: profile.profileImageUrl ?? null,
    cvFileUrl: profile.cvFileUrl ?? null,
    aboutSectionTitle: profile.aboutSectionTitle ?? null,
    services: (profile.services ?? []) as PortfolioService[],
    projects: (profile.projects ?? []) as PortfolioProject[],
    beats: (profile.beats ?? []) as PortfolioBeat[],
    businesses: (profile.businesses ?? []) as PortfolioBusiness[],
    photoProjects: (profile.photoProjects ?? []) as PortfolioPhotoProject[],
    motionProjects: (profile.motionProjects ?? []) as PortfolioMotionProject[],
    artworks: (profile.artworks ?? []) as PortfolioArtwork[],
    educations: (profile.educations ?? []) as PortfolioEducation[],
    experiences: (profile.experiences ?? []) as PortfolioExperience[],
    socialLinks: (profile.socialLinks ?? []) as PortfolioSocialLink[],
    contactInfo: (profile.contactInfo ?? null) as PortfolioContactInfo | null,
    isPublished: Boolean(profile.isPublished),
    publishedAt: (profile.publishedAt as Date | null | undefined) ?? null,
  };
}

function normalizePortfolioSnapshot(record: Record<string, unknown>): PortfolioData | null {
  const snapshot = record.publishedSnapshot;

  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }

  const value = snapshot as Partial<PortfolioData> & {
    roles?: string[];
    templateKey?: string;
  };

  return {
    id: typeof value.id === "string" ? value.id : typeof record.id === "string" ? record.id : "",
    adminUserId:
      typeof value.adminUserId === "string"
        ? value.adminUserId
        : typeof record.adminUserId === "string"
          ? record.adminUserId
          : "",
    slug: typeof value.slug === "string" ? value.slug : typeof record.slug === "string" ? record.slug : "",
    publishedSlug:
      typeof record.publishedSlug === "string"
        ? record.publishedSlug
        : typeof value.publishedSlug === "string"
          ? value.publishedSlug
          : null,
    templateKey: normalizeTemplateKey(value.templateKey),
    roles: normalizePortfolioRoles(value.roles ?? []) as PortfolioRole[],
    fullName: typeof value.fullName === "string" ? value.fullName : "",
    heroTitlePrefix: value.heroTitlePrefix ?? null,
    heroHighlight: value.heroHighlight ?? null,
    heroTitleSuffix: value.heroTitleSuffix ?? null,
    heroDescription: value.heroDescription ?? null,
    location: value.location ?? null,
    profileImageUrl: value.profileImageUrl ?? null,
    cvFileUrl: value.cvFileUrl ?? null,
    aboutSectionTitle: value.aboutSectionTitle ?? null,
    services: Array.isArray(value.services) ? (value.services as PortfolioService[]) : [],
    projects: Array.isArray(value.projects) ? (value.projects as PortfolioProject[]) : [],
    beats: Array.isArray(value.beats) ? (value.beats as PortfolioBeat[]) : [],
    businesses: Array.isArray(value.businesses) ? (value.businesses as PortfolioBusiness[]) : [],
    photoProjects: Array.isArray(value.photoProjects) ? (value.photoProjects as PortfolioPhotoProject[]) : [],
    motionProjects: Array.isArray(value.motionProjects) ? (value.motionProjects as PortfolioMotionProject[]) : [],
    artworks: Array.isArray(value.artworks) ? (value.artworks as PortfolioArtwork[]) : [],
    educations: Array.isArray(value.educations) ? (value.educations as PortfolioEducation[]) : [],
    experiences: Array.isArray(value.experiences) ? (value.experiences as PortfolioExperience[]) : [],
    socialLinks: Array.isArray(value.socialLinks) ? (value.socialLinks as PortfolioSocialLink[]) : [],
    contactInfo:
      value.contactInfo && typeof value.contactInfo === "object"
        ? (value.contactInfo as PortfolioContactInfo)
        : null,
    isPublished: Boolean(record.isPublished),
    publishedAt: (record.publishedAt as Date | null | undefined) ?? null,
  };
}

export async function getPortfolioDataBySlug(slug: string): Promise<PortfolioData | null> {
  const record = await prismaAny.profile.findUnique({
    where: { slug },
    include: {
      ...portfolioInclude,
    },
  });

  return normalizeProfileRecord(record);
}

export async function getPortfolioDataByAdminUserId(adminUserId: string): Promise<PortfolioData | null> {
  const record = await prismaAny.profile.findUnique({
    where: { adminUserId },
    include: {
      ...portfolioInclude,
    },
  });

  return normalizeProfileRecord(record);
}

export async function getPublishedPortfolioDataBySlug(slug: string): Promise<PortfolioData | null> {
  const record = await prismaAny.profile.findUnique({
    where: { publishedSlug: slug },
    select: {
      id: true,
      adminUserId: true,
      slug: true,
      publishedSlug: true,
      isPublished: true,
      publishedAt: true,
      publishedSnapshot: true,
    },
  });

  if (!record || !record.isPublished) {
    return null;
  }

  return normalizePortfolioSnapshot(record);
}

export async function getPublicPortfolioList(limit = 9): Promise<PublicPortfolioListItem[]> {
  const records = await prismaAny.profile.findMany({
    where: { isPublished: true },
    take: limit,
    orderBy: [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }],
    select: {
      id: true,
      publishedSlug: true,
      isPublished: true,
      publishedAt: true,
      publishedSnapshot: true,
    },
  });

  return records.flatMap((record) => {
    const snapshot = normalizePortfolioSnapshot(record);

    if (!snapshot) {
      return [];
    }

    const profile = record as {
      id?: string;
      publishedSlug?: string | null;
      publishedAt?: Date | null;
    };

    return [{
      id: profile.id ?? "",
      slug: profile.publishedSlug ?? "",
      fullName: snapshot.fullName,
      heroDescription: snapshot.heroDescription,
      location: snapshot.location,
      profileImageUrl: snapshot.profileImageUrl,
      roles: snapshot.roles,
      projectCount: snapshot.projects.length,
      serviceCount: snapshot.services.length,
      socialLinkCount: snapshot.socialLinks.length,
      publishedAt: profile.publishedAt ?? null,
    }];
  });
}
