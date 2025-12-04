ALTER TABLE "bills" ADD COLUMN "invoice_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD COLUMN "report_impression" text;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_invoice_number_unique" UNIQUE("invoice_number");