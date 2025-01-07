'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/lib/store/event.store';
import { format } from 'date-fns';
import {
  Activity,
  BarChart,
  Calendar,
  Clock,
  Eye,
  Lock,
  MoreVertical,
  Settings,
  Shield,
  Unlock,
  Users,
  ChevronRight,
  Mic,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Event } from '@/types/event';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/core/ui/alert';
import { BackButton } from '@/components/core/ui/back-button';
import { Badge } from '@/components/core/ui/badge';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/core/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/core/ui/dropdown-menu';
import { Separator } from '@/components/core/ui/separator';
import { EventStatusBadge } from '@/components/features/events-global/status/event-status-badge';

interface EventDashboardProps {
  event: Event;
  slug: string;
}

export function EventDashboard({ event, slug }: EventDashboardProps) {
  const router = useRouter();
  const { updateEventStatus } = useEventStore();
  const { t } = useTranslation('components/event-manage');

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) return t('common:noDateSet');
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return t('common:invalidDate');
      return format(dateObj, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('common:invalidDate');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEventStatus(slug, newStatus as Event['status']);
      router.refresh();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const navigateToEventPage = (path: string) => {
    if (!slug) return;
    router.push(`/events/${slug}/manage${path}`);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <BackButton />
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="glass-effect"
            onClick={() => navigateToEventPage('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('quickActions.eventSettings')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass-effect">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigateToEventPage('')}>
                <Eye className="mr-2 h-4 w-4" />
                {t('dashboard.viewEvent')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                <Lock className="mr-2 h-4 w-4" />
                {t('dashboard.actions.startEvent')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('ended')}>
                <Unlock className="mr-2 h-4 w-4" />
                {t('dashboard.actions.endEvent')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('scheduled')}>
                <Calendar className="mr-2 h-4 w-4" />
                {t('dashboard.actions.reopenEvent')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.status.title')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <EventStatusBadge event={event} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.rooms.title')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.rooms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.rooms.activeRooms')}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.duration.title')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(event.startDateTime)}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.duration.to')} {formatDate(event.endDateTime)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigateToEventPage('/rooms')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5" />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{t('quickActions.manageRooms')}</CardTitle>
            <CardDescription>Gérez les salles et les streams</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-effect hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigateToEventPage('/analytics')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <BarChart className="h-5 w-5" />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{t('quickActions.viewAnalytics')}</CardTitle>
            <CardDescription>Statistiques et analyses</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-effect hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigateToEventPage('/speakers')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Mic className="h-5 w-5" />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{t('quickActions.manageSpeakers')}</CardTitle>
            <CardDescription>Gérez les orateurs de l'événement</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-effect hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => navigateToEventPage('/security')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Shield className="h-5 w-5" />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{t('quickActions.security')}</CardTitle>
            <CardDescription>Sécurité et accès</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
