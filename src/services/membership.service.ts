import { supabase } from '../lib/supabase';

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
      .select('id, plan_name, description, price, duration_days, created_at')
      .order('price', { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.error('Supabase error in getPlans:', error);
      throw error;
    }
    
    if (data) {
      return data.map((p: any) => {
        const name = p.plan_name || 'Standard Pass';
        // Map legacy DB prices to requested prices for UI consistency
        let price = p.price;
        if (name.includes('Basic') && price === 29) price = 1999;
        if (name.includes('Elite') && price === 59) price = 2999;
        if (name.includes('VIP') && price === 99) price = 4999;


        
        return {
          id: p.id,
          name: name,
          description: p.description || '',
          price: price,
          duration_days: p.duration_days || 30,
          features: [],
          is_active: true,
          color: '#4F46E5',
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
      duration_days: plan.duration_days
    };

    const { data, error } = await supabase
      .from('membership_plans')
      .insert([dbPlanPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase error in createPlan:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.plan_name,
      description: data.description || '',
      price: data.price,
      duration_days: data.duration_days || 30,
      features: plan.features || [],
      is_active: true,
      color: plan.color || '#4F46E5',
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
    if (updates.duration_days !== undefined) dbPlanPayload.duration_days = updates.duration_days;

    const { data, error } = await supabase
      .from('membership_plans')
      .update(dbPlanPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error in updatePlan:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.plan_name,
      description: data.description || '',
      price: data.price,
      duration_days: data.duration_days || 30,
      features: updates.features || [],
      is_active: true,
      color: updates.color || '#4F46E5',
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
      console.error('Supabase error in deletePlan:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.plan_name,
      description: data.description || '',
      price: data.price,
      duration_days: data.duration_days || 30,
      features: [],
      is_active: false,
      color: '#4F46E5',
      display_order: 0,
      created_at: data.created_at,
      updated_at: data.created_at,
    } as MembershipPlan;
  },

  async seedDefaultPlansIfEmpty() {
    try {
      const { data: existingPlans } = await supabase
        .from('membership_plans')
        .select('id')
        .limit(1);
        
      if (!existingPlans || existingPlans.length === 0) {
        console.log('Database membership plans are empty. Seeding default packages...');
        const plansToSeed = [
          {
            plan_name: 'Basic Pass',
            description: 'Perfect for casual gym goers looking to stay active.',
            price: 1999,
            duration_days: 30
          },
          {
            plan_name: 'Elite Gym Pass',
            description: 'Our most popular option for dedicated fitness enthusiasts.',
            price: 2999,
            duration_days: 90
          },
          {
            plan_name: 'VIP Unlimited',
            description: 'All-inclusive premium experience with absolute freedom.',
            price: 4999,
            duration_days: 180
          }
        ];
        
        await supabase
          .from('membership_plans')
          .insert(plansToSeed);
      }
    } catch (e) {
      console.warn('Failed to seed membership plans:', e);
    }
  }
};
