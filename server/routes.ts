import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq } from "drizzle-orm";
import { users, wallets, transactions, supportTickets, faqs } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Wallet routes
  app.get("/api/wallets", isAuthenticated, async (req, res, next) => {
    try {
      const userWallets = await storage.getUserWallets(req.user!.id);
      res.json(userWallets);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/wallets", isAuthenticated, async (req, res, next) => {
    try {
      const newWallet = await storage.createWallet({ 
        ...req.body, 
        userId: req.user!.id
      });
      res.status(201).json(newWallet);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/wallets/:id", isAuthenticated, async (req, res, next) => {
    try {
      const wallet = await storage.getWallet(Number(req.params.id));
      
      if (!wallet || wallet.userId !== req.user!.id) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.json(wallet);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/wallets/:id", isAuthenticated, async (req, res, next) => {
    try {
      const walletId = Number(req.params.id);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet || wallet.userId !== req.user!.id) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const updatedWallet = await storage.updateWallet(walletId, req.body);
      res.json(updatedWallet);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/wallets/:id", isAuthenticated, async (req, res, next) => {
    try {
      const walletId = Number(req.params.id);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet || wallet.userId !== req.user!.id) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      await storage.deleteWallet(walletId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req, res, next) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const userTransactions = await storage.getUserTransactions(req.user!.id, limit);
      res.json(userTransactions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/wallets/:walletId/transactions", isAuthenticated, async (req, res, next) => {
    try {
      const walletId = Number(req.params.walletId);
      const wallet = await storage.getWallet(walletId);
      
      if (!wallet || wallet.userId !== req.user!.id) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const walletTransactions = await storage.getWalletTransactions(walletId);
      res.json(walletTransactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req, res, next) => {
    try {
      if (req.body.walletId) {
        const wallet = await storage.getWallet(req.body.walletId);
        if (!wallet || wallet.userId !== req.user!.id) {
          return res.status(404).json({ message: "Wallet not found" });
        }
      }
      
      const newTransaction = await storage.createTransaction({
        ...req.body,
        userId: req.user!.id
      });
      
      res.status(201).json(newTransaction);
    } catch (error) {
      next(error);
    }
  });

  // KYC verification routes
  app.get("/api/kyc", isAuthenticated, async (req, res, next) => {
    try {
      const kycVerification = await storage.getUserKycVerification(req.user!.id);
      res.json(kycVerification || { status: "not_started" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/kyc", isAuthenticated, async (req, res, next) => {
    try {
      const newVerification = await storage.createKycVerification({
        ...req.body,
        userId: req.user!.id,
        status: "pending"
      });
      
      // Update user's KYC status
      await storage.updateUser(req.user!.id, { kycStatus: "pending" });
      
      res.status(201).json(newVerification);
    } catch (error) {
      next(error);
    }
  });

  // Support tickets routes
  app.get("/api/support/tickets", isAuthenticated, async (req, res, next) => {
    try {
      const tickets = await storage.getUserSupportTickets(req.user!.id);
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/support/tickets", isAuthenticated, async (req, res, next) => {
    try {
      const newTicket = await storage.createSupportTicket({
        ...req.body,
        userId: req.user!.id,
        status: "open"
      });
      
      res.status(201).json(newTicket);
    } catch (error) {
      next(error);
    }
  });

  // FAQ routes
  app.get("/api/faqs", async (req, res, next) => {
    try {
      const category = req.query.category as string;
      const allFaqs = category 
        ? await storage.getFaqsByCategory(category)
        : await storage.getFaqs();
      
      res.json(allFaqs);
    } catch (error) {
      next(error);
    }
  });

  // User profile route
  app.put("/api/user/profile", isAuthenticated, async (req, res, next) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.id, {
        ...req.body,
        // Don't allow updating username or password through this endpoint
        username: undefined,
        password: undefined
      });
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Login history
  app.get("/api/user/login-history", isAuthenticated, async (req, res, next) => {
    try {
      const history = await storage.getUserLoginHistory(req.user!.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
