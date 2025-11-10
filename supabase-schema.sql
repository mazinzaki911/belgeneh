-- ============================================
-- Belgeneh Real Estate Investment Calculator
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- 1. Users Profile Table (extends Supabase Auth)
-- This table extends auth.users with custom fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    profile_picture TEXT,
    usage JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Saved Units Table
CREATE TABLE IF NOT EXISTS public.saved_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UnderConsideration' CHECK (status IN ('UnderConsideration', 'OfferMade', 'Purchased', 'Rejected', 'Pending')),
    notes TEXT,
    deal_date DATE,
    -- Unit data stored as JSONB for flexibility
    total_price NUMERIC(15, 2),
    down_payment_percentage NUMERIC(5, 2),
    installment_amount NUMERIC(15, 2),
    installment_frequency INTEGER, -- in months: 1, 3, 6, 12
    maintenance_percentage NUMERIC(5, 2),
    handover_payment_percentage NUMERIC(5, 2),
    contract_date DATE,
    handover_date DATE,
    monthly_rent NUMERIC(15, 2),
    annual_rent_increase NUMERIC(5, 2),
    annual_operating_expenses NUMERIC(15, 2),
    annual_appreciation_rate NUMERIC(5, 2),
    appreciation_years INTEGER,
    discount_rate NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Portfolio Properties Table
CREATE TABLE IF NOT EXISTS public.portfolio_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'shop', 'office', 'clinic')),
    purchase_price NUMERIC(15, 2) NOT NULL,
    monthly_rent NUMERIC(15, 2) NOT NULL,
    annual_operating_expenses NUMERIC(15, 2) DEFAULT 0,
    property_tax NUMERIC(15, 2) DEFAULT 0,
    insurance NUMERIC(15, 2) DEFAULT 0,
    area NUMERIC(10, 2),
    internal_area NUMERIC(10, 2),
    external_area NUMERIC(10, 2),
    garden_area NUMERIC(10, 2),
    roof_area NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Property Tasks Table
CREATE TABLE IF NOT EXISTS public.property_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.portfolio_properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Property Documents Table
CREATE TABLE IF NOT EXISTS public.property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.portfolio_properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Will store in Supabase Storage or as base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. App Settings Table (Global settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    tool_usage_limit INTEGER DEFAULT 0, -- 0 for unlimited
    disabled_tools JSONB DEFAULT '{}'::jsonb,
    calculator_settings JSONB DEFAULT '{}'::jsonb,
    action_icons JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for global notifications
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Global', 'UnitUpdate')),
    is_read BOOLEAN DEFAULT FALSE,
    related_unit_id UUID REFERENCES public.saved_units(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_saved_units_user_id ON public.saved_units(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_properties_user_id ON public.portfolio_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_property_tasks_property_id ON public.property_tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON public.property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Saved Units Policies
CREATE POLICY "Users can view their own saved units" ON public.saved_units
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved units" ON public.saved_units
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved units" ON public.saved_units
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved units" ON public.saved_units
    FOR DELETE USING (auth.uid() = user_id);

-- Portfolio Properties Policies
CREATE POLICY "Users can view their own properties" ON public.portfolio_properties
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" ON public.portfolio_properties
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" ON public.portfolio_properties
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" ON public.portfolio_properties
    FOR DELETE USING (auth.uid() = user_id);

-- Property Tasks Policies
CREATE POLICY "Users can view tasks for their properties" ON public.property_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_tasks.property_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tasks for their properties" ON public.property_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_tasks.property_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks for their properties" ON public.property_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_tasks.property_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks for their properties" ON public.property_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_tasks.property_id AND user_id = auth.uid()
        )
    );

-- Property Documents Policies (same pattern as tasks)
CREATE POLICY "Users can view documents for their properties" ON public.property_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_documents.property_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their properties" ON public.property_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_documents.property_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents for their properties" ON public.property_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.portfolio_properties
            WHERE id = property_documents.property_id AND user_id = auth.uid()
        )
    );

-- App Settings Policies (Admin only)
CREATE POLICY "Anyone can view app settings" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can update app settings" ON public.app_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_units_updated_at BEFORE UPDATE ON public.saved_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_properties_updated_at BEFORE UPDATE ON public.portfolio_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_tasks_updated_at BEFORE UPDATE ON public.property_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, status, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'Active',
        CASE
            WHEN NEW.email = 'said@gmail.com' THEN 'admin'
            ELSE 'user'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default app settings
INSERT INTO public.app_settings (
    is_maintenance_mode,
    maintenance_message,
    tool_usage_limit,
    disabled_tools,
    calculator_settings,
    action_icons
) VALUES (
    false,
    'The system is currently under maintenance. Please check back later.',
    0,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================
-- HELPFUL QUERIES FOR ADMINS
-- ============================================

-- View all users with their profiles
-- SELECT u.id, u.email, u.created_at, p.name, p.role, p.status
-- FROM auth.users u
-- LEFT JOIN public.user_profiles p ON u.id = p.id;

-- View user statistics
-- SELECT
--     u.email,
--     p.name,
--     COUNT(DISTINCT su.id) as saved_units_count,
--     COUNT(DISTINCT pp.id) as properties_count
-- FROM auth.users u
-- LEFT JOIN public.user_profiles p ON u.id = p.id
-- LEFT JOIN public.saved_units su ON u.id = su.user_id
-- LEFT JOIN public.portfolio_properties pp ON u.id = pp.user_id
-- GROUP BY u.id, u.email, p.name;
