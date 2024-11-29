"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Signal,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
} from 'lucide-react';

export function StreamStats() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b flex-none">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Signal className="h-4 w-4" />
          Stream Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Viewers</span>
                <span className="font-medium flex items-center gap-1 text-green-500">
                  <ArrowUpRight className="h-3 w-3" />
                  1,234
                </span>
              </div>
              <Progress value={72} className="h-1" />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="text-sm font-medium">02:34:15</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Quality</span>
                </div>
                <span className="text-sm font-medium">1080p60</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Bitrate</span>
                </div>
                <span className="text-sm font-medium">6000 Kbps</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dropped Frames</span>
                </div>
                <span className="text-sm font-medium text-yellow-500">0.2%</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium">System Health</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPU Usage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Load</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <Progress value={28} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}