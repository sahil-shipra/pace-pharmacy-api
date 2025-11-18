ALTER TABLE "documents" DROP CONSTRAINT "documents_reference_code_applications_reference_code_fk";
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "reference_code" DROP NOT NULL;