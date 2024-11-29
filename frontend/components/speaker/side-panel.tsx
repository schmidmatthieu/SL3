"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Check, X } from 'lucide-react';

interface SidePanelProps {
  type: 'questions' | 'chat' | 'files';
}

interface Question {
  id: string;
  text: string;
  author: string;
  upvotes: number;
  status: 'pending' | 'approved' | 'rejected';
}

const mockQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
  id: `q-${i}`,
  text: `What are your thoughts on ${['technology', 'design', 'future'][i % 3]}?`,
  author: `User${i + 1}`,
  upvotes: Math.floor(Math.random() * 50),
  status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)] as Question['status'],
}));

export function SidePanel({ type }: SidePanelProps) {
  const renderContent = () => {
    switch (type) {
      case 'questions':
        return (
          <div className="space-y-4 p-4">
            {mockQuestions.map((question) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{question.author}</span>
                      <Badge
                        variant={
                          question.status === 'approved'
                            ? 'default'
                            : question.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {question.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{question.text}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{question.upvotes}</span>
                      </div>
                      {question.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'chat':
        return (
          <div className="p-4 text-center text-muted-foreground">
            Chat panel content
          </div>
        );

      case 'files':
        return (
          <div className="p-4 text-center text-muted-foreground">
            Files panel content
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 flex-none">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">{renderContent()}</ScrollArea>
      </CardContent>
    </Card>
  );
}