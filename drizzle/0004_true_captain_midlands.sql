CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference_code" text NOT NULL,
	"path" text NOT NULL,
	"full_path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_reference_code_applications_reference_code_fk" FOREIGN KEY ("reference_code") REFERENCES "public"."applications"("reference_code") ON DELETE cascade ON UPDATE no action;