// Import necessary packages and types
import express, { type Request, Response, NextFunction } from "express";
import { pool } from './db';
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const MemoryStore = createMemoryStore(session);

const app = express();

function log(message: string, source = "server") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json({ limit: '1mb' })); // Limiting maximum request body size
app.use(express.urlencoded({ extended: true }));

// Enhanced Error Handling Middleware for JSON Parse Errors
app.use((err: SyntaxError, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    log(`Syntax Error: ${err.message}`, "JSON Parsing");
    return res.status(400).json({ message: "Invalid JSON Syntax" });
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error-handling middleware for other errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("Error:", err); // Improved error logging for development
  });

  // Set the server port
  const PORT = 2400;
  server.listen(PORT, "127.0.0.1", () => {
    log(`Server is running on port ${PORT}`);
  });
})();