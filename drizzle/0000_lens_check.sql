CREATE TABLE "lens_check_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"follow_up_consent" boolean DEFAULT false NOT NULL,
	"follow_up_consent_at" timestamp with time zone,
	"consent_wording_version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lens_check_leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "lens_check_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"questionnaire_version" text NOT NULL,
	"answers" jsonb NOT NULL,
	"dimension_scores" jsonb NOT NULL,
	"result_kind" text NOT NULL,
	"archetype_id" text,
	"secondary_archetype_id" text,
	"source" jsonb,
	"helpful_rating" text,
	"lead_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"claimed_at" timestamp with time zone,
	CONSTRAINT "lens_check_responses_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD CONSTRAINT "lens_check_responses_lead_id_lens_check_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lens_check_leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lens_check_responses_lead_id_idx" ON "lens_check_responses" USING btree ("lead_id");