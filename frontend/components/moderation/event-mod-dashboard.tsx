import React from 'react';
import { Event } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventModDashboardProps {
  event: Event;
}

export function EventModDashboard({ event }: EventModDashboardProps): JSX.Element {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{event.title}</span>
            <Badge variant={event.status === 'live' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}>
              {event.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Event Details</h3>
              <div className="space-y-2">
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Rooms:</strong> {event.rooms}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}