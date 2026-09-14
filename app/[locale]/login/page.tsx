import { LoginFormOAuth } from "@/components/auth/login-form-oauth";
import { Link } from "@/src/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

type LoginPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return {
    title: `${t('signIn')} - ATP Trading`,
    description: t('signInDescriptionOAuth'),
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
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

        <LoginFormOAuth />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('newToAtp')}
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
