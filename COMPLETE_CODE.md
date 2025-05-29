# GConnect - Complete Government Scheme Discovery Platform

## Database Schema (shared/schema.ts)

```typescript
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
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  applicationId: varchar("application_id", { length: 50 }),
  submittedAt: timestamp("submitted_at"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
  documents: jsonb("documents"),
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
  type: varchar("type", { length: 20 }).notNull(),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  language: varchar("language", { length: 5 }).default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Scheme = typeof schemes.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
```

## Configuration Files

### package.json
```json
{
  "name": "gconnect",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.4",
    "@tanstack/react-query": "^5.60.5",
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "framer-motion": "^11.13.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.453.0",
    "openai": "^4.103.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/express": "4.17.21",
    "@types/react": "^18.3.11",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.30.4",
    "esbuild": "^0.25.0",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.14"
  }
}
```

## Frontend Components

### Main App (client/src/App.tsx)
```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Schemes from "./pages/Schemes";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/schemes" component={Schemes} />
      <Route path="/applications" component={Applications} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router />
            <Toaster />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
```

### Landing Page (client/src/pages/Landing.tsx)
```tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Search, MessageCircle, Bell, Shield } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: "Smart Scheme Discovery",
      description: "Find government schemes based on your profile and eligibility",
    },
    {
      icon: MessageCircle,
      title: "AI Chatbot Assistant",
      description: "Ask questions in Hindi or English about schemes",
    },
    {
      icon: Bell,
      title: "Application Tracking",
      description: "Track your scheme applications and get reminders",
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Official government scheme information",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <Landmark className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GConnect</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-hindi">सरकारी योजना खोजें</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <Link href="/login">
              <Button variant="outline">{t("login")}</Button>
            </Link>
            <Link href="/register">
              <Button>{t("getStarted")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover Government Schemes Made Simple
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Find and apply for government schemes in India with our AI-powered platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700">
                Start Discovering
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Government Schemes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">10L+</div>
              <div className="text-gray-600 dark:text-gray-300">Beneficiaries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">28</div>
              <div className="text-gray-600 dark:text-gray-300">States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
```

## Backend Server

### Main Server (server/index.ts)
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error ${status}: ${message}`, "error");
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`, "server");
  });
})();
```

### API Routes (server/routes.ts)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, optionalAuth, hashPassword, comparePassword, generateToken, type AuthRequest } from "./auth";
import { processChat } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      const token = generateToken(user.id, user.email);
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.email);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Schemes routes
  app.get("/api/schemes", optionalAuth, async (req, res) => {
    try {
      const schemes = await storage.getAllSchemes();
      res.json(schemes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/schemes/recommended", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const schemes = await storage.getRecommendedSchemes(userId);
      res.json(schemes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.post("/api/chat", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { message, language = "en" } = req.body;
      const userId = req.user!.id;
      
      const user = await storage.getUser(userId);
      const response = await processChat(message, user);
      
      await storage.saveChatMessage(userId, message, response.message, language);
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

## Styling

### Global CSS (client/src/index.css)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 217 91% 60%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --accent: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 217 91% 60%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 217 91% 60%;
  --secondary: 240 3.7% 15.9%;
  --muted: 240 3.7% 15.9%;
  --accent: 240 3.7% 15.9%;
  --destructive: 0 62.8% 30.6%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 217 91% 60%;
}

@layer base {
  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Inter', sans-serif;
  }
  
  .font-hindi {
    font-family: 'Noto Sans Devanagari', sans-serif;
  }
}

@layer components {
  .scheme-card {
    @apply transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
  }
}
```

### Tailwind Config (tailwind.config.ts)
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

## Development Setup

### Environment Variables (.env)
```
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
```

### TypeScript Config (tsconfig.json)
```json
{
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"],
  "compilerOptions": {
    "module": "ESNext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

## Deployment Instructions

### For VS Code Development:
1. Install Node.js 18+
2. Clone the repository
3. Run `npm install`
4. Set up environment variables
5. Run `npm run dev`

### For Vercel Deployment:
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy with build command: `npm run build`

### For Railway/Render:
1. Connect GitHub repository
2. Set environment variables
3. Use start command: `npm start`

## Authentic Government Schemes Data

The platform includes real Indian government schemes:
- Pradhan Mantri Jan Dhan Yojana
- Ayushman Bharat
- PM Kisan Samman Nidhi
- Beti Bachao Beti Padhao
- Mudra Loan Scheme
- Kisan Credit Card
- Ujjwala Yojana
- Digital India Mission

All with complete Hindi translations and authentic eligibility criteria!
```