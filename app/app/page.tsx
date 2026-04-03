import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LandingPortfolioCarousel } from "@/app/landing-portfolio-carousel";
import { getPublicPortfolioList } from "@/lib/portfolio";
import { PORTFOLIO_ROLES } from "@/lib/portfolio-config";

const roleLabelMap = Object.fromEntries(PORTFOLIO_ROLES.map((role) => [role.value, role.label])) as Record<string, string>;

export default async function Home() {
  const [isAuthenticated, portfolios] = await Promise.all([
    isAdminAuthenticated(),
    getPublicPortfolioList(12),
  ]);

  const primaryHref = isAuthenticated ? "/admin" : "/register";
  const primaryLabel = isAuthenticated ? "Open Dashboard" : "Create Your Portfolio";
  const secondaryHref = isAuthenticated ? "/admin" : "/login";
  const secondaryLabel = isAuthenticated ? "Manage Portfolio" : "Login";
  const topPrimaryHref = isAuthenticated ? "/admin" : "/register";
  const topPrimaryLabel = isAuthenticated ? "Dashboard" : "Register Now";
  const topSecondaryHref = isAuthenticated ? "/admin" : "/login";
  const topSecondaryLabel = isAuthenticated ? "Manage" : "Login";

  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="container">
          <div className="landing-topbar">
            <Link href="/" className="landing-logo">
              Portfolio Manager
            </Link>
            <div className="landing-auth-links">
              <Link href={topSecondaryHref} className="landing-auth-link">
                {topSecondaryLabel}
              </Link>
              <Link href={topPrimaryHref} className="landing-auth-button">
                {topPrimaryLabel}
              </Link>
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="landing-hero-copy">
              <p className="landing-kicker">For new creators, freelancers, studios, and modern portfolio owners</p>
              <h1 className="landing-title">Create and manage your portfolio on the go.</h1>
             

              

              <div className="landing-stat-grid">
                <div className="landing-stat-card">
                  <span className="landing-stat-value">{portfolios.length}+</span>
                  <span className="landing-stat-label">Public portfolios to browse</span>
                </div>
                <div className="landing-stat-card">
                  <span className="landing-stat-value">1 slug</span>
                  <span className="landing-stat-label">Personal URL for every creator</span>
                </div>
                <div className="landing-stat-card">
                  <span className="landing-stat-value">Private admin</span>
                  <span className="landing-stat-label">Edit only your own content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="container">
          <div className="landing-section-header">
            <div>
              <p className="landing-section-kicker landing-section-kicker-lg">Public portfolio feed</p>
              <h2>See the creators already live on the platform</h2>
            </div>
           
          </div>

          {portfolios.length > 0 ? (
            <LandingPortfolioCarousel portfolios={portfolios} roleLabelMap={roleLabelMap} />
          ) : (
            <div className="landing-empty-state">
              <h3>No public portfolios yet</h3>
              <p>Be the first creator to publish a profile and turn this page into a live showcase.</p>
              <Link href="/register" className="btn btn-brand">
                Create the First Portfolio
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="landing-section landing-section-muted">
        <div className="container">
          <div className="landing-feature-grid">
            <div className="landing-feature-card">
              <p className="landing-section-kicker">Step 1</p>
              <h2>Register or login at the top</h2>
              <p>New users can create an account fast, and returning users can jump straight into their dashboard.</p>
            </div>
            <div className="landing-feature-card">
              <p className="landing-section-kicker">Step 2</p>
              <h2>Build your own public identity</h2>
              <p>Add projects, services, social links, beats, visual work, and personal profile details in one place.</p>
            </div>
            <div className="landing-feature-card">
              <p className="landing-section-kicker">Step 3</p>
              <h2>Share your public slug everywhere</h2>
              <p>Your work stays easy to discover with a simple public URL that anyone can open and explore.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
