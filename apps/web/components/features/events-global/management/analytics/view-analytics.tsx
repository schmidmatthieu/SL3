'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Event } from '@/types/event';

interface ViewAnalyticsProps {
  event: Event;
}

export function ViewAnalytics({ event }: ViewAnalyticsProps) {
  const analyticsData = useMemo(() => {
    return [
      { 
        name: 'Tickets Sold', 
        value: event.registrations?.filter(r => r.status === 'CONFIRMED').length || 0 
      },
      { 
        name: 'Revenue (CHF)', 
        value: event.registrations
          ?.filter(r => r.status === 'CONFIRMED')
          .reduce((acc, reg) => acc + (reg.ticket?.price || 0), 0) || 0
      },
      { 
        name: 'Registrations', 
        value: event.registrations?.length || 0 
      },
      { 
        name: 'Waitlist', 
        value: event.registrations?.filter(r => r.status === 'WAITLIST').length || 0 
      },
    ];
  }, [event]);

  const chartData = useMemo(() => {
    const registrationsByDay = event.registrations?.reduce((acc, reg) => {
      const date = new Date(reg.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return Object.entries(registrationsByDay).map(([date, tickets]) => ({
      date,
      tickets,
    }));
  }, [event]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.name}
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                {item.value}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations Over Time</CardTitle>
          <CardDescription>Daily registration count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
