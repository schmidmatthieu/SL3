"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QASection } from "@/components/room/qa-section";
import { VotesSection } from "@/components/room/votes-section";
import { FilesSection } from "@/components/room/files-section";

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