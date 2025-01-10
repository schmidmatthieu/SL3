'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useSocket } from '@/hooks/useSocket';
import { useMessages } from '@/hooks/useMessages';
import { ChatMessage, ChatUser } from '@/types/chat';
import { ChatInput } from './chat-input';
import { ChatList } from './chat-list';
import { Alert, AlertDescription } from '@/components/core/ui/alert';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/core/ui/dialog';
import { Button } from '@/components/core/ui/button';
import { Textarea } from '@/components/core/ui/textarea';

interface ChatProps {
  roomId: string;
}

export function Chat({ roomId }: ChatProps) {
  const { user } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    error: socketError,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    on,
    off,
  } = useSocket();

  const {
    messages,
    isLoading,
    error: messagesError,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
    deleteMessage,
  } = useMessages({ roomId });

  const currentUser: ChatUser = {
    id: user?.id || 'anonymous',
    username: user?.username || 'Anonymous',
    color: '#FF4B4B',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'anonymous'}`,
  };

  // Gérer le scroll infini
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop } = scrollAreaRef.current;
      
      // Si on est proche du haut, charger plus de messages
      if (scrollTop < 100 && !isLoading && hasMore) {
        loadMore();
      }
    }
  }, [isLoading, hasMore, loadMore]);

  useEffect(() => {
    let isMounted = true;
    
    const handleConnect = async () => {
      if (isMounted) {
        try {
          await joinRoom(roomId);
          console.log('Successfully joined room:', roomId);
        } catch (err) {
          console.error('Failed to join room:', err);
        }
      }
    };

    if (isConnected) {
      handleConnect();
    }

    const connectListener = () => {
      if (isMounted) {
        handleConnect();
      }
    };

    on('connect', connectListener);

    return () => {
      isMounted = false;
      off('connect', connectListener);
      leaveRoom(roomId).catch(err => console.error('Failed to leave room:', err));
    };
  }, [roomId, isConnected, joinRoom, leaveRoom, on, off]);

  useEffect(() => {
    if (isConnected) {
      const handleMessage = (message: ChatMessage) => {
        addMessage(message);
        markMessageAsRead(roomId, message.id);
        
        // Scroll vers le bas si on est déjà en bas
        if (lastMessageRef.current && scrollAreaRef.current) {
          const { scrollHeight, clientHeight, scrollTop } = scrollAreaRef.current;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
          
          if (isAtBottom) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };

      const handleTyping = (data: { userId: string; roomId: string }) => {
        if (data.roomId === roomId && data.userId !== currentUser.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      };

      const handleOnlineUsers = (count: number) => {
        setOnlineUsers(count);
      };

      const handleMessageUpdate = (data: { messageId: string; updates: Partial<ChatMessage> }) => {
        updateMessage(data.messageId, data.updates);
      };

      const handleMessageDelete = (messageId: string) => {
        deleteMessage(messageId);
      };

      on('chat:message', handleMessage);
      on('chat:typing', handleTyping);
      on('chat:online_users', handleOnlineUsers);
      on('chat:message_update', handleMessageUpdate);
      on('chat:message_delete', handleMessageDelete);

      return () => {
        leaveRoom(roomId);
        off('chat:message', handleMessage);
        off('chat:typing', handleTyping);
        off('chat:online_users', handleOnlineUsers);
        off('chat:message_update', handleMessageUpdate);
        off('chat:message_delete', handleMessageDelete);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [roomId, isConnected, currentUser.id, joinRoom, leaveRoom, on, off]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(roomId, content);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Vous pouvez ajouter ici une notification d'erreur pour l'utilisateur
    }
  };

  const handleTyping = async (isTyping: boolean) => {
    try {
      await sendTyping(roomId, isTyping);
    } catch (err) {
      console.error('Failed to send typing status:', err);
    }
  };

  const handleEditMessage = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(message);
      setEditContent(message.content);
    }
  }, [messages]);

  const handleSaveEdit = useCallback(() => {
    if (editingMessage && editContent.trim()) {
      const updatedMessage = {
        ...editingMessage,
        content: editContent.trim(),
        edited: true,
        updatedAt: new Date().toISOString(),
      };

      updateMessage(editingMessage.id, updatedMessage);
      // Émettre l'événement de mise à jour via WebSocket
      // socket.emit('chat:update_message', { messageId: editingMessage.id, content: editContent.trim() });

      setEditingMessage(null);
      setEditContent('');
    }
  }, [editingMessage, editContent, updateMessage]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    deleteMessage(messageId);
    // Émettre l'événement de suppression via WebSocket
    // socket.emit('chat:delete_message', { messageId });
  }, [deleteMessage]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const error = socketError || messagesError;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {onlineUsers} en ligne
            </span>
          </div>
          {isTyping && (
            <span className="text-sm text-muted-foreground animate-pulse">
              Quelqu'un écrit...
            </span>
          )}
        </div>

        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4"
          onScroll={handleScroll}
        >
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <ChatList 
                messages={messages}
                currentUser={currentUser}
                lastMessageRef={lastMessageRef}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            </>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <ChatInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={!isConnected}
          />
        </div>
      </div>

      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
