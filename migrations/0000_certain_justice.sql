CREATE TABLE "mu_online"."functions" (
	"id" serial PRIMARY KEY NOT NULL,
	"file" text NOT NULL,
	"class" text,
	"function" text NOT NULL,
	"description" text NOT NULL,
	"embedding" vector(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
