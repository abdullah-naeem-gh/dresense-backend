import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").$type<string[]>(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  productUrl: text("product_url").notNull(),
});

export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const outfitArticles = pgTable("outfit_articles", {
  id: serial("id").primaryKey(),
  outfitId: integer("outfit_id").notNull().references(() => outfits.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
  position: jsonb("position").$type<{ x: number; y: number }>(),
});

export const saves = pgTable("saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArticleSchema = createInsertSchema(articles);
export const insertOutfitSchema = createInsertSchema(outfits).omit({ createdAt: true });
export const insertOutfitArticleSchema = createInsertSchema(outfitArticles);
export const insertSaveSchema = createInsertSchema(saves);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Outfit = typeof outfits.$inferSelect;
export type OutfitArticle = typeof outfitArticles.$inferSelect;
export type Save = typeof saves.$inferSelect;