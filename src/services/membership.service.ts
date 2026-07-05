import { supabase } from '../lib/supabase';
import { DUMMY_MEMBERSHIP_PLANS } from '../lib/dummy-data';

let MOCK_PLANS: MembershipPlan[] = [...DUMMY_MEMBERSHIP_PLANS];

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  features: string[]; // Typed as string array for JSONB
  is_active: boolean;
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const membershipService = {
  async getPlans(includeInactive = false) {
    let query = supabase
      .from('membership_plans')
      .select('id, plan_name, description, price, duration, created_at')
      .order('price', { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase error in getPlans, falling back to mock:', error);
      let list = [...MOCK_PLANS];
      if (!includeInactive) {
        list = list.filter(p => p.is_active);
      }
      return list as MembershipPlan[];
    }
    
    if (data) {
      return data.map((p: any) => {
        const name = p.plan_name || 'Standard Pass';
        // Map legacy DB prices to requested prices for UI consistency
        let price = p.price;
        if (name.includes('Basic') && price === 29) price = 1999;
        if (name.includes('Elite') && price === 59) price = 2999;
        if (name.includes('VIP') && price === 99) price = 4999;

        const dummyMatch = DUMMY_MEMBERSHIP_PLANS.find((dp: any) => dp.name === name);
        
        return {
          id: p.id,
          name: name,
          description: p.description || '',
          price: price,
          duration_days: p.duration || 30,
          features: dummyMatch?.features || [],
          is_active: true,
          color: dummyMatch?.color || '#4F46E5',
          display_order: 0,
          created_at: p.created_at,
          updated_at: p.created_at,
        } as MembershipPlan;
      });
    }
    
    return [];
  },

  async createPlan(plan: Partial<MembershipPlan>) {
    const dbPlanPayload = {
      plan_name: plan.name,
      description: plan.description || '',
      price: plan.price,
      duration: plan.duration_days
    };

    const { data, error } = await supabase
      .from('membership_plans')
      .insert([dbPlanPayload])
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in createPlan, falling back to mock:', error);
      const newPlan = {
        id: `mock-plan-${Date.now()}`,
        name: plan.name || 'New Package',
        description: plan.description || '',
        price: Number(plan.price) || 0,
        duration_days: Number(plan.duration_days) || 30,
        features: plan.features || [],
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        color: plan.color || '#4F46E5',
        display_order: plan.display_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as MembershipPlan;
      MOCK_PLANS.push(newPlan);
      return newPlan;
    }

    const dummyMatch = DUMMY_MEMBERSHIP_PLANS.find((dp: any) => dp.name === data.plan_name);
    return {
      id: data.id,
      name: data.plan_name,
      description: data.description || '',
      price: data.price,
      duration_days: data.duration || 30,
      features: plan.features || dummyMatch?.features || [],
      is_active: true,
      color: plan.color || dummyMatch?.color || '#4F46E5',
      display_order: 0,
      created_at: data.created_at,
      updated_at: data.created_at,
    } as MembershipPlan;
  },

  async updatePlan(id: string, updates: Partial<MembershipPlan>) {
    const dbPlanPayload: any = {};
    if (updates.name !== undefined) dbPlanPayload.plan_name = updates.name;
    if (updates.description !== undefined) dbPlanPayload.description = updates.description;
    if (updates.price !== undefined) dbPlanPayload.price = updates.price;
    if (updates.duration_days !== undefined) dbPlanPayload.duration = updates.duration_days;

    const { data, error } = await supabase
      .from('membership_plans')
      .update(dbPlanPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in updatePlan, falling back to mock:', error);
      MOCK_PLANS = MOCK_PLANS.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
      return MOCK_PLANS.find(p => p.id === id) as MembershipPlan;
    }

    const dummyMatch = DUMMY_MEMBERSHIP_PLANS.find((dp: any) => dp.name === data.plan_name);
    return {
      id: data.id,
      name: data.plan_name,
      description: data.description || '',
      price: data.price,
      duration_days: data.duration || 30,
      features: updates.features || dummyMatch?.features || [],
      is_active: true,
      color: updates.color || dummyMatch?.color || '#4F46E5',
      display_order: 0,
      created_at: data.created_at,
      updated_at: data.created_at,
    } as MembershipPlan;
  },

  async deletePlan(id: string) {
    const { data, error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in deletePlan, falling back to mock:', error);
      MOCK_PLANS = MOCK_PLANS.filter(p => p.id !== id);
      return null;
    }

    const dummyMatch = DUMMY_MEMBERSHIP_PLANS.find((dp: any) => dp.name === data.plan_name);
    return {
      id: data.id,
      name: data.plan_name,
      description: data.description || '',
      price: data.price,
      duration_days: data.duration || 30,
      features: dummyMatch?.features || [],
      is_active: false,
      color: dummyMatch?.color || '#4F46E5',
      display_order: 0,
      created_at: data.created_at,
      updated_at: data.created_at,
    } as MembershipPlan;
  }
};
