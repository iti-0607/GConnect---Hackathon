import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, optionalAuth, hashPassword, comparePassword, generateToken, type AuthRequest } from "./auth";
import { processChat } from "./openai";
import { 
  insertUserSchema, 
  loginSchema, 
  profileUpdateSchema, 
  insertApplicationSchema,
  chatMessageSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user.id, user.email);

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        token,
        message: "User registered successfully"
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile routes
  app.put("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = profileUpdateSchema.parse(req.body);
      const user = await storage.updateUserProfile(req.user!.id, validatedData);
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Scheme routes
  app.get("/api/schemes", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { search, category } = req.query;
      
      let schemes;
      if (search) {
        schemes = await storage.searchSchemes(search as string, { category });
      } else {
        schemes = await storage.getAllSchemes();
      }
      
      res.json(schemes);
    } catch (error) {
      console.error("Get schemes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/schemes/recommended", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const schemes = await storage.getRecommendedSchemes(req.user!.id);
      res.json(schemes);
    } catch (error) {
      console.error("Get recommended schemes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/schemes/:id", async (req, res) => {
    try {
      const schemeId = parseInt(req.params.id);
      const scheme = await storage.getScheme(schemeId);
      
      if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
      }
      
      res.json(scheme);
    } catch (error) {
      console.error("Get scheme error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Application routes
  app.get("/api/applications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const applications = await storage.getUserApplications(req.user!.id);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/applications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/applications/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      const application = await storage.updateApplicationStatus(applicationId, status, notes);
      res.json(application);
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/notifications/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/notifications/read-all", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.markAllNotificationsRead(req.user!.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat routes
  app.post("/api/chat", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { message, language } = chatMessageSchema.parse(req.body);
      
      // Get user profile for context
      const user = await storage.getUser(req.user!.id);
      const userProfile = user ? {
        age: user.age,
        gender: user.gender,
        income: user.income,
        occupation: user.occupation,
        state: user.state,
      } : undefined;

      // Process with OpenAI
      const response = await processChat(message, userProfile);
      
      // Save chat history
      await storage.saveChatMessage(
        req.user!.id,
        message,
        response.message,
        language || response.language
      );
      
      res.json(response);
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/chat/history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = await storage.getUserChatHistory(req.user!.id, limit);
      res.json(history);
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
