/**
 * Interface for chat-specific room settings
 */
export interface ChatRoomSettings {
  chatEnabled: boolean;
  isArchived: boolean;
  allowEmojis: boolean;
  allowGifs: boolean;
  allowFiles: boolean;
  maxMessageLength: number;
  maxFileSize: number; // in MB
  rateLimitMessages: number; // messages per minute
  autoModeration: {
    enabled: boolean;
    profanityFilter: boolean;
    spamFilter: boolean;
    linkFilter: boolean;
    autoDelete: boolean;
  };
}
