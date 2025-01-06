'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';

const mockData = [
  { name: 'Tickets Sold', value: 150 },
  { name: 'Revenue (CHF)', value: 7500 },
  { name: 'Registrations', value: 200 },
  { name: 'Waitlist', value: 25 },
];

const chartData = [
  { date: 'Mon', tickets: 20 },
  { date: 'Tue', tickets: 35 },
  { date: 'Wed', tickets: 45 },
  { date: 'Thu', tickets: 30 },
  { date: 'Fri', tickets: 50 },
  { date: 'Sat', tickets: 65 },
  { date: 'Sun', tickets: 40 },
];

export function ViewAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Sales Overview</CardTitle>
          <CardDescription>Daily ticket sales for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="hsl(267, 100%, 65%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
