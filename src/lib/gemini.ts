import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export function getGeminiAI() {
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
            const errorData = await response.json().catch(() => ({ error: "AI error" }));
            throw new Error(errorData.error || errorData.details || "AI failure");
          }

          const data = await response.json();
          return {
            text: data.text || "",
            candidates: data.candidates,
          };
        } catch (error: any) {
          console.error("Gemini Error:", error);
          throw error;
        }
      },
    },
  } as any;
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
