import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidSlug, normalizeSlug } from "@/lib/slug";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const value = searchParams.get("value") ?? "";
  const excludeProfileId = searchParams.get("excludeProfileId") ?? "";
  const slug = normalizeSlug(value);

  if (!isValidSlug(slug)) {
    return NextResponse.json({
      slug,
      valid: false,
      available: false,
    });
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({
    slug,
    valid: true,
    available: !existingProfile || existingProfile.id === excludeProfileId,
  });
}
