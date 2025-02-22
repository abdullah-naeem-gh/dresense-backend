import { pool } from './db'; // Make sure this path is correct
import { User, Article, Save, Outfit, OutfitArticle } from "../shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; // Import required types

const MemoryStore = createMemoryStore(session);

// Define InsertUser type, assuming it's an omission
export interface InsertUser {
  username: string;
  password: string;
  preferences?: any;
}

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

export class MySQLStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE id = ?', [id]);
    return rows[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE username = ?', [username]);
    return rows[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Users (username, password, preferences) VALUES (?, ?, ?)', 
      [insertUser.username, insertUser.password, JSON.stringify(insertUser.preferences)]);
    const [userRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE id = ?', [result.insertId]);
    return userRows[0] as User;
  }

  async getArticles(categories?: string[]): Promise<Article[]> {
    let query = 'SELECT * FROM Articles';
    
    if (categories && categories.length > 0) {
      query += ' WHERE category IN (?)';
    }
  
    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, [categories]);
      
      // Convert to Article[] and log the response
      const articles = rows as Article[];
      // console.log('Query Result:', JSON.stringify(articles, null, 2)); // Log formatted JSON
    
      return articles;
    } catch (error) {
      console.error('Error executing query', error);
      throw error;
    }
  }

  async createSave(save: { userId: number; articleId: number }): Promise<Save> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Saves (user_id, article_id) VALUES (?, ?)', 
      [save.userId, save.articleId]);
    const [saveRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Saves WHERE id = ?', [result.insertId]);
    return saveRows[0] as Save;
  }

  async deleteSave(userId: number, articleId: number): Promise<void> {
    await pool.query('DELETE FROM Saves WHERE user_id = ? AND article_id = ?', [userId, articleId]);
  }

  async getSavesByUser(userId: number): Promise<Save[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Saves WHERE user_id = ?', [userId]);
    return rows as Save[];
  }

  async getOutfits(): Promise<Outfit[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Outfits');
    return rows as Outfit[];
  }

  async createOutfit(outfit: Omit<Outfit, "id">): Promise<Outfit> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Outfits (user_id, image_url, description) VALUES (?, ?, ?)',
      [outfit.userId, outfit.imageUrl, outfit.description]);
    const [outfitRows] = await pool.query<RowDataPacket[]>('SELECT * FROM Outfits WHERE id = ?', [result.insertId]);
    return outfitRows[0] as Outfit;
  }

  async getOutfitArticles(): Promise<OutfitArticle[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM OutfitArticles');
    return rows as OutfitArticle[];
  }

  async createOutfitArticle(outfitArticle: Omit<OutfitArticle, "id">): Promise<OutfitArticle> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO OutfitArticles (outfit_id, article_id, position) VALUES (?, ?, ?)',
      [outfitArticle.outfitId, outfitArticle.articleId, JSON.stringify(outfitArticle.position)]);
    const [outfitArticleRows] = await pool.query<RowDataPacket[]>('SELECT * FROM OutfitArticles WHERE id = ?', [result.insertId]);
    return outfitArticleRows[0] as OutfitArticle;
  }
}

export const storage = new MySQLStorage();