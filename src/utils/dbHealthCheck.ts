/**
 * Database Health Check Utility
 *
 * Provides utilities to verify Supabase connection and database health
 */

import { supabase } from '../lib/supabase';

export interface HealthCheckResult {
    isHealthy: boolean;
    message: string;
    details?: {
        authenticated: boolean;
        canQuery: boolean;
        timestamp: string;
    };
}

/**
 * Performs a comprehensive health check on the Supabase connection
 * @returns HealthCheckResult object with connection status
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
    try {
        // Check 1: Verify Supabase client is initialized
        if (!supabase) {
            return {
                isHealthy: false,
                message: 'Supabase client is not initialized. Check environment variables.',
            };
        }

        // Check 2: Verify authentication state
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError) {
            return {
                isHealthy: false,
                message: `Authentication error: ${authError.message}`,
            };
        }

        const isAuthenticated = !!session?.user;

        // Check 3: Attempt a simple query to verify database access
        let canQuery = false;
        if (isAuthenticated) {
            const { error: queryError } = await supabase
                .from('user_profiles')
                .select('id')
                .limit(1);

            canQuery = !queryError;

            if (queryError) {
                console.warn('Database query test failed:', queryError);
            }
        }

        return {
            isHealthy: isAuthenticated && canQuery,
            message: isAuthenticated
                ? (canQuery ? 'Database connection is healthy' : 'Connected but cannot query database. Check RLS policies.')
                : 'Not authenticated. Please sign in.',
            details: {
                authenticated: isAuthenticated,
                canQuery,
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Health check failed:', error);
        return {
            isHealthy: false,
            message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Quick check if user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session?.user;
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }
}

/**
 * Checks if environment variables are properly configured
 * @returns boolean indicating if config is valid
 */
export function isConfigValid(): boolean {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return !!(supabaseUrl && supabaseAnonKey &&
              supabaseUrl !== 'your_supabase_project_url' &&
              supabaseAnonKey !== 'your_supabase_anon_key');
}
