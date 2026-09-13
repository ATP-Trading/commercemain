import { SignupFormOAuth } from "@/components/auth/signup-form-oauth";
import { Link } from "@/src/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Create Account - ATP Trading",
  description:
    "Join ATP Trading and unlock exclusive wellness benefits with our premium membership program.",
};

export default function SignupPage() {
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

        <SignupFormOAuth />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Join thousands of satisfied customers
          </p>
          <Link
            href="/atp-membership"
            className="inline-flex items-center gap-2 text-atp-gold hover:underline font-medium"
          >
            Learn More About ATP Membership Benefits
          </Link>
        </div>
      </div>
    </div>
  );
}
