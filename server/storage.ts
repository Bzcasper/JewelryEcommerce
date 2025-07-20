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
    const [created] = await db.insert(categories).values([category]).returning();
    return created;
  }

  // Material operations
  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials);
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [created] = await db.insert(materials).values([material]).returning();
    return created;
  }

  // Era operations
  async getEras(): Promise<Era[]> {
    return await db.select().from(eras);
  }

  async createEra(era: InsertEra): Promise<Era> {
    const [created] = await db.insert(eras).values([era]).returning();
    return created;
  }

  // Brand operations
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [created] = await db.insert(brands).values([brand]).returning();
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
        sql`${products.title} ILIKE ${`%${filters.search}%`} OR ${products.description} ILIKE ${`%${filters.search}%`}`
      );
    }

    if (filters.featured !== undefined) {
      conditions.push(eq(products.featured, filters.featured));
    }

    // Always show in-stock items
    conditions.push(eq(products.inStock, true));

    // Build the where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause || sql`1=1`);
    const total = countResult[0].count;

    // Build and execute main query
    const productResults = await db
      .select()
      .from(products)
      .where(whereClause || sql`1=1`)
      .orderBy(desc(products.createdAt))
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);

    return { products: productResults, total };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Handle array fields properly
    const productData: any = {
      ...product,
      imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls : []
    };
    const [created] = await db.insert(products).values(productData).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    // Prepare update data excluding problematic fields
    const { imageUrls, ...cleanProduct } = product;
    const updateData: any = { 
      ...cleanProduct, 
      updatedAt: new Date() 
    };
    
    // Only include imageUrls if it's provided
    if (imageUrls !== undefined) {
      updateData.imageUrls = imageUrls;
    }
    
    const [updated] = await db
      .update(products)
      .set(updateData)
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
        .set({ quantity: (existing.quantity || 0) + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new cart item
      const [created] = await db.insert(cartItems).values([cartItem]).returning();
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
    const [created] = await db.insert(orders).values([order]).returning();
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
    const [created] = await db.insert(wishlistItems).values([wishlistItem]).returning();
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
    // Handle array fields properly
    const analysisData: any = {
      ...analysis,
      imageUrls: Array.isArray(analysis.imageUrls) ? analysis.imageUrls : []
    };
    const [created] = await db.insert(aiAnalyses).values(analysisData).returning();
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

  // Seed function to initialize database with sample data
  async seedSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const existingCategories = await this.getCategories();
      if (existingCategories.length > 0) {
        return; // Data already seeded
      }

      // Create categories
      const categories = await Promise.all([
        this.createCategory({ name: 'Rings', slug: 'rings' }),
        this.createCategory({ name: 'Necklaces', slug: 'necklaces' }),
        this.createCategory({ name: 'Earrings', slug: 'earrings' }),
        this.createCategory({ name: 'Bracelets', slug: 'bracelets' }),
        this.createCategory({ name: 'Watches', slug: 'watches' })
      ]);

      // Create brands
      const brands = await Promise.all([
        this.createBrand({ name: 'Tiffany & Co.' }),
        this.createBrand({ name: 'Cartier' }),
        this.createBrand({ name: 'Van Cleef & Arpels' }),
        this.createBrand({ name: 'Bulgari' }),
        this.createBrand({ name: 'David Yurman' })
      ]);

      // Create eras
      const eras = await Promise.all([
        this.createEra({ name: 'Vintage 1950s', period: '1950-1959' }),
        this.createEra({ name: 'Vintage 1960s', period: '1960-1969' }),
        this.createEra({ name: 'Contemporary', period: '2000-present' }),
        this.createEra({ name: 'Art Deco', period: '1920-1940' }),
        this.createEra({ name: 'Victorian', period: '1837-1901' })
      ]);

      // Create materials
      const materials = await Promise.all([
        this.createMaterial({ name: 'Gold' }),
        this.createMaterial({ name: 'Silver' }),
        this.createMaterial({ name: 'Platinum' }),
        this.createMaterial({ name: 'Diamond' }),
        this.createMaterial({ name: 'Pearl' })
      ]);

      // Create sample products with real web images
      const sampleProducts = [
        {
          title: 'Diamond Solitaire Ring',
          description: 'Elegant 1-carat diamond solitaire ring in platinum setting',
          price: '8500.00',
          condition: 'Excellent',
          mainImageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          categoryId: categories[0].id,
          brandId: brands[0].id,
          eraId: eras[2].id,
          featured: true,
          inStock: true
        },
        {
          title: 'Pearl Necklace',
          description: 'Classic strand of cultured pearls with 14k gold clasp',
          price: '2200.00',
          condition: 'Very Good',
          mainImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          categoryId: categories[1].id,
          brandId: brands[1].id,
          eraId: eras[0].id,
          featured: true,
          inStock: true
        },
        {
          title: 'Emerald Drop Earrings',
          description: 'Stunning emerald and diamond drop earrings in white gold',
          price: '5800.00',
          condition: 'Excellent',
          mainImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          categoryId: categories[2].id,
          brandId: brands[2].id,
          eraId: eras[2].id,
          featured: false,
          inStock: true
        },
        {
          title: 'Tennis Bracelet',
          description: 'Diamond tennis bracelet with 2.5 carats total weight',
          price: '12000.00',
          condition: 'Excellent',
          mainImageUrl: 'https://images.unsplash.com/photo-1506629905607-bb5199dd18ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          categoryId: categories[3].id,
          brandId: brands[3].id,
          eraId: eras[2].id,
          featured: true,
          inStock: true
        },
        {
          title: 'Vintage Gold Watch',
          description: 'Luxury vintage gold watch with leather strap',
          price: '15500.00',
          condition: 'Very Good',
          mainImageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          categoryId: categories[4].id,
          brandId: brands[1].id,
          eraId: eras[1].id,
          featured: true,
          inStock: true
        },
        {
          title: 'Art Deco Sapphire Ring',
          description: 'Gorgeous Art Deco sapphire ring with diamond accents',
          price: '6800.00',
          condition: 'Good',
          mainImageUrl: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          categoryId: categories[0].id,
          brandId: brands[4].id,
          eraId: eras[3].id,
          featured: false,
          inStock: true
        }
      ];

      await Promise.all(sampleProducts.map(product => this.createProduct(product)));
      
      console.log('✓ Sample jewelry data seeded successfully');
    } catch (error) {
      console.error('Error seeding sample data:', error);
    }
  }
}

export const storage = new DatabaseStorage();
