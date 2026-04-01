import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const portfolioDataArgs = Prisma.validator<Prisma.ProfileDefaultArgs>()({
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

export type PortfolioData = Prisma.ProfileGetPayload<typeof portfolioDataArgs>;

export async function getPortfolioData() {
  return prisma.profile.findFirst(portfolioDataArgs);
}
