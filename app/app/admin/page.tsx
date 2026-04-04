import type { Metadata } from "next";
import { AdminPanelClient } from "./admin-panel-client";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminPublishingSummaryByAdminUserId,
  getPortfolioDataByAdminUserId,
  type AdminPublishingSummary,
  type PortfolioData,
} from "@/lib/portfolio";

type AdminPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const adminUser = await requireAdmin();
  const profile = await getPortfolioDataByAdminUserId(adminUser.id);
  const displayName = profile?.fullName?.trim() || adminUser.email.split("@")[0] || "Portfolio Owner";

  return {
    title: "Portfolio Manager",
    description: `Portfolio Manager dashboard for ${displayName}`,
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const adminUser = await requireAdmin();
  const [profile, publishingSummary]: [PortfolioData | null, AdminPublishingSummary | null] = await Promise.all([
    getPortfolioDataByAdminUserId(adminUser.id),
    getAdminPublishingSummaryByAdminUserId(adminUser.id),
  ]);
  const params = await searchParams;

  if (!profile) {
    return (
      <main className="full-height px-4 text-center d-flex align-items-center justify-content-center">
        <div>
          <h1>No portfolio data found</h1>
          <p>Create a profile record for this account to start editing your portfolio.</p>
        </div>
      </main>
    );
  }

  return (
    <AdminPanelClient
      adminEmail={adminUser.email}
      adminDisplayName={profile.fullName?.trim() || adminUser.email.split("@")[0] || "Portfolio Owner"}
      profile={profile}
      publishingSummary={publishingSummary}
      error={params.error}
      saved={params.saved}
    />
  );
}
