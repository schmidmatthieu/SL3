"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  isActive: boolean;
}

const mockPoll: Poll = {
  id: '1',
  question: 'Which technology stack should we use for the next project?',
  options: [
    { id: '1', text: 'Next.js + TypeScript', votes: 45 },
    { id: '2', text: 'Remix + TypeScript', votes: 28 },
    { id: '3', text: 'Astro + TypeScript', votes: 32 },
    { id: '4', text: 'SvelteKit + TypeScript', votes: 25 },
  ],
  totalVotes: 130,
  isActive: true,
};

interface VotesSectionProps {
  roomId: string;
}

export function VotesSection({ roomId }: VotesSectionProps) {
  const [poll, setPoll] = useState(mockPoll);
  const [userVote, setUserVote] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    if (userVote || !poll.isActive) return;

    setPoll(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId
          ? { ...opt, votes: opt.votes + 1 }
          : opt
      ),
      totalVotes: prev.totalVotes + 1,
    }));
    setUserVote(optionId);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {poll.totalVotes} votes • {poll.isActive ? 'Active' : 'Closed'}
        </p>

        <div className="space-y-4">
          {poll.options.map((option) => {
            const percentage = Math.round((option.votes / poll.totalVotes) * 100) || 0;
            const isSelected = userVote === option.id;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => handleVote(option.id)}
                    disabled={!!userVote || !poll.isActive}
                  >
                    {option.text}
                  </Button>
                  <span className="text-sm font-medium ml-2">
                    {percentage}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={isSelected ? "bg-primary/20" : ""}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}