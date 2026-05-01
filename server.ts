import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

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
