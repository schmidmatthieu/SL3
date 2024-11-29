"use client";

import { Event } from '@/types/event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoomOverview } from '@/components/management/room-overview';
import { ModeratorManagement } from '@/components/management/moderator-management';
import { TimelineManagement } from '@/components/management/timeline-management';
import { AnalyticsDashboard } from '@/components/management/analytics-dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EventManagementProps {
  event: Event;
}

export function EventManagement({ event }: EventManagementProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/events/${event.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Event Management
              </h1>
              <p className="text-muted-foreground">{event.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderators">Moderators</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <RoomOverview eventId={event.id} />
          </TabsContent>

          <TabsContent value="moderators">
            <ModeratorManagement eventId={event.id} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineManagement eventId={event.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard eventId={event.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}