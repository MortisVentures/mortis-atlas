-- =============================================================================
-- PHASE 2B: Referral Counter Triggers
-- Auto-update Contact referral metrics when deals are created/updated
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: Update referral metrics for a contact
-- Recalculates total_referrals_made, successful_referrals, and conversion_rate
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_contact_referral_metrics(contact_id TEXT)
RETURNS VOID AS $$
DECLARE
    total_deals INT;
    won_deals INT;
    total_companies INT;
    total_refs INT;
    conversion DECIMAL(5,2);
    last_ref TIMESTAMP;
BEGIN
    -- Skip if contact_id is null
    IF contact_id IS NULL THEN
        RETURN;
    END IF;

    -- Count deals referred by this contact
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE stage = 'CLOSED_WON')
    INTO total_deals, won_deals
    FROM "Deal"
    WHERE "referrerContactId" = contact_id;

    -- Count companies referred by this contact
    SELECT COUNT(*)
    INTO total_companies
    FROM "Company"
    WHERE "referrerContactId" = contact_id;

    -- Total referrals = deals + companies
    total_refs := total_deals + total_companies;

    -- Calculate conversion rate (successful deals / total referrals * 100)
    IF total_refs > 0 THEN
        conversion := (won_deals::DECIMAL / total_refs::DECIMAL) * 100;
    ELSE
        conversion := NULL;
    END IF;

    -- Get the most recent referral date
    SELECT MAX(COALESCE("referralDate", "createdAt"))
    INTO last_ref
    FROM "Deal"
    WHERE "referrerContactId" = contact_id;

    -- Update the contact record
    UPDATE "Contact"
    SET
        "totalReferralsMade" = total_refs,
        "successfulReferrals" = won_deals,
        "referralConversionRate" = conversion,
        "lastReferralDate" = last_ref,
        "updatedAt" = NOW()
    WHERE id = contact_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Trigger Function: Handle deal INSERT
-- When a new deal is created with a referrer, update their metrics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_deal_insert_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Update referrer metrics if referrer is set
    IF NEW."referrerContactId" IS NOT NULL THEN
        PERFORM update_contact_referral_metrics(NEW."referrerContactId");
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Trigger Function: Handle deal UPDATE
-- When deal stage changes or referrer changes, update metrics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_deal_update_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- If referrer changed, update both old and new referrer
    IF OLD."referrerContactId" IS DISTINCT FROM NEW."referrerContactId" THEN
        -- Update old referrer (decrement)
        IF OLD."referrerContactId" IS NOT NULL THEN
            PERFORM update_contact_referral_metrics(OLD."referrerContactId");
        END IF;
        -- Update new referrer (increment)
        IF NEW."referrerContactId" IS NOT NULL THEN
            PERFORM update_contact_referral_metrics(NEW."referrerContactId");
        END IF;
    -- If stage changed (especially to/from CLOSED_WON), update referrer metrics
    ELSIF OLD.stage IS DISTINCT FROM NEW.stage THEN
        IF NEW."referrerContactId" IS NOT NULL THEN
            PERFORM update_contact_referral_metrics(NEW."referrerContactId");
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Trigger Function: Handle deal DELETE
-- When a deal is deleted, update referrer metrics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_deal_delete_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Update referrer metrics if referrer was set
    IF OLD."referrerContactId" IS NOT NULL THEN
        PERFORM update_contact_referral_metrics(OLD."referrerContactId");
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Trigger Function: Handle company INSERT/UPDATE/DELETE for referrals
-- Companies can also have referrers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_company_referral()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD."referrerContactId" IS NOT NULL THEN
            PERFORM update_contact_referral_metrics(OLD."referrerContactId");
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If referrer changed, update both
        IF OLD."referrerContactId" IS DISTINCT FROM NEW."referrerContactId" THEN
            IF OLD."referrerContactId" IS NOT NULL THEN
                PERFORM update_contact_referral_metrics(OLD."referrerContactId");
            END IF;
            IF NEW."referrerContactId" IS NOT NULL THEN
                PERFORM update_contact_referral_metrics(NEW."referrerContactId");
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        IF NEW."referrerContactId" IS NOT NULL THEN
            PERFORM update_contact_referral_metrics(NEW."referrerContactId");
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Drop existing triggers if they exist (for idempotency)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS deal_insert_referral_trigger ON "Deal";
DROP TRIGGER IF EXISTS deal_update_referral_trigger ON "Deal";
DROP TRIGGER IF EXISTS deal_delete_referral_trigger ON "Deal";
DROP TRIGGER IF EXISTS company_referral_trigger ON "Company";

-- -----------------------------------------------------------------------------
-- Create triggers on Deal table
-- -----------------------------------------------------------------------------
CREATE TRIGGER deal_insert_referral_trigger
    AFTER INSERT ON "Deal"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_deal_insert_referral();

CREATE TRIGGER deal_update_referral_trigger
    AFTER UPDATE ON "Deal"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_deal_update_referral();

CREATE TRIGGER deal_delete_referral_trigger
    AFTER DELETE ON "Deal"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_deal_delete_referral();

-- -----------------------------------------------------------------------------
-- Create trigger on Company table
-- -----------------------------------------------------------------------------
CREATE TRIGGER company_referral_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Company"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_company_referral();

-- -----------------------------------------------------------------------------
-- Initialize existing data (one-time run)
-- Update all contacts that have referrals
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    contact_record RECORD;
BEGIN
    -- Find all contacts that are referrers
    FOR contact_record IN
        SELECT DISTINCT "referrerContactId" as id
        FROM "Deal"
        WHERE "referrerContactId" IS NOT NULL
        UNION
        SELECT DISTINCT "referrerContactId" as id
        FROM "Company"
        WHERE "referrerContactId" IS NOT NULL
    LOOP
        PERFORM update_contact_referral_metrics(contact_record.id);
    END LOOP;
END $$;
