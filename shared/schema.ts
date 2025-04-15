import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum definitions
export enum UserRole {
  USER = "USER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED"
}

export enum VendorVerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum ListingStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  INACTIVE = "INACTIVE"
}

export enum ListingType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
  DIGITAL = "DIGITAL"
}

export enum OrderStatus {
  CREATED = "CREATED",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum CommentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

// Define schema tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("USER"),
  status: text("status").notNull().default("ACTIVE"),
  avatar: text("avatar"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const vendorProfiles = pgTable("vendor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  businessNumber: text("business_number"),
  website: text("website"),
  description: text("description"),
  verificationStatus: text("verification_status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  parentId: integer("parent_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorProfiles.id),
  titleEn: text("title_en").notNull(),
  titleZh: text("title_zh").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionZh: text("description_zh").notNull(),
  price: doublePrecision("price").notNull(),
  type: text("type").notNull().default("SERVICE"),
  status: text("status").notNull().default("PENDING"),
  images: text("images").array(),
  categoryId: integer("category_id").references(() => categories.id),
  tags: text("tags").array(),
  rejectionReason: text("rejection_reason"),
  deliveryInstructions: text("delivery_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("CREATED"),
  totalAmount: doublePrecision("total_amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  deliveryDetails: jsonb("delivery_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: doublePrecision("unit_price").notNull()
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("PENDING"),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  status: text("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const userSavedListings = pgTable("user_saved_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  savedAt: timestamp("saved_at").defaultNow()
});

// Zod schemas for inserts and selections
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ 
  id: true 
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCommentSchema = createInsertSchema(comments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertUserSavedListingSchema = createInsertSchema(userSavedListings).omit({ 
  id: true, 
  savedAt: true 
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type VendorProfile = typeof vendorProfiles.$inferSelect;
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type UserSavedListing = typeof userSavedListings.$inferSelect;
export type InsertUserSavedListing = z.infer<typeof insertUserSavedListingSchema>;

// Custom schema for login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;
