"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  clearAdminSession,
  createAdminSession,
  hashPassword,
  normalizeEmail,
  requireAdmin,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  deleteStorageFileByPublicUrl,
  uploadFileToSupabase,
} from "@/lib/supabase-admin";
import {
  isValidSlug,
  normalizeSlug,
} from "@/lib/slug";
import { buildDefaultProfileData, buildUniqueProfileSlug } from "@/lib/profile-defaults";
import { getPortfolioDataByAdminUserId } from "@/lib/portfolio";
import { buildPublishedPortfolioSnapshot } from "@/lib/portfolio-publish";
import {
  PORTFOLIO_ROLE_LIMIT,
  normalizePortfolioRoles,
} from "@/lib/portfolio-config";
import { isSupportedSocialPlatform } from "@/lib/social-links";
import {
  getServiceOption,
  inferServiceOptionFromTitle,
} from "@/lib/service-options";

type SortableRecord = {
  id: string;
  profileId: string;
  sortOrder: number;
};

type DynamicDelegate<TRecord extends SortableRecord> = {
  aggregate(args: unknown): Promise<{ _max: { sortOrder: number | null } }>;
  findUnique(args: unknown): Promise<TRecord | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<TRecord[]>;
};

const prismaAny = prisma as unknown as {
  business: DynamicDelegate<SortableRecord & { imageUrl: string | null }>;
  photoProject: DynamicDelegate<SortableRecord & { imageUrl: string | null }>;
  motionProject: DynamicDelegate<SortableRecord & {
    previewImageUrl: string | null;
    previewGifUrl: string | null;
    previewVideoUrl: string | null;
  }>;
  artwork: DynamicDelegate<SortableRecord & { imageUrl: string | null }>;
};

function asPrismaPayload<T>(value: T) {
  return value as unknown as never;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getStringValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((value) => (typeof value === "string" ? [value.trim()] : []))
    .filter(Boolean);
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key) || "0");
  return Number.isFinite(value) ? value : 0;
}

function getStringArray(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.flatMap((item) => (typeof item === "string" ? [item] : []))
      : [];
  } catch {
    return [];
  }
}

async function reorderOwnedCollection(options: {
  orderedIds: string[];
  profileId: string;
  slug: string;
  loadItems: () => Promise<Array<{ id: string }>>;
  updateItem: (id: string, sortOrder: number) => Promise<unknown>;
}) {
  const items = await options.loadItems();
  const itemIds = new Set(items.map((item) => item.id));

  if (
    options.orderedIds.length === 0 ||
    options.orderedIds.length !== items.length ||
    options.orderedIds.some((id) => !itemIds.has(id)) ||
    new Set(options.orderedIds).size !== options.orderedIds.length
  ) {
    refreshPortfolio([options.slug]);
    return;
  }

  await Promise.all(options.orderedIds.map((id, index) => options.updateItem(id, index + 1)));
  refreshPortfolio([options.slug]);
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getValidatedRoles(formData: FormData) {
  const submittedRoles = getStringValues(formData, "roles");

  if (submittedRoles.length > PORTFOLIO_ROLE_LIMIT) {
    redirect("/admin");
  }

  const roles = normalizePortfolioRoles(submittedRoles);

  if (roles.length === 0) {
    return ["developer"];
  }

  return roles;
}

async function uploadIfPresent(options: {
  formData: FormData;
  fieldName: string;
  bucket: string;
  folder: string;
}) {
  const file = getFile(options.formData, options.fieldName);

  if (!file) {
    return null;
  }

  return uploadFileToSupabase({
    bucket: options.bucket,
    folder: options.folder,
    file,
  });
}

async function deleteIfChanged(oldUrl: string | null | undefined, nextUrl: string | null | undefined) {
  if (!oldUrl || !nextUrl || oldUrl === nextUrl) {
    return;
  }

  await deleteStorageFileByPublicUrl(oldUrl);
}

async function deleteIfChangedForDraftOnly(
  profile: { isPublished?: boolean | null },
  oldUrl: string | null | undefined,
  nextUrl: string | null | undefined,
) {
  if (profile.isPublished) {
    return;
  }

  await deleteIfChanged(oldUrl, nextUrl);
}

async function deleteStorageFileForDraftOnly(
  profile: { isPublished?: boolean | null },
  url: string | null | undefined,
) {
  if (profile.isPublished || !url) {
    return;
  }

  await deleteStorageFileByPublicUrl(url);
}

function refreshPortfolio(slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];

  revalidatePath("/");
  revalidatePath("/admin");
  revalidateTag("public-portfolios", "max");

  for (const slug of uniqueSlugs) {
    revalidatePath(`/u/${slug}`);
    revalidateTag(`portfolio:${slug}`, "max");
  }
}

function refreshPortfolioAndRedirect(slugs: string[], saved: string) {
  refreshPortfolio(slugs);
  redirect(`/admin?saved=${saved}`);
}

async function ensurePublishedSlugAvailable(profileId: string, publishedSlug: string) {
  const existingPublishedSlugOwner = await prisma.profile.findFirst({
    where: {
      publishedSlug,
      NOT: { id: profileId },
    },
    select: { id: true },
  });

  if (existingPublishedSlugOwner) {
    redirect("/admin?error=slug");
  }
}

async function getCurrentProfileOrRedirect() {
  const adminUser = await requireAdmin();

  if (!adminUser.profile) {
    redirect("/register?error=profile");
  }

  return adminUser.profile;
}

function requireOwnedProfileId(currentProfileId: string, submittedProfileId: string) {
  if (submittedProfileId && submittedProfileId !== currentProfileId) {
    redirect("/admin");
  }
}

function ensureOwnedRecord(profileId: string, currentProfileId: string) {
  if (profileId !== currentProfileId) {
    redirect("/admin");
  }
}

async function getNextSortOrder(
  model:
    | "service"
    | "project"
    | "beat"
    | "business"
    | "photoProject"
    | "motionProject"
    | "artwork"
    | "education"
    | "experience"
    | "socialLink",
  profileId: string,
) {
  if (model === "service") {
    return ((await prisma.service.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "project") {
    return ((await prisma.project.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "beat") {
    return ((await prisma.beat.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "business") {
    return ((await prismaAny.business.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "photoProject") {
    return ((await prismaAny.photoProject.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "motionProject") {
    return ((await prismaAny.motionProject.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "artwork") {
    return ((await prismaAny.artwork.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "education") {
    return ((await prisma.education.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  if (model === "experience") {
    return ((await prisma.experience.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
  }

  return ((await prisma.socialLink.aggregate({ where: { profileId }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
}

export async function registerAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");
  const fullName = getString(formData, "fullName");

  if (!email || !password || !fullName) {
    redirect("/register?error=missing");
  }

  if (password.length < 8) {
    redirect("/register?error=password");
  }

  const existingUser = await prisma.adminUser.findUnique({ where: { email } });

  if (existingUser) {
    redirect("/register?error=email");
  }

  const initialSlug = await buildUniqueProfileSlug(fullName);

  const passwordHash = await hashPassword(password);
  const adminUser = await prisma.adminUser.create({
    data: asPrismaPayload({
      email,
      passwordHash,
      profile: {
        create: buildDefaultProfileData({
          fullName,
          slug: initialSlug,
          email,
        }),
      },
    }),
  });

  await createAdminSession(adminUser.id);
  redirect("/admin");
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");

  const adminUser = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!adminUser || !(await verifyPassword(password, adminUser.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await createAdminSession(adminUser.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function updateSlugAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));

  const nextSlug = normalizeSlug(getString(formData, "slug"));

  if (!isValidSlug(nextSlug)) {
    redirect("/admin?error=slug");
  }

  const existingSlugOwner = await prisma.profile.findUnique({
    where: { slug: nextSlug },
  });

  if (existingSlugOwner && existingSlugOwner.id !== profile.id) {
    redirect("/admin?error=slug");
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { slug: nextSlug },
  });

  refreshPortfolioAndRedirect([profile.slug, profile.publishedSlug ?? "", nextSlug], "slug");
}

export async function publishPortfolioAction() {
  const profile = await getCurrentProfileOrRedirect();
  const draftProfile = await getPortfolioDataByAdminUserId(profile.adminUserId);

  if (!draftProfile) {
    redirect("/admin");
  }

  await ensurePublishedSlugAvailable(profile.id, draftProfile.slug);

  const publishedProfile = await prisma.profile.update({
    where: { id: profile.id },
    data: asPrismaPayload({
      isPublished: true,
      publishedSlug: draftProfile.slug,
      publishedAt: new Date(),
      publishedSnapshot: buildPublishedPortfolioSnapshot(draftProfile),
    }),
    select: {
      updatedAt: true,
    },
  });

  // Keep publishedAt aligned with the actual row update time so the admin
  // status reflects that the current saved draft has been published.
  await prisma.$executeRaw`
    UPDATE "Profile"
    SET "publishedAt" = ${publishedProfile.updatedAt}
    WHERE "id" = ${profile.id}
  `;

  refreshPortfolio([profile.slug, profile.publishedSlug ?? "", draftProfile.slug]);
  redirect("/admin?saved=publish");
}

export async function unpublishPortfolioAction() {
  const profile = await getCurrentProfileOrRedirect();

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      isPublished: false,
      publishedSlug: null,
      publishedAt: null,
      publishedSnapshot: Prisma.JsonNull,
    },
  });

  refreshPortfolio([profile.slug, profile.publishedSlug ?? ""]);
  redirect("/admin?saved=unpublish");
}

export async function updateProfileAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const existingProfile = await prisma.profile.findUnique({ where: { id: profile.id } });

  if (!existingProfile) {
    redirect("/admin");
  }

  const uploadedProfileImageUrl = await uploadIfPresent({
    formData,
    fieldName: "profileImageFile",
    bucket: "profile",
    folder: `images/${profile.id}`,
  });

  const uploadedCvFileUrl = await uploadIfPresent({
    formData,
    fieldName: "cvFile",
    bucket: "cv",
    folder: `files/${profile.id}`,
  });

  const nextProfileImageUrl = uploadedProfileImageUrl ?? existingProfile.profileImageUrl;
  const nextCvFileUrl = uploadedCvFileUrl ?? existingProfile.cvFileUrl;

  await prisma.profile.update({
    where: { id: profile.id },
    data: asPrismaPayload({
      roles: getValidatedRoles(formData),
      fullName: getString(formData, "fullName"),
      heroTitlePrefix: getNullableString(formData, "heroTitlePrefix"),
      heroHighlight: getNullableString(formData, "heroHighlight"),
      heroTitleSuffix: getNullableString(formData, "heroTitleSuffix"),
      heroDescription: getNullableString(formData, "heroDescription"),
      location: getNullableString(formData, "location"),
      profileImageUrl: nextProfileImageUrl,
      cvFileUrl: nextCvFileUrl,
      aboutSectionTitle: getNullableString(formData, "aboutSectionTitle"),
    }),
  });

  await deleteIfChangedForDraftOnly(profile, existingProfile.profileImageUrl, nextProfileImageUrl);
  await deleteIfChangedForDraftOnly(profile, existingProfile.cvFileUrl, nextCvFileUrl);

  refreshPortfolioAndRedirect([profile.slug], "profile");
}

export async function updateContactInfoAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const contactInfoId = getString(formData, "contactInfoId");

  const data = {
    sectionLabel: getNullableString(formData, "sectionLabel"),
    heading: getNullableString(formData, "heading"),
    description: getNullableString(formData, "description"),
    phone: getNullableString(formData, "phone"),
    email: getNullableString(formData, "email"),
  };

  if (contactInfoId) {
    const existingContactInfo = await prisma.contactInfo.findUnique({ where: { id: contactInfoId } });

    if (!existingContactInfo || existingContactInfo.profileId !== profile.id) {
      redirect("/admin");
    }

    await prisma.contactInfo.update({ where: { id: contactInfoId }, data });
  } else {
    await prisma.contactInfo.upsert({
      where: { profileId: profile.id },
      update: data,
      create: { profileId: profile.id, ...data },
    });
  }

  refreshPortfolioAndRedirect([profile.slug], "contact");
}

export async function upsertServiceAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingService = id ? await prisma.service.findUnique({ where: { id } }) : null;

  if (existingService) {
    ensureOwnedRecord(existingService.profileId, profile.id);
  }

  const selectedOption =
    getServiceOption(getString(formData, "serviceType")) ??
    inferServiceOptionFromTitle(existingService?.title);

  const data = {
    title: selectedOption?.title ?? getString(formData, "title"),
    description: getString(formData, "description"),
    iconName: selectedOption?.iconName ?? getNullableString(formData, "iconName"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("service", profile.id),
  };

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "service");
}

export async function deleteServiceAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(service.profileId, profile.id);
  await prisma.service.delete({ where: { id } });
  refreshPortfolio([profile.slug]);
}

export async function moveServiceAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(service.profileId, profile.id);

  const services = await prisma.service.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = services.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= services.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentService = services[currentIndex];
  const targetService = services[targetIndex];

  await prisma.$transaction([
    prisma.service.update({
      where: { id: currentService.id },
      data: { sortOrder: targetService.sortOrder },
    }),
    prisma.service.update({
      where: { id: targetService.id },
      data: { sortOrder: currentService.sortOrder },
    }),
  ]);

  refreshPortfolio([profile.slug]);
}

export async function upsertProjectAction(formData: FormData) {
  try {
    const profile = await getCurrentProfileOrRedirect();
    requireOwnedProfileId(profile.id, getString(formData, "profileId"));
    const id = getString(formData, "id");
    const existingProject = id ? await prisma.project.findUnique({ where: { id } }) : null;

    if (existingProject) {
      ensureOwnedRecord(existingProject.profileId, profile.id);
    }

    const uploadedImageUrl = await uploadIfPresent({
      formData,
      fieldName: "imageFile",
      bucket: "projects",
      folder: `images/${profile.id}`,
    });

    const nextImageUrl = uploadedImageUrl ?? existingProject?.imageUrl ?? null;
    const data = {
      title: getString(formData, "title"),
      description: getString(formData, "description"),
      imageUrl: nextImageUrl,
      liveUrl: getNullableString(formData, "liveUrl"),
      sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("project", profile.id),
    };

    if (id) {
      await prisma.project.update({ where: { id }, data: asPrismaPayload(data) });
      await deleteIfChangedForDraftOnly(profile, existingProject?.imageUrl, nextImageUrl);
    } else {
      await prisma.project.create({
        data: asPrismaPayload({
          profileId: profile.id,
          ...data,
        }),
      });
    }

    refreshPortfolioAndRedirect([profile.slug], "project");
  } catch (error) {
    console.error("upsertProjectAction failed", error);
    throw error;
  }
}

export async function deleteProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(project.profileId, profile.id);
  await prisma.project.delete({ where: { id } });
  await deleteStorageFileForDraftOnly(profile, project.imageUrl);
  refreshPortfolio([profile.slug]);
}

export async function moveProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(project.profileId, profile.id);

  const projects = await prisma.project.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = projects.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= projects.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentProject = projects[currentIndex];
  const targetProject = projects[targetIndex];

  await prisma.$transaction([
    prisma.project.update({
      where: { id: currentProject.id },
      data: { sortOrder: targetProject.sortOrder },
    }),
    prisma.project.update({
      where: { id: targetProject.id },
      data: { sortOrder: currentProject.sortOrder },
    }),
  ]);

  refreshPortfolio([profile.slug]);
}

export async function reorderProjectsAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prisma.project.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prisma.project.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderServicesAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prisma.service.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prisma.service.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderBeatsAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prisma.beat.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prisma.beat.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderBusinessesAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prismaAny.business.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prismaAny.business.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderPhotoProjectsAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prismaAny.photoProject.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prismaAny.photoProject.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderMotionProjectsAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prismaAny.motionProject.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prismaAny.motionProject.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderArtworksAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prismaAny.artwork.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prismaAny.artwork.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderEducationsAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prisma.education.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prisma.education.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderExperiencesAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prisma.experience.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prisma.experience.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function reorderSocialLinksAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const orderedIds = getStringArray(formData, "orderedIds");
  await reorderOwnedCollection({
    orderedIds,
    profileId: profile.id,
    slug: profile.slug,
    loadItems: () =>
      prisma.socialLink.findMany({
        where: { profileId: profile.id },
        orderBy: { sortOrder: "asc" },
      }),
    updateItem: (id, sortOrder) =>
      prisma.socialLink.update({
        where: { id },
        data: { sortOrder },
      }),
  });
}

export async function upsertBeatAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingBeat = id ? await prisma.beat.findUnique({ where: { id } }) : null;

  if (existingBeat) {
    ensureOwnedRecord(existingBeat.profileId, profile.id);
  }

  const uploadedCoverImageUrl = await uploadIfPresent({
    formData,
    fieldName: "coverImageFile",
    bucket: "beats",
    folder: `covers/${profile.id}`,
  });

  const uploadedAudioUrl = await uploadIfPresent({
    formData,
    fieldName: "audioFile",
    bucket: "beats",
    folder: `audio/${profile.id}`,
  });

  const nextCoverImageUrl = uploadedCoverImageUrl ?? existingBeat?.coverImageUrl ?? null;
  const nextAudioUrl = uploadedAudioUrl ?? existingBeat?.audioUrl ?? null;
  const data = {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    coverImageUrl: nextCoverImageUrl,
    audioUrl: nextAudioUrl,
    externalUrl: getNullableString(formData, "externalUrl"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("beat", profile.id),
  };

  if (id) {
    await prisma.beat.update({ where: { id }, data: asPrismaPayload(data) });
    await deleteIfChangedForDraftOnly(profile, existingBeat?.coverImageUrl, nextCoverImageUrl);
    await deleteIfChangedForDraftOnly(profile, existingBeat?.audioUrl, nextAudioUrl);
  } else {
    await prisma.beat.create({ data: asPrismaPayload({ profileId: profile.id, ...data }) });
  }

  refreshPortfolioAndRedirect([profile.slug], "beat");
}

export async function deleteBeatAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const beat = await prisma.beat.findUnique({ where: { id } });

  if (!beat) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(beat.profileId, profile.id);
  await prisma.beat.delete({ where: { id } });
  await deleteStorageFileForDraftOnly(profile, beat.coverImageUrl);
  await deleteStorageFileForDraftOnly(profile, beat.audioUrl);
  refreshPortfolio([profile.slug]);
}

export async function moveBeatAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const beat = await prisma.beat.findUnique({ where: { id } });

  if (!beat) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(beat.profileId, profile.id);

  const beats = await prisma.beat.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = beats.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= beats.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentBeat = beats[currentIndex];
  const targetBeat = beats[targetIndex];

  await prisma.$transaction([
    prisma.beat.update({
      where: { id: currentBeat.id },
      data: { sortOrder: targetBeat.sortOrder },
    }),
    prisma.beat.update({
      where: { id: targetBeat.id },
      data: { sortOrder: currentBeat.sortOrder },
    }),
  ]);

  refreshPortfolio([profile.slug]);
}

export async function upsertBusinessAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingBusiness = id ? await prismaAny.business.findUnique({ where: { id } }) : null;

  if (existingBusiness) {
    ensureOwnedRecord(existingBusiness.profileId, profile.id);
  }

  const uploadedImageUrl = await uploadIfPresent({
    formData,
    fieldName: "imageFile",
    bucket: "businesses",
    folder: `images/${profile.id}`,
  });

  const nextImageUrl = uploadedImageUrl ?? existingBusiness?.imageUrl ?? null;
  const data = {
    name: getString(formData, "name"),
    businessType: getNullableString(formData, "businessType"),
    description: getString(formData, "description"),
    websiteUrl: getNullableString(formData, "websiteUrl"),
    imageUrl: nextImageUrl,
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("business", profile.id),
  };

  if (id) {
    await prismaAny.business.update({ where: { id }, data });
    await deleteIfChangedForDraftOnly(profile, existingBusiness?.imageUrl, nextImageUrl);
  } else {
    await prismaAny.business.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "business");
}

export async function deleteBusinessAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const business = await prismaAny.business.findUnique({ where: { id } });

  if (!business) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(business.profileId, profile.id);
  await prismaAny.business.delete({ where: { id } });
  await deleteStorageFileForDraftOnly(profile, business.imageUrl);
  refreshPortfolio([profile.slug]);
}

export async function moveBusinessAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const business = await prismaAny.business.findUnique({ where: { id } });

  if (!business) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(business.profileId, profile.id);

  const businesses = await prismaAny.business.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = businesses.findIndex((item: { id: string }) => item.id === id);
  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= businesses.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentBusiness = businesses[currentIndex];
  const targetBusiness = businesses[targetIndex];

  await prismaAny.business.update({
    where: { id: currentBusiness.id },
    data: { sortOrder: targetBusiness.sortOrder },
  });
  await prismaAny.business.update({
    where: { id: targetBusiness.id },
    data: { sortOrder: currentBusiness.sortOrder },
  });

  refreshPortfolio([profile.slug]);
}

export async function upsertPhotoProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingProject = id ? await prismaAny.photoProject.findUnique({ where: { id } }) : null;

  if (existingProject) {
    ensureOwnedRecord(existingProject.profileId, profile.id);
  }

  const uploadedImageUrl = await uploadIfPresent({
    formData,
    fieldName: "imageFile",
    bucket: "photos",
    folder: `images/${profile.id}`,
  });

  const nextImageUrl = uploadedImageUrl ?? existingProject?.imageUrl ?? null;
  const data = {
    title: getString(formData, "title"),
    collection: getNullableString(formData, "collection"),
    description: getString(formData, "description"),
    imageUrl: nextImageUrl,
    projectUrl: getNullableString(formData, "projectUrl"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("photoProject", profile.id),
  };

  if (id) {
    await prismaAny.photoProject.update({ where: { id }, data });
    await deleteIfChangedForDraftOnly(profile, existingProject?.imageUrl, nextImageUrl);
  } else {
    await prismaAny.photoProject.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "photo");
}

export async function deletePhotoProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const photoProject = await prismaAny.photoProject.findUnique({ where: { id } });

  if (!photoProject) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(photoProject.profileId, profile.id);
  await prismaAny.photoProject.delete({ where: { id } });
  await deleteStorageFileForDraftOnly(profile, photoProject.imageUrl);
  refreshPortfolio([profile.slug]);
}

export async function movePhotoProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const photoProject = await prismaAny.photoProject.findUnique({ where: { id } });

  if (!photoProject) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(photoProject.profileId, profile.id);

  const photoProjects = await prismaAny.photoProject.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = photoProjects.findIndex((item: { id: string }) => item.id === id);
  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= photoProjects.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentPhotoProject = photoProjects[currentIndex];
  const targetPhotoProject = photoProjects[targetIndex];

  await prismaAny.photoProject.update({
    where: { id: currentPhotoProject.id },
    data: { sortOrder: targetPhotoProject.sortOrder },
  });
  await prismaAny.photoProject.update({
    where: { id: targetPhotoProject.id },
    data: { sortOrder: currentPhotoProject.sortOrder },
  });

  refreshPortfolio([profile.slug]);
}

export async function upsertMotionProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingProject = id ? await prismaAny.motionProject.findUnique({ where: { id } }) : null;

  if (existingProject) {
    ensureOwnedRecord(existingProject.profileId, profile.id);
  }

  const uploadedPreviewImageUrl = await uploadIfPresent({
    formData,
    fieldName: "previewImageFile",
    bucket: "motion",
    folder: `images/${profile.id}`,
  });

  const uploadedPreviewGifUrl = await uploadIfPresent({
    formData,
    fieldName: "previewGifFile",
    bucket: "motion",
    folder: `gifs/${profile.id}`,
  });

  const uploadedPreviewVideoUrl = await uploadIfPresent({
    formData,
    fieldName: "previewVideoFile",
    bucket: "motion",
    folder: `videos/${profile.id}`,
  });

  const nextPreviewImageUrl = uploadedPreviewImageUrl ?? existingProject?.previewImageUrl ?? null;
  const nextPreviewGifUrl = uploadedPreviewGifUrl ?? existingProject?.previewGifUrl ?? null;
  const nextPreviewVideoUrl = uploadedPreviewVideoUrl ?? existingProject?.previewVideoUrl ?? null;

  const data = {
    title: getString(formData, "title"),
    toolName: getNullableString(formData, "toolName"),
    description: getString(formData, "description"),
    previewImageUrl: nextPreviewImageUrl,
    previewGifUrl: nextPreviewGifUrl,
    previewVideoUrl: nextPreviewVideoUrl,
    projectUrl: getNullableString(formData, "projectUrl"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("motionProject", profile.id),
  };

  if (id) {
    await prismaAny.motionProject.update({ where: { id }, data });
    await deleteIfChangedForDraftOnly(profile, existingProject?.previewImageUrl, nextPreviewImageUrl);
    await deleteIfChangedForDraftOnly(profile, existingProject?.previewGifUrl, nextPreviewGifUrl);
    await deleteIfChangedForDraftOnly(profile, existingProject?.previewVideoUrl, nextPreviewVideoUrl);
  } else {
    await prismaAny.motionProject.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "motion");
}

export async function deleteMotionProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const motionProject = await prismaAny.motionProject.findUnique({ where: { id } });

  if (!motionProject) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(motionProject.profileId, profile.id);
  await prismaAny.motionProject.delete({ where: { id } });
  await deleteStorageFileForDraftOnly(profile, motionProject.previewImageUrl);
  await deleteStorageFileForDraftOnly(profile, motionProject.previewGifUrl);
  await deleteStorageFileForDraftOnly(profile, motionProject.previewVideoUrl);
  refreshPortfolio([profile.slug]);
}

export async function moveMotionProjectAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const motionProject = await prismaAny.motionProject.findUnique({ where: { id } });

  if (!motionProject) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(motionProject.profileId, profile.id);

  const motionProjects = await prismaAny.motionProject.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = motionProjects.findIndex((item: { id: string }) => item.id === id);
  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= motionProjects.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentMotionProject = motionProjects[currentIndex];
  const targetMotionProject = motionProjects[targetIndex];

  await prismaAny.motionProject.update({
    where: { id: currentMotionProject.id },
    data: { sortOrder: targetMotionProject.sortOrder },
  });
  await prismaAny.motionProject.update({
    where: { id: targetMotionProject.id },
    data: { sortOrder: currentMotionProject.sortOrder },
  });

  refreshPortfolio([profile.slug]);
}

export async function upsertArtworkAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingArtwork = id ? await prismaAny.artwork.findUnique({ where: { id } }) : null;

  if (existingArtwork) {
    ensureOwnedRecord(existingArtwork.profileId, profile.id);
  }

  const uploadedImageUrl = await uploadIfPresent({
    formData,
    fieldName: "imageFile",
    bucket: "artworks",
    folder: `images/${profile.id}`,
  });

  const nextImageUrl = uploadedImageUrl ?? existingArtwork?.imageUrl ?? null;
  const data = {
    title: getString(formData, "title"),
    medium: getNullableString(formData, "medium"),
    description: getString(formData, "description"),
    imageUrl: nextImageUrl,
    collectionUrl: getNullableString(formData, "collectionUrl"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("artwork", profile.id),
  };

  if (id) {
    await prismaAny.artwork.update({ where: { id }, data });
    await deleteIfChangedForDraftOnly(profile, existingArtwork?.imageUrl, nextImageUrl);
  } else {
    await prismaAny.artwork.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "artwork");
}

export async function deleteArtworkAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const artwork = await prismaAny.artwork.findUnique({ where: { id } });

  if (!artwork) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(artwork.profileId, profile.id);
  await prismaAny.artwork.delete({ where: { id } });
  await deleteStorageFileForDraftOnly(profile, artwork.imageUrl);
  refreshPortfolio([profile.slug]);
}

export async function moveArtworkAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const artwork = await prismaAny.artwork.findUnique({ where: { id } });

  if (!artwork) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(artwork.profileId, profile.id);

  const artworks = await prismaAny.artwork.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = artworks.findIndex((item: { id: string }) => item.id === id);
  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= artworks.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentArtwork = artworks[currentIndex];
  const targetArtwork = artworks[targetIndex];

  await prismaAny.artwork.update({
    where: { id: currentArtwork.id },
    data: { sortOrder: targetArtwork.sortOrder },
  });
  await prismaAny.artwork.update({
    where: { id: targetArtwork.id },
    data: { sortOrder: currentArtwork.sortOrder },
  });

  refreshPortfolio([profile.slug]);
}

export async function upsertEducationAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingEducation = id ? await prisma.education.findUnique({ where: { id } }) : null;

  if (existingEducation) {
    ensureOwnedRecord(existingEducation.profileId, profile.id);
  }

  const data = {
    degree: getString(formData, "degree"),
    institution: getString(formData, "institution"),
    period: getString(formData, "period"),
    description: getNullableString(formData, "description"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("education", profile.id),
  };

  if (id) {
    await prisma.education.update({ where: { id }, data });
  } else {
    await prisma.education.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "education");
}

export async function deleteEducationAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const education = await prisma.education.findUnique({ where: { id } });

  if (!education) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(education.profileId, profile.id);
  await prisma.education.delete({ where: { id } });
  refreshPortfolio([profile.slug]);
}

export async function moveEducationAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const education = await prisma.education.findUnique({ where: { id } });

  if (!education) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(education.profileId, profile.id);

  const educations = await prisma.education.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = educations.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= educations.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentEducation = educations[currentIndex];
  const targetEducation = educations[targetIndex];

  await prisma.$transaction([
    prisma.education.update({
      where: { id: currentEducation.id },
      data: { sortOrder: targetEducation.sortOrder },
    }),
    prisma.education.update({
      where: { id: targetEducation.id },
      data: { sortOrder: currentEducation.sortOrder },
    }),
  ]);

  refreshPortfolio([profile.slug]);
}

export async function upsertExperienceAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingExperience = id ? await prisma.experience.findUnique({ where: { id } }) : null;

  if (existingExperience) {
    ensureOwnedRecord(existingExperience.profileId, profile.id);
  }

  const data = {
    role: getString(formData, "role"),
    company: getString(formData, "company"),
    period: getString(formData, "period"),
    description: getNullableString(formData, "description"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("experience", profile.id),
  };

  if (id) {
    await prisma.experience.update({ where: { id }, data });
  } else {
    await prisma.experience.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "experience");
}

export async function deleteExperienceAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const experience = await prisma.experience.findUnique({ where: { id } });

  if (!experience) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(experience.profileId, profile.id);
  await prisma.experience.delete({ where: { id } });
  refreshPortfolio([profile.slug]);
}

export async function moveExperienceAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const experience = await prisma.experience.findUnique({ where: { id } });

  if (!experience) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(experience.profileId, profile.id);

  const experiences = await prisma.experience.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = experiences.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= experiences.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentExperience = experiences[currentIndex];
  const targetExperience = experiences[targetIndex];

  await prisma.$transaction([
    prisma.experience.update({
      where: { id: currentExperience.id },
      data: { sortOrder: targetExperience.sortOrder },
    }),
    prisma.experience.update({
      where: { id: targetExperience.id },
      data: { sortOrder: currentExperience.sortOrder },
    }),
  ]);

  refreshPortfolio([profile.slug]);
}

export async function upsertSocialLinkAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  requireOwnedProfileId(profile.id, getString(formData, "profileId"));
  const id = getString(formData, "id");
  const existingSocialLink = id ? await prisma.socialLink.findUnique({ where: { id } }) : null;

  if (existingSocialLink) {
    ensureOwnedRecord(existingSocialLink.profileId, profile.id);
  }

  const platform = getString(formData, "platform").trim().toLowerCase();

  if (!isSupportedSocialPlatform(platform)) {
    refreshPortfolioAndRedirect([profile.slug], "social");
  }

  const data = {
    platform,
    url: getString(formData, "url"),
    sortOrder: id ? getNumber(formData, "sortOrder") : await getNextSortOrder("socialLink", profile.id),
  };

  if (id) {
    await prisma.socialLink.update({ where: { id }, data });
  } else {
    await prisma.socialLink.create({ data: { profileId: profile.id, ...data } });
  }

  refreshPortfolioAndRedirect([profile.slug], "social");
}

export async function deleteSocialLinkAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const socialLink = await prisma.socialLink.findUnique({ where: { id } });

  if (!socialLink) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(socialLink.profileId, profile.id);
  await prisma.socialLink.delete({ where: { id } });
  refreshPortfolio([profile.slug]);
}

export async function moveSocialLinkAction(formData: FormData) {
  const profile = await getCurrentProfileOrRedirect();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const socialLink = await prisma.socialLink.findUnique({ where: { id } });

  if (!socialLink) {
    refreshPortfolio([profile.slug]);
    return;
  }

  ensureOwnedRecord(socialLink.profileId, profile.id);

  const socialLinks = await prisma.socialLink.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = socialLinks.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= socialLinks.length || targetIndex === currentIndex) {
    refreshPortfolio([profile.slug]);
    return;
  }

  const currentSocialLink = socialLinks[currentIndex];
  const targetSocialLink = socialLinks[targetIndex];

  await prisma.$transaction([
    prisma.socialLink.update({
      where: { id: currentSocialLink.id },
      data: { sortOrder: targetSocialLink.sortOrder },
    }),
    prisma.socialLink.update({
      where: { id: targetSocialLink.id },
      data: { sortOrder: currentSocialLink.sortOrder },
    }),
  ]);

  refreshPortfolio([profile.slug]);
}


