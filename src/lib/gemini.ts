import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export function getGeminiAI() {
  // Return a mock object that matches the @google/genai SDK structure
  // but redirects calls to our server-side proxy.
  return {
    models: {
      generateContent: async (params: { model: string; contents: any; config?: any }) => {
        try {
          const response = await fetch("/api/ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || errorData.error || "AI Proxy Error");
          }

          const data = await response.json();
          // Mock the GenerateContentResponse shape
          return {
            text: data.text,
            get functionCalls() { return undefined; } // Add if needed later
          };
        } catch (error: any) {
          console.error("Gemini Proxy Fetch Error:", error);
          throw error;
        }
      },
    }
  } as any;
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
