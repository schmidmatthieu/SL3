'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserPlus,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { Badge } from '@/components/core/ui/badge';
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

interface ModeratorManagementProps {
  eventId: string;
}

interface Moderator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'moderator';
  assignedRooms: string[];
  status: 'active' | 'inactive';
}

const mockModerators: Moderator[] = Array.from({ length: 10 }, (_, i) => ({
  id: `mod-${i}`,
  name: `Moderator ${i + 1}`,
  email: `mod${i + 1}@example.com`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=mod${i}`,
  role: i === 0 ? 'admin' : 'moderator',
  assignedRooms: Array.from(
    { length: Math.floor(Math.random() * 3) + 1 },
    (_, j) => `Room ${j + 1}`
  ),
  status: Math.random() > 0.2 ? 'active' : 'inactive',
}));

export function ModeratorManagement({ eventId }: ModeratorManagementProps) {
  const [moderators, setModerators] = useState(mockModerators);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModerators = moderators.filter(
    mod =>
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModeratorAction = (modId: string, action: 'promote' | 'demote' | 'remove') => {
    setModerators(prev =>
      action === 'remove'
        ? prev.filter(m => m.id !== modId)
        : prev.map(m =>
            m.id === modId ? { ...m, role: action === 'promote' ? 'admin' : 'moderator' } : m
          )
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Active Moderators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {moderators.filter(m => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {moderators.filter(m => m.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldX className="h-4 w-4" />
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {moderators.filter(m => m.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Moderators</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search moderators..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-xs"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Moderator
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filteredModerators.map(mod => (
                <Card key={mod.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={mod.avatar} />
                          <AvatarFallback>{mod.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mod.name}</span>
                            <Badge variant={mod.role === 'admin' ? 'default' : 'secondary'}>
                              <Shield className="h-3 w-3 mr-1" />
                              {mod.role}
                            </Badge>
                            {mod.status === 'inactive' && (
                              <Badge variant="outline" className="text-yellow-500">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{mod.email}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {mod.assignedRooms.length > 0
                              ? `Assigned to: ${mod.assignedRooms.join(', ')}`
                              : 'No rooms assigned'}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {mod.role !== 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleModeratorAction(mod.id, 'promote')}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </DropdownMenuItem>
                          )}
                          {mod.role === 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleModeratorAction(mod.id, 'demote')}
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Demote to Moderator
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleModeratorAction(mod.id, 'remove')}
                            className="text-destructive"
                          >
                            <ShieldX className="h-4 w-4 mr-2" />
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
