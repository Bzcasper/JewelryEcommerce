import {
  users,
  categories,
  materials,
  eras,
  brands,
  products,
  productMaterials,
  cartItems,
  orders,
  orderItems,
  wishlistItems,
  aiAnalyses,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Material,
  type InsertMaterial,
  type Era,
  type InsertEra,
  type Brand,
  type InsertBrand,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type WishlistItem,
  type InsertWishlistItem,
  type AiAnalysis,
  type InsertAiAnalysis,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Material operations
  getMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;

  // Era operations
  getEras(): Promise<Era[]>;
  createEra(era: InsertEra): Promise<Era>;

  // Brand operations
  getBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    brandId?: number;
    eraId?: number;
    materialIds?: number[];
    priceMin?: number;
    priceMax?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Wishlist operations
  getWishlistItems(userId: string): Promise<WishlistItem[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;

  // AI Analysis operations
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getAiAnalysis(id: number): Promise<AiAnalysis | undefined>;
  getUserAiAnalyses(userId: string): Promise<AiAnalysis[]>;
  updateAiAnalysis(id: number, analysis: Partial<AiAnalysis>): Promise<AiAnalysis>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  // Material operations
  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials);
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [created] = await db.insert(materials).values(material).returning();
    return created;
  }

  // Era operations
  async getEras(): Promise<Era[]> {
    return await db.select().from(eras);
  }

  async createEra(era: InsertEra): Promise<Era> {
    const [created] = await db.insert(eras).values(era).returning();
    return created;
  }

  // Brand operations
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values(brand).returning();
    return created;
  }

  // Product operations
  async getProducts(filters: {
    categoryId?: number;
    brandId?: number;
    eraId?: number;
    materialIds?: number[];
    priceMin?: number;
    priceMax?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ products: Product[]; total: number }> {
    let query = db.select().from(products);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(products);

    const conditions = [];

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters.brandId) {
      conditions.push(eq(products.brandId, filters.brandId));
    }

    if (filters.eraId) {
      conditions.push(eq(products.eraId, filters.eraId));
    }

    if (filters.priceMin !== undefined) {
      conditions.push(sql`${products.price} >= ${filters.priceMin}`);
    }

    if (filters.priceMax !== undefined) {
      conditions.push(sql`${products.price} <= ${filters.priceMax}`);
    }

    if (filters.search) {
      conditions.push(
        sql`${products.title} ILIKE ${'%' + filters.search + '%'} OR ${products.description} ILIKE ${'%' + filters.search + '%'}`
      );
    }

    if (filters.featured !== undefined) {
      conditions.push(eq(products.featured, filters.featured));
    }

    // Always show in-stock items
    conditions.push(eq(products.inStock, true));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    // Get total count
    const [{ count: total }] = await countQuery;

    // Apply ordering, limit, and offset
    query = query.orderBy(desc(products.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const productResults = await query;

    return { products: productResults, total };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new cart item
      const [created] = await db.insert(cartItems).values(cartItem).returning();
      return created;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const [created] = await db.insert(wishlistItems).values(wishlistItem).returning();
    return created;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db
      .delete(wishlistItems)
      .where(
        and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId))
      );
  }

  // AI Analysis operations
  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [created] = await db.insert(aiAnalyses).values(analysis).returning();
    return created;
  }

  async getAiAnalysis(id: number): Promise<AiAnalysis | undefined> {
    const [analysis] = await db.select().from(aiAnalyses).where(eq(aiAnalyses.id, id));
    return analysis;
  }

  async getUserAiAnalyses(userId: string): Promise<AiAnalysis[]> {
    return await db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.userId, userId))
      .orderBy(desc(aiAnalyses.createdAt));
  }

  async updateAiAnalysis(id: number, analysis: Partial<AiAnalysis>): Promise<AiAnalysis> {
    const [updated] = await db
      .update(aiAnalyses)
      .set({ ...analysis, updatedAt: new Date() })
      .where(eq(aiAnalyses.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
