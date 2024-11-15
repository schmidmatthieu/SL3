"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowBigUp, ArrowBigDown, MessageSquare } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  replies: number;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'What are the key differences between this approach and traditional methods?',
    author: 'Alice Smith',
    timestamp: Date.now() - 1000 * 60 * 5,
    upvotes: 15,
    downvotes: 2,
    replies: 3,
  },
  {
    id: '2',
    text: 'Can you elaborate on the implementation timeline?',
    author: 'Bob Johnson',
    timestamp: Date.now() - 1000 * 60 * 15,
    upvotes: 8,
    downvotes: 1,
    replies: 2,
  },
];

interface QASectionProps {
  roomId: string;
}

export function QASection({ roomId }: QASectionProps) {
  const [sortBy, setSortBy] = useState('recent');
  const [questions, setQuestions] = useState(mockQuestions);
  const [newQuestion, setNewQuestion] = useState('');

  const handleVote = (questionId: string, isUpvote: boolean) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              upvotes: isUpvote ? q.upvotes + 1 : q.upvotes,
              downvotes: !isUpvote ? q.downvotes + 1 : q.downvotes,
            }
          : q
      )
    );
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
    return b.timestamp - a.timestamp;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const question: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: newQuestion.trim(),
      author: 'You',
      timestamp: Date.now(),
      upvotes: 0,
      downvotes: 0,
      replies: 0,
    };

    setQuestions(prev => [question, ...prev]);
    setNewQuestion('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newQuestion.trim()}>
          Ask
        </Button>
      </form>

      <div className="space-y-3">
        {sortedQuestions.map((question) => (
          <Card key={question.id} className="p-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleVote(question.id, true)}
                >
                  <ArrowBigUp className="h-6 w-6" />
                </Button>
                <span className="text-sm font-medium">
                  {question.upvotes - question.downvotes}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleVote(question.id, false)}
                >
                  <ArrowBigDown className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">{question.text}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{question.author}</span>
                  <span suppressHydrationWarning>
                    {new Date(question.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{question.replies}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}