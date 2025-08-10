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
import { isAdmin } from "./authMiddleware";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: undefined,
});

// Modal AI Integration
const MODAL_AI_URL = process.env.MODAL_AI_URL || "https://bzcasper--jewelry-ai-app-fastapi-app.modal.run";

async function processModalAIAnalysis(analysisId: number, imageUrls: any) {
  try {
    // Mark as processing
    await storage.updateAiAnalysis(analysisId, { status: "processing" });

    // Convert first image URL to base64 for Modal AI
    const imageArray = Array.isArray(imageUrls) ? imageUrls : [];
    if (imageArray.length === 0) {
      throw new Error("No images provided for analysis");
    }

    // For demo, we'll use the first image
    const imageUrl = imageArray[0];
    let imageData: string;
    
    if (imageUrl.startsWith('data:image/')) {
      // Already base64 encoded
      imageData = imageUrl.split(',')[1];
    } else {
      // Fetch and convert to base64
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      imageData = Buffer.from(buffer).toString('base64');
    }

    // Call Modal AI service
    const modalResponse = await fetch(`${MODAL_AI_URL}/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        image_data: imageData,
        image_name: `analysis_${analysisId}.jpg`
      })
    });

    if (!modalResponse.ok) {
      throw new Error(`Modal AI service error: ${modalResponse.statusText}`);
    }

    const modalResult = await modalResponse.json();

    if (modalResult.status === 'error') {
      throw new Error(modalResult.message || 'Modal AI analysis failed');
    }

    // Transform Modal results to our schema
    const analysisResults = {
      materials: [modalResult.material || 'Unknown'],
      authenticity: modalResult.confidence > 0.7 ? 'Authenticated' : 'Needs Further Review',
      condition: modalResult.condition || 'Unknown',
      estimatedValue: { 
        min: Math.max(100, modalResult.price_estimate * 0.8 || 500), 
        max: modalResult.price_estimate * 1.2 || 1000 
      },
      confidence: modalResult.confidence || 0.5,
      title: modalResult.title || 'Unknown Jewelry',
      description: modalResult.description || 'Analysis completed',
      category: modalResult.category || 'Unknown',
      features: modalResult.features || []
    };

    // Update analysis with results
    await storage.updateAiAnalysis(analysisId, {
      status: "completed",
      analysisResults
    });

    console.log(`AI Analysis ${analysisId} completed successfully`);

  } catch (error) {
    console.error(`AI Analysis ${analysisId} failed:`, error);
    
    // Mark as failed
    await storage.updateAiAnalysis(analysisId, {
      status: "failed",
      analysisResults: {
        materials: [],
        authenticity: "Analysis Failed",
        condition: "Unknown",
        estimatedValue: { min: 0, max: 0 },
        confidence: 0
      }
    });
  }
}

import { type NextFunction } from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res, next: NextFunction) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/categories/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Material routes
  app.get("/api/materials", async (req, res, next: NextFunction) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/materials", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.json(material);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/materials/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.updateMaterial(id, materialData);
      res.json(material);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/materials/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaterial(id);
      res.json({ message: "Material deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Era routes
  app.get("/api/eras", async (req, res, next: NextFunction) => {
    try {
      const eras = await storage.getEras();
      res.json(eras);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/eras", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const eraData = insertEraSchema.parse(req.body);
      const era = await storage.createEra(eraData);
      res.json(era);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/eras/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const eraData = insertEraSchema.parse(req.body);
      const era = await storage.updateEra(id, eraData);
      res.json(era);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/eras/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEra(id);
      res.json({ message: "Era deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Brand routes
  app.get("/api/brands", async (req, res, next: NextFunction) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/brands", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.json(brand);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/brands/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.updateBrand(id, brandData);
      res.json(brand);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/brands/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBrand(id);
      res.json({ message: "Brand deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Product routes
  app.get("/api/products", async (req, res, next: NextFunction) => {
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
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/products/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", isAuthenticated, isAdmin, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/cart", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({ ...req.body, userId });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      next(error);
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const orderData = insertOrderSchema.parse({ ...req.body, userId });
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const wishlistItemData = insertWishlistItemSchema.parse({ ...req.body, userId });
      const wishlistItem = await storage.addToWishlist(wishlistItemData);
      res.json(wishlistItem);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const productId = parseInt(req.params.productId);
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      next(error);
    }
  });

  // AI Analysis routes
  app.post("/api/ai-analysis", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const analysisData = insertAiAnalysisSchema.parse({ ...req.body, userId });
      const analysis = await storage.createAiAnalysis(analysisData);

      // Trigger Modal AI analysis process  
      processModalAIAnalysis(analysis.id, analysisData.imageUrls);

      res.json(analysis);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ai-analysis", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const analyses = await storage.getUserAiAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ai-analysis/:id", isAuthenticated, async (req, res, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAiAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  });

  // Stripe checkout routes
  app.post("/api/checkout/create-payment-intent", isAuthenticated, async (req: any, res, next: NextFunction) => {
    try {
      const { amount, orderId } = req.body;
      
      if (!amount || amount < 50) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { orderId },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
