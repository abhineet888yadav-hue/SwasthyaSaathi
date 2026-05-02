import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const envResult = dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SwasthyaSaathi Backend is Running" });
});

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

// AI Proxy for security
app.post("/api/ai", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      return res.status(401).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetModel = model || "gemini-1.5-flash";

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: contents,
      config: {
        ...config,
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    res.json({
      text: response.text,
      candidates: response.candidates
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    const msg = (error.message || "").toLowerCase();
    
    if (msg.includes("429") || msg.includes("quota")) {
      return res.status(429).json({ error: "System busy (Quota exceeded). Please try later." });
    }
    
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not in a serverless environment that handles listening
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SwasthyaSaathi] Server is up and listening on port ${PORT}`);
      console.log(`[SwasthyaSaathi] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

startServer();

export default app;
