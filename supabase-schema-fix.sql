-- ============================================
-- Belgeneh Real Estate Investment Calculator
-- Supabase Database Schema - FIXED RLS Policies
-- ============================================

-- This script fixes the infinite recursion issue in RLS policies
-- Run this AFTER running the main supabase-schema.sql

-- ============================================
-- DROP PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- ============================================
-- CREATE HELPER FUNCTION TO CHECK ADMIN ROLE
-- ============================================

-- Function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RECREATE ADMIN POLICIES WITH FIXED LOGIC
-- ============================================

-- Admins can view all profiles (using helper function)
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        public.is_admin()
    );

-- Admins can update all profiles (using helper function)
CREATE POLICY "Admins can update all profiles" ON public.user_profiles
    FOR UPDATE USING (
        public.is_admin()
    );

-- ============================================
-- FIX APP SETTINGS POLICY
-- ============================================

DROP POLICY IF EXISTS "Only admins can update app settings" ON public.app_settings;

CREATE POLICY "Only admins can update app settings" ON public.app_settings
    FOR ALL USING (
        public.is_admin()
    );

-- ============================================
-- FIX NOTIFICATIONS POLICY
-- ============================================

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        public.is_admin()
    );

-- ============================================
-- VERIFICATION
-- ============================================

-- Test the function (optional - run this to verify it works)
-- SELECT public.is_admin();
-- Should return TRUE if you're logged in as admin, FALSE otherwise

-- View all policies (optional - to verify they're created)
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'user_profiles';
