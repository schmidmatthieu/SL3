'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatModeration } from '@/components/moderation/chat-moderation';
import { QAModeration } from '@/components/moderation/qa-moderation';
import { VoteModeration } from '@/components/moderation/vote-moderation';

interface ModTabsProps {
  roomId: string;
}

export function ModTabs({ roomId }: ModTabsProps) {
  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col h-full">
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
            <TabsTrigger value="votes">Votes</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0">
          <TabsContent value="chat" className="h-full m-0">
            <ChatModeration roomId={roomId} />
          </TabsContent>
          <TabsContent value="qa" className="h-full m-0">
            <QAModeration roomId={roomId} />
          </TabsContent>
          <TabsContent value="votes" className="h-full m-0">
            <VoteModeration roomId={roomId} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
