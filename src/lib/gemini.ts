import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export function getGeminiAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In development on some platforms, this might be missing initially.
      // The frontend build system typically injects it.
      console.warn("GEMINI_API_KEY is not defined in the environment.");
    }
    genAI = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return genAI;
}

/**
 * Saves the Gemini API key to local storage (optional backup).
 */
export function setLocalGeminiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('SW_GEMINI_KEY', key);
  }
}

/**
 * Clears the local Gemini API key.
 */
export function clearLocalGeminiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('SW_GEMINI_KEY');
  }
}

// Functions are preferred over static exports for dynamic initialization.
export {};
