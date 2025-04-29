import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const walletTypeEnum = pgEnum('wallet_type', ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 'binance']);
export const transactionTypeEnum = pgEnum('transaction_type', ['send', 'receive', 'swap']);
export const kycStatusEnum = pgEnum('kyc_status', ['not_started', 'pending', 'approved', 'rejected']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  kycStatus: kycStatusEnum("kyc_status").default('not_started').notNull(),
  avatarUrl: text("avatar_url"),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: walletTypeEnum("type").notNull(),
  address: text("address"),
  balance: doublePrecision("balance").default(0).notNull(),
  isConnected: boolean("is_connected").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId: integer("wallet_id").references(() => wallets.id, { onDelete: "set null" }),
  type: transactionTypeEnum("type").notNull(),
  amount: doublePrecision("amount").notNull(),
  cryptoAmount: doublePrecision("crypto_amount").notNull(),
  cryptoSymbol: text("crypto_symbol").notNull(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  hash: text("hash"),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// KYC verification table
export const kycVerifications = pgTable("kyc_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  idType: text("id_type").notNull(),
  idNumber: text("id_number").notNull(),
  idExpiry: timestamp("id_expiry"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Login history table
export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// FAQs table
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  transactions: many(transactions),
  kycVerifications: many(kycVerifications),
  loginHistory: many(loginHistory),
  supportTickets: many(supportTickets),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  name: true,
  type: true,
  address: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  walletId: true,
  type: true,
  amount: true,
  cryptoAmount: true,
  cryptoSymbol: true,
  fromAddress: true,
  toAddress: true,
  hash: true,
  status: true,
});

export const insertKycVerificationSchema = createInsertSchema(kycVerifications).pick({
  userId: true,
  idType: true,
  idNumber: true,
  idExpiry: true,
  status: true,
});

export const insertLoginHistorySchema = createInsertSchema(loginHistory).pick({
  userId: true,
  ipAddress: true,
  userAgent: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  subject: true,
  message: true,
  status: true,
});

export const insertFaqSchema = createInsertSchema(faqs).pick({
  question: true,
  answer: true,
  category: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;
export type KycVerification = typeof kycVerifications.$inferSelect;

export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistory = typeof loginHistory.$inferSelect;

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;
