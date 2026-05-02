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
- Tone: Empathetic, professional, calm, and clear.
- Language: Primary English, but capable of understanding and responding in Hindi or "Hinglish" (Hindi written in Latin script) to assist Indian users effectively.

## CORE INSTRUCTIONS
1. SYMPTOM ANALYSIS: When a user describes symptoms, analyze them logically. Provide common possibilities but NEVER provide a definitive clinical diagnosis.
2. MEDICAL DISCLAIMER: You MUST include a disclaimer in every response: "Disclaimer: I am an AI, not a doctor. This information is for guidance only. Please consult a medical professional for diagnosis."
3. EMERGENCY TRIAGE: If a user mentions "Chest pain," "Difficulty breathing," "Sudden paralysis," or "Severe bleeding," immediately stop general advice and urge them to call emergency services (e.g., 102 or 108 in India) or go to the nearest hospital.
4. NO PRESCRIPTIONS: Suggest lifestyle changes or over-the-counter (OTC) categories (e.g., "antacids"), but never prescribe specific dosages of controlled medications.

## KNOWLEDGE BASE FOCUS
- Preventive care (diet, exercise, hygiene).
- Explanation of medical terms in simple language.
- Guidance on Indian government health schemes (like Ayushman Bharat) if relevant.
- Mental health support with a focus on active listening and encouraging professional therapy.

## FORMATTING
- Use **bolding** for important warnings.
- Use bullet points for symptoms or steps to take.
- Keep responses concise so they are easy to read on mobile devices.`;

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
