import { users, type User, type InsertUser, type Article, type Save, type Outfit, type OutfitArticle } from "../shared/schema.ts";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

const sampleArticles: Article[] = [
  {
    id: 1,
    brand: "Khaadi",
    name: "Embroidered Lawn Suit",
    price: 5999,
    category: "Traditional",
    imageUrl: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
    productUrl: "https://www.khaadi.com/pk/lawn-suit",
  },
  {
    id: 2,
    brand: "Sapphire",
    name: "Printed Cotton Kurta",
    price: 2499,
    category: "Casual",
    imageUrl: "https://images.pexels.com/photos/7679863/pexels-photo-7679863.jpeg",
    productUrl: "https://www.sapphire.pk/kurta",
  },
  {
    id: 3,
    brand: "Gul Ahmed",
    name: "Formal Silk Shirt",
    price: 4999,
    category: "Formal",
    imageUrl: "https://images.pexels.com/photos/7679657/pexels-photo-7679657.jpeg",
    productUrl: "https://www.gulahmed.com/formal-shirt",
  }
];

const sampleOutfits: Outfit[] = [
  {
    id: 100,
    userId: 1,
    imageUrl: "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg",
    description: "Perfect summer casual look",
    createdAt: new Date().toISOString()
  },
  {
    id: 101,
    userId: 1,
    imageUrl: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
    description: "Formal office attire",
    createdAt: new Date().toISOString()
  }
];

const sampleOutfitArticles: OutfitArticle[] = [
  {
    id: 200,
    outfitId: 100,
    articleId: 2,
    position: { x: 0.3, y: 0.5 }
  },
  {
    id: 201,
    outfitId: 101,
    articleId: 3,
    position: { x: 0.4, y: 0.4 }
  }
];

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getArticles(categories?: string[]): Promise<Article[]>;
  createSave(save: { userId: number; articleId: number }): Promise<Save>;
  deleteSave(userId: number, articleId: number): Promise<void>;
  getSavesByUser(userId: number): Promise<Save[]>;
  getOutfits(): Promise<Outfit[]>;
  createOutfit(outfit: Omit<Outfit, "id">): Promise<Outfit>;
  getOutfitArticles(): Promise<OutfitArticle[]>;
  createOutfitArticle(outfitArticle: Omit<OutfitArticle, "id">): Promise<OutfitArticle>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private saves: Map<number, Save>;
  private outfits: Map<number, Outfit>;
  private outfitArticles: Map<number, OutfitArticle>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.saves = new Map();
    this.outfits = new Map();
    this.outfitArticles = new Map();
    this.currentId = Math.max(
      ...sampleArticles.map(a => a.id),
      ...sampleOutfits.map(o => o.id),
      ...sampleOutfitArticles.map(oa => oa.id)
    ) + 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize sample data
    sampleArticles.forEach(article => {
      this.articles.set(article.id, article);
    });

    sampleOutfits.forEach(outfit => {
      this.outfits.set(outfit.id, outfit);
    });

    sampleOutfitArticles.forEach(outfitArticle => {
      this.outfitArticles.set(outfitArticle.id, outfitArticle);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, preferences: null };
    this.users.set(id, user);
    return user;
  }

  async getArticles(categories?: string[]): Promise<Article[]> {
    const articles = Array.from(this.articles.values());
    if (!categories || categories.length === 0) {
      return articles;
    }
    return articles.filter(article => categories.includes(article.category));
  }

  async createSave(save: { userId: number; articleId: number }): Promise<Save> {
    const id = this.currentId++;
    const newSave: Save = { id, ...save };
    this.saves.set(id, newSave);
    return newSave;
  }

  async deleteSave(userId: number, articleId: number): Promise<void> {
    const saves = Array.from(this.saves.values());
    const saveToDelete = saves.find(
      save => save.userId === userId && save.articleId === articleId
    );
    if (saveToDelete) {
      this.saves.delete(saveToDelete.id);
    }
  }

  async getSavesByUser(userId: number): Promise<Save[]> {
    return Array.from(this.saves.values()).filter(save => save.userId === userId);
  }

  async getOutfits(): Promise<Outfit[]> {
    return Array.from(this.outfits.values());
  }

  async createOutfit(outfit: Omit<Outfit, "id">): Promise<Outfit> {
    const id = this.currentId++;
    const newOutfit: Outfit = { id, ...outfit };
    this.outfits.set(id, newOutfit);
    return newOutfit;
  }

  async getOutfitArticles(): Promise<OutfitArticle[]> {
    return Array.from(this.outfitArticles.values());
  }

  async createOutfitArticle(outfitArticle: Omit<OutfitArticle, "id">): Promise<OutfitArticle> {
    const id = this.currentId++;
    const newOutfitArticle: OutfitArticle = { id, ...outfitArticle };
    this.outfitArticles.set(id, newOutfitArticle);
    return newOutfitArticle;
  }
}

export const storage = new MemStorage();