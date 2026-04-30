import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export function getGeminiAI() {
  if (genAI) return genAI;

  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  genAI = new GoogleGenAI(apiKey);
  return genAI;
}

// Keeping a safe export for backward compatibility where possible, but functions are better
export const ai = null; // We'll move away from this static export
