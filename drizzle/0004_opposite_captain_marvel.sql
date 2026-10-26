CREATE TABLE "lens_check_journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"secret_hash" text NOT NULL,
	"questionnaire_version" text NOT NULL,
	"notice_version" text NOT NULL,
	"cohort" text NOT NULL,
	"device" text NOT NULL,
	"source" jsonb,
	"stage" text NOT NULL,
	"question_id" text,
	"question_number" integer DEFAULT 0 NOT NULL,
	"furthest_question" integer DEFAULT 0 NOT NULL,
	"total_questions" integer NOT NULL,
	"processed_count" integer DEFAULT 0 NOT NULL,
	"answered_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"not_applicable_count" integer DEFAULT 0 NOT NULL,
	"active_seconds" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"sequence" bigint NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"response_id" uuid,
	"withdrawn_at" timestamp with time zone,
	CONSTRAINT "lens_check_journeys_secret_hash_unique" UNIQUE("secret_hash")
);
--> statement-breakpoint
CREATE TABLE "lens_check_report_access" (
	"email" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"granted_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lens_check_report_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "cohort" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "helpful_rated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lens_check_journeys" ADD CONSTRAINT "lens_check_journeys_response_id_lens_check_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."lens_check_responses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lens_check_journeys_report_idx" ON "lens_check_journeys" USING btree ("questionnaire_version","started_at");