'use client';

import {
  FileText,
  HelpCircle,
  MessageSquare,
  Mic,
  Settings,
  Upload,
  Users,
  Video,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  onPanelChange: (panel: 'questions' | 'chat' | 'files') => void;
}

export function Toolbar({ onPanelChange }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-card rounded-lg border px-4 py-2 h-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r pr-4">
          <Button variant="outline" size="sm">
            <Mic className="h-4 w-4 mr-2" />
            Audio
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onPanelChange('questions')}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Questions
                </Button>
              </TooltipTrigger>
              <TooltipContent>View and manage audience questions</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onPanelChange('chat')}>
                  <Users className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </TooltipTrigger>
              <TooltipContent>Interact with participants</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onPanelChange('files')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Files
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage presentation files</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload new files</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configure stream settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
