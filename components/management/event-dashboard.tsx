'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/store/event.store';
import { format } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  BarChart,
  Calendar,
  Clock,
  Eye,
  Lock,
  MoreVertical,
  Search,
  Settings,
  Shield,
  Unlock,
  Users,
} from 'lucide-react';

import { Event } from '@/types/event';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EventDashboardProps {
  event: Event;
  eventId: string;
}

export function EventDashboard({ event, eventId }: EventDashboardProps) {
  console.log('EventDashboard - Component mounted with event:', event);
  const router = useRouter();
  const { updateEventStatus } = useEventStore();
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) return 'No date set';
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      return format(dateObj, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log('EventDashboard - Updating status to:', newStatus);
    try {
      await updateEventStatus(eventId, newStatus as Event['status']);
      console.log('EventDashboard - Status updated successfully');
      router.refresh();
    } catch (error) {
      console.error('EventDashboard - Error updating event status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'ended':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Live';
      case 'ended':
        return 'Ended';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  };

  const navigateToEventPage = (path: string) => {
    if (!eventId) {
      console.error('No event ID available');
      return;
    }
    router.push(`/events/${eventId}${path}`);
  };

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground mt-2">{event.description}</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="glass-effect"
            onClick={() => navigateToEventPage('')}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Event
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass-effect">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                <Lock className="mr-2 h-4 w-4" /> Start Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('ended')}>
                <Unlock className="mr-2 h-4 w-4" /> End Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('scheduled')}>
                <Calendar className="mr-2 h-4 w-4" /> Reopen Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={cn('h-3 w-3 rounded-full', getStatusColor(event.status))} />
              <div className="text-2xl font-bold">{getDisplayStatus(event.status)}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.rooms?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active Rooms</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(event.startDateTime)}</div>
            <p className="text-xs text-muted-foreground">to {formatDate(event.endDateTime)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Button
          variant="outline"
          className="h-20 glass-effect"
          onClick={() => navigateToEventPage('/rooms')}
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Rooms
        </Button>
        <Button
          variant="outline"
          className="h-20 glass-effect"
          onClick={() => navigateToEventPage('/analytics')}
        >
          <BarChart className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
        <Button
          variant="outline"
          className="h-20 glass-effect"
          onClick={() => navigateToEventPage('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Event Settings
        </Button>
        <Button
          variant="outline"
          className="h-20 glass-effect"
          onClick={() => navigateToEventPage('/security')}
        >
          <Shield className="mr-2 h-4 w-4" />
          Security
        </Button>
      </div>

      {/* Timeline and Speakers */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 glass-effect">
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                <span className="text-sm">Created on {formatDate(event.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                <span className="text-sm">Starts on {formatDate(event.startDateTime)}</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                <span className="text-sm">Ends on {formatDate(event.endDateTime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="md:col-span-3">
          <Button
            variant="outline"
            className="w-full h-[200px] glass-effect"
            onClick={() => navigateToEventPage('/speakers')}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Users className="h-12 w-12" />
              <div className="text-xl">Manage Speakers</div>
              <div className="text-sm text-muted-foreground">
                Add, edit, or remove event speakers
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
