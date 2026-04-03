import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { registerAction } from "@/app/admin/actions";
import { GoogleAuthButton } from "@/app/google-auth-button";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error: string | undefined) {
  if (error === "missing") {
    return "Please fill in all required fields.";
  }

  if (error === "password") {
    return "Password must be at least 8 characters long.";
  }

  if (error === "email") {
    return "That email is already registered.";
  }

  if (error === "slug") {
    return "That slug is invalid or already taken.";
  }

  if (error === "profile") {
    return "A profile could not be created for this account.";
  }

  if (error === "google") {
    return "Google sign-up failed. Please try again.";
  }

  return null;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="full-height px-4">
      <div className="container" style={{ maxWidth: "640px" }}>
        <div className="bg-base rounded-4 p-4 p-md-5 shadow-effect">
          <p className="text-brand text-uppercase fw-semibold mb-2">Register</p>
          <h1 className="mb-3">Create your own portfolio workspace</h1>
          <p className="mb-4">
            You&apos;ll get a private admin panel and a public portfolio page. Your slug will be generated automatically from your name.
          </p>

          <div className="mb-3">
            <GoogleAuthButton
              href="/api/auth/google?mode=register"
              label="Google मार्फत जारी राख्नुहोस्"
            />
          </div>

          <div className="auth-divider small mb-3">
            <span>OR</span>
          </div>

          {errorMessage ? (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <form action={registerAction} className="row gy-3">
            <div className="col-12">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" className="form-control" required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" minLength={8} required />
            </div>
            <div className="col-12 d-grid">
              <button type="submit" className="btn btn-brand">
                Create Account
              </button>
            </div>
          </form>

          <p className="mt-4 mb-0 small text-white-50">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
