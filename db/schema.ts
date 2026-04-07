import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "employee",
  "partner",
]);

export const recordVisibilityEnum = pgEnum("record_visibility", [
  "private",
  "internal",
  "partner",
]);

export const knowledgeCategoryEnum = pgEnum("knowledge_category", [
  "campaign_result",
  "sponsor_info",
  "content_insight",
  "strategy_learning",
  "design_pattern",
  "general",
]);

export const knowledgeStatusEnum = pgEnum("knowledge_status", [
  "draft",
  "review",
  "approved",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "upload",
  "generated",
  "link",
]);

export const resourceStatusEnum = pgEnum("resource_status", [
  "draft",
  "published",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("partner").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  agentId: text("agent_id").notNull(),
  title: text("title"),
  visibility: recordVisibilityEnum("visibility").default("private").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  enriched: boolean("enriched").default(false).notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgebaseEntries = pgTable("knowledgebase_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  ownerId: uuid("owner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  agentId: text("agent_id").notNull(),
  category: knowledgeCategoryEnum("category").notNull(),
  status: knowledgeStatusEnum("status").default("draft").notNull(),
  visibility: recordVisibilityEnum("visibility").default("internal").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  sourceType: text("source_type").default("manual").notNull(),
  sourceResourceId: uuid("source_resource_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  type: resourceTypeEnum("type").default("upload").notNull(),
  status: resourceStatusEnum("status").default("draft").notNull(),
  visibility: recordVisibilityEnum("visibility").default("internal").notNull(),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  extension: text("extension"),
  sizeBytes: integer("size_bytes"),
  externalUrl: text("external_url"),
  textContent: text("text_content"),
  binaryContentBase64: text("binary_content_base64"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type KnowledgebaseEntry = typeof knowledgebaseEntries.$inferSelect;
export type Resource = typeof resources.$inferSelect;
