import { GoogleGenAI, Type } from "@google/genai";

export interface TrendingTopic {
  text: string;
  category: string;
}

export const trendingService = {
  async fetchTrendingTopics(): Promise<TrendingTopic[]> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY not found for trending topics.");
        return this.getDefaultTopics();
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "What are the top 4 trending AI news or technical topics today? Provide them as a list of short, actionable questions or prompts that a user might ask an AI assistant. Focus on recent breakthroughs, new model releases, or major industry shifts.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The trending question or prompt" },
                category: { type: Type.STRING, description: "A short category name like 'Model Release', 'Breakthrough', etc." }
              },
              required: ["text", "category"]
            }
          }
        },
      });

      const topics = JSON.parse(response.text || "[]");
      return topics.length > 0 ? topics : this.getDefaultTopics();
    } catch (error) {
      console.error("Failed to fetch trending topics:", error);
      return this.getDefaultTopics();
    }
  },

  getDefaultTopics(): TrendingTopic[] {
    return [
      { text: "What's new in GPT-4o and Gemini 1.5 Pro?", category: "Models" },
      { text: "Explain the latest breakthroughs in AI agents.", category: "Agents" },
      { text: "How is AI impacting software engineering in 2024?", category: "Industry" },
      { text: "What are the top open-source LLMs right now?", category: "Open Source" }
    ];
  }
};
