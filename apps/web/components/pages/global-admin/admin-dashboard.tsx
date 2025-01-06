'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Image,
  Paintbrush,
  Settings,
  Shield,
} from 'lucide-react';

import { Button } from '@/components/core/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs';
import { EventsMonitoring } from '@/components/pages/global-admin/events-monitoring';
import { GlobalSettings } from '@/components/pages/global-admin/global-settings';
import { IncidentLogs } from '@/components/pages/global-admin/incident-logs';
import { MediaManagement } from '@/components/pages/global-admin/media-management';
import { StyleManagement } from '@/components/pages/global-admin/style-management';
import { SystemOverview } from '@/components/pages/global-admin/system-overview';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const handleMediaSelect = (url: string) => {
    // Vous pouvez ajouter ici la logique pour gérer la sélection d'un média
    console.log('Media selected:', url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
                <p className="text-muted-foreground">Monitor and manage the SL3 platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events">
                <Shield className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="incidents">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Incidents
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="style">
                <Paintbrush className="h-4 w-4 mr-2" />
                Style
              </TabsTrigger>
              <TabsTrigger value="media">
                <Image className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <EventsMonitoring />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <IncidentLogs />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <GlobalSettings />
          </TabsContent>

          <TabsContent value="style" className="space-y-6">
            <StyleManagement />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaManagement onSelect={handleMediaSelect} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
