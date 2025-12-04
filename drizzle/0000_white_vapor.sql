CREATE TABLE "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"final_amount" numeric(10, 2) NOT NULL,
	"is_paid" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" text NOT NULL,
	"name" text NOT NULL,
	"specialization" text,
	"contact_number" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "doctors_doctor_id_unique" UNIQUE("doctor_id")
);
--> statement-breakpoint
CREATE TABLE "patient_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"test_id" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"full_name" text NOT NULL,
	"age" integer,
	"gender" text,
	"phone_number" text NOT NULL,
	"address_line_1" text NOT NULL,
	"state" text NOT NULL,
	"pincode" text NOT NULL,
	"medical_history" text,
	"allergies" text,
	"insurance_policy_number" text,
	"referred_by" integer,
	"patient_consent" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "patients_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
CREATE TABLE "test_parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" integer NOT NULL,
	"parameter_name" text NOT NULL,
	"unit" text,
	"normal_range" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_test_id" integer NOT NULL,
	"parameter_id" integer NOT NULL,
	"value" text NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tests_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_referred_by_doctors_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_parameters" ADD CONSTRAINT "test_parameters_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_patient_test_id_patient_tests_id_fk" FOREIGN KEY ("patient_test_id") REFERENCES "public"."patient_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_parameter_id_test_parameters_id_fk" FOREIGN KEY ("parameter_id") REFERENCES "public"."test_parameters"("id") ON DELETE no action ON UPDATE no action;