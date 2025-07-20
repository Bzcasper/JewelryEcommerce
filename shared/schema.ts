import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  productCount: integer("product_count").default(0),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});

export const eras = pgTable("eras", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  period: varchar("period", { length: 100 }).notNull(),
  description: text("description"),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  condition: varchar("condition", { length: 50 }).notNull(),
  authenticated: boolean("authenticated").default(true),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  eraId: integer("era_id").references(() => eras.id),
  size: varchar("size", { length: 50 }),
  resizable: boolean("resizable").default(false),
  mainImageUrl: varchar("main_image_url").notNull(),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  featured: boolean("featured").default(false),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productMaterials = pgTable("product_materials", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  materialId: integer("material_id").references(() => materials.id).notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1),
  selectedSize: varchar("selected_size", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  insurance: decimal("insurance", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  selectedSize: varchar("selected_size", { length: 50 }),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jewelryType: varchar("jewelry_type", { length: 100 }),
  estimatedEra: varchar("estimated_era", { length: 100 }),
  additionalInfo: text("additional_info"),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  analysisResults: jsonb("analysis_results").$type<{
    materials: string[];
    authenticity: string;
    condition: string;
    estimatedValue: { min: number; max: number };
    confidence: number;
  }>(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
  wishlistItems: many(wishlistItems),
  aiAnalyses: many(aiAnalyses),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const erasRelations = relations(eras, ({ many }) => ({
  products: many(products),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  productMaterials: many(productMaterials),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  era: one(eras, {
    fields: [products.eraId],
    references: [eras.id],
  }),
  productMaterials: many(productMaterials),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  wishlistItems: many(wishlistItems),
}));

export const productMaterialsRelations = relations(productMaterials, ({ one }) => ({
  product: one(products, {
    fields: [productMaterials.productId],
    references: [products.id],
  }),
  material: one(materials, {
    fields: [productMaterials.materialId],
    references: [materials.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [aiAnalyses.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
});

export const insertEraSchema = createInsertSchema(eras).omit({
  id: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
  createdAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Era = typeof eras.$inferSelect;
export type InsertEra = z.infer<typeof insertEraSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
