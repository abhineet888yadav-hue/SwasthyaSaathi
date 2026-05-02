import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SwasthyaSaathi Backend is Running" });
});

// Gemini MindMap Generation Endpoint
app.post("/api/generate-mindmap", async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `Topic: "${topic}". 
    You are an expert academic mentor. Create a comprehensive, well-structured hierarchical mind map for this topic. 
    Break it down into 4-6 main logical branches and 3-5 key details/sub-points for each branch.
    The level should be suitable for higher education students but clear enough for high schoolers.
    Use professional yet engaging academic terminology.
    Return the response strictly as valid JSON.`;

    // Using the recommended pattern from the gemini-api skill
    const result = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "The central core topic" },
            branches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Main branch category" },
                  details: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING, description: "Specific sub-point or detail" }
                  }
                },
                required: ["label", "details"]
              }
            }
          },
          required: ["topic", "branches"]
        }
      }
    });

    const text = result.text || "";
    
    // Robust JSON extraction
    const cleanJson = text.replace(/```json|```/gi, "").trim();
    const data = JSON.parse(cleanJson);
    
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error during mind map generation",
      details: error.message 
    });
  }
});

// AI Mentor Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { contents, systemInstruction, thinkingConfig } = req.body;
    
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: "Contents array is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const genAI = new GoogleGenAI({ apiKey });

    // Handle multimodal data if present in parts
    const result = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are an expert AI mentor named SwasthyaSaathi.",
        maxOutputTokens: 2048,
        temperature: 0.7,
        thinkingConfig: thinkingConfig || undefined
      },
    });

    res.json({ text: result.text || "" });
  } catch (error: any) {
    console.error("Chat Server Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error during chat generation",
      details: error.message 
    });
  }
});

// Generic AI Endpoint
app.post("/api/ai", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const result = await (genAI as any).models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents,
      config: config || {}
    });

    res.json({ text: result.text || "" });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ 
      error: "AI Generation failed",
      details: error.message 
    });
  }
});

async function setupApp() {
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
}

setupApp();

// Only listen if not in a Vercel-like environment (Vercel uses the exported app)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SwasthyaSaathi] Server is up and listening on port ${PORT}`);
    console.log(`[SwasthyaSaathi] Node Version: ${process.version}`);
    console.log(`[SwasthyaSaathi] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
