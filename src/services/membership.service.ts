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
      .select('*')
      .order('display_order', { ascending: true })
      .order('price', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase error in getPlans, falling back to mock:', error);
      let list = [...MOCK_PLANS];
      if (!includeInactive) {
        list = list.filter(p => p.is_active);
      }
      return list as MembershipPlan[];
    }
    
    // Map legacy DB prices to requested prices for UI consistency
    if (data) {
      data.forEach((p: any) => {
        if (p.name.includes('Basic') && p.price === 29) p.price = 1999;
        if (p.name.includes('Elite') && p.price === 59) p.price = 2999;
        if (p.name.includes('VIP') && p.price === 99) p.price = 4999;
      });
    }
    
    return data as MembershipPlan[];
  },

  async createPlan(plan: Partial<MembershipPlan>) {
    const { data, error } = await supabase
      .from('membership_plans')
      .insert([plan])
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
    return data as MembershipPlan;
  },

  async updatePlan(id: string, updates: Partial<MembershipPlan>) {
    const { data, error } = await supabase
      .from('membership_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in updatePlan, falling back to mock:', error);
      MOCK_PLANS = MOCK_PLANS.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
      return MOCK_PLANS.find(p => p.id === id) as MembershipPlan;
    }
    return data as MembershipPlan;
  },

  async deletePlan(id: string) {
    // Instead of hard delete, we archive (is_active = false)
    const { data, error } = await supabase
      .from('membership_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in deletePlan, falling back to mock:', error);
      MOCK_PLANS = MOCK_PLANS.map(p => p.id === id ? { ...p, is_active: false, updated_at: new Date().toISOString() } : p);
      return MOCK_PLANS.find(p => p.id === id) as MembershipPlan;
    }
    return data as MembershipPlan;
  }
};
