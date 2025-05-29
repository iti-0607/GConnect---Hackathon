import { 
  users, 
  schemes, 
  applications, 
  notifications, 
  chatMessages,
  type User, 
  type InsertUser,
  type Scheme,
  type InsertScheme,
  type Application,
  type InsertApplication,
  type Notification,
  type InsertNotification,
  type ChatMessage,
  type ProfileUpdate
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, inArray, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profile: ProfileUpdate): Promise<User>;

  // Scheme operations
  getAllSchemes(): Promise<Scheme[]>;
  getScheme(id: number): Promise<Scheme | undefined>;
  getRecommendedSchemes(userId: number): Promise<Scheme[]>;
  searchSchemes(query: string, filters?: any): Promise<Scheme[]>;
  createScheme(scheme: InsertScheme): Promise<Scheme>;

  // Application operations
  getUserApplications(userId: number): Promise<(Application & { scheme: Scheme })[]>;
  getApplication(id: number): Promise<(Application & { scheme: Scheme }) | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string, notes?: string): Promise<Application>;

  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;

  // Chat operations
  getUserChatHistory(userId: number, limit?: number): Promise<ChatMessage[]>;
  saveChatMessage(userId: number, message: string, response: string, language?: string): Promise<ChatMessage>;

  // Analytics
  getDashboardStats(userId: number): Promise<{
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    upcomingDeadlines: number;
    eligibleSchemes: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProfile(id: number, profile: ProfileUpdate): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...profile, 
        isProfileComplete: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllSchemes(): Promise<Scheme[]> {
    return await db
      .select()
      .from(schemes)
      .where(eq(schemes.isActive, true))
      .orderBy(desc(schemes.createdAt));
  }

  async getScheme(id: number): Promise<Scheme | undefined> {
    const [scheme] = await db
      .select()
      .from(schemes)
      .where(and(eq(schemes.id, id), eq(schemes.isActive, true)));
    return scheme;
  }

  async getRecommendedSchemes(userId: number): Promise<Scheme[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const conditions = [eq(schemes.isActive, true)];

    // Add age filter if user has age
    if (user.age) {
      if (schemes.minAge) {
        conditions.push(gte(schemes.minAge, user.age));
      }
      if (schemes.maxAge) {
        conditions.push(lte(schemes.maxAge, user.age));
      }
    }

    // Add income filter if user has income
    if (user.income) {
      if (schemes.minIncome) {
        conditions.push(lte(schemes.minIncome, user.income));
      }
      if (schemes.maxIncome) {
        conditions.push(gte(schemes.maxIncome, user.income));
      }
    }

    // Add gender filter
    if (user.gender) {
      conditions.push(
        sql`(${schemes.targetGender} IS NULL OR ${schemes.targetGender} = ${user.gender} OR ${schemes.targetGender} = 'all')`
      );
    }

    // Add state filter
    if (user.state) {
      conditions.push(
        sql`(${schemes.targetStates} IS NULL OR ${user.state} = ANY(${schemes.targetStates}))`
      );
    }

    // Add occupation filter
    if (user.occupation) {
      conditions.push(
        sql`(${schemes.targetOccupations} IS NULL OR ${user.occupation} = ANY(${schemes.targetOccupations}))`
      );
    }

    return await db
      .select()
      .from(schemes)
      .where(and(...conditions))
      .orderBy(desc(schemes.createdAt))
      .limit(10);
  }

  async searchSchemes(query: string, filters?: any): Promise<Scheme[]> {
    let whereCondition = and(
      eq(schemes.isActive, true),
      sql`(
        ${schemes.name} ILIKE ${`%${query}%`} OR 
        ${schemes.nameHindi} ILIKE ${`%${query}%`} OR 
        ${schemes.description} ILIKE ${`%${query}%`} OR 
        ${schemes.category} ILIKE ${`%${query}%`}
      )`
    );

    if (filters?.category) {
      whereCondition = and(whereCondition, eq(schemes.category, filters.category))!;
    }

    return await db
      .select()
      .from(schemes)
      .where(whereCondition)
      .orderBy(desc(schemes.createdAt));
  }

  async createScheme(scheme: InsertScheme): Promise<Scheme> {
    const [newScheme] = await db
      .insert(schemes)
      .values(scheme)
      .returning();
    return newScheme;
  }

  async getUserApplications(userId: number): Promise<any[]> {
    const userApps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
    
    const result = [];
    for (const app of userApps) {
      const scheme = await this.getScheme(app.schemeId);
      if (scheme) {
        result.push({ ...app, scheme });
      }
    }
    return result;
  }

  async getApplication(id: number): Promise<any | undefined> {
    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    
    if (!app) return undefined;
    
    const scheme = await this.getScheme(app.schemeId);
    return scheme ? { ...app, scheme } : undefined;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string, notes?: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ 
        status, 
        notes, 
        lastUpdated: new Date() 
      })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getUserChatHistory(userId: number, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async saveChatMessage(userId: number, message: string, response: string, language = "en"): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values({
        userId,
        message,
        response,
        language,
      })
      .returning();
    return chatMessage;
  }

  async getDashboardStats(userId: number): Promise<{
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    upcomingDeadlines: number;
    eligibleSchemes: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        upcomingDeadlines: 0,
        eligibleSchemes: 0,
      };
    }

    // Get application counts
    const [totalApplicationsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.userId, userId));

    const [approvedApplicationsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "approved")));

    const [pendingApplicationsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.status, "pending")));

    // Get upcoming deadlines (within next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [upcomingDeadlinesResult] = await db
      .select({ count: count() })
      .from(schemes)
      .innerJoin(applications, eq(schemes.id, applications.schemeId))
      .where(
        and(
          eq(applications.userId, userId),
          gte(schemes.applicationDeadline, new Date()),
          lte(schemes.applicationDeadline, nextWeek)
        )
      );

    // Get eligible schemes count
    const eligibleSchemes = await this.getRecommendedSchemes(userId);

    return {
      totalApplications: totalApplicationsResult.count,
      approvedApplications: approvedApplicationsResult.count,
      pendingApplications: pendingApplicationsResult.count,
      upcomingDeadlines: upcomingDeadlinesResult.count,
      eligibleSchemes: eligibleSchemes.length,
    };
  }
}

export const storage = new DatabaseStorage();
