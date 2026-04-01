"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { uploadFileToSupabase } from "@/lib/supabase-admin";
import {
  clearAdminSession,
  createAdminSession,
  getAdminCredentials,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

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

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      fullName: getString(formData, "fullName"),
      heroTitlePrefix: getNullableString(formData, "heroTitlePrefix"),
      heroHighlight: getNullableString(formData, "heroHighlight"),
      heroTitleSuffix: getNullableString(formData, "heroTitleSuffix"),
      heroDescription: getNullableString(formData, "heroDescription"),
      location: getNullableString(formData, "location"),
      profileImageUrl: uploadedProfileImageUrl ?? getNullableString(formData, "profileImageUrl"),
      cvFileUrl: uploadedCvFileUrl ?? getNullableString(formData, "cvFileUrl"),
      aboutSectionTitle: getNullableString(formData, "aboutSectionTitle"),
      footerCreditText: getNullableString(formData, "footerCreditText"),
    },
  });

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
    await prisma.contactInfo.update({
      where: { id: contactInfoId },
      data,
    });
  } else {
    await prisma.contactInfo.create({
      data: {
        profileId,
        ...data,
      },
    });
  }

  refreshPortfolio();
}

export async function upsertServiceAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const data = {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    iconName: getNullableString(formData, "iconName"),
    sortOrder: getNumber(formData, "sortOrder"),
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

export async function upsertProjectAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");

  const uploadedImageUrl = await uploadIfPresent({
    formData,
    fieldName: "imageFile",
    bucket: "projects",
    folder: "images",
  });

  const data = {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    imageUrl: uploadedImageUrl ?? getNullableString(formData, "imageUrl"),
    liveUrl: getNullableString(formData, "liveUrl"),
    sortOrder: getNumber(formData, "sortOrder"),
  };

  if (id) {
    await prisma.project.update({ where: { id }, data });
  } else {
    await prisma.project.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteProjectAction(formData: FormData) {
  await requireAuthenticatedAction();
  await prisma.project.delete({ where: { id: getString(formData, "id") } });
  refreshPortfolio();
}

export async function upsertBeatAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");

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

  const data = {
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    coverImageUrl: uploadedCoverImageUrl ?? getNullableString(formData, "coverImageUrl"),
    audioUrl: uploadedAudioUrl ?? getNullableString(formData, "audioUrl"),
    sortOrder: getNumber(formData, "sortOrder"),
  };

  if (id) {
    await prisma.beat.update({ where: { id }, data });
  } else {
    await prisma.beat.create({ data: { profileId, ...data } });
  }

  refreshPortfolio();
}

export async function deleteBeatAction(formData: FormData) {
  await requireAuthenticatedAction();
  await prisma.beat.delete({ where: { id: getString(formData, "id") } });
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
    sortOrder: getNumber(formData, "sortOrder"),
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

export async function upsertExperienceAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const data = {
    role: getString(formData, "role"),
    company: getString(formData, "company"),
    period: getString(formData, "period"),
    description: getNullableString(formData, "description"),
    sortOrder: getNumber(formData, "sortOrder"),
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

export async function upsertSocialLinkAction(formData: FormData) {
  await requireAuthenticatedAction();
  const id = getString(formData, "id");
  const profileId = getString(formData, "profileId");
  const data = {
    platform: getString(formData, "platform"),
    url: getString(formData, "url"),
    sortOrder: getNumber(formData, "sortOrder"),
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
