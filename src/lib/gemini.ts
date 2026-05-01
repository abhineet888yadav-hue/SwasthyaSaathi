import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export function getGeminiAI() {
  if (genAI) return genAI;

  // 1. Check environment variables (Prioritize process.env.GEMINI_API_KEY for this platform)
  let apiKey: string | undefined = process.env.GEMINI_API_KEY;
  
  // 2. Check localStorage (User provided fallback)
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = localStorage.getItem('SW_GEMINI_KEY') || undefined;
  }
  
  if (!apiKey) {
    const errorMsg = "Gemini API Key missing! Please set GEMINI_API_KEY in environment or provide it in settings.";
    console.warn(errorMsg);
    throw new Error("API_KEY_MISSING");
  }

  genAI = new GoogleGenAI({ apiKey });
  return genAI;
}

/**
 * Saves the Gemini API key to local storage for persistence across reloads.
 */
export function setLocalGeminiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('SW_GEMINI_KEY', key);
    // Reset the internal instance so it re-initializes with the new key
    genAI = null;
  }
}

/**
 * Clears the local Gemini API key.
 */
export function clearLocalGeminiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('SW_GEMINI_KEY');
    genAI = null;
  }
}

// Functions are preferred over static exports for dynamic initialization.
export {};
