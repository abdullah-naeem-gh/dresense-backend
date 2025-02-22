// Remove import { z } from "zod";

// User Schema
export interface User {
  id: number;
  username: string;
  password: string;
  preferences?: any; // Preferences can be any valid JSON
  createdAt: string;
  updatedAt: string;
}

// Brand Schema
export interface Brand {
  id: number;
  brandName: string;
  websiteUrl?: string | null;
  bio?: string | null;
  profilePictureUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Article Schema
export interface Article {
  id: number;
  brandId: number;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  productUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Outfit Schema
export interface Outfit {
  id: number;
  userId: number;
  imageUrl: string;
  description?: string | null;
  createdAt: string;
}

// OutfitArticle Schema
export interface OutfitArticle {
  id: number;
  outfitId: number;
  articleId: number;
  position: any; // Can be more specific if you define a position type
  createdAt: string;
  updatedAt: string;
}

// Save Schema
export interface Save {
  id: number;
  userId: number;
  articleId: number;
  createdAt: string;
}

// Follow Schema
export interface Follow {
  followerId: number;
  followeeId: number;
  followType: "user" | "brand";
  createdAt: string;
}