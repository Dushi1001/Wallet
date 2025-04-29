import { 
  users, wallets, transactions, kycVerifications, 
  loginHistory, supportTickets, faqs,
  type User, type InsertUser, 
  type Wallet, type InsertWallet,
  type Transaction, type InsertTransaction,
  type KycVerification, type InsertKycVerification,
  type LoginHistory, type InsertLoginHistory,
  type SupportTicket, type InsertSupportTicket,
  type Faq, type InsertFaq
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, InferSelectModel } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Wallet methods
  getWallet(id: number): Promise<Wallet | undefined>;
  getUserWallets(userId: number): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, data: Partial<Wallet>): Promise<Wallet | undefined>;
  deleteWallet(id: number): Promise<boolean>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  getWalletTransactions(walletId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // KYC verification methods
  getUserKycVerification(userId: number): Promise<KycVerification | undefined>;
  createKycVerification(verification: InsertKycVerification): Promise<KycVerification>;
  updateKycVerification(id: number, data: Partial<KycVerification>): Promise<KycVerification | undefined>;

  // Login history methods
  getUserLoginHistory(userId: number, limit?: number): Promise<LoginHistory[]>;
  createLoginHistory(history: InsertLoginHistory): Promise<LoginHistory>;

  // Support tickets methods
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;

  // FAQs methods
  getFaqs(): Promise<Faq[]>;
  getFaqsByCategory(category: string): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;

  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db
      .insert(wallets)
      .values(wallet)
      .returning();
    return newWallet;
  }

  async updateWallet(id: number, data: Partial<Wallet>): Promise<Wallet | undefined> {
    const [updatedWallet] = await db
      .update(wallets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wallets.id, id))
      .returning();
    return updatedWallet;
  }

  async deleteWallet(id: number): Promise<boolean> {
    const result = await db
      .delete(wallets)
      .where(eq(wallets.id, id))
      .returning({ id: wallets.id });
    return result.length > 0;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
  }

  async getWalletTransactions(walletId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.timestamp));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // KYC verification methods
  async getUserKycVerification(userId: number): Promise<KycVerification | undefined> {
    const [verification] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId))
      .orderBy(desc(kycVerifications.createdAt))
      .limit(1);
    return verification;
  }

  async createKycVerification(verification: InsertKycVerification): Promise<KycVerification> {
    const [newVerification] = await db
      .insert(kycVerifications)
      .values(verification)
      .returning();
    return newVerification;
  }

  async updateKycVerification(id: number, data: Partial<KycVerification>): Promise<KycVerification | undefined> {
    const [updatedVerification] = await db
      .update(kycVerifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(kycVerifications.id, id))
      .returning();
    return updatedVerification;
  }

  // Login history methods
  async getUserLoginHistory(userId: number, limit = 10): Promise<LoginHistory[]> {
    return await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.timestamp))
      .limit(limit);
  }

  async createLoginHistory(history: InsertLoginHistory): Promise<LoginHistory> {
    const [newHistory] = await db
      .insert(loginHistory)
      .values(history)
      .returning();
    return newHistory;
  }

  // Support tickets methods
  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // FAQs methods
  async getFaqs(): Promise<Faq[]> {
    return await db
      .select()
      .from(faqs)
      .orderBy(faqs.category);
  }

  async getFaqsByCategory(category: string): Promise<Faq[]> {
    return await db
      .select()
      .from(faqs)
      .where(eq(faqs.category, category))
      .orderBy(faqs.id);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const [newFaq] = await db
      .insert(faqs)
      .values(faq)
      .returning();
    return newFaq;
  }
}

export const storage = new DatabaseStorage();
