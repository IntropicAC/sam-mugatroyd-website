CREATE TABLE "lens_check_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_issuer" text NOT NULL,
	"auth_subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "account_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "owner_account_id" uuid;--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "claim_hash" text;--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "claim_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "attempt_key" text;--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD COLUMN "submission_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX "lens_check_accounts_identity_idx" ON "lens_check_accounts" USING btree ("auth_issuer","auth_subject");--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD CONSTRAINT "lens_check_responses_owner_account_id_lens_check_accounts_id_fk" FOREIGN KEY ("owner_account_id") REFERENCES "public"."lens_check_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lens_check_responses_owner_idx" ON "lens_check_responses" USING btree ("owner_account_id","created_at");--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD CONSTRAINT "lens_check_responses_attempt_key_unique" UNIQUE("attempt_key");--> statement-breakpoint
ALTER TABLE "lens_check_responses" ADD CONSTRAINT "lens_check_response_account_owner" CHECK ("lens_check_responses"."owner_account_id" IS NULL OR "lens_check_responses"."account_required" = true);