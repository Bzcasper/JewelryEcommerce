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

// Modal AI Integration
const MODAL_AI_URL = "https://bzcasper--jewelry-ai-app-fastapi-app.modal.run";

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

      // Trigger Modal AI analysis process  
      processModalAIAnalysis(analysis.id, analysisData.imageUrls);

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

  // Stripe checkout routes
  app.post("/api/checkout/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, orderId } = req.body;
      
      if (!amount || amount < 50) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Mock payment intent for now since Stripe isn't configured
      // In production, you would use: const paymentIntent = await stripe.paymentIntents.create(...)
      const mockPaymentIntent = {
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        amount,
        currency: 'usd',
        status: 'requires_payment_method'
      };

      res.json({ 
        clientSecret: mockPaymentIntent.clientSecret,
        amount: mockPaymentIntent.amount 
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
