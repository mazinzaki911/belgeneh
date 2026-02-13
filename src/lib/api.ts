import { supabase } from './supabase';
import { SavedUnit, FullUnitData, PortfolioProperty, PropertyTask, PropertyDocument } from '../types';

// Timeout wrapper — prevents Supabase calls from hanging forever on mobile
function withTimeout<T>(promise: Promise<T>, ms: number, step: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${step} took longer than ${ms / 1000}s`)), ms)
        ),
    ]);
}

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
            status: unit.status as SavedUnit['status'],
            notes: unit.notes || undefined,
            dealDate: unit.deal_date || undefined,
            updatedAt: unit.updated_at || unit.created_at || undefined,
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

        // Validate required fields
        if (!unit.name || !unit.name.trim()) {
            throw new Error('Unit name is required');
        }

        const unitData: Record<string, any> = {
            user_id: user.id,
            name: unit.name.trim(),
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

        // Only include id when it's a valid string (for updates)
        if (unit.id) {
            unitData.id = unit.id;
        }

        const { data, error } = await supabase
            .from('saved_units')
            .upsert(unitData)
            .select()
            .single();

        if (error) {
            console.error('Supabase error saving unit:', error);
            throw new Error(`Failed to save unit: ${error.message}`);
        }

        if (!data) {
            throw new Error('No data returned from database');
        }

        // Return the saved unit in the application format
        return {
            id: data.id,
            name: data.name,
            status: data.status as SavedUnit['status'],
            notes: data.notes || undefined,
            dealDate: data.deal_date || undefined,
            updatedAt: data.updated_at || data.created_at || undefined,
            data: {
                totalPrice: String(data.total_price || ''),
                downPaymentPercentage: String(data.down_payment_percentage || ''),
                installmentAmount: String(data.installment_amount || ''),
                installmentFrequency: String(data.installment_frequency || ''),
                maintenancePercentage: String(data.maintenance_percentage || ''),
                handoverPaymentPercentage: String(data.handover_payment_percentage || ''),
                contractDate: data.contract_date || '',
                handoverDate: data.handover_date || '',
                monthlyRent: String(data.monthly_rent || ''),
                annualRentIncrease: String(data.annual_rent_increase || ''),
                annualOperatingExpenses: String(data.annual_operating_expenses || ''),
                annualAppreciationRate: String(data.annual_appreciation_rate || ''),
                appreciationYears: String(data.appreciation_years || ''),
                discountRate: String(data.discount_rate || ''),
            },
        };
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
            propertyType: prop.property_type as PortfolioProperty['propertyType'],
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
        const TIMEOUT = 15000; // 15s per step

        // Step 1: Auth check
        const { data: { user } } = await withTimeout(
            supabase.auth.getUser(), TIMEOUT, 'Auth check'
        );
        if (!user) throw new Error('User not authenticated');

        // Validate required fields
        if (!property.name || !property.name.trim()) {
            throw new Error('Property name is required');
        }
        if (!property.purchasePrice || property.purchasePrice <= 0) {
            throw new Error('Valid purchase price is required');
        }
        if (property.monthlyRent == null || property.monthlyRent < 0) {
            throw new Error('Valid monthly rent is required');
        }

        const propertyData = {
            id: property.id,
            user_id: user.id,
            name: property.name.trim(),
            property_type: property.propertyType,
            purchase_price: property.purchasePrice,
            monthly_rent: property.monthlyRent,
            annual_operating_expenses: property.annualOperatingExpenses || 0,
            property_tax: property.propertyTax || 0,
            insurance: property.insurance || 0,
            area: property.area || null,
            internal_area: property.internalArea || null,
            external_area: property.externalArea || null,
            garden_area: property.gardenArea || null,
            roof_area: property.roofArea || null,
        };

        // Step 2: Save property
        const { data, error } = await withTimeout(
            supabase.from('portfolio_properties').upsert(propertyData).select().single(),
            TIMEOUT, 'Save property'
        );

        if (error) {
            console.error('Supabase error saving property:', error);
            throw new Error(`Failed to save property: ${error.message}`);
        }

        if (!data) {
            throw new Error('No data returned from database');
        }

        const propertyId = data.id;

        // Step 3: Sync tasks — fetch existing + delete removed + batch upsert
        const { data: existingTasks } = await withTimeout(
            supabase.from('property_tasks').select('id').eq('property_id', propertyId),
            TIMEOUT, 'Fetch tasks'
        );

        const existingTaskIds = (existingTasks || []).map((t: any) => t.id);
        const currentTaskIds = (property.tasks || []).map(t => t.id);

        // Delete removed tasks
        const taskIdsToDelete = existingTaskIds.filter((id: string) => !currentTaskIds.includes(id));
        if (taskIdsToDelete.length > 0) {
            await withTimeout(
                supabase.from('property_tasks').delete().in('id', taskIdsToDelete),
                TIMEOUT, 'Delete tasks'
            );
        }

        // Batch upsert all current tasks in ONE request
        if (property.tasks && property.tasks.length > 0) {
            const taskRows = property.tasks.map(task => ({
                id: task.id,
                property_id: propertyId,
                title: task.title,
                date: task.date,
                notes: task.notes || null,
                is_completed: task.isCompleted,
            }));
            const { error: taskErr } = await withTimeout(
                supabase.from('property_tasks').upsert(taskRows),
                TIMEOUT, 'Save tasks'
            );
            if (taskErr) {
                console.error('Error saving tasks:', taskErr);
                throw new Error(`Failed to save tasks: ${taskErr.message}`);
            }
        }

        // Step 4: Sync documents — fetch existing + delete removed + batch insert new
        const { data: existingDocs } = await withTimeout(
            supabase.from('property_documents').select('id').eq('property_id', propertyId),
            TIMEOUT, 'Fetch documents'
        );

        const existingDocIds = (existingDocs || []).map((d: any) => d.id);
        const currentDocIds = (property.documents || []).map(d => d.id);

        // Delete removed documents
        const docIdsToDelete = existingDocIds.filter((id: string) => !currentDocIds.includes(id));
        if (docIdsToDelete.length > 0) {
            await withTimeout(
                supabase.from('property_documents').delete().in('id', docIdsToDelete),
                TIMEOUT, 'Delete documents'
            );
        }

        // Batch insert only NEW documents in ONE request
        const newDocs = (property.documents || []).filter(d => !existingDocIds.includes(d.id));
        if (newDocs.length > 0) {
            const docRows = newDocs.map(doc => ({
                id: doc.id,
                property_id: propertyId,
                name: doc.name,
                file_url: doc.dataUrl,
            }));
            const { error: docErr } = await withTimeout(
                supabase.from('property_documents').insert(docRows),
                TIMEOUT, 'Save documents'
            );
            if (docErr) {
                console.error('Error saving documents:', docErr);
                throw new Error(`Failed to save documents: ${docErr.message}`);
            }
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
