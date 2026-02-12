-- ============================================================================
-- Seed Data: Development Data for Pool Service CRM
-- Run with: npx supabase db reset (includes migrations + seed)
-- Or manually: psql -f seed.sql
-- ============================================================================

-- ============================================================================
-- SETUP INSTRUCTIONS
-- ============================================================================
-- For LOCAL development (npx supabase start):
--   1. Run: npx supabase db reset
--   2. This creates a test user automatically
--
-- For REMOTE/Production:
--   1. Create a user in Supabase Dashboard > Authentication > Users
--   2. Update SEED_ADMIN_EMAIL and run this seed manually
-- ============================================================================

-- Configuration
\set SEED_ADMIN_EMAIL 'admin@poolcrm.local'
\set SEED_ADMIN_PASSWORD 'password123'
\set SEED_ADMIN_NAME 'Demo Admin'

DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN;

    -- Customer IDs for reference
    customer1_id UUID;
    customer2_id UUID;
    customer3_id UUID;
    customer4_id UUID;
    customer5_id UUID;

    -- Property IDs for reference
    property1_id UUID;
    property2_id UUID;
    property3_id UUID;
    property4a_id UUID;
    property4b_id UUID;
    property5_id UUID;

    -- Pool IDs for reference
    pool1_id UUID;
    pool2_id UUID;
    pool3_id UUID;
    pool4a_id UUID;
    pool4b_id UUID;
    pool5_id UUID;

    -- Tag IDs for reference
    tag_vip_id UUID;
    tag_residential_id UUID;
    tag_commercial_id UUID;
    tag_new_lead_id UUID;
    tag_priority_id UUID;
    tag_seasonal_id UUID;
BEGIN
    -- ========================================================================
    -- Create Auth User (for local development)
    -- ========================================================================
    -- Check if we can create auth users (local Supabase only)
    -- In production, users are created via Dashboard

    -- Try to find existing admin by email
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@poolcrm.local'
    LIMIT 1;

    -- If no admin exists, create one (works in local Supabase)
    IF admin_user_id IS NULL THEN
        -- Generate a UUID for the new user
        admin_user_id := gen_random_uuid();

        -- Insert into auth.users (local Supabase only)
        -- This mimics what Supabase Auth does internally
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@poolcrm.local',
            crypt('password123', gen_salt('bf')),  -- Password: password123
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Demo Admin"}',
            'authenticated',
            'authenticated',
            NOW(),
            NOW(),
            '',
            ''
        )
        ON CONFLICT (id) DO NOTHING;

        -- Also insert identity for the user
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            admin_user_id,
            'admin@poolcrm.local',
            jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@poolcrm.local'),
            'email',
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Created auth user: admin@poolcrm.local (password: password123)';
    ELSE
        RAISE NOTICE 'Using existing auth user: %', admin_user_id;
    END IF;

    -- Verify admin user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = admin_user_id) INTO admin_exists;

    IF NOT admin_exists THEN
        RAISE EXCEPTION 'Failed to create or find admin user';
    END IF;

    -- ========================================================================
    -- Admin Profile
    -- ========================================================================
    INSERT INTO admins (id, email, full_name)
    VALUES (admin_user_id, 'admin@poolcrm.local', 'Demo Admin')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;

    RAISE NOTICE 'Admin profile created/updated';

    -- ========================================================================
    -- Tags (6 tags for variety)
    -- ========================================================================
    INSERT INTO customer_tags (id, name, color) VALUES
        (gen_random_uuid(), 'VIP', '#8b5cf6'),
        (gen_random_uuid(), 'Residential', '#3b82f6'),
        (gen_random_uuid(), 'Commercial', '#10b981'),
        (gen_random_uuid(), 'New Lead', '#f59e0b'),
        (gen_random_uuid(), 'Priority', '#ef4444'),
        (gen_random_uuid(), 'Seasonal', '#06b6d4')
    ON CONFLICT (name) DO NOTHING;

    -- Get tag IDs
    SELECT id INTO tag_vip_id FROM customer_tags WHERE name = 'VIP';
    SELECT id INTO tag_residential_id FROM customer_tags WHERE name = 'Residential';
    SELECT id INTO tag_commercial_id FROM customer_tags WHERE name = 'Commercial';
    SELECT id INTO tag_new_lead_id FROM customer_tags WHERE name = 'New Lead';
    SELECT id INTO tag_priority_id FROM customer_tags WHERE name = 'Priority';
    SELECT id INTO tag_seasonal_id FROM customer_tags WHERE name = 'Seasonal';

    RAISE NOTICE 'Created 6 customer tags';

    -- ========================================================================
    -- Customers (5 customers with variety)
    -- ========================================================================
    INSERT INTO customers (id, phone, name, email, source, created_by)
    VALUES
        (gen_random_uuid(), '(555) 123-4567', 'John Smith', 'john.smith@example.com', 'referral', admin_user_id),
        (gen_random_uuid(), '555-987-6543', 'Sarah Johnson', 'sarah.j@example.com', 'website', admin_user_id),
        (gen_random_uuid(), '5552468135', 'Acme Corp', 'facilities@acme.example.com', 'phone', admin_user_id),
        (gen_random_uuid(), '(555) 333-2211', 'Robert Williams', 'rwilliams@example.com', 'referral', admin_user_id),
        (gen_random_uuid(), '555.444.5566', 'Miami Beach Resort', 'maintenance@miamiresort.example.com', 'website', admin_user_id)
    ON CONFLICT DO NOTHING;

    -- Get customer IDs
    SELECT id INTO customer1_id FROM customers WHERE name = 'John Smith';
    SELECT id INTO customer2_id FROM customers WHERE name = 'Sarah Johnson';
    SELECT id INTO customer3_id FROM customers WHERE name = 'Acme Corp';
    SELECT id INTO customer4_id FROM customers WHERE name = 'Robert Williams';
    SELECT id INTO customer5_id FROM customers WHERE name = 'Miami Beach Resort';

    RAISE NOTICE 'Created 5 customers';

    -- ========================================================================
    -- Customer Tags (assignments)
    -- ========================================================================
    INSERT INTO customer_tag_links (customer_id, tag_id) VALUES
        (customer1_id, tag_vip_id),
        (customer1_id, tag_residential_id),
        (customer2_id, tag_residential_id),
        (customer2_id, tag_new_lead_id),
        (customer3_id, tag_commercial_id),
        (customer4_id, tag_residential_id),
        (customer4_id, tag_priority_id),
        (customer5_id, tag_commercial_id),
        (customer5_id, tag_vip_id),
        (customer5_id, tag_seasonal_id)
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- Properties (6 properties - customer4 has 2 properties)
    -- ========================================================================
    INSERT INTO properties (id, customer_id, address_line1, address_line2, city, state, zip_code, gate_code, access_notes)
    VALUES
        (gen_random_uuid(), customer1_id, '123 Oak Street', NULL, 'Miami', 'FL', '33101', '1234', 'Enter through side gate'),
        (gen_random_uuid(), customer2_id, '456 Palm Avenue', 'Unit A', 'Fort Lauderdale', 'FL', '33301', NULL, 'Dogs in backyard - call before arriving'),
        (gen_random_uuid(), customer3_id, '789 Corporate Blvd', 'Suite 100', 'Boca Raton', 'FL', '33432', '9999#', 'Check in at front desk'),
        (gen_random_uuid(), customer4_id, '321 Sunset Drive', NULL, 'Coral Gables', 'FL', '33134', '5678', 'Main residence'),
        (gen_random_uuid(), customer4_id, '999 Beach Road', 'Penthouse', 'Key Biscayne', 'FL', '33149', '0000', 'Vacation property - call ahead'),
        (gen_random_uuid(), customer5_id, '500 Ocean Drive', NULL, 'Miami Beach', 'FL', '33139', NULL, 'Service entrance on Collins Ave')
    ON CONFLICT DO NOTHING;

    -- Get property IDs
    SELECT id INTO property1_id FROM properties WHERE address_line1 = '123 Oak Street';
    SELECT id INTO property2_id FROM properties WHERE address_line1 = '456 Palm Avenue';
    SELECT id INTO property3_id FROM properties WHERE address_line1 = '789 Corporate Blvd';
    SELECT id INTO property4a_id FROM properties WHERE address_line1 = '321 Sunset Drive';
    SELECT id INTO property4b_id FROM properties WHERE address_line1 = '999 Beach Road';
    SELECT id INTO property5_id FROM properties WHERE address_line1 = '500 Ocean Drive';

    RAISE NOTICE 'Created 6 properties';

    -- ========================================================================
    -- Pools (6 pools - one per property, variety of types)
    -- ========================================================================
    INSERT INTO pools (id, property_id, type, surface_type, length_ft, width_ft, depth_shallow_ft, depth_deep_ft, volume_gallons, equipment_notes)
    VALUES
        (gen_random_uuid(), property1_id, 'inground', 'pebble', 32, 16, 3.5, 9, 25000, 'Variable speed pump, salt chlorine generator, solar heating'),
        (gen_random_uuid(), property2_id, 'inground', 'tile', 24, 12, 4, 8, 15000, 'Standard pump, cartridge filter, gas heater'),
        (gen_random_uuid(), property3_id, 'inground', 'plaster', 50, 25, 4, 12, 75000, 'Commercial dual pump system, DE filter, heat pump'),
        (gen_random_uuid(), property4a_id, 'inground', 'pebble', 40, 20, 3, 10, 35000, 'Pentair variable speed, salt system, LED lighting'),
        (gen_random_uuid(), property4b_id, 'spa', 'tile', 8, 8, 3, 4, 500, 'Hot tub with jets, ozone system'),
        (gen_random_uuid(), property5_id, 'inground', 'tile', 75, 40, 4, 15, 150000, 'Olympic-size commercial pool, multiple pumps, chlorine injection system')
    ON CONFLICT DO NOTHING;

    -- Get pool IDs
    SELECT id INTO pool1_id FROM pools WHERE property_id = property1_id;
    SELECT id INTO pool2_id FROM pools WHERE property_id = property2_id;
    SELECT id INTO pool3_id FROM pools WHERE property_id = property3_id;
    SELECT id INTO pool4a_id FROM pools WHERE property_id = property4a_id;
    SELECT id INTO pool4b_id FROM pools WHERE property_id = property4b_id;
    SELECT id INTO pool5_id FROM pools WHERE property_id = property5_id;

    RAISE NOTICE 'Created 6 pools';

    -- ========================================================================
    -- Customer Notes (variety of notes)
    -- ========================================================================
    INSERT INTO customer_notes (customer_id, content, created_by) VALUES
        (customer1_id, 'Long-time customer, very particular about chemical balance. Prefers service on Tuesdays.', admin_user_id),
        (customer1_id, 'Referred us to their neighbor - potential new customer.', admin_user_id),
        (customer2_id, 'Interested in weekly maintenance service. Follow up after estimate.', admin_user_id),
        (customer3_id, 'Contact Maria (facilities manager) for scheduling. Building closes at 6 PM.', admin_user_id),
        (customer3_id, 'Budget approved for quarterly deep cleaning services.', admin_user_id),
        (customer4_id, 'Has two properties - ensure both are serviced same day when possible.', admin_user_id),
        (customer4_id, 'Prefers text message communication over phone calls.', admin_user_id),
        (customer5_id, 'Large commercial account - VIP treatment required.', admin_user_id),
        (customer5_id, 'Peak season: Memorial Day through Labor Day. Need extra attention.', admin_user_id),
        (customer5_id, 'Health inspector visits monthly - ensure compliance documentation ready.', admin_user_id);

    RAISE NOTICE 'Created 10 customer notes';

    -- ========================================================================
    -- Communications (variety of types and directions)
    -- ========================================================================
    INSERT INTO communications (customer_id, type, direction, summary, occurred_at, logged_by) VALUES
        -- Customer 1 - John Smith
        (customer1_id, 'call', 'inbound', 'Customer called to report cloudy water. Scheduled visit for tomorrow.', NOW() - INTERVAL '2 days', admin_user_id),
        (customer1_id, 'call', 'outbound', 'Called to confirm appointment. Customer confirmed availability.', NOW() - INTERVAL '1 day', admin_user_id),
        (customer1_id, 'text', 'outbound', 'Sent appointment reminder for tomorrow at 10 AM.', NOW() - INTERVAL '12 hours', admin_user_id),

        -- Customer 2 - Sarah Johnson
        (customer2_id, 'email', 'inbound', 'Initial inquiry about pool cleaning services from website form.', NOW() - INTERVAL '3 days', admin_user_id),
        (customer2_id, 'call', 'outbound', 'Called to discuss services and schedule estimate visit.', NOW() - INTERVAL '2 days', admin_user_id),
        (customer2_id, 'email', 'outbound', 'Sent service brochure and pricing information.', NOW() - INTERVAL '1 day', admin_user_id),

        -- Customer 3 - Acme Corp
        (customer3_id, 'email', 'outbound', 'Sent monthly maintenance proposal for commercial account.', NOW() - INTERVAL '5 days', admin_user_id),
        (customer3_id, 'call', 'inbound', 'Maria called to discuss proposal. Requested quarterly option.', NOW() - INTERVAL '3 days', admin_user_id),
        (customer3_id, 'email', 'outbound', 'Sent revised proposal with quarterly deep cleaning option.', NOW() - INTERVAL '2 days', admin_user_id),

        -- Customer 4 - Robert Williams
        (customer4_id, 'text', 'inbound', 'New customer inquiry via text: interested in service for 2 properties.', NOW() - INTERVAL '4 days', admin_user_id),
        (customer4_id, 'text', 'outbound', 'Replied with availability for estimate visits.', NOW() - INTERVAL '4 days' + INTERVAL '2 hours', admin_user_id),
        (customer4_id, 'call', 'outbound', 'Called to discuss multi-property discount. Customer interested.', NOW() - INTERVAL '3 days', admin_user_id),

        -- Customer 5 - Miami Beach Resort
        (customer5_id, 'email', 'inbound', 'RFP received for commercial pool maintenance contract.', NOW() - INTERVAL '10 days', admin_user_id),
        (customer5_id, 'call', 'outbound', 'Called to schedule site visit and discuss requirements.', NOW() - INTERVAL '8 days', admin_user_id),
        (customer5_id, 'email', 'outbound', 'Submitted comprehensive proposal for resort pool services.', NOW() - INTERVAL '5 days', admin_user_id),
        (customer5_id, 'call', 'inbound', 'Contract manager called with questions about insurance coverage.', NOW() - INTERVAL '2 days', admin_user_id);

    RAISE NOTICE 'Created 16 communications';

    -- ========================================================================
    -- Calendar Events (variety of types, statuses, and times)
    -- ========================================================================
    INSERT INTO calendar_events (customer_id, property_id, pool_id, title, description, event_type, status, start_datetime, end_datetime, created_by) VALUES
        -- Upcoming events
        (customer1_id, property1_id, pool1_id, 'Pool Consultation - Smith', 'Initial consultation to assess pool condition and discuss treatment plan', 'consultation', 'scheduled',
            (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '10 hours',
            (CURRENT_DATE + INTERVAL '1 day')::timestamp + INTERVAL '11 hours', admin_user_id),
        (customer2_id, property2_id, pool2_id, 'Estimate Visit - Johnson', 'On-site visit for maintenance estimate', 'estimate_visit', 'scheduled',
            (CURRENT_DATE + INTERVAL '2 days')::timestamp + INTERVAL '14 hours',
            (CURRENT_DATE + INTERVAL '2 days')::timestamp + INTERVAL '15 hours', admin_user_id),
        (customer3_id, property3_id, pool3_id, 'Monthly Check-in - Acme Corp', 'Regular monthly maintenance review with facilities manager', 'follow_up', 'scheduled',
            (CURRENT_DATE + INTERVAL '1 week')::timestamp + INTERVAL '9 hours',
            (CURRENT_DATE + INTERVAL '1 week')::timestamp + INTERVAL '10 hours', admin_user_id),
        (customer4_id, property4a_id, pool4a_id, 'Estimate - Williams Main Residence', 'Estimate for main residence pool service', 'estimate_visit', 'scheduled',
            (CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '11 hours',
            (CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '12 hours', admin_user_id),
        (customer4_id, property4b_id, pool4b_id, 'Estimate - Williams Beach Property', 'Estimate for beach property spa', 'estimate_visit', 'scheduled',
            (CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '14 hours',
            (CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '15 hours', admin_user_id),
        (customer5_id, property5_id, pool5_id, 'Contract Signing - Miami Beach Resort', 'Final contract review and signing', 'other', 'scheduled',
            (CURRENT_DATE + INTERVAL '4 days')::timestamp + INTERVAL '10 hours',
            (CURRENT_DATE + INTERVAL '4 days')::timestamp + INTERVAL '11 hours', admin_user_id),

        -- Past completed events
        (customer1_id, property1_id, pool1_id, 'Previous Service - Smith', 'Completed regular maintenance visit', 'other', 'completed',
            (CURRENT_DATE - INTERVAL '1 week')::timestamp + INTERVAL '10 hours',
            (CURRENT_DATE - INTERVAL '1 week')::timestamp + INTERVAL '11 hours', admin_user_id),
        (customer3_id, property3_id, pool3_id, 'Initial Consultation - Acme', 'First meeting with facilities team', 'consultation', 'completed',
            (CURRENT_DATE - INTERVAL '2 weeks')::timestamp + INTERVAL '9 hours',
            (CURRENT_DATE - INTERVAL '2 weeks')::timestamp + INTERVAL '10 hours', admin_user_id),
        (customer5_id, property5_id, pool5_id, 'Site Survey - Miami Resort', 'Conducted comprehensive site survey', 'consultation', 'completed',
            (CURRENT_DATE - INTERVAL '1 week')::timestamp + INTERVAL '8 hours',
            (CURRENT_DATE - INTERVAL '1 week')::timestamp + INTERVAL '11 hours', admin_user_id),

        -- Canceled event
        (customer2_id, property2_id, pool2_id, 'Canceled: Initial Visit - Johnson', 'Customer rescheduled due to conflict', 'consultation', 'canceled',
            (CURRENT_DATE - INTERVAL '3 days')::timestamp + INTERVAL '14 hours',
            (CURRENT_DATE - INTERVAL '3 days')::timestamp + INTERVAL '15 hours', admin_user_id);

    RAISE NOTICE 'Created 10 calendar events';

    -- ========================================================================
    -- Estimates (variety of statuses and line items)
    -- ========================================================================

    -- Estimate 1: John Smith - Sent
    INSERT INTO estimates (customer_id, pool_id, status, line_items, tax_rate, notes, valid_until, created_by)
    VALUES (
        customer1_id,
        pool1_id,
        'sent',
        '[
            {"id": "11111111-1111-1111-1111-111111111111", "description": "Weekly Pool Cleaning Service (4 visits)", "quantity": 4, "unit_price_cents": 15000},
            {"id": "11111111-1111-1111-1111-111111111112", "description": "Chemical Balance Treatment", "quantity": 1, "unit_price_cents": 7500},
            {"id": "11111111-1111-1111-1111-111111111113", "description": "Filter Cleaning", "quantity": 1, "unit_price_cents": 5000}
        ]'::jsonb,
        0.07,
        'Monthly maintenance package. Includes all chemicals. Service day: Tuesday.',
        (CURRENT_DATE + INTERVAL '30 days')::date,
        admin_user_id
    );

    -- Estimate 2: Sarah Johnson - Draft
    INSERT INTO estimates (customer_id, pool_id, status, line_items, tax_rate, notes, valid_until, created_by)
    VALUES (
        customer2_id,
        pool2_id,
        'draft',
        '[
            {"id": "22222222-2222-2222-2222-222222222221", "description": "Initial Pool Assessment", "quantity": 1, "unit_price_cents": 9900},
            {"id": "22222222-2222-2222-2222-222222222222", "description": "Algae Treatment - Severe", "quantity": 1, "unit_price_cents": 12500},
            {"id": "22222222-2222-2222-2222-222222222223", "description": "Filter Deep Clean", "quantity": 1, "unit_price_cents": 8500}
        ]'::jsonb,
        0.07,
        'One-time treatment for algae issue. May require follow-up visit.',
        NULL,
        admin_user_id
    );

    -- Estimate 3: Acme Corp - Converted
    INSERT INTO estimates (customer_id, pool_id, status, line_items, tax_rate, notes, valid_until, created_by)
    VALUES (
        customer3_id,
        pool3_id,
        'converted',
        '[
            {"id": "33333333-3333-3333-3333-333333333331", "description": "Commercial Pool Maintenance (Monthly)", "quantity": 1, "unit_price_cents": 250000},
            {"id": "33333333-3333-3333-3333-333333333332", "description": "Quarterly Deep Cleaning", "quantity": 1, "unit_price_cents": 75000},
            {"id": "33333333-3333-3333-3333-333333333333", "description": "Emergency Call-out Coverage", "quantity": 1, "unit_price_cents": 50000}
        ]'::jsonb,
        0.07,
        'Annual commercial maintenance contract. Includes 24/7 emergency support.',
        (CURRENT_DATE + INTERVAL '90 days')::date,
        admin_user_id
    );

    -- Estimate 4: Robert Williams - Multiple properties - Sent
    INSERT INTO estimates (customer_id, pool_id, status, line_items, tax_rate, notes, valid_until, created_by)
    VALUES (
        customer4_id,
        pool4a_id,
        'sent',
        '[
            {"id": "44444444-4444-4444-4444-444444444441", "description": "Weekly Service - Main Residence Pool", "quantity": 4, "unit_price_cents": 17500},
            {"id": "44444444-4444-4444-4444-444444444442", "description": "Weekly Service - Beach Property Spa", "quantity": 4, "unit_price_cents": 7500},
            {"id": "44444444-4444-4444-4444-444444444443", "description": "Multi-Property Discount", "quantity": 1, "unit_price_cents": -10000}
        ]'::jsonb,
        0.07,
        'Combined service for both properties. 10% multi-property discount applied.',
        (CURRENT_DATE + INTERVAL '14 days')::date,
        admin_user_id
    );

    -- Estimate 5: Miami Beach Resort - Internal Final (pending contract)
    INSERT INTO estimates (customer_id, pool_id, status, line_items, tax_rate, notes, valid_until, created_by)
    VALUES (
        customer5_id,
        pool5_id,
        'internal_final',
        '[
            {"id": "55555555-5555-5555-5555-555555555551", "description": "Daily Pool Maintenance (Olympic Size)", "quantity": 30, "unit_price_cents": 35000},
            {"id": "55555555-5555-5555-5555-555555555552", "description": "Chemical Supply Package - Commercial Grade", "quantity": 1, "unit_price_cents": 150000},
            {"id": "55555555-5555-5555-5555-555555555553", "description": "Equipment Inspection (Monthly)", "quantity": 1, "unit_price_cents": 45000},
            {"id": "55555555-5555-5555-5555-555555555554", "description": "Staff Training (Quarterly)", "quantity": 1, "unit_price_cents": 25000},
            {"id": "55555555-5555-5555-5555-555555555555", "description": "Health Compliance Documentation", "quantity": 1, "unit_price_cents": 15000}
        ]'::jsonb,
        0.07,
        'Comprehensive resort pool service. Includes daily service, supplies, training, and compliance support.',
        (CURRENT_DATE + INTERVAL '60 days')::date,
        admin_user_id
    );

    -- Estimate 6: John Smith - Declined (old estimate)
    INSERT INTO estimates (customer_id, pool_id, status, line_items, tax_rate, notes, valid_until, created_by)
    VALUES (
        customer1_id,
        pool1_id,
        'declined',
        '[
            {"id": "66666666-6666-6666-6666-666666666661", "description": "Pool Resurfacing - Pebble Finish", "quantity": 1, "unit_price_cents": 850000},
            {"id": "66666666-6666-6666-6666-666666666662", "description": "Tile Replacement - Waterline", "quantity": 1, "unit_price_cents": 250000}
        ]'::jsonb,
        0.07,
        'Customer declined - decided to wait until next year for renovation.',
        (CURRENT_DATE - INTERVAL '30 days')::date,
        admin_user_id
    );

    RAISE NOTICE 'Created 6 estimates';

    -- ========================================================================
    -- Summary
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'SEED DATA COMPLETE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Login credentials:';
    RAISE NOTICE '  Email: admin@poolcrm.local';
    RAISE NOTICE '  Password: password123';
    RAISE NOTICE '';
    RAISE NOTICE 'Data created:';
    RAISE NOTICE '  - 1 admin user';
    RAISE NOTICE '  - 6 customer tags';
    RAISE NOTICE '  - 5 customers';
    RAISE NOTICE '  - 6 properties';
    RAISE NOTICE '  - 6 pools';
    RAISE NOTICE '  - 10 customer notes';
    RAISE NOTICE '  - 16 communications';
    RAISE NOTICE '  - 10 calendar events';
    RAISE NOTICE '  - 6 estimates';
    RAISE NOTICE '==========================================';

END $$;
