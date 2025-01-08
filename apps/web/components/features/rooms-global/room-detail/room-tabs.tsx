'use client';

import { Room } from '@/types/room';
import { MessageSquare, FileText, Vote } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs';
import { FilesSection } from './files-section';
import { QASection } from './qa-section';
import { VotesSection } from './votes-section';

interface RoomTabsProps {
  room: Room;
}

const tabItems = [
  {
    value: 'qa',
    label: 'Questions & Réponses',
    icon: MessageSquare,
    component: QASection,
  },
  {
    value: 'votes',
    label: 'Votes',
    icon: Vote,
    component: VotesSection,
  },
  {
    value: 'files',
    label: 'Fichiers',
    icon: FileText,
    component: FilesSection,
  },
] as const;

export function RoomTabs({ room }: RoomTabsProps) {
  return (
    <Tabs defaultValue="qa" className="w-full">
      <TabsList className="w-full h-auto flex justify-start gap-1 bg-transparent p-0">
        {tabItems.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={cn(
              'relative h-10 px-4 rounded-none border-0',
              'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
              'transition-colors hover:bg-muted/50'
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
            {/* Active indicator line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              initial={false}
              animate={{
                opacity: value === 'qa' ? 1 : 0,
                scale: value === 'qa' ? 1 : 0.95,
              }}
              transition={{ duration: 0.15 }}
              data-state-active={value === 'qa' ? 'true' : 'false'}
            />
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        {tabItems.map(({ value, component: Component }) => (
          <TabsContent
            key={value}
            value={value}
            className="mt-0 border-none p-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Component roomId={room._id} />
            </motion.div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
