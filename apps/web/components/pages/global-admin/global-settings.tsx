'use client';

import { useState } from 'react';
import { AlertTriangle, MessageSquare, Save, Settings, Shield, Users } from 'lucide-react';

import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Input } from '@/components/core/ui/input';
import { Slider } from '@/components/core/ui/slider';
import { Switch } from '@/components/core/ui/switch';

export function GlobalSettings() {
  const [automod, setAutomod] = useState({
    links: true,
    spam: true,
    caps: true,
    profanity: true,
  });

  const [limits, setLimits] = useState({
    maxViewers: 10000,
    maxRooms: 50,
    messageDelay: 3,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Platform Configuration</h2>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              AutoMod Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Block Links</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically remove messages containing URLs
                  </div>
                </div>
                <Switch
                  checked={automod.links}
                  onCheckedChange={checked => setAutomod(prev => ({ ...prev, links: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Spam Detection</div>
                  <div className="text-sm text-muted-foreground">
                    Filter repeated messages and patterns
                  </div>
                </div>
                <Switch
                  checked={automod.spam}
                  onCheckedChange={checked => setAutomod(prev => ({ ...prev, spam: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Excessive Caps</div>
                  <div className="text-sm text-muted-foreground">
                    Filter messages with too many capital letters
                  </div>
                </div>
                <Switch
                  checked={automod.caps}
                  onCheckedChange={checked => setAutomod(prev => ({ ...prev, caps: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Profanity Filter</div>
                  <div className="text-sm text-muted-foreground">
                    Block messages containing inappropriate language
                  </div>
                </div>
                <Switch
                  checked={automod.profanity}
                  onCheckedChange={checked => setAutomod(prev => ({ ...prev, profanity: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Max Viewers per Room</div>
                  <span className="text-sm text-muted-foreground">
                    {limits.maxViewers.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[limits.maxViewers]}
                  max={20000}
                  step={100}
                  onValueChange={([value]) => setLimits(prev => ({ ...prev, maxViewers: value }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Max Rooms per Event</div>
                  <span className="text-sm text-muted-foreground">{limits.maxRooms}</span>
                </div>
                <Slider
                  value={[limits.maxRooms]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setLimits(prev => ({ ...prev, maxRooms: value }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Chat Message Delay (seconds)</div>
                  <span className="text-sm text-muted-foreground">{limits.messageDelay}s</span>
                </div>
                <Slider
                  value={[limits.messageDelay]}
                  max={10}
                  step={1}
                  onValueChange={([value]) => setLimits(prev => ({ ...prev, messageDelay: value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Default Username Pattern</label>
              <Input placeholder="user_{random_id}" defaultValue="user_{random_id}" />
            </div>

            <div>
              <label className="text-sm font-medium">Username Minimum Length</label>
              <Input type="number" defaultValue="3" min="3" max="20" />
            </div>

            <div>
              <label className="text-sm font-medium">Maximum Concurrent Sessions</label>
              <Input type="number" defaultValue="5" min="1" max="10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message Length Limit</label>
              <Input type="number" defaultValue="500" min="1" max="1000" />
            </div>

            <div>
              <label className="text-sm font-medium">Emote Limit per Message</label>
              <Input type="number" defaultValue="10" min="1" max="50" />
            </div>

            <div>
              <label className="text-sm font-medium">Chat History Duration (hours)</label>
              <Input type="number" defaultValue="24" min="1" max="72" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
