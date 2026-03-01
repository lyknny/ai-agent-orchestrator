import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Session } from '../types';
import { GoogleGenAI } from "@google/genai";

const USER_ID = 'user-123';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: (window as any).process?.env?.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "" });

export function useChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/sessions?user_id=${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  }, []);

  const fetchHistory = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}/history?user_id=${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (currentSessionId) {
      fetchHistory(currentSessionId);
    } else if (sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    } else {
      startNewChat();
    }
  }, [currentSessionId, sessions.length, fetchHistory]);

  const startNewChat = () => {
    const newId = uuidv4();
    setCurrentSessionId(newId);
    setMessages([]);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID })
      });
      if (res.ok) {
        const newSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(newSessions);
        if (currentSessionId === sessionId) {
          if (newSessions.length > 0) {
            setCurrentSessionId(newSessions[0].id);
          } else {
            startNewChat();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Ensure we have a session ID
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      setCurrentSessionId(sessionId);
    }

    setError(null);
    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      // 1. Initialize message on backend
      const initRes = await fetch('/api/v1/chat/stream/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: USER_ID,
          message: content
        })
      });

      if (!initRes.ok) throw new Error('Failed to initialize chat on backend');

      // 2. Prepare assistant placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // 3. Attempt Gemini Streaming in Frontend (Primary)
      try {
        const model = genAI.models.generateContentStream({
          model: "gemini-3-flash-preview",
          contents: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          config: {
            systemInstruction: "You are an advanced AI Agent runtime. You support tool calling, context management, and RAG. Always respond in structured Markdown."
          }
        });

        let assistantContent = '';
        for await (const chunk of await model) {
          const content = chunk.text;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1].content = assistantContent;
              }
              return updated;
            });
          }
        }

        // 4. Save assistant message to backend
        await fetch('/api/v1/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: USER_ID,
            content: assistantContent
          })
        });

      } catch (geminiErr: any) {
        console.error('Gemini Frontend Error, falling back to Backend OpenAI:', geminiErr);
        
        // 5. Fallback to Backend OpenAI
        const response = await fetch('/api/v1/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            session_id: sessionId,
            user_id: USER_ID
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to stream from backend');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    assistantContent += parsed.content;
                    setMessages(prev => {
                      const updated = [...prev];
                      if (updated.length > 0) {
                        updated[updated.length - 1].content = assistantContent;
                      }
                      return updated;
                    });
                  }
                } catch (e) {
                  // Ignore parse errors for partial chunks
                }
              }
            }
          }
        }
      }

      fetchSessions();
    } catch (err: any) {
      console.error('Streaming error', err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    error,
    setCurrentSessionId,
    startNewChat,
    deleteSession,
    sendMessage,
    USER_ID
  };
}
