CREATE TYPE "public"."knowledge_category" AS ENUM('campaign_result', 'sponsor_info', 'content_insight', 'strategy_learning', 'design_pattern', 'general');--> statement-breakpoint
CREATE TYPE "public"."knowledge_status" AS ENUM('draft', 'review', 'approved');--> statement-breakpoint
CREATE TYPE "public"."record_visibility" AS ENUM('private', 'internal', 'partner');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('upload', 'generated', 'link');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'employee', 'partner');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"agent_id" text NOT NULL,
	"title" text,
	"visibility" "record_visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"enriched" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgebase_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid,
	"owner_id" uuid,
	"agent_id" text NOT NULL,
	"category" "knowledge_category" NOT NULL,
	"status" "knowledge_status" DEFAULT 'draft' NOT NULL,
	"visibility" "record_visibility" DEFAULT 'internal' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"source_type" text DEFAULT 'manual' NOT NULL,
	"source_resource_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"conversation_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"type" "resource_type" DEFAULT 'upload' NOT NULL,
	"status" "resource_status" DEFAULT 'draft' NOT NULL,
	"visibility" "record_visibility" DEFAULT 'internal' NOT NULL,
	"file_name" text,
	"mime_type" text,
	"extension" text,
	"size_bytes" integer,
	"external_url" text,
	"text_content" text,
	"binary_content_base64" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'partner' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgebase_entries" ADD CONSTRAINT "knowledgebase_entries_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgebase_entries" ADD CONSTRAINT "knowledgebase_entries_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;