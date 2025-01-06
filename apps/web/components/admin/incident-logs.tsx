'use client';

import { useState } from 'react';
import { AlertTriangle, Ban, Download, MessageSquare, Search, Shield, UserX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Incident {
  id: string;
  type: 'ban' | 'warning' | 'timeout' | 'report';
  eventId: string;
  roomId: string;
  moderator: string;
  target: string;
  reason: string;
  timestamp: Date;
}

const mockIncidents: Incident[] = Array.from({ length: 20 }, (_, i) => ({
  id: `inc-${i}`,
  type: ['ban', 'warning', 'timeout', 'report'][Math.floor(Math.random() * 4)] as Incident['type'],
  eventId: `event-${Math.floor(Math.random() * 3) + 1}`,
  roomId: `room-${Math.floor(Math.random() * 5) + 1}`,
  moderator: `Moderator ${Math.floor(Math.random() * 5) + 1}`,
  target: `User${Math.floor(Math.random() * 100) + 1}`,
  reason: ['Spam', 'Inappropriate content', 'Harassment', 'Multiple violations'][
    Math.floor(Math.random() * 4)
  ],
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
}));

const incidentIcons = {
  ban: Ban,
  warning: AlertTriangle,
  timeout: UserX,
  report: MessageSquare,
};

const incidentColors = {
  ban: 'text-red-500',
  warning: 'text-yellow-500',
  timeout: 'text-orange-500',
  report: 'text-blue-500',
};

export function IncidentLogs() {
  const [incidents] = useState(mockIncidents);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch =
      incident.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.moderator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || incident.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Moderation Activity</h2>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Incident Log</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-[300px]"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ban">Bans</SelectItem>
                  <SelectItem value="warning">Warnings</SelectItem>
                  <SelectItem value="timeout">Timeouts</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredIncidents.map(incident => {
                const Icon = incidentIcons[incident.type];
                return (
                  <Card key={incident.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 ${incidentColors[incident.type]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{incident.target}</span>
                              <Badge variant="secondary">{incident.type.toUpperCase()}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {incident.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{incident.reason}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>by {incident.moderator}</span>
                            <span>•</span>
                            <span>Event {incident.eventId}</span>
                            <span>•</span>
                            <span>Room {incident.roomId}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
