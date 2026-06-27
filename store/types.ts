export type KnowledgeDomain = 'medicine' | 'agriculture' | 'culture' | 'craft';
export type MediaType = 'text' | 'audio' | 'video' | 'photo' | 'mixed';
export type KnowledgeStatus = 'draft' | 'reviewed' | 'published';

export interface JAAMU {
  id: string;
  title: string;
  content: string;
  domain: KnowledgeDomain;
  community: string;
  region: string;
  mediaType: MediaType;
  mediaUri: string;
  transcription: string;
  keywords: string[];
  summary: string;
  aiCategory: string;
  status: KnowledgeStatus;
  createdAt: number;
  isFavorite: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  community: string;
  region: string;
  preferredLanguage: string;
  contributionsCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  relatedKnowledgeIds: string[];
}

export interface Preferences {
  language: string;
  notifications: boolean;
}
