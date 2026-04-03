import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioPage } from "@/app/portfolio-page";
import { getPublishedPortfolioDataBySlug } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

type PortfolioRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PortfolioRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublishedPortfolioDataBySlug(slug);

  if (!profile) {
    return {
      title: "Portfolio Not Found",
    };
  }

  return {
    title: profile.fullName,
    description: profile.heroDescription ?? `Portfolio of ${profile.fullName}`,
  };
}

export default async function PublicPortfolioPage({ params }: PortfolioRouteProps) {
  const { slug } = await params;
  const profile = await getPublishedPortfolioDataBySlug(slug);

  if (!profile) {
    notFound();
  }

  return <PortfolioPage profile={profile} />;
}
