import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertWishlistItemSchema,
  insertAiAnalysisSchema,
  insertCategorySchema,
  insertMaterialSchema,
  insertEraSchema,
  insertBrandSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Material routes
  app.get("/api/materials", async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  // Era routes
  app.get("/api/eras", async (req, res) => {
    try {
      const eras = await storage.getEras();
      res.json(eras);
    } catch (error) {
      console.error("Error fetching eras:", error);
      res.status(500).json({ message: "Failed to fetch eras" });
    }
  });

  // Brand routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        brandId: req.query.brandId ? parseInt(req.query.brandId as string) : undefined,
        eraId: req.query.eraId ? parseInt(req.query.eraId as string) : undefined,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        search: req.query.search as string,
        featured: req.query.featured === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const result = await storage.getProducts(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({ ...req.body, userId });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({ ...req.body, userId });
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistItemData = insertWishlistItemSchema.parse({ ...req.body, userId });
      const wishlistItem = await storage.addToWishlist(wishlistItemData);
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // AI Analysis routes
  app.post("/api/ai-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analysisData = insertAiAnalysisSchema.parse({ ...req.body, userId });
      const analysis = await storage.createAiAnalysis(analysisData);

      // TODO: Trigger AI analysis process here
      // For now, we'll just mark it as completed with mock results
      setTimeout(async () => {
        await storage.updateAiAnalysis(analysis.id, {
          status: "completed",
          analysisResults: {
            materials: ["Gold", "Diamond"],
            authenticity: "Authenticated",
            condition: "Excellent",
            estimatedValue: { min: 1500, max: 2500 },
            confidence: 0.92,
          },
        });
      }, 5000);

      res.json(analysis);
    } catch (error) {
      console.error("Error creating AI analysis:", error);
      res.status(500).json({ message: "Failed to create AI analysis" });
    }
  });

  app.get("/api/ai-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getUserAiAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching AI analyses:", error);
      res.status(500).json({ message: "Failed to fetch AI analyses" });
    }
  });

  app.get("/api/ai-analysis/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAiAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      res.status(500).json({ message: "Failed to fetch AI analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
