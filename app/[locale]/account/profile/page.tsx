import { ProfileForm } from '@/components/account/profile-form'
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return { title: { absolute: `${locale === 'ar' ? 'تعديل الملف الشخصي' : 'Edit profile'} | ATP Trading` }, robots: { index: false, follow: false } }
}
export default function ProfilePage() { return <ProfileForm /> }
