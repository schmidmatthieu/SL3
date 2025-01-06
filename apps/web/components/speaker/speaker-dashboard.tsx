'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Edit, Save } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PresentationArea } from '@/components/speaker/presentation-area';
import { SidePanel } from '@/components/speaker/side-panel';
import { SourceControls } from '@/components/speaker/source-controls';
import { StreamPreview } from '@/components/speaker/stream-preview';
import { Toolbar } from '@/components/speaker/toolbar';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface SpeakerDashboardProps {
  event: Event;
  room: Room;
}

type PanelContent = 'questions' | 'chat' | 'files';
type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

// Updated layouts with toolbar at the top
const defaultLayouts = {
  lg: [
    { i: 'toolbar', x: 0, y: 0, w: 12, h: 1, minW: 12, minH: 1, static: true },
    { i: 'stream', x: 0, y: 1, w: 8, h: 6, minW: 4, minH: 3 },
    { i: 'source', x: 8, y: 1, w: 4, h: 6, minW: 3, minH: 3 },
    { i: 'presentation', x: 0, y: 7, w: 8, h: 7, minW: 6, minH: 4 },
    { i: 'side-panel', x: 8, y: 7, w: 4, h: 7, minW: 3, minH: 6 },
  ],
  md: [
    { i: 'toolbar', x: 0, y: 0, w: 12, h: 1, static: true },
    { i: 'stream', x: 0, y: 1, w: 8, h: 6 },
    { i: 'source', x: 8, y: 1, w: 4, h: 6 },
    { i: 'presentation', x: 0, y: 7, w: 8, h: 7 },
    { i: 'side-panel', x: 8, y: 7, w: 4, h: 7 },
  ],
  sm: [
    { i: 'toolbar', x: 0, y: 0, w: 12, h: 1, static: true },
    { i: 'stream', x: 0, y: 1, w: 12, h: 6 },
    { i: 'source', x: 0, y: 7, w: 12, h: 4 },
    { i: 'presentation', x: 0, y: 11, w: 12, h: 7 },
    { i: 'side-panel', x: 0, y: 18, w: 12, h: 6 },
  ],
};

export function SpeakerDashboard({ event, room }: SpeakerDashboardProps) {
  const [selectedPanel, setSelectedPanel] = useState<PanelContent>('questions');
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem(`speaker-layout-${room.id}`);
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
    localStorage.setItem(`speaker-layout-${room.id}`, JSON.stringify(layouts));
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem(`speaker-layout-${room.id}`);
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
                <h1 className="text-2xl font-bold tracking-tight">Speaker View</h1>
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
          <div key="toolbar" className="shadow-sm">
            <Toolbar onPanelChange={setSelectedPanel} />
          </div>
          <div key="stream" className="shadow-sm">
            <StreamPreview roomId={room.id} />
          </div>
          <div key="source" className="shadow-sm">
            <SourceControls />
          </div>
          <div key="presentation" className="shadow-sm">
            <PresentationArea />
          </div>
          <div key="side-panel" className="shadow-sm">
            <SidePanel type={selectedPanel} />
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
