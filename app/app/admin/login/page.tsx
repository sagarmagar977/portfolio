import { redirect } from "next/navigation";
import { getAdminCredentials, isAdminAuthenticated } from "@/lib/admin-auth";
import { loginAction } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const credentials = getAdminCredentials();

  return (
    <main className="full-height px-4">
      <div className="container" style={{ maxWidth: "560px" }}>
        <div className="bg-base rounded-4 p-4 p-md-5 shadow-effect">
          <p className="text-brand text-uppercase fw-semibold mb-2">Admin</p>
          <h1 className="mb-3">Portfolio Admin Login</h1>
          <p className="mb-4">
            Sign in to update the same sections that appear on your portfolio.
          </p>

          {params.error ? (
            <div className="alert alert-danger" role="alert">
              Invalid email or password.
            </div>
          ) : null}

          <form action={loginAction} className="row gy-3">
            <div className="col-12">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={credentials.email}
                className="form-control"
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" required />
            </div>
            <div className="col-12 d-grid">
              <button type="submit" className="btn btn-brand">
                Sign In
              </button>
            </div>
          </form>

          <p className="mt-4 mb-0 small text-white-50">
            Set <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code>, and <code>ADMIN_SESSION_SECRET</code> in your environment before deployment.
          </p>
        </div>
      </div>
    </main>
  );
}
