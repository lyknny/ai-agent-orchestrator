import express from "express";
import { createServer as createViteServer } from "vite";
import { dbService } from "./src/db.ts";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config({ override: true });

function getOpenAIClient() {
  let apiKey = process.env.OPENAI_API_KEY?.trim();
  
  // Remove potential quotes if user pasted them
  if (apiKey?.startsWith('"') && apiKey?.endsWith('"')) {
    apiKey = apiKey.substring(1, apiKey.length - 1);
  }

  if (!apiKey || apiKey === "mock-key" || apiKey.includes("YOUR_") || apiKey.endsWith("_kwA")) {
    throw new Error("CRITICAL: You are using a mock/placeholder OpenAI API key. Please ensure your .env file contains a valid key (not ending in _kwA).");
  }
  
  // Safe logging for debugging (masked)
  const maskedKey = `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`[OpenAI] Initializing client with key: ${maskedKey}`);
  
  return new OpenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // OpenAI Streaming Endpoint
  app.post("/api/v1/chat/stream", async (req, res) => {
    const { messages, session_id, user_id } = req.body;

    if (!messages || !session_id || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const openai = getOpenAIClient();
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an advanced AI Agent runtime. You support tool calling, context management, and RAG. Always respond in structured Markdown." 
          },
          ...messages
        ],
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message to DB after stream finishes
      dbService.addMessage(session_id, 'assistant', fullContent);
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (openaiError: any) {
      console.error("OpenAI Error:", openaiError);
      res.status(openaiError.status || 500).json({ 
        error: openaiError.message || "OpenAI service failed. Please check your quota.",
        code: openaiError.code
      });
    }
  });

  // List sessions
  app.get("/api/v1/sessions", (req, res) => {
    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: "user_id is required" });
    }
    const sessions = dbService.listSessions(user_id);
    res.json({ sessions });
  });

  // Get session history
  app.get("/api/v1/sessions/:session_id/history", (req, res) => {
    const { session_id } = req.params;
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: "user_id is required" });
    }

    const messages = dbService.getSessionHistory(session_id, user_id);
    res.json({
      session_id,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        created_at: m.created_at
      }))
    });
  });

  // Delete session
  app.delete("/api/v1/sessions/:session_id", (req, res) => {
    const { session_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const deleted = dbService.deleteSession(session_id, user_id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Session not found or unauthorized" });
    }
  });

  // Chat stream endpoint - Now just handles persistence of user message
  // The actual AI generation is moved to the frontend due to environment restrictions on API keys
  app.post("/api/v1/chat/stream/init", async (req, res) => {
    const { session_id, user_id, message } = req.body;

    if (!session_id || !user_id || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      console.log(`[ChatInit] Initializing session: ${session_id} for user: ${user_id}`);
      dbService.getOrCreateSession(session_id, user_id);
      dbService.addMessage(session_id, 'user', message);
      res.json({ status: "ok" });
    } catch (error: any) {
      console.error("[ChatInit] Error initializing chat:", error);
      res.status(500).json({ error: error.message || "Failed to initialize chat on backend" });
    }
  });

  // Save assistant message
  app.post("/api/v1/chat/message", async (req, res) => {
    const { session_id, user_id, content } = req.body;

    if (!session_id || !user_id || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    dbService.addMessage(session_id, 'assistant', content);
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
