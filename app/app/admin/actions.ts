"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  deleteStorageFileByPublicUrl,
  uploadFileToSupabase,
} from "@/lib/supabase-admin";
import {
  clearAdminSession,
  createAdminSession,
  getAdminCredentials,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import {
  getServiceOption,
  inferServiceOptionFromTitle,
} from "@/lib/service-options";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key) || "0");
  return Number.isFinite(value) ? value : 0;
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
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

async function requireAuthenticatedAction() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

function refreshPortfolio() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const credentials = getAdminCredentials();

  if (email !== credentials.email || password !== credentials.password) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateProfileAction(formData: FormData) {
  await requireAuthenticatedAction();
  const profileId = getString(formData, "profileId");
  const existingProfile = await prisma.profile.findUnique({ where: { id: profileId } });

  if (!existingProfile) {
    redirect("/admin");
  }

  const uploadedProfileImageUrl = await uploadIfPresent({
    formData,
    fieldName: "profileImageFile",
    bucket: "profile",
    folder: "images",
  });

  const uploadedCvFileUrl = await uploadIfPresent({
    formData,
    fieldName: "cvFile",
    bucket: "cv",
    folder: "files",
  });

  const nextProfileImageUrl = uploadedProfileImageUrl ?? getNullableString(formData, "profileImageUrl");
  const nextCvFileUrl = uploadedCvFileUrl ?? getNullableString(formData, "cvFileUrl");

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      fullName: getString(formData, "fullName"),
      heroTitlePrefix: getNullableString(formData, "heroTitlePrefix"),
      heroHighlight: getNullableString(formData, "heroHighlight"),
      heroTitleSuffix: getNullableString(formData, "heroTitleSuffix"),
      heroDescription: getNullableString(formData, "heroDescription"),
      location: getNullableString(formData, "location"),
      profileImageUrl: nextProfileImageUrl,
      cvFileUrl: nextCvFileUrl,
      aboutSectionTitle: getNullableString(formData, "aboutSectionTitle"),
      footerCreditText: getNullableString(formData, "footerCreditText"),
    },
  });

  await deleteIfChanged(existingProfile.profileImageUrl, nextProfileImageUrl);
  await deleteIfChanged(existingProfile.cvFileUrl, nextCvFileUrl);

  refreshPortfolio();
}

export async function updateContactInfoAction(formData: FormData) {
  await requireAuthenticatedAction();
  const contactInfoId = getString(formData, "contactInfoId");
  const profileId = getString(formData, "profileId");

  const data = {
    sectionLabel: getNullableString(formData, "sectionLabel"),
    heading: getNullableString(formData, "heading"),
    description: getNullableString(formData, "description"),
    phone: getNullableString(formData, "phone"),
    email: getNullableString(formData, "email"),
  };

  if (contactInfoId) {
    await prisma.contactInfo.update({ where: { id: contactInfoId }, data });
  } else {
    await prisma.contactInfo.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function upsertServiceAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const existingService = id ? await prisma.service.findUnique({ where: { id } }) : null;
  const selectedOption =
    getServiceOption(getString(formData, "serviceType")) ??
    inferServiceOptionFromTitle(existingService?.title);
  const nextSortOrder = id
    ? getNumber(formData, "sortOrder")
    : ((await prisma.service.aggregate({
        where: { profileId },
        _max: { sortOrder: true },
      }))._max.sortOrder ?? 0) + 1;

  const data = {
    title: selectedOption?.title ?? getString(formData, "title"),
    description: getString(formData, "description"),
    iconName: selectedOption?.iconName ?? getNullableString(formData, "iconName"),
    sortOrder: nextSortOrder,
  };

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteServiceAction(formData: FormData) {
  await requireAuthenticatedAction();
  await prisma.service.delete({ where: { id: getString(formData, "id") } });
  refreshPortfolio();
}

export async function moveServiceAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    refreshPortfolio();
    return;
  }

  const services = await prisma.service.findMany({
    where: { profileId: service.profileId },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = services.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio();
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= services.length || targetIndex === currentIndex) {
    refreshPortfolio();
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

  refreshPortfolio();
}

export async function upsertProjectAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const existingProject = id ? await prisma.project.findUnique({ where: { id } }) : null;

  const uploadedImageUrl = await uploadIfPresent({
    formData,
    fieldName: "imageFile",
    bucket: "projects",
    folder: "images",
  });

  const nextImageUrl = uploadedImageUrl ?? getNullableString(formData, "imageUrl");
  const data = {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    imageUrl: nextImageUrl,
    liveUrl: getNullableString(formData, "liveUrl"),
    sortOrder: id
      ? getNumber(formData, "sortOrder")
      : ((await prisma.project.aggregate({
          where: { profileId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
  };

  if (id) {
    await prisma.project.update({ where: { id }, data });
    await deleteIfChanged(existingProject?.imageUrl, nextImageUrl);
  } else {
    await prisma.project.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteProjectAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const project = await prisma.project.findUnique({ where: { id } });
  await prisma.project.delete({ where: { id } });
  await deleteStorageFileByPublicUrl(project?.imageUrl);
  refreshPortfolio();
}

export async function moveProjectAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    refreshPortfolio();
    return;
  }

  const projects = await prisma.project.findMany({
    where: { profileId: project.profileId },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = projects.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio();
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= projects.length || targetIndex === currentIndex) {
    refreshPortfolio();
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

  refreshPortfolio();
}

export async function upsertBeatAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const existingBeat = id ? await prisma.beat.findUnique({ where: { id } }) : null;

  const uploadedCoverImageUrl = await uploadIfPresent({
    formData,
    fieldName: "coverImageFile",
    bucket: "beats",
    folder: "covers",
  });

  const uploadedAudioUrl = await uploadIfPresent({
    formData,
    fieldName: "audioFile",
    bucket: "beats",
    folder: "audio",
  });

  const nextCoverImageUrl = uploadedCoverImageUrl ?? getNullableString(formData, "coverImageUrl");
  const nextAudioUrl = uploadedAudioUrl ?? getNullableString(formData, "audioUrl");
  const data = {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    coverImageUrl: nextCoverImageUrl,
    audioUrl: nextAudioUrl,
    sortOrder: id
      ? getNumber(formData, "sortOrder")
      : ((await prisma.beat.aggregate({
          where: { profileId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
  };

  if (id) {
    await prisma.beat.update({ where: { id }, data });
    await deleteIfChanged(existingBeat?.coverImageUrl, nextCoverImageUrl);
    await deleteIfChanged(existingBeat?.audioUrl, nextAudioUrl);
  } else {
    await prisma.beat.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteBeatAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const beat = await prisma.beat.findUnique({ where: { id } });
  await prisma.beat.delete({ where: { id } });
  await deleteStorageFileByPublicUrl(beat?.coverImageUrl);
  await deleteStorageFileByPublicUrl(beat?.audioUrl);
  refreshPortfolio();
}

export async function moveBeatAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const beat = await prisma.beat.findUnique({ where: { id } });

  if (!beat) {
    refreshPortfolio();
    return;
  }

  const beats = await prisma.beat.findMany({
    where: { profileId: beat.profileId },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = beats.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio();
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= beats.length || targetIndex === currentIndex) {
    refreshPortfolio();
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

  refreshPortfolio();
}

export async function upsertEducationAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const data = {
    degree: getString(formData, "degree"),
    institution: getString(formData, "institution"),
    period: getString(formData, "period"),
    description: getNullableString(formData, "description"),
    sortOrder: id
      ? getNumber(formData, "sortOrder")
      : ((await prisma.education.aggregate({
          where: { profileId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
  };

  if (id) {
    await prisma.education.update({ where: { id }, data });
  } else {
    await prisma.education.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteEducationAction(formData: FormData) {
  await requireAuthenticatedAction();
  await prisma.education.delete({ where: { id: getString(formData, "id") } });
  refreshPortfolio();
}

export async function moveEducationAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const education = await prisma.education.findUnique({ where: { id } });

  if (!education) {
    refreshPortfolio();
    return;
  }

  const educations = await prisma.education.findMany({
    where: { profileId: education.profileId },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = educations.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio();
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= educations.length || targetIndex === currentIndex) {
    refreshPortfolio();
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

  refreshPortfolio();
}

export async function upsertExperienceAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const data = {
    role: getString(formData, "role"),
    company: getString(formData, "company"),
    period: getString(formData, "period"),
    description: getNullableString(formData, "description"),
    sortOrder: id
      ? getNumber(formData, "sortOrder")
      : ((await prisma.experience.aggregate({
          where: { profileId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
  };

  if (id) {
    await prisma.experience.update({ where: { id }, data });
  } else {
    await prisma.experience.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteExperienceAction(formData: FormData) {
  await requireAuthenticatedAction();
  await prisma.experience.delete({ where: { id: getString(formData, "id") } });
  refreshPortfolio();
}

export async function moveExperienceAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const experience = await prisma.experience.findUnique({ where: { id } });

  if (!experience) {
    refreshPortfolio();
    return;
  }

  const experiences = await prisma.experience.findMany({
    where: { profileId: experience.profileId },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = experiences.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio();
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= experiences.length || targetIndex === currentIndex) {
    refreshPortfolio();
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

  refreshPortfolio();
}

export async function upsertSocialLinkAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const data = {
    platform: getString(formData, "platform"),
    url: getString(formData, "url"),
    sortOrder: id
      ? getNumber(formData, "sortOrder")
      : ((await prisma.socialLink.aggregate({
          where: { profileId },
          _max: { sortOrder: true },
        }))._max.sortOrder ?? 0) + 1,
  };

  if (id) {
    await prisma.socialLink.update({ where: { id }, data });
  } else {
    await prisma.socialLink.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteSocialLinkAction(formData: FormData) {
  await requireAuthenticatedAction();
  await prisma.socialLink.delete({ where: { id: getString(formData, "id") } });
  refreshPortfolio();
}

export async function moveSocialLinkAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const direction = getString(formData, "direction");
  const socialLink = await prisma.socialLink.findUnique({ where: { id } });

  if (!socialLink) {
    refreshPortfolio();
    return;
  }

  const socialLinks = await prisma.socialLink.findMany({
    where: { profileId: socialLink.profileId },
    orderBy: { sortOrder: "asc" },
  });

  const currentIndex = socialLinks.findIndex((item) => item.id === id);

  if (currentIndex === -1) {
    refreshPortfolio();
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= socialLinks.length || targetIndex === currentIndex) {
    refreshPortfolio();
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

  refreshPortfolio();
}
