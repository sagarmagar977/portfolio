import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loginAction } from "@/app/admin/actions";
import { GoogleAuthButton } from "@/app/google-auth-button";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error: string | undefined) {
  if (error === "invalid") {
    return "Invalid email or password.";
  }

  if (error === "google") {
    return "Google sign-in failed. Please try again.";
  }

  if (error === "google_cancelled") {
    return "Google sign-in was cancelled before it finished.";
  }

  if (error === "google_state") {
    return "Your Google sign-in session expired. Please try again.";
  }

  if (error === "google_account") {
    return "We couldn't match that Google account. Please try again or use your password.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="full-height px-4">
      <div className="container" style={{ maxWidth: "560px" }}>
        <div className="bg-base rounded-4 p-4 p-md-5 shadow-effect">
          <p className="text-brand text-uppercase fw-semibold mb-2">Login</p>
          <h1 className="mb-3">Sign in to your portfolio dashboard</h1>
          <p className="mb-4">
            Access your private admin panel and manage only your own public portfolio.
          </p>

          <div className="mb-3">
            <GoogleAuthButton
              href="/api/auth/google?mode=login"
              label="Google मार्फत जारी राख्नुहोस्"
            />
          </div>

          <p className="small text-white-50 mb-3">
            First-time Google users will get an account created automatically.
          </p>

          <div className="auth-divider small mb-3">
            <span>OR</span>
          </div>

          {errorMessage ? (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <form action={loginAction} className="row gy-3">
            <div className="col-12">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" required />
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
            New here? <Link href="/register">Create your account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
