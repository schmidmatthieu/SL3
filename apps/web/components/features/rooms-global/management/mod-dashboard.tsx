'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Edit, Save, Settings } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/core/ui/alert-dialog';
import { Button } from '@/components/core/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/core/ui/sheet';
import { ActivityLog } from '@/components/moderation/activity-log';
import { ModTabs } from '@/components/moderation/mod-tabs';
import { QuickActions } from '@/components/moderation/quick-actions';
import { StreamControls } from '@/components/moderation/stream-controls';
import { StreamPreview } from '@/components/moderation/stream-preview';
import { StreamSettings } from '@/components/moderation/stream-settings';
import { StreamStats } from '@/components/moderation/stream-stats';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface ModDashboardProps {
  event: Event;
  room: Room;
}

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

const defaultLayouts = {
  lg: [
    { i: 'stream', x: 0, y: 0, w: 8, h: 8, minW: 6, minH: 6 },
    { i: 'controls', x: 8, y: 0, w: 4, h: 1, minW: 3, minH: 1 },
    { i: 'stats', x: 8, y: 2, w: 4, h: 7, minW: 3, minH: 7 },
    { i: 'content', x: 0, y: 4, w: 8, h: 12, minW: 6, minH: 8 },
    { i: 'activity', x: 8, y: 4, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'actions', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 6 },
  ],
  md: [
    { i: 'stream', x: 0, y: 0, w: 8, h: 4 },
    { i: 'controls', x: 8, y: 0, w: 4, h: 1 },
    { i: 'stats', x: 8, y: 2, w: 4, h: 7 },
    { i: 'content', x: 0, y: 4, w: 8, h: 8 },
    { i: 'activity', x: 8, y: 4, w: 4, h: 4 },
    { i: 'actions', x: 8, y: 8, w: 4, h: 6 },
  ],
  sm: [
    { i: 'stream', x: 0, y: 0, w: 12, h: 4 },
    { i: 'controls', x: 0, y: 4, w: 12, h: 7 },
    { i: 'stats', x: 0, y: 6, w: 12, h: 7 },
    { i: 'content', x: 0, y: 8, w: 12, h: 8 },
    { i: 'activity', x: 0, y: 16, w: 12, h: 4 },
    { i: 'actions', x: 0, y: 20, w: 12, h: 6 },
  ],
};

export function ModDashboard({ event, room }: ModDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem(`mod-layout-${room.id}`);
    if (savedLayout) {
      try {
        setLayouts(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to load saved layout:', e);
      }
    }
  }, [room.id]);

  const handleLayoutChange = (currentLayout: LayoutItem[], allLayouts: any) => {
    setLayouts(allLayouts);
    setHasUnsavedChanges(true);
  };

  const saveLayout = () => {
    localStorage.setItem(`mod-layout-${room.id}`, JSON.stringify(layouts));
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem(`mod-layout-${room.id}`);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setShowResetDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/events/${event.id}/rooms/${room.id}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Moderation Dashboard</h1>
                <p className="text-muted-foreground">{room.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Unsaved changes
                </span>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Stream Settings
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:w-[600px]" side="right">
                  <SheetHeader>
                    <SheetTitle>Stream Settings</SheetTitle>
                    <SheetDescription>Configure stream settings for this room</SheetDescription>
                  </SheetHeader>
                  <div className="py-6">
                    <StreamSettings roomId={room.id} />
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" onClick={() => setShowResetDialog(true)}>
                Reset Layout
              </Button>
              <Button
                variant={isEditMode ? 'default' : 'outline'}
                onClick={() => (isEditMode ? saveLayout() : setIsEditMode(true))}
              >
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Layout
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Layout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <ResponsiveGridLayout
          className={`layout ${isEditMode ? 'layout-edit-mode' : ''}`}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 12, sm: 12 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          <div key="stream" className="shadow-sm">
            <StreamPreview roomId={room.id} />
          </div>
          <div key="controls" className="shadow-sm">
            <StreamControls />
          </div>
          <div key="stats" className="shadow-sm">
            <StreamStats />
          </div>
          <div key="content" className="shadow-sm">
            <ModTabs roomId={room.id} />
          </div>
          <div key="activity" className="shadow-sm">
            <ActivityLog />
          </div>
          <div key="actions" className="shadow-sm">
            <QuickActions />
          </div>
        </ResponsiveGridLayout>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Layout</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the layout to its default state. Any customizations will be lost. Are
              you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetLayout}>Reset Layout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
