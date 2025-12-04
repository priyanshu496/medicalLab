CREATE TABLE "lab_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"lab_name" text NOT NULL,
	"lab_logo" text,
	"gstin_number" text,
	"registration_number" text NOT NULL,
	"police_station_name" text,
	"address" text,
	"phone_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone_number" text,
	"role_id" integer NOT NULL,
	"lab_info_id" integer NOT NULL,
	"permissions" text DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "patient_tests" ADD COLUMN "test_entry_date" timestamp;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD COLUMN "test_result_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_lab_info_id_lab_info_id_fk" FOREIGN KEY ("lab_info_id") REFERENCES "public"."lab_info"("id") ON DELETE no action ON UPDATE no action;