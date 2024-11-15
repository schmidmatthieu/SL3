"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemOverview } from '@/components/admin/system-overview';
import { EventsMonitoring } from '@/components/admin/events-monitoring';
import { IncidentLogs } from '@/components/admin/incident-logs';
import { GlobalSettings } from '@/components/admin/global-settings';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

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
                <p className="text-muted-foreground">
                  Monitor and manage the SL3 platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}