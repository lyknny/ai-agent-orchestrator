# AI Agent Orchestrator

An enterprise-grade AI agent runtime designed for high-performance engineering workflows. This project demonstrates a full-stack architecture supporting tool calling, RAG pipelines, and multi-model orchestration.

## 🚀 Tech Stack
- **Backend**: Python (FastAPI) & Node.js (Express) Orchestrator
- **Frontend**: React (Vite) with Ant Design & Glassmorphism UI
- **Desktop**: Electron integration for local tool orchestration
- **AI Agent**: OpenAI GPT-4o with Tool Calling & Structured Outputs
- **Database**: SQLite (`agent_orchestrator.db`) for local persistence
- **RAG**: Simulated Vector DB (Pinecone) for technical documentation retrieval

## 💰 Cheapest Budgeting Guide (For Recruiters/Demos)
To run this project with zero or minimal cost, follow these steps:

1. **OpenAI API (Cheapest LLM)**:
   - **Model**: Use `gpt-4o-mini`. It is ~20x cheaper than GPT-4o and highly capable of tool calling.
   - **Cost**: $0.15 per 1M input tokens. A $5 credit will last for thousands of test runs.
   - **Setup**: Create an account at [platform.openai.com](https://platform.openai.com), generate a key, and add $5 (minimum) to your balance.

2. **Pinecone (Free Vector DB)**:
   - **Plan**: Use the **Starter** (Free) plan.
   - **Setup**: Sign up at [pinecone.io](https://www.pinecone.io). You get one free index which is perfect for a RAG demo.

3. **Database (Zero Cost)**:
   - **Local**: The project uses **SQLite** (`agent_orchestrator.db`) by default. It is free, local, and requires no hosting.
   - **Cloud (Optional)**: If you need a hosted DB, use **Supabase** or **Neon.tech**. Both have generous free tiers for PostgreSQL.

4. **Gemini (Free Tier)**:
   - **Setup**: Use Google AI Studio to get a free API key for `gemini-1.5-flash` if you want to swap back to a completely free model.

## 🛠️ Architecture Highlights
- **Agent Runtime**: Handles stateful multi-step workflows and tool orchestration.
- **RAG Pipeline**: Implements a retrieval layer that injects technical context into agent prompts.
- **Glassmorphism UI**: A modern, professional interface built with Ant Design and Tailwind CSS.
- **Desktop Bridge**: Electron IPC handlers ready for local MCP (Model Context Protocol) server integration.

## 📖 How to Run
1. **WORKAROUND APPLIED**: I have created a `.env` file in the root directory using the keys you provided in `.env.example`. This is a workaround since the Secrets panel was not visible in your UI.
2. The application will automatically initialize the `agent_orchestrator.db`.
3. Start chatting! The agent will use RAG when you ask about technical architecture.
