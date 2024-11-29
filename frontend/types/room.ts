export type RoomStatus = 'live' | 'upcoming' | 'ended' | 'off';
export type Language = 'en' | 'fr' | 'de' | 'it';

export interface Room {
  id: string;
  title: string;
  status: RoomStatus;
  thumbnail: string;
  participants: number;
  startTime: string;
  endTime: string;
  languages: Language[];
}