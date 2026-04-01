import { prisma } from "@/lib/prisma";

export async function getPortfolioData() {
  return prisma.profile.findFirst({
    include: {
      services: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { sortOrder: "asc" } },
      beats: { orderBy: { sortOrder: "asc" } },
      educations: { orderBy: { sortOrder: "asc" } },
      experiences: { orderBy: { sortOrder: "asc" } },
      socialLinks: { orderBy: { sortOrder: "asc" } },
      contactInfo: true,
    },
  });
}
