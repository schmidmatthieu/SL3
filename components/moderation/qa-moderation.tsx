"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';

interface QAModerationProps {
  roomId: string;
}

interface Question {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  upvotes: number;
  status: 'pending' | 'approved' | 'rejected' | 'highlighted';
}

const mockQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
  id: `q-${i}`,
  text: `What are your thoughts on ${['technology', 'design', 'future', 'innovation'][i % 4]} and its impact on society?`,
  author: `User${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
  upvotes: Math.floor(Math.random() * 50),
  status: ['pending', 'approved', 'rejected', 'highlighted'][Math.floor(Math.random() * 4)] as Question['status'],
}));

const statusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  highlighted: 'bg-blue-500',
};

export function QAModeration({ roomId }: QAModerationProps) {
  const [questions, setQuestions] = useState(mockQuestions);
  const [filter, setFilter] = useState<Question['status'] | 'all'>('all');

  const handleQuestionAction = (questionId: string, action: Question['status']) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, status: action }
          : q
      )
    );
  };

  const filteredQuestions = questions.filter(q =>
    filter === 'all' ? true : q.status === filter
  );

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Question Queue</CardTitle>
            <div className="flex gap-2">
              <Badge
                variant={filter === 'all' ? 'secondary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('all')}
              >
                All
              </Badge>
              <Badge
                variant={filter === 'pending' ? 'secondary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Badge>
              <Badge
                variant={filter === 'approved' ? 'secondary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('approved')}
              >
                Approved
              </Badge>
              <Badge
                variant={filter === 'highlighted' ? 'secondary' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter('highlighted')}
              >
                Highlighted
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            statusColors[question.status]
                          }`}
                        />
                        <span className="font-medium">{question.author}</span>
                        <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                          {question.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{question.text}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{question.upvotes}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuestionAction(question.id, 'approved')}
                        className="text-green-500"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuestionAction(question.id, 'rejected')}
                        className="text-red-500"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuestionAction(question.id, 'highlighted')}
                        className="text-blue-500"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}