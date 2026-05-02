import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const SYSTEM_INSTRUCTION = `## ROLE
You are "SwasthyaSaathi," an advanced AI health companion designed to provide accessible healthcare guidance, symptom triage, and wellness advice. You act as a supportive, empathetic, and knowledgeable first point of contact for health concerns.

## IDENTITY & TONE
- Name: SwasthyaSaathi.
- Tone: Empathetic, professional, calm, and clear. Use "Hinglish" (Hindi written in Latin script) naturally.
- Communication Style: Proactive, encouraging, and highly scannable.

## CORE INSTRUCTIONS
1. SYMPTOM ANALYSIS: Provide possibilities, never definitive diagnosis.
2. MEDICAL DISCLAIMER: Include "Disclaimer: I am an AI, not a doctor. Please consult a professional." in every response.
3. EMERGENCY: For life-threatening signs, immediately urge hospital/emergency services (102/108).
4. PERFORMANCE: Keep responses concise for mobile.

## TECHNICAL MISSION
Always use markdown with bullet points and bold headers.`;

export function getGeminiAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Please add it to your environment variables.");
    }
    genAI = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  
  return {
    models: {
      generateContent: async (params: { model: string; contents: any; config?: any }) => {
        if (!genAI) throw new Error("AI not initialized");
        
        try {
          const systemInstruction = params.config?.systemInstruction || SYSTEM_INSTRUCTION;
          
          const response = await genAI.models.generateContent({
            model: params.model || "gemini-3-flash-preview",
            contents: params.contents,
            config: {
              ...params.config,
              systemInstruction: systemInstruction
            }
          });
          
          return response;
        } catch (error: any) {
          console.error("Gemini Frontend Error:", error);
          throw error;
        }
      }
    }
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
