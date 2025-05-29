import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  age: integer("age"),
  gender: varchar("gender", { length: 10 }),
  income: integer("income"),
  occupation: varchar("occupation", { length: 100 }),
  state: varchar("state", { length: 50 }),
  district: varchar("district", { length: 50 }),
  isProfileComplete: boolean("is_profile_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Government schemes table
export const schemes = pgTable("schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi"),
  description: text("description").notNull(),
  descriptionHindi: text("description_hindi"),
  eligibility: text("eligibility").notNull(),
  eligibilityHindi: text("eligibility_hindi"),
  benefits: text("benefits").notNull(),
  benefitsHindi: text("benefits_hindi"),
  applicationProcess: text("application_process").notNull(),
  applicationProcessHindi: text("application_process_hindi"),
  officialLink: text("official_link"),
  category: varchar("category", { length: 50 }).notNull(),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  minIncome: integer("min_income"),
  maxIncome: integer("max_income"),
  targetGender: varchar("target_gender", { length: 10 }),
  targetStates: text("target_states").array(),
  targetOccupations: text("target_occupations").array(),
  applicationDeadline: timestamp("application_deadline"),
  isActive: boolean("is_active").default(true),
  documents: text("documents").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  schemeId: integer("scheme_id").notNull().references(() => schemes.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, under_review
  applicationId: varchar("application_id", { length: 50 }), // External application ID
  submittedAt: timestamp("submitted_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
  documents: jsonb("documents"), // Store document metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  titleHindi: text("title_hindi"),
  message: text("message").notNull(),
  messageHindi: text("message_hindi"),
  type: varchar("type", { length: 20 }).notNull(), // scheme_match, deadline_reminder, status_update
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"), // Additional data like scheme ID, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  language: varchar("language", { length: 5 }).default("en"), // en, hi, hinglish
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  notifications: many(notifications),
  chatMessages: many(chatMessages),
}));

export const schemesRelations = relations(schemes, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  scheme: one(schemes, {
    fields: [applications.schemeId],
    references: [schemes.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const profileUpdateSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  age: true,
  gender: true,
  income: true,
  occupation: true,
  state: true,
  district: true,
});

export const insertSchemeSchema = createInsertSchema(schemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const chatMessageSchema = z.object({
  message: z.string().min(1),
  language: z.enum(["en", "hi", "hinglish"]).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export type Scheme = typeof schemes.$inferSelect;
export type InsertScheme = z.infer<typeof insertSchemeSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;
