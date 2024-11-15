export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'moderator' | 'speaker' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'moderator' | 'speaker' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'moderator' | 'speaker' | 'user'
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          venue: string
          rooms_count: number
          status: 'live' | 'upcoming' | 'ended'
          image_url: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          date: string
          venue: string
          rooms_count?: number
          status?: 'live' | 'upcoming' | 'ended'
          image_url?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          date?: string
          venue?: string
          rooms_count?: number
          status?: 'live' | 'upcoming' | 'ended'
          image_url?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      rooms: {
        Row: {
          id: string
          event_id: string
          title: string
          status: 'live' | 'upcoming' | 'ended' | 'off'
          thumbnail: string | null
          participants: number
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          status?: 'live' | 'upcoming' | 'ended' | 'off'
          thumbnail?: string | null
          participants?: number
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          status?: 'live' | 'upcoming' | 'ended' | 'off'
          thumbnail?: string | null
          participants?: number
          start_time?: string
          end_time?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          content: string
          status: 'sending' | 'delivered'
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          content: string
          status?: 'sending' | 'delivered'
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          content?: string
          status?: 'sending' | 'delivered'
          created_at?: string
        }
      }
      room_moderators: {
        Row: {
          room_id: string
          user_id: string
        }
        Insert: {
          room_id: string
          user_id: string
        }
        Update: {
          room_id?: string
          user_id?: string
        }
      }
      room_languages: {
        Row: {
          room_id: string
          language: string
        }
        Insert: {
          room_id: string
          language: string
        }
        Update: {
          room_id?: string
          language?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_status: 'live' | 'upcoming' | 'ended'
      room_status: 'live' | 'upcoming' | 'ended' | 'off'
      user_role: 'admin' | 'moderator' | 'speaker' | 'user'
      message_status: 'sending' | 'delivered'
    }
  }
}