import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { User, UserRole, insertVendorProfileSchema, insertListingSchema, insertCommentSchema, insertOrderSchema, insertPaymentSchema } from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    error: {
      code: "NOT_AUTHENTICATED",
      message: "Authentication required"
    }
  });
};

// Middleware to check user role
const hasRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "Authentication required"
        }
      });
    }
    
    if ((req.user as User).role !== role) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to access this resource"
        }
      });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching categories"
        }
      });
    }
  });
  
  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Category not found"
          }
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching category"
        }
      });
    }
  });
  
  // Listings API
  app.get("/api/listings", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const listings = await storage.getActiveListings(limit, offset);
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching listings"
        }
      });
    }
  });
  
  app.get("/api/listings/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const listings = await storage.getFeaturedListings(limit);
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching featured listings"
        }
      });
    }
  });
  
  app.get("/api/listings/top-rated", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const listings = await storage.getTopRatedListings(limit);
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching top rated listings"
        }
      });
    }
  });
  
  app.get("/api/listings/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const listings = await storage.getListingsByCategory(categoryId);
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching listings by category"
        }
      });
    }
  });
  
  app.get("/api/listings/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const listings = await storage.searchListings(query);
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error searching listings"
        }
      });
    }
  });
  
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Listing not found"
          }
        });
      }
      
      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching listing"
        }
      });
    }
  });
  
  // Comments API
  app.get("/api/listings/:id/comments", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const comments = await storage.getCommentsByListingId(listingId);
      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching comments"
        }
      });
    }
  });
  
  app.post("/api/listings/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = (req.user as User).id;
      
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Listing not found"
          }
        });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId,
        listingId,
        status: "PENDING" // Comments need approval
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid comment data",
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error creating comment"
        }
      });
    }
  });
  
  // Vendor API
  app.post("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      
      // Check if user already has a vendor profile
      const existingProfile = await storage.getVendorProfileByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VENDOR_EXISTS",
            message: "User already has a vendor profile"
          }
        });
      }
      
      const validatedData = insertVendorProfileSchema.parse({
        ...req.body,
        userId,
        verificationStatus: "PENDING" // New vendors need approval
      });
      
      const vendorProfile = await storage.createVendorProfile(validatedData);
      
      // Update user role
      await storage.updateUser(userId, { role: "VENDOR" });
      
      res.status(201).json({
        success: true,
        data: vendorProfile
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid vendor profile data",
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error creating vendor profile"
        }
      });
    }
  });
  
  app.get("/api/vendors/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const vendorProfile = await storage.getVendorProfileByUserId(userId);
      
      if (!vendorProfile) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Vendor profile not found"
          }
        });
      }
      
      res.json({
        success: true,
        data: vendorProfile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching vendor profile"
        }
      });
    }
  });
  
  app.post("/api/vendors/listings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      
      // Get vendor profile
      const vendorProfile = await storage.getVendorProfileByUserId(userId);
      if (!vendorProfile) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Vendor profile not found"
          }
        });
      }
      
      // Check if vendor is approved
      if (vendorProfile.verificationStatus !== "APPROVED") {
        return res.status(403).json({
          success: false,
          error: {
            code: "NOT_APPROVED",
            message: "Vendor profile is not approved yet"
          }
        });
      }
      
      const validatedData = insertListingSchema.parse({
        ...req.body,
        vendorId: vendorProfile.id,
        status: "PENDING" // New listings need approval
      });
      
      const listing = await storage.createListing(validatedData);
      res.status(201).json({
        success: true,
        data: listing
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid listing data",
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error creating listing"
        }
      });
    }
  });
  
  app.get("/api/vendors/listings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      
      const vendorProfile = await storage.getVendorProfileByUserId(userId);
      if (!vendorProfile) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Vendor profile not found"
          }
        });
      }
      
      const listings = await storage.getListingsByVendorId(vendorProfile.id);
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching vendor listings"
        }
      });
    }
  });
  
  // Admin API
  app.get("/api/admin/vendors/pending", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const pendingVendors = await storage.getPendingVendors();
      res.json({
        success: true,
        data: pendingVendors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching pending vendors"
        }
      });
    }
  });
  
  app.patch("/api/admin/vendors/:id", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { verificationStatus, rejectionReason } = req.body;
      
      if (!["APPROVED", "REJECTED"].includes(verificationStatus)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Invalid verification status"
          }
        });
      }
      
      const vendor = await storage.getVendorProfile(id);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Vendor not found"
          }
        });
      }
      
      const updatedVendor = await storage.updateVendorProfile(id, {
        verificationStatus,
        rejectionReason: verificationStatus === "REJECTED" ? rejectionReason : null
      });
      
      res.json({
        success: true,
        data: updatedVendor
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error updating vendor"
        }
      });
    }
  });
  
  app.get("/api/admin/listings/pending", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const pendingListings = await storage.getPendingListings();
      res.json({
        success: true,
        data: pendingListings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching pending listings"
        }
      });
    }
  });
  
  app.patch("/api/admin/listings/:id", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Invalid listing status"
          }
        });
      }
      
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Listing not found"
          }
        });
      }
      
      const finalStatus = status === "APPROVED" ? "ACTIVE" : "REJECTED";
      const updatedListing = await storage.updateListing(id, {
        status: finalStatus,
        rejectionReason: finalStatus === "REJECTED" ? rejectionReason : null
      });
      
      res.json({
        success: true,
        data: updatedListing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error updating listing"
        }
      });
    }
  });
  
  // Favorites API
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const savedListings = await storage.getUserSavedListings(userId);
      
      // Get full listing details for each saved listing
      const listings = await Promise.all(
        savedListings.map(async (saved) => {
          const listing = await storage.getListing(saved.listingId);
          return { ...saved, listing };
        })
      );
      
      res.json({
        success: true,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching favorites"
        }
      });
    }
  });
  
  app.post("/api/favorites/:listingId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const listingId = parseInt(req.params.listingId);
      
      // Check if listing exists
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Listing not found"
          }
        });
      }
      
      const savedListing = await storage.createUserSavedListing({
        userId,
        listingId
      });
      
      res.status(201).json({
        success: true,
        data: savedListing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error adding to favorites"
        }
      });
    }
  });
  
  app.delete("/api/favorites/:listingId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const listingId = parseInt(req.params.listingId);
      
      const result = await storage.deleteUserSavedListing(userId, listingId);
      if (!result) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Favorite not found"
          }
        });
      }
      
      res.json({
        success: true,
        data: { message: "Removed from favorites" }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error removing from favorites"
        }
      });
    }
  });
  
  // Orders API
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const orders = await storage.getOrdersByUserId(userId);
      
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItemsByOrderId(order.id);
          return { ...order, items };
        })
      );
      
      res.json({
        success: true,
        data: ordersWithItems
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error fetching orders"
        }
      });
    }
  });
  
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      
      const validatedOrderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        status: "CREATED"
      });
      
      const order = await storage.createOrder(validatedOrderData);
      
      // Create order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.createOrderItem({
            orderId: order.id,
            listingId: item.listingId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          });
        }
      }
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid order data",
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error creating order"
        }
      });
    }
  });
  
  // Payments API (mock payment for demonstration)
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const { orderId, paymentMethod } = req.body;
      
      // Check if order exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Order not found"
          }
        });
      }
      
      // Check if payment already exists
      const existingPayment = await storage.getPaymentByOrderId(orderId);
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          error: {
            code: "PAYMENT_EXISTS",
            message: "Payment already exists for this order"
          }
        });
      }
      
      // Simulate payment processing
      const validatedPaymentData = insertPaymentSchema.parse({
        orderId,
        amount: order.totalAmount,
        currency: order.currency,
        paymentMethod,
        status: "PENDING",
        transactionId: `mock-${Date.now()}`
      });
      
      const payment = await storage.createPayment(validatedPaymentData);
      
      // Update order status to PAID in case of success
      await storage.updateOrderStatus(orderId, "PAID");
      
      // Update payment status to COMPLETED in case of success
      const updatedPayment = await storage.updatePaymentStatus(payment.id, "COMPLETED");
      
      res.json({
        success: true,
        data: updatedPayment
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid payment data",
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error processing payment"
        }
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
