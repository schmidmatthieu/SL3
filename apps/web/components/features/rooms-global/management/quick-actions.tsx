'use client';

import { useState } from 'react';
import { AlertTriangle, Ban, Clock, MessageSquare, ShieldAlert, Trash2, Users } from 'lucide-react';

import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Input } from '@/components/core/ui/input';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Switch } from '@/components/core/ui/switch';

export function QuickActions() {
  const [slowMode, setSlowMode] = useState(false);
  const [followersOnly, setFollowersOnly] = useState(false);
  const [slowModeDelay, setSlowModeDelay] = useState(30);

  const handleClearChat = () => {
    // Implementation
  };

  const handleEmergencyMode = () => {
    // Implementation
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b flex-none">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Slow Mode</span>
                </div>
                <Switch checked={slowMode} onCheckedChange={setSlowMode} />
              </div>
              {slowMode && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={slowModeDelay}
                    onChange={e => setSlowModeDelay(Number(e.target.value))}
                    className="w-20"
                    min={1}
                    max={300}
                  />
                  <span className="text-sm text-muted-foreground">seconds</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Followers-only Chat</span>
              </div>
              <Switch checked={followersOnly} onCheckedChange={setFollowersOnly} />
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleClearChat}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleEmergencyMode}
              >
                <Ban className="h-4 w-4 mr-2" />
                Emergency Mode
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Recent Actions</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Slow mode enabled (30s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat cleared by moderator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Followers-only mode disabled</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
