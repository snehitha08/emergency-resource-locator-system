import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase on the server
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Emergency Resource Locator System API is running" });
  });

  // Backend to Database connection: Fetch public stats
  app.get("/api/stats", async (req, res) => {
    try {
      const { count: resourceCount, error: resError } = await supabase
        .from('emergency_resources')
        .select('*', { count: 'exact', head: true });

      const { count: reportCount, error: repError } = await supabase
        .from('incident_reports')
        .select('*', { count: 'exact', head: true });

      if (resError || repError) throw resError || repError;

      res.json({
        resources: resourceCount || 0,
        reports: reportCount || 0,
        status: "Connected to Database"
      });
    } catch (error) {
      res.status(500).json({ status: "Database Connection Failed", error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
