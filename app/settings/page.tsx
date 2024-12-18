import { Metadata } from 'next';
import { SettingsForm } from '@/components/settings/settings-form';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences.',
};

export default function SettingsPage() {
  return (
    <div className="container max-w-screen-lg mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <SettingsForm />
    </div>
  );
}
