// server/routes.ts

import type { Express, Request, Response } from "express"; // Ensure Request and Response types are imported
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  })
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/articles", async (req: Request, res: Response) => {
    const categories = req.query.categories as string[] | undefined;
    const articles = await storage.getArticles(categories);
    res.json(articles);
  });

  app.post("/api/saves", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const save = await storage.createSave({
      userId: req.user.id,
      articleId: req.body.articleId,
    });
    res.status(201).json(save);
  });

  app.delete("/api/saves/:articleId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteSave(req.user.id, parseInt(req.params.articleId, 10));
    res.sendStatus(200);
  });

  app.get("/api/saves", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const saves = await storage.getSavesByUser(req.user.id);
    res.json(saves);
  });

  // Outfit routes
  app.post("/api/upload", upload.single("image"), (req: Request, res: Response) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.get("/api/outfits", async (req: Request, res: Response) => {
    const outfits = await storage.getOutfits();
    res.json(outfits);
  });

  app.post("/api/outfits", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const outfit = await storage.createOutfit({
      ...req.body,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(outfit);
  });

  app.get("/api/outfit-articles", async (req: Request, res: Response) => {
    const outfitArticles = await storage.getOutfitArticles();
    res.json(outfitArticles);
  });

  app.post("/api/outfit-articles", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const outfitArticle = await storage.createOutfitArticle(req.body);
    res.status(201).json(outfitArticle);
  });

  // Create HTTP server from express app
  const httpServer = createServer(app);
  return httpServer;
}