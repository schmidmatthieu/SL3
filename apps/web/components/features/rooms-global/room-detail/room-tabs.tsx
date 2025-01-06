'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs';
import { FilesSection } from './files-section';
import { QASection } from './qa-section';
import { VotesSection } from './votes-section';

interface RoomTabsProps {
  roomId: string;
}

export function RoomTabs({ roomId }: RoomTabsProps) {
  return (
    <Tabs defaultValue="qa" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="qa">Q&A</TabsTrigger>
        <TabsTrigger value="votes">Votes</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>
      <TabsContent value="qa">
        <QASection roomId={roomId} />
      </TabsContent>
      <TabsContent value="votes">
        <VotesSection roomId={roomId} />
      </TabsContent>
      <TabsContent value="files">
        <FilesSection roomId={roomId} />
      </TabsContent>
    </Tabs>
  );
}
