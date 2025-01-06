'use client';

import { useState } from 'react';
import { AlertTriangle, Ban, Clock, MoreVertical, Search, Settings, Shield } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/core/ui/dropdown-menu';
import { Input } from '@/components/core/ui/input';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Switch } from '@/components/core/ui/switch';

interface ChatModerationProps {
  roomId: string;
}

interface ActiveUser {
  id: string;
  username: string;
  avatar?: string;
  isMod?: boolean;
  messages: number;
  status: 'active' | 'warned' | 'timed-out';
}

const mockUsers: ActiveUser[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i}`,
  username: `User${i}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  isMod: i === 0,
  messages: Math.floor(Math.random() * 100),
  status: ['active', 'warned', 'timed-out'][Math.floor(Math.random() * 3)] as ActiveUser['status'],
}));

export function ChatModeration({ roomId }: ChatModerationProps) {
  const [automod, setAutomod] = useState({
    links: true,
    caps: true,
    spam: true,
    profanity: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserAction = (userId: string, action: 'timeout' | 'ban' | 'mod') => {
    console.log(`${action} user ${userId}`);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold">AutoMod Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Block Links</span>
            </div>
            <Switch
              checked={automod.links}
              onCheckedChange={checked => setAutomod(prev => ({ ...prev, links: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Excessive Caps</span>
            </div>
            <Switch
              checked={automod.caps}
              onCheckedChange={checked => setAutomod(prev => ({ ...prev, caps: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Spam Detection</span>
            </div>
            <Switch
              checked={automod.spam}
              onCheckedChange={checked => setAutomod(prev => ({ ...prev, spam: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Profanity Filter</span>
            </div>
            <Switch
              checked={automod.profanity}
              onCheckedChange={checked => setAutomod(prev => ({ ...prev, profanity: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="border-b p-4 flex-none">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Active Users</CardTitle>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-sm"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.username}</span>
                        {user.isMod && <Shield className="h-3 w-3 text-primary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {user.messages} messages
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUserAction(user.id, 'timeout')}>
                        <Clock className="h-4 w-4 mr-2" />
                        Timeout
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUserAction(user.id, 'ban')}
                        className="text-destructive"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </DropdownMenuItem>
                      {!user.isMod && (
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'mod')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Moderator
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
