CREATE TABLE "email_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message_id" varchar(36) NOT NULL,
	"status" varchar(50) NOT NULL,
	"submitted_at" timestamp NOT NULL,
	"error_code" integer DEFAULT 0,
	"to_email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_deliveries_message_id_unique" UNIQUE("message_id")
);
