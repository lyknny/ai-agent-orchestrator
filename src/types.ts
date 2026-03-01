export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  title?: string;
  updated_at: string;
}
