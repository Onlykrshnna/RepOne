import { supabase } from '../lib/supabase';

export type GuestPass = {
  id: string;
  generated_by: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  pass_code: string;
  valid_from: string;
  valid_until: string;
  is_used: boolean;
  used_at?: string;
  used_by_staff?: string;
  notes?: string;
  created_at: string;
  // joined data
  profiles?: { first_name: string; last_name: string; email: string };
};

export type CreateGuestPassDto = {
  generated_by: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  valid_days?: number; // default 1
  notes?: string;
};

function generatePassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GP-${code.slice(0, 4)}-${code.slice(4)}`;
}

export const guestPassService = {
  async createPass(dto: CreateGuestPassDto): Promise<GuestPass> {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + (dto.valid_days ?? 1));

    const { data, error } = await supabase
      .from('guest_passes')
      .insert([{
        generated_by: dto.generated_by,
        guest_name: dto.guest_name,
        guest_phone: dto.guest_phone || null,
        guest_email: dto.guest_email || null,
        pass_code: generatePassCode(),
        valid_from: now.toISOString(),
        valid_until: validUntil.toISOString(),
        is_used: false,
        notes: dto.notes || null,
      }])
      .select(`*, profiles:generated_by ( first_name, last_name, email )`)
      .single();

    if (error) throw error;
    return data;
  },

  async getPasses(limit = 50): Promise<GuestPass[]> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select(`*, profiles:generated_by ( first_name, last_name, email )`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getPassByCode(code: string): Promise<GuestPass | null> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select(`*, profiles:generated_by ( first_name, last_name, email )`)
      .eq('pass_code', code.toUpperCase())
      .single();

    if (error) return null;
    return data;
  },

  async getPassById(id: string): Promise<GuestPass | null> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select(`*, profiles:generated_by ( first_name, last_name, email )`)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async markUsed(passId: string, staffId: string): Promise<GuestPass> {
    const { data, error } = await supabase
      .from('guest_passes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_staff: staffId,
      })
      .eq('id', passId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePass(passId: string): Promise<void> {
    const { error } = await supabase
      .from('guest_passes')
      .delete()
      .eq('id', passId);

    if (error) throw error;
    return;
  },

  async getStats(): Promise<{ total: number; used: number; active: number; expired: number }> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select('is_used, valid_until');

    const sourceData = data || [];
    const now = new Date();
    const total = sourceData.length;
    const used = sourceData.filter(p => p.is_used).length;
    const expired = sourceData.filter(p => !p.is_used && new Date(p.valid_until) < now).length;
    const active = total - used - expired;

    return { total, used, active, expired };
  },
};
