import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { argon2id, hash, verify } from "argon2";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

async function hashPassword(password: string) {
  return await hash(password, { type: argon2id });
}

async function comparePasswords(supplied: string, stored: string) {
  return await verify(stored, supplied);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "cimplico-marketplace-secret";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        if (user.status !== "ACTIVE") {
          return done(null, false, { message: "Account is not active" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Register route
  app.post("/api/register", async (req: Request, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "User with this email already exists"
          }
        });
      }
      
      // Create new user
      const hashedPassword = await hashPassword(password);
      const userData: InsertUser = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "USER",
        status: "ACTIVE",
        avatar: null,
        phone: null
      };
      
      const newUser = await storage.createUser(userData);
      
      // Log the user in
      req.login(newUser, (err) => {
        if (err) return next(err);
        
        const userResponse = { ...newUser };
        delete userResponse.password;
        
        return res.status(201).json({
          success: true,
          data: userResponse
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: info?.message || "Invalid credentials"
          }
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        return res.status(200).json({
          success: true,
          data: userResponse
        });
      });
    })(req, res, next);
  });
  
  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: {
            code: "LOGOUT_ERROR",
            message: "Error during logout"
          }
        });
      }
      
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({
            success: false,
            error: {
              code: "SESSION_ERROR",
              message: "Error destroying session"
            }
          });
        }
        
        res.clearCookie("connect.sid");
        return res.status(200).json({
          success: true,
          data: { message: "Logged out successfully" }
        });
      });
    });
  });
  
  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: {
          code: "NOT_AUTHENTICATED",
          message: "Not authenticated"
        }
      });
    }
    
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    return res.status(200).json({
      success: true,
      data: userResponse
    });
  });
}
