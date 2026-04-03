import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { buildInitialSlug, isValidSlug } from "@/lib/slug";

export async function buildUniqueProfileSlug(seed: string) {
  const baseSlug = buildInitialSlug(seed, "my-portfolio");
  const candidate = isValidSlug(baseSlug) ? baseSlug : "my-portfolio";

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const slug = suffix === 0 ? candidate : `${candidate}-${suffix + 1}`;
    const existing = await prisma.profile.findUnique({ where: { slug } });

    if (!existing) {
      return slug;
    }
  }

  return `${candidate}-${randomBytes(3).toString("hex")}`;
}

export function buildDefaultProfileData(options: {
  fullName: string;
  slug: string;
  email: string;
}) {
  return {
    slug: options.slug,
    templateKey: "classic",
    roles: ["developer"],
    fullName: options.fullName,
    heroTitlePrefix: "I build",
    heroHighlight: "software",
    heroTitleSuffix: "for the web",
    heroDescription: "This is a starter portfolio profile. Replace this placeholder copy with your own introduction, work, and contact details.",
    profileImageUrl: null,
    cvFileUrl: null,
    aboutSectionTitle: "Education & Experience",
    contactInfo: {
      create: {
        sectionLabel: "GET IN TOUCH",
        heading: "Let’s build something useful",
        description: "Add your email, phone number, or any preferred contact details when you are ready.",
        phone: null,
        email: options.email,
      },
    },
  };
}
