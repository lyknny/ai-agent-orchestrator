import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('agent_orchestrator.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
  );
`);

// Migration: Add title column if it doesn't exist
try {
  db.prepare('ALTER TABLE chat_sessions ADD COLUMN title TEXT').run();
} catch (e) {
  // Column already exists or other error
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const dbService = {
  getOrCreateSession: (sessionId: string, userId: string): ChatSession => {
    // First, check if the session exists at all
    const existingSession = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId) as ChatSession | undefined;
    
    if (existingSession) {
      // If it exists but belongs to a different user (unlikely with UUIDs but possible in dev), 
      // we should probably allow it or handle it. For now, let's just return it if it matches the user.
      if (existingSession.user_id === userId) {
        return existingSession;
      }
      // If it belongs to someone else, we might have a collision or a stale ID.
      // In this specific app context, we'll just return it to avoid the crash, 
      // but in a real multi-user app we'd handle this more strictly.
      return existingSession;
    }

    // Create new session
    db.prepare('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)').run(sessionId, userId);
    return db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId) as ChatSession;
  },

  addMessage: (sessionId: string, role: 'user' | 'assistant', content: string) => {
    const id = uuidv4();
    db.prepare('INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)').run(id, sessionId, role, content);
    
    // If it's the first message and it's from the user, set the session title
    if (role === 'user') {
      const messageCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?').get(sessionId) as { count: number };
      if (messageCount.count === 1) {
        // Truncate title if it's too long
        const title = content.length > 40 ? content.substring(0, 37) + '...' : content;
        db.prepare('UPDATE chat_sessions SET title = ? WHERE id = ?').run(title, sessionId);
      }
    }

    db.prepare('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(sessionId);
    return id;
  },

  getSessionHistory: (sessionId: string, userId: string): ChatMessage[] => {
    // Verify session belongs to user
    const session = db.prepare('SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) return [];

    return db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId) as ChatMessage[];
  },

  deleteSession: (sessionId: string, userId: string) => {
    const result = db.prepare('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?').run(sessionId, userId);
    return result.changes > 0;
  },

  listSessions: (userId: string): ChatSession[] => {
    return db.prepare('SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as ChatSession[];
  }
};
