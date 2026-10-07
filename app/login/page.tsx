import { signIn } from "@/auth";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Login - TrackIt Load Balancer",
  description: "Sign in with Google to access the TrackIt Load Balancer console",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = params?.callbackUrl;

  const isAccessDenied =
    error === "AccessDenied" ||
    error === "OAuthSignin" ||
    error === "CallbackRouteError" ||
    error === "OAuthCallbackError";

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            TrackIt Console
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your authorized Google account to manage projects, servers, and load balancer settings.
          </p>
        </div>

        {isAccessDenied && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800"
          >
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Access denied</p>
              <p className="mt-0.5 text-xs text-red-700">
                This account is not authorized. Please sign in with an allowlisted Google account.
              </p>
            </div>
          </div>
        )}

        <form
          action={async () => {
            "use server";
            // Safe redirect target
            const safeRedirect =
              callbackUrl &&
              callbackUrl.startsWith("/") &&
              !callbackUrl.startsWith("//")
                ? callbackUrl
                : "/dashboard";

            await signIn("google", {
              redirectTo: safeRedirect,
            });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400">
            Secured with Google OAuth 2.0 and database-enforced RBAC.
          </p>
        </div>
      </div>
    </div>
  );
}
