import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main(prompt) {
  const response = await ai.models.generateContent({
    // gemini-2.5-flash is blocked for new API keys; use the current flash preview
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}

export default main;
