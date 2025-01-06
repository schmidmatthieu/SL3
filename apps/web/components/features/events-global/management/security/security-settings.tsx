'use client';

import { AlertTriangle, Shield } from 'lucide-react';

import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Input } from '@/components/core/ui/input';
import { Label } from '@/components/core/ui/label';
import { Switch } from '@/components/core/ui/switch';

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Control
          </CardTitle>
          <CardDescription>Configure who can access your event and how</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Registration</Label>
              <p className="text-sm text-muted-foreground">
                Users must register to access event details
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Verification</Label>
              <p className="text-sm text-muted-foreground">Verify attendee email addresses</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Access Code</Label>
            <Input type="text" placeholder="Enter access code" />
            <p className="text-sm text-muted-foreground">
              Optional: Require an access code to register
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control what information is visible to attendees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Attendee List Visibility</Label>
              <p className="text-sm text-muted-foreground">Show list of registered attendees</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Contact Information Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow attendees to see each other&apos;s contact info
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Social Media Integration</Label>
              <p className="text-sm text-muted-foreground">Allow social media sharing</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}
