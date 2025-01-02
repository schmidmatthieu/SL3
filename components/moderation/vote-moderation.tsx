'use client';

import { useState } from 'react';
import { BarChart3, Play, Plus, Square, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VoteModerationProps {
  roomId: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  status: 'draft' | 'active' | 'ended';
  totalVotes: number;
}

const mockPolls: Poll[] = [
  {
    id: '1',
    question: 'Which feature should we prioritize?',
    options: [
      { id: '1', text: 'Mobile App', votes: 150 },
      { id: '2', text: 'Desktop App', votes: 85 },
      { id: '3', text: 'Web Interface', votes: 120 },
    ],
    status: 'active',
    totalVotes: 355,
  },
  {
    id: '2',
    question: 'When should we schedule the next meeting?',
    options: [
      { id: '1', text: 'Next Week', votes: 45 },
      { id: '2', text: 'Next Month', votes: 30 },
      { id: '3', text: 'In Two Months', votes: 25 },
    ],
    status: 'ended',
    totalVotes: 100,
  },
];

export function VoteModeration({ roomId }: VoteModerationProps) {
  const [polls, setPolls] = useState(mockPolls);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
  });

  const handleAddOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleCreatePoll = () => {
    const poll: Poll = {
      id: Date.now().toString(),
      question: newPoll.question,
      options: newPoll.options.map((text, i) => ({
        id: i.toString(),
        text,
        votes: 0,
      })),
      status: 'draft',
      totalVotes: 0,
    };
    setPolls(prev => [poll, ...prev]);
    setNewPoll({ question: '', options: ['', ''] });
  };

  const handlePollAction = (pollId: string, action: 'start' | 'end' | 'delete') => {
    if (action === 'delete') {
      setPolls(prev => prev.filter(p => p.id !== pollId));
    } else {
      setPolls(prev =>
        prev.map(p =>
          p.id === pollId ? { ...p, status: action === 'start' ? 'active' : 'ended' } : p
        )
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold">Create New Poll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter your question"
            value={newPoll.question}
            onChange={e => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
          />
          <div className="space-y-2">
            {newPoll.options.map((option, index) => (
              <Input
                key={index}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={e => handleOptionChange(index, e.target.value)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAddOption}
              disabled={newPoll.options.length >= 5}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
            <Button
              onClick={handleCreatePoll}
              disabled={
                !newPoll.question || newPoll.options.some(opt => !opt) || newPoll.options.length < 2
              }
            >
              Create Poll
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg font-semibold">Active & Recent Polls</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-5rem)]">
          <CardContent className="p-4">
            <div className="space-y-4">
              {polls.map(poll => (
                <Card key={poll.id}>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">{poll.question}</h3>
                      <div className="text-sm text-muted-foreground">
                        {poll.totalVotes} votes • {poll.status}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {poll.options.map(option => {
                        const percentage = Math.round(
                          (option.votes / (poll.totalVotes || 1)) * 100
                        );
                        return (
                          <div key={option.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{option.text}</span>
                              <span>{percentage}%</span>
                            </div>
                            <Progress value={percentage} />
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      {poll.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePollAction(poll.id, 'start')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      {poll.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePollAction(poll.id, 'end')}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          End
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePollAction(poll.id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
