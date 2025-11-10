import { supabase } from './supabase';
import { SavedUnit, FullUnitData, PortfolioProperty, PropertyTask, PropertyDocument } from '../types';

// ============================================
// SAVED UNITS API
// ============================================

export const savedUnitsAPI = {
    // Get all saved units for the current user
    async getAll(): Promise<SavedUnit[]> {
        const { data, error } = await supabase
            .from('saved_units')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(unit => ({
            id: unit.id,
            name: unit.name,
            status: unit.status as any,
            notes: unit.notes || undefined,
            dealDate: unit.deal_date || undefined,
            data: {
                totalPrice: String(unit.total_price || ''),
                downPaymentPercentage: String(unit.down_payment_percentage || ''),
                installmentAmount: String(unit.installment_amount || ''),
                installmentFrequency: String(unit.installment_frequency || ''),
                maintenancePercentage: String(unit.maintenance_percentage || ''),
                handoverPaymentPercentage: String(unit.handover_payment_percentage || ''),
                contractDate: unit.contract_date || '',
                handoverDate: unit.handover_date || '',
                monthlyRent: String(unit.monthly_rent || ''),
                annualRentIncrease: String(unit.annual_rent_increase || ''),
                annualOperatingExpenses: String(unit.annual_operating_expenses || ''),
                annualAppreciationRate: String(unit.annual_appreciation_rate || ''),
                appreciationYears: String(unit.appreciation_years || ''),
                discountRate: String(unit.discount_rate || ''),
            },
        }));
    },

    // Create or update a saved unit
    async upsert(unit: SavedUnit): Promise<SavedUnit> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const unitData = {
            id: unit.id,
            user_id: user.id,
            name: unit.name,
            status: unit.status,
            notes: unit.notes || null,
            deal_date: unit.dealDate || null,
            total_price: parseFloat(unit.data.totalPrice) || null,
            down_payment_percentage: parseFloat(unit.data.downPaymentPercentage) || null,
            installment_amount: parseFloat(unit.data.installmentAmount) || null,
            installment_frequency: parseInt(unit.data.installmentFrequency) || null,
            maintenance_percentage: parseFloat(unit.data.maintenancePercentage) || null,
            handover_payment_percentage: parseFloat(unit.data.handoverPaymentPercentage) || null,
            contract_date: unit.data.contractDate || null,
            handover_date: unit.data.handoverDate || null,
            monthly_rent: parseFloat(unit.data.monthlyRent) || null,
            annual_rent_increase: parseFloat(unit.data.annualRentIncrease) || null,
            annual_operating_expenses: parseFloat(unit.data.annualOperatingExpenses) || null,
            annual_appreciation_rate: parseFloat(unit.data.annualAppreciationRate) || null,
            appreciation_years: parseInt(unit.data.appreciationYears) || null,
            discount_rate: parseFloat(unit.data.discountRate) || null,
        };

        const { data, error } = await supabase
            .from('saved_units')
            .upsert(unitData)
            .select()
            .single();

        if (error) throw error;

        return unit; // Return the original unit format
    },

    // Delete a saved unit
    async delete(unitId: string): Promise<void> {
        const { error } = await supabase
            .from('saved_units')
            .delete()
            .eq('id', unitId);

        if (error) throw error;
    },
};

// ============================================
// PORTFOLIO PROPERTIES API
// ============================================

export const portfolioAPI = {
    // Get all properties for the current user (with tasks and documents)
    async getAll(): Promise<PortfolioProperty[]> {
        const { data: properties, error: propError } = await supabase
            .from('portfolio_properties')
            .select(`
                *,
                property_tasks(*),
                property_documents(*)
            `)
            .order('created_at', { ascending: false });

        if (propError) throw propError;

        return properties.map(prop => ({
            id: prop.id,
            name: prop.name,
            propertyType: prop.property_type as any,
            purchasePrice: prop.purchase_price,
            monthlyRent: prop.monthly_rent,
            annualOperatingExpenses: prop.annual_operating_expenses,
            propertyTax: prop.property_tax,
            insurance: prop.insurance,
            area: prop.area || undefined,
            internalArea: prop.internal_area || undefined,
            externalArea: prop.external_area || undefined,
            gardenArea: prop.garden_area || undefined,
            roofArea: prop.roof_area || undefined,
            tasks: prop.property_tasks?.map((task: any) => ({
                id: task.id,
                title: task.title,
                date: task.date,
                notes: task.notes || '',
                isCompleted: task.is_completed,
            })),
            documents: prop.property_documents?.map((doc: any) => ({
                id: doc.id,
                name: doc.name,
                dataUrl: doc.file_url,
            })),
        }));
    },

    // Create or update a property
    async upsert(property: PortfolioProperty): Promise<PortfolioProperty> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const propertyData = {
            id: property.id,
            user_id: user.id,
            name: property.name,
            property_type: property.propertyType,
            purchase_price: property.purchasePrice,
            monthly_rent: property.monthlyRent,
            annual_operating_expenses: property.annualOperatingExpenses,
            property_tax: property.propertyTax,
            insurance: property.insurance,
            area: property.area || null,
            internal_area: property.internalArea || null,
            external_area: property.externalArea || null,
            garden_area: property.gardenArea || null,
            roof_area: property.roofArea || null,
        };

        const { data, error } = await supabase
            .from('portfolio_properties')
            .upsert(propertyData)
            .select()
            .single();

        if (error) throw error;

        // Handle tasks
        if (property.tasks && property.tasks.length > 0) {
            await Promise.all(
                property.tasks.map(task =>
                    supabase.from('property_tasks').upsert({
                        id: task.id,
                        property_id: property.id,
                        title: task.title,
                        date: task.date,
                        notes: task.notes || null,
                        is_completed: task.isCompleted,
                    })
                )
            );
        }

        // Handle documents
        if (property.documents && property.documents.length > 0) {
            await Promise.all(
                property.documents.map(doc =>
                    supabase.from('property_documents').upsert({
                        id: doc.id,
                        property_id: property.id,
                        name: doc.name,
                        file_url: doc.dataUrl,
                    })
                )
            );
        }

        return property;
    },

    // Delete a property (cascade deletes tasks and documents)
    async delete(propertyId: string): Promise<void> {
        const { error } = await supabase
            .from('portfolio_properties')
            .delete()
            .eq('id', propertyId);

        if (error) throw error;
    },

    // Delete a specific task
    async deleteTask(taskId: string): Promise<void> {
        const { error } = await supabase
            .from('property_tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;
    },

    // Delete a specific document
    async deleteDocument(documentId: string): Promise<void> {
        const { error } = await supabase
            .from('property_documents')
            .delete()
            .eq('id', documentId);

        if (error) throw error;
    },
};

// ============================================
// USER PROFILE API
// ============================================

export const userProfileAPI = {
    // Get user profile
    async get(userId: string) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    // Update user profile
    async update(userId: string, updates: Partial<{
        name: string;
        profile_picture: string;
        status: string;
        role: string;
        usage: Record<string, number>;
    }>) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get all users (admin only)
    async getAll() {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Record tool usage
    async recordUsage(userId: string, toolId: string) {
        const profile = await this.get(userId);
        const usage = profile.usage || {};
        usage[toolId] = (usage[toolId] || 0) + 1;

        return this.update(userId, { usage });
    },
};
