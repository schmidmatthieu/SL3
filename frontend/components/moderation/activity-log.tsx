"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, UserPlus, MessageSquare, Ban } from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'warning' | 'user' | 'chat' | 'mod';
  message: string;
  timestamp: Date;
}

const typeIcons = {
  warning: AlertCircle,
  user: UserPlus,
  chat: MessageSquare,
  mod: Ban,
};

const typeColors = {
  warning: 'bg-yellow-500',
  user: 'bg-green-500',
  chat: 'bg-blue-500',
  mod: 'bg-red-500',
};

export function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: '1',
        type: 'warning',
        message: 'High CPU usage detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: '2',
        type: 'user',
        message: 'New user joined: JohnDoe',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
      },
      {
        id: '3',
        type: 'chat',
        message: 'Chat cleared by moderator',
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
      },
      {
        id: '4',
        type: 'mod',
        message: 'User TrollUser123 banned',
        timestamp: new Date(Date.now() - 1000 * 60),
      },
    ];

    setLogs(initialLogs);

    // Simulate new logs
    const interval = setInterval(() => {
      const types: ('warning' | 'user' | 'chat' | 'mod')[] = [
        'warning',
        'user',
        'chat',
        'mod',
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message: `Random ${type} event occurred`,
        timestamp: new Date(),
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b flex-none">
        <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4"
              >
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    typeColors[log.type]
                  }`}
                />
                <div className="space-y-1">
                  <p>{log.message}</p>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {log.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}