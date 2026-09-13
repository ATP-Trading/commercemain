import { AccountDashboard } from '@/components/account/account-dashboard';

export const metadata = {
  title: 'My Account | ATP Trading',
  description: 'Manage your profile, orders, and membership.',
};

export default function AccountPage() {
  return <AccountDashboard />;
}