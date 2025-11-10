import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Database Types (matching our schema)
export interface Database {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string;
                    name: string;
                    status: 'Active' | 'Suspended';
                    role: 'admin' | 'user';
                    profile_picture: string | null;
                    usage: Record<string, number>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
            };
            saved_units: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    status: 'UnderConsideration' | 'OfferMade' | 'Purchased' | 'Rejected' | 'Pending';
                    notes: string | null;
                    deal_date: string | null;
                    total_price: number | null;
                    down_payment_percentage: number | null;
                    installment_amount: number | null;
                    installment_frequency: number | null;
                    maintenance_percentage: number | null;
                    handover_payment_percentage: number | null;
                    contract_date: string | null;
                    handover_date: string | null;
                    monthly_rent: number | null;
                    annual_rent_increase: number | null;
                    annual_operating_expenses: number | null;
                    annual_appreciation_rate: number | null;
                    appreciation_years: number | null;
                    discount_rate: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['saved_units']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['saved_units']['Insert']>;
            };
            portfolio_properties: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    property_type: 'apartment' | 'shop' | 'office' | 'clinic';
                    purchase_price: number;
                    monthly_rent: number;
                    annual_operating_expenses: number;
                    property_tax: number;
                    insurance: number;
                    area: number | null;
                    internal_area: number | null;
                    external_area: number | null;
                    garden_area: number | null;
                    roof_area: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['portfolio_properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['portfolio_properties']['Insert']>;
            };
            property_tasks: {
                Row: {
                    id: string;
                    property_id: string;
                    title: string;
                    date: string;
                    notes: string | null;
                    is_completed: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['property_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['property_tasks']['Insert']>;
            };
            property_documents: {
                Row: {
                    id: string;
                    property_id: string;
                    name: string;
                    file_url: string;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['property_documents']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['property_documents']['Insert']>;
            };
        };
    };
}
