import { LoginFormOAuth } from "@/components/auth/login-form-oauth";
import { Link } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sign In - ATP Trading",
  description:
    "Sign in to your ATP account to access exclusive member benefits and manage your wellness journey.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-atp-gray-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <LoginFormOAuth />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            New to ATP Trading?
          </p>
          <Link
            href="/atp-membership"
            className="inline-flex items-center gap-2 text-atp-gold hover:underline font-medium"
          >
            Explore ATP Membership Benefits
          </Link>
        </div>
      </div>
    </div>
  );
}
