CREATE TABLE "account_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_status_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
ALTER TABLE "account_status" ADD CONSTRAINT "account_status_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;