import { supabase } from '../lib/supabase';

// Real guest_passes table columns:
//   id, member_id, guest_name, guest_phone, guest_email,
//   pass_code, valid_until, is_used, used_at, created_at
// Missing (code had): generated_by (→ member_id), valid_from, used_by_staff, notes

export type GuestPass = {
  id: string;
  member_id: string;           // real FK column (was generated_by)
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  pass_code: string;
  valid_until: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
  // Virtual aliases for UI compatibility
  generated_by?: string;
  profiles?: { first_name: string; last_name: string; email: string };
  notes?: string;
};

export type CreateGuestPassDto = {
  generated_by: string;       // UI passes this — mapped to member_id
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  valid_days?: number;        // default 1
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

function normalizePass(row: any): GuestPass {
  return {
    ...row,
    generated_by: row.member_id,  // alias for UI
    profiles: row.profiles ?? null,
  };
}

export const guestPassService = {
  async createPass(dto: CreateGuestPassDto): Promise<GuestPass> {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + (dto.valid_days ?? 1));

    const { data, error } = await supabase
      .from('guest_passes')
      .insert([{
        member_id: dto.generated_by,   // mapped from generated_by → member_id
        guest_name: dto.guest_name,
        guest_phone: dto.guest_phone || null,
        guest_email: dto.guest_email || null,
        pass_code: generatePassCode(),
        valid_until: validUntil.toISOString(),
        is_used: false,
        // valid_from, used_by_staff, notes columns do NOT exist — omitted
      }])
      .select(`
        id, member_id, guest_name, guest_phone, guest_email,
        pass_code, valid_until, is_used, used_at, created_at,
        profiles:member_id ( first_name, last_name, email )
      `)
      .single();

    if (error) throw error;
    return normalizePass(data);
  },

  async getPasses(limit = 50): Promise<GuestPass[]> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select(`
        id, member_id, guest_name, guest_phone, guest_email,
        pass_code, valid_until, is_used, used_at, created_at,
        profiles:member_id ( first_name, last_name, email )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(normalizePass);
  },

  async getPassByCode(code: string): Promise<GuestPass | null> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select(`
        id, member_id, guest_name, guest_phone, guest_email,
        pass_code, valid_until, is_used, used_at, created_at,
        profiles:member_id ( first_name, last_name, email )
      `)
      .eq('pass_code', code.toUpperCase())
      .single();

    if (error) return null;
    return normalizePass(data);
  },

  async getPassById(id: string): Promise<GuestPass | null> {
    const { data, error } = await supabase
      .from('guest_passes')
      .select(`
        id, member_id, guest_name, guest_phone, guest_email,
        pass_code, valid_until, is_used, used_at, created_at,
        profiles:member_id ( first_name, last_name, email )
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return normalizePass(data);
  },

  async markUsed(passId: string, _staffId: string): Promise<GuestPass> {
    // used_by_staff column does not exist — only update is_used and used_at
    const { data, error } = await supabase
      .from('guest_passes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        // used_by_staff omitted — column does not exist in production
      })
      .eq('id', passId)
      .select('id, member_id, guest_name, guest_phone, guest_email, pass_code, valid_until, is_used, used_at, created_at')
      .single();

    if (error) throw error;
    return normalizePass(data);
  },

  async deletePass(passId: string): Promise<void> {
    const { error } = await supabase
      .from('guest_passes')
      .delete()
      .eq('id', passId);

    if (error) throw error;
  },

  async getStats(): Promise<{ total: number; used: number; active: number; expired: number }> {
    const { data } = await supabase
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
