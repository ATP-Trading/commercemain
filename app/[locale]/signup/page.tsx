import { SignupFormOAuth } from "@/components/auth/signup-form-oauth";
import { Link } from "@/src/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

type SignupPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: SignupPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: `${t('createAccount')} - ATP Trading`, description: t('oauthSignupDescription') };
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return (
    <div className="min-h-screen bg-gradient-to-b from-atp-gray-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('backToHome')}
          </Link>
        </div>

        <SignupFormOAuth />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('oauthSignupDescription')}
          </p>
          <Link
            href="/atp-membership"
            className="inline-flex items-center gap-2 text-atp-gold hover:underline font-medium"
          >
            {t('exploreMembershipBenefits')}
          </Link>
        </div>
      </div>
    </div>
  );
}
