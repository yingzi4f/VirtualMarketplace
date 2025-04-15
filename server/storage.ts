import { User, InsertUser, VendorProfile, InsertVendorProfile, Listing, InsertListing, Category, InsertCategory, Order, InsertOrder, OrderItem, InsertOrderItem, Payment, InsertPayment, Comment, InsertComment, UserSavedListing, InsertUserSavedListing, users, vendorProfiles, categories, listings, orders, orderItems, payments, comments, userSavedListings } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { json } from "drizzle-orm/pg-core";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Vendor operations
  getVendorProfile(id: number): Promise<VendorProfile | undefined>;
  getVendorProfileByUserId(userId: number): Promise<VendorProfile | undefined>;
  createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile>;
  updateVendorProfile(id: number, profile: Partial<VendorProfile>): Promise<VendorProfile | undefined>;
  getPendingVendors(): Promise<VendorProfile[]>;
  
  // Listing operations
  getListing(id: number): Promise<Listing | undefined>;
  getListingsByVendorId(vendorId: number): Promise<Listing[]>;
  getListingsByCategory(categoryId: number): Promise<Listing[]>;
  getActiveListings(limit?: number, offset?: number): Promise<Listing[]>;
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  getTopRatedListings(limit?: number): Promise<Listing[]>;
  getPendingListings(): Promise<Listing[]>;
  searchListings(query: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<Listing>): Promise<Listing | undefined>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByOrderId(orderId: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Comment operations
  getCommentsByListingId(listingId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentStatus(id: number, status: string): Promise<Comment | undefined>;
  
  // UserSavedListing operations
  getUserSavedListings(userId: number): Promise<UserSavedListing[]>;
  createUserSavedListing(savedListing: InsertUserSavedListing): Promise<UserSavedListing>;
  deleteUserSavedListing(userId: number, listingId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vendorProfiles: Map<number, VendorProfile>;
  private categories: Map<number, Category>;
  private listings: Map<number, Listing>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private payments: Map<number, Payment>;
  private comments: Map<number, Comment>;
  private userSavedListings: Map<number, UserSavedListing>;
  
  private userId: number;
  private vendorProfileId: number;
  private categoryId: number;
  private listingId: number;
  private orderId: number;
  private orderItemId: number;
  private paymentId: number;
  private commentId: number;
  private userSavedListingId: number;
  
  sessionStore: session.SessionStore;
  
  constructor() {
    this.users = new Map();
    this.vendorProfiles = new Map();
    this.categories = new Map();
    this.listings = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.payments = new Map();
    this.comments = new Map();
    this.userSavedListings = new Map();
    
    this.userId = 1;
    this.vendorProfileId = 1;
    this.categoryId = 1;
    this.listingId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.paymentId = 1;
    this.commentId = 1;
    this.userSavedListingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with admin user
    this.users.set(this.userId, {
      id: this.userId++,
      email: "admin@cimplico.com",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aHBVJm+5q0lFVkXmutTu/A$+2V+AfbEr8KlWnUYsOBL+gUKJQaQJBjNmqxllcXAcyI", // password: admin123
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
      avatar: null,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Initialize with some categories
    const categories = [
      { nameEn: "Accounting Services", nameZh: "会计服务", slug: "accounting-services", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" },
      { nameEn: "Consulting Services", nameZh: "咨询服务", slug: "consulting-services", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" },
      { nameEn: "Tax Services", nameZh: "税务服务", slug: "tax-services", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" },
      { nameEn: "Business Services", nameZh: "商业服务", slug: "business-services", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" },
      { nameEn: "Tech Services", nameZh: "技术服务", slug: "tech-services", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" }
    ];
    
    categories.forEach(cat => {
      this.categories.set(this.categoryId, {
        id: this.categoryId,
        nameEn: cat.nameEn,
        nameZh: cat.nameZh,
        slug: cat.slug,
        image: cat.image,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      this.categoryId++;
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.userId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...user,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Vendor operations
  async getVendorProfile(id: number): Promise<VendorProfile | undefined> {
    return this.vendorProfiles.get(id);
  }
  
  async getVendorProfileByUserId(userId: number): Promise<VendorProfile | undefined> {
    return Array.from(this.vendorProfiles.values()).find(profile => profile.userId === userId);
  }
  
  async createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile> {
    const newProfile: VendorProfile = {
      ...profile,
      id: this.vendorProfileId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.vendorProfiles.set(newProfile.id, newProfile);
    return newProfile;
  }
  
  async updateVendorProfile(id: number, profile: Partial<VendorProfile>): Promise<VendorProfile | undefined> {
    const existingProfile = this.vendorProfiles.get(id);
    if (!existingProfile) return undefined;
    
    const updatedProfile: VendorProfile = {
      ...existingProfile,
      ...profile,
      updatedAt: new Date()
    };
    this.vendorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  async getPendingVendors(): Promise<VendorProfile[]> {
    return Array.from(this.vendorProfiles.values()).filter(profile => profile.verificationStatus === 'PENDING');
  }
  
  // Listing operations
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }
  
  async getListingsByVendorId(vendorId: number): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(listing => listing.vendorId === vendorId);
  }
  
  async getListingsByCategory(categoryId: number): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(listing => 
      listing.categoryId === categoryId && listing.status === 'ACTIVE'
    );
  }
  
  async getActiveListings(limit?: number, offset: number = 0): Promise<Listing[]> {
    let activeListings = Array.from(this.listings.values())
      .filter(listing => listing.status === 'ACTIVE')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset);
    
    if (limit) {
      activeListings = activeListings.slice(0, limit);
    }
    
    return activeListings;
  }
  
  async getFeaturedListings(limit?: number): Promise<Listing[]> {
    // In a real DB we'd have a featured flag, here we'll just use some of the active listings
    let featuredListings = Array.from(this.listings.values())
      .filter(listing => listing.status === 'ACTIVE')
      .sort(() => 0.5 - Math.random()); // Random sort for demo
    
    if (limit) {
      featuredListings = featuredListings.slice(0, limit);
    }
    
    return featuredListings;
  }
  
  async getTopRatedListings(limit?: number): Promise<Listing[]> {
    // In a real DB we'd join with comments to calculate average ratings
    let topRatedListings = Array.from(this.listings.values())
      .filter(listing => listing.status === 'ACTIVE')
      .sort(() => 0.5 - Math.random()); // Random sort for demo
    
    if (limit) {
      topRatedListings = topRatedListings.slice(0, limit);
    }
    
    return topRatedListings;
  }
  
  async getPendingListings(): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(listing => listing.status === 'PENDING');
  }
  
  async searchListings(query: string): Promise<Listing[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.listings.values()).filter(listing => 
      (listing.titleEn.toLowerCase().includes(lowerQuery) || 
      listing.titleZh.toLowerCase().includes(lowerQuery) ||
      listing.descriptionEn.toLowerCase().includes(lowerQuery) ||
      listing.descriptionZh.toLowerCase().includes(lowerQuery)) &&
      listing.status === 'ACTIVE'
    );
  }
  
  async createListing(listing: InsertListing): Promise<Listing> {
    const newListing: Listing = {
      ...listing,
      id: this.listingId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.listings.set(newListing.id, newListing);
    return newListing;
  }
  
  async updateListing(id: number, listing: Partial<Listing>): Promise<Listing | undefined> {
    const existingListing = this.listings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing: Listing = {
      ...existingListing,
      ...listing,
      updatedAt: new Date()
    };
    this.listings.set(id, updatedListing);
    return updatedListing;
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: this.categoryId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: this.orderId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }
  
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const newItem: OrderItem = {
      ...item,
      id: this.orderItemId++
    };
    this.orderItems.set(newItem.id, newItem);
    return newItem;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder: Order = {
      ...existingOrder,
      status,
      updatedAt: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: this.paymentId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.set(newPayment.id, newPayment);
    return newPayment;
  }
  
  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.orderId === orderId);
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment: Payment = {
      ...existingPayment,
      status,
      updatedAt: new Date()
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Comment operations
  async getCommentsByListingId(listingId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.listingId === listingId && comment.status === 'APPROVED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      id: this.commentId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.comments.set(newComment.id, newComment);
    return newComment;
  }
  
  async updateCommentStatus(id: number, status: string): Promise<Comment | undefined> {
    const existingComment = this.comments.get(id);
    if (!existingComment) return undefined;
    
    const updatedComment: Comment = {
      ...existingComment,
      status,
      updatedAt: new Date()
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }
  
  // UserSavedListing operations
  async getUserSavedListings(userId: number): Promise<UserSavedListing[]> {
    return Array.from(this.userSavedListings.values())
      .filter(saved => saved.userId === userId)
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }
  
  async createUserSavedListing(savedListing: InsertUserSavedListing): Promise<UserSavedListing> {
    // Check if already exists
    const existing = Array.from(this.userSavedListings.values()).find(
      item => item.userId === savedListing.userId && item.listingId === savedListing.listingId
    );
    
    if (existing) {
      return existing;
    }
    
    const newSavedListing: UserSavedListing = {
      ...savedListing,
      id: this.userSavedListingId++,
      savedAt: new Date()
    };
    this.userSavedListings.set(newSavedListing.id, newSavedListing);
    return newSavedListing;
  }
  
  async deleteUserSavedListing(userId: number, listingId: number): Promise<boolean> {
    const saved = Array.from(this.userSavedListings.values())
      .find(item => item.userId === userId && item.listingId === listingId);
    
    if (saved) {
      return this.userSavedListings.delete(saved.id);
    }
    
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Vendor operations
  async getVendorProfile(id: number): Promise<VendorProfile | undefined> {
    const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.id, id));
    return profile;
  }

  async getVendorProfileByUserId(userId: number): Promise<VendorProfile | undefined> {
    const [profile] = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId));
    return profile;
  }

  async createVendorProfile(profile: InsertVendorProfile): Promise<VendorProfile> {
    const [createdProfile] = await db.insert(vendorProfiles).values(profile).returning();
    return createdProfile;
  }

  async updateVendorProfile(id: number, profile: Partial<VendorProfile>): Promise<VendorProfile | undefined> {
    const [updatedProfile] = await db
      .update(vendorProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(vendorProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getPendingVendors(): Promise<VendorProfile[]> {
    return await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.verificationStatus, 'PENDING'));
  }

  // Listing operations
  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async getListingsByVendorId(vendorId: number): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(eq(listings.vendorId, vendorId));
  }

  async getListingsByCategory(categoryId: number): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.categoryId, categoryId),
          eq(listings.status, 'ACTIVE')
        )
      );
  }

  async getActiveListings(limit?: number, offset: number = 0): Promise<Listing[]> {
    const query = db
      .select()
      .from(listings)
      .where(eq(listings.status, 'ACTIVE'))
      .orderBy(desc(listings.createdAt))
      .offset(offset);
    
    if (limit !== undefined) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getFeaturedListings(limit?: number): Promise<Listing[]> {
    const query = db
      .select()
      .from(listings)
      .where(eq(listings.status, 'ACTIVE'))
      .orderBy(desc(listings.createdAt));
    
    if (limit !== undefined) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getTopRatedListings(limit?: number): Promise<Listing[]> {
    const query = db
      .select()
      .from(listings)
      .where(eq(listings.status, 'ACTIVE'))
      .orderBy(desc(listings.createdAt));
    
    if (limit !== undefined) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getPendingListings(): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(eq(listings.status, 'PENDING'));
  }

  async searchListings(query: string): Promise<Listing[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.status, 'ACTIVE'),
          or(
            like(listings.titleEn, searchTerm),
            like(listings.titleZh, searchTerm),
            like(listings.descriptionEn, searchTerm),
            like(listings.descriptionZh, searchTerm)
          )
        )
      );
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [createdListing] = await db.insert(listings).values(listing).returning();
    return createdListing;
  }

  async updateListing(id: number, listing: Partial<Listing>): Promise<Listing | undefined> {
    const [updatedListing] = await db
      .update(listings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return updatedListing;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db.insert(categories).values(category).returning();
    return createdCategory;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [createdOrder] = await db.insert(orders).values(order).returning();
    return createdOrder;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [createdItem] = await db.insert(orderItems).values(item).returning();
    return createdItem;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db.insert(payments).values(payment).returning();
    return createdPayment;
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId));
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Comment operations
  async getCommentsByListingId(listingId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.listingId, listingId),
          eq(comments.status, 'APPROVED')
        )
      )
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [createdComment] = await db.insert(comments).values(comment).returning();
    return createdComment;
  }

  async updateCommentStatus(id: number, status: string): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set({ status, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  // UserSavedListing operations
  async getUserSavedListings(userId: number): Promise<UserSavedListing[]> {
    return await db
      .select()
      .from(userSavedListings)
      .where(eq(userSavedListings.userId, userId))
      .orderBy(desc(userSavedListings.savedAt));
  }

  async createUserSavedListing(savedListing: InsertUserSavedListing): Promise<UserSavedListing> {
    const [created] = await db.insert(userSavedListings).values(savedListing).returning();
    return created;
  }

  async deleteUserSavedListing(userId: number, listingId: number): Promise<boolean> {
    const result = await db
      .delete(userSavedListings)
      .where(
        and(
          eq(userSavedListings.userId, userId),
          eq(userSavedListings.listingId, listingId)
        )
      );
    return result.count > 0;
  }
}

// Use this line to switch between memory storage and database storage
export const storage = new DatabaseStorage();
