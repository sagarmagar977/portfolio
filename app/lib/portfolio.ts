import { unstable_cache } from "next/cache";
import { cache } from "react";
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

export type AdminPublishingSummary = {
  latestChangedSectionLabel: string | null;
  latestChangePublished: boolean;
};

type PublicPortfolioListRow = {
  id: string;
  slug: string | null;
  fullName: string | null;
  heroDescription: string | null;
  location: string | null;
  profileImageUrl: string | null;
  roles: unknown;
  projectCount: number | bigint | null;
  serviceCount: number | bigint | null;
  socialLinkCount: number | bigint | null;
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

function toSafeCount(value: number | bigint | null | undefined) {
  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return 0;
}

function createPublishedPortfolioCache(slug: string) {
  return unstable_cache(
    async () => {
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
    },
    ["published-portfolio-by-slug", slug],
    {
      tags: ["public-portfolios", `portfolio:${slug}`],
      revalidate: 300,
    },
  );
}

const getCachedPublishedPortfolioDataBySlug = cache((slug: string) => createPublishedPortfolioCache(slug));

const getCachedPublicPortfolioList = unstable_cache(
  async (limit: number) => {
    const rows = await prisma.$queryRaw<PublicPortfolioListRow[]>`
      SELECT
        id,
        "publishedSlug" AS slug,
        "publishedSnapshot"->>'fullName' AS "fullName",
        "publishedSnapshot"->>'heroDescription' AS "heroDescription",
        "publishedSnapshot"->>'location' AS location,
        "publishedSnapshot"->>'profileImageUrl' AS "profileImageUrl",
        "publishedSnapshot"->'roles' AS roles,
        jsonb_array_length(COALESCE("publishedSnapshot"->'projects', '[]'::jsonb)) AS "projectCount",
        jsonb_array_length(COALESCE("publishedSnapshot"->'services', '[]'::jsonb)) AS "serviceCount",
        jsonb_array_length(COALESCE("publishedSnapshot"->'socialLinks', '[]'::jsonb)) AS "socialLinkCount",
        "publishedAt"
      FROM "Profile"
      WHERE
        "isPublished" = true
        AND "publishedSlug" IS NOT NULL
        AND "publishedSnapshot" IS NOT NULL
      ORDER BY "publishedAt" DESC NULLS LAST, "updatedAt" DESC
      LIMIT ${limit}
    `;

    return rows.flatMap((row) => {
      if (!row.slug) {
        return [];
      }

      return [{
        id: row.id,
        slug: row.slug,
        fullName: row.fullName ?? "",
        heroDescription: row.heroDescription,
        location: row.location,
        profileImageUrl: row.profileImageUrl,
        roles: normalizePortfolioRoles(Array.isArray(row.roles) ? row.roles : []) as PortfolioRole[],
        projectCount: toSafeCount(row.projectCount),
        serviceCount: toSafeCount(row.serviceCount),
        socialLinkCount: toSafeCount(row.socialLinkCount),
        publishedAt: row.publishedAt,
      }];
    });
  },
  ["public-portfolio-list"],
  {
    tags: ["public-portfolios"],
    revalidate: 300,
  },
);

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

export async function getAdminPublishingSummaryByAdminUserId(
  adminUserId: string,
): Promise<AdminPublishingSummary | null> {
  const profile = await prisma.profile.findUnique({
    where: { adminUserId },
    select: {
      id: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
      contactInfo: {
        select: {
          updatedAt: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  const [
    latestService,
    latestProject,
    latestBeat,
    latestBusiness,
    latestPhotoProject,
    latestMotionProject,
    latestArtwork,
    latestEducation,
    latestExperience,
    latestSocialLink,
  ] = await Promise.all([
    prisma.service.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.project.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.beat.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.business.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.photoProject.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.motionProject.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.artwork.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.education.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.experience.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
    prisma.socialLink.findFirst({ where: { profileId: profile.id }, orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
  ]);

  const candidates = [
    { label: "Profile", updatedAt: profile.updatedAt },
    { label: "Contact", updatedAt: profile.contactInfo?.updatedAt ?? null },
    { label: "Services", updatedAt: latestService?.updatedAt ?? null },
    { label: "Projects", updatedAt: latestProject?.updatedAt ?? null },
    { label: "Beats", updatedAt: latestBeat?.updatedAt ?? null },
    { label: "Ventures", updatedAt: latestBusiness?.updatedAt ?? null },
    { label: "Photography", updatedAt: latestPhotoProject?.updatedAt ?? null },
    { label: "3D / Motion", updatedAt: latestMotionProject?.updatedAt ?? null },
    { label: "Artworks", updatedAt: latestArtwork?.updatedAt ?? null },
    { label: "Education", updatedAt: latestEducation?.updatedAt ?? null },
    { label: "Experience", updatedAt: latestExperience?.updatedAt ?? null },
    { label: "Social Links", updatedAt: latestSocialLink?.updatedAt ?? null },
  ].filter((candidate): candidate is { label: string; updatedAt: Date } => candidate.updatedAt instanceof Date);

  const latestCandidate = candidates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ?? null;

  if (!latestCandidate) {
    return {
      latestChangedSectionLabel: null,
      latestChangePublished: profile.isPublished,
    };
  }

  return {
    latestChangedSectionLabel: latestCandidate.label,
    latestChangePublished: Boolean(profile.isPublished && profile.publishedAt && latestCandidate.updatedAt <= profile.publishedAt),
  };
}

export async function getPublishedPortfolioDataBySlug(slug: string): Promise<PortfolioData | null> {
  return getCachedPublishedPortfolioDataBySlug(slug)();
}

export async function getPublicPortfolioList(limit = 9): Promise<PublicPortfolioListItem[]> {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 9;

  if (safeLimit === 0) {
    return [];
  }

  return getCachedPublicPortfolioList(safeLimit);
}
