export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  attachments?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: number;
}

export interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId?: string;
  loading: boolean;
  error?: string;
}
