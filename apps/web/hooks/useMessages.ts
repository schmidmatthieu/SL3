import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { ChatMessage } from '@/types/chat';

interface UseMessagesProps {
  roomId: string;
  pageSize?: number;
}

interface UseMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
}

export function useMessages({ roomId, pageSize = 50 }: UseMessagesProps): UseMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesCache = useRef<Map<string, ChatMessage>>(new Map());
  const { socket, isConnected } = useSocket();

  // Charger les messages initiaux
  useEffect(() => {
    if (isConnected && roomId) {
      loadMessages(1);
    }
  }, [roomId, isConnected]);

  // Fonction pour charger les messages
  const loadMessages = async (pageNum: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Émettre l'événement pour récupérer les messages
      socket?.emit('chat:getMessages', {
        roomId,
        page: pageNum,
        pageSize,
      }, (response: { messages: ChatMessage[]; hasMore: boolean }) => {
        if (response.messages) {
          // Mettre à jour le cache
          response.messages.forEach(msg => {
            messagesCache.current.set(msg.id, msg);
          });

          // Mettre à jour l'état
          setMessages(prev => {
            const newMessages = [...prev];
            response.messages.forEach(msg => {
              if (!newMessages.some(m => m.id === msg.id)) {
                newMessages.unshift(msg);
              }
            });
            return newMessages.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          setHasMore(response.hasMore);
          setPage(pageNum);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger plus de messages
  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await loadMessages(page + 1);
    }
  }, [isLoading, hasMore, page]);

  // Fonction pour ajouter un nouveau message
  const addMessage = useCallback((message: ChatMessage) => {
    messagesCache.current.set(message.id, message);
    setMessages(prev => {
      const newMessages = [message, ...prev];
      return newMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, []);

  // Fonction pour mettre à jour un message
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    const cached = messagesCache.current.get(messageId);
    if (cached) {
      const updated = { ...cached, ...updates };
      messagesCache.current.set(messageId, updated);
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updated : msg)
      );
    }
  }, []);

  // Fonction pour supprimer un message
  const deleteMessage = useCallback((messageId: string) => {
    messagesCache.current.delete(messageId);
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
    deleteMessage,
  };
}
