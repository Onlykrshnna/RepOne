import { supabase } from '../lib/supabase';
import { profileService } from './profile.service';
import { DUMMY_MEMBERS, DUMMY_MEMBERSHIP_PLANS } from '../lib/dummy-data';

const MEMBERS_STORAGE_KEY = 'elevate_fitness_members';

const getInitialMembers = (): MemberProfile[] => {
  if (typeof window === 'undefined') return [...DUMMY_MEMBERS];
  const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored members', e);
    }
  }
  return [...DUMMY_MEMBERS];
};

export let MOCK_MEMBERS: MemberProfile[] = getInitialMembers();

const saveMembers = (members: MemberProfile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  }
};

export async function reconcileMissingProfiles() {
  if (typeof window === 'undefined') return;
  
  try {
    const notifsStr = localStorage.getItem('elevate_fitness_notifications');
    const paymentsStr = localStorage.getItem('elevate_fitness_payments');
    const membersStr = localStorage.getItem('elevate_fitness_members');
    
    const notifications = notifsStr ? JSON.parse(notifsStr) : [];
    const payments = paymentsStr ? JSON.parse(paymentsStr) : [];
    const members = membersStr ? JSON.parse(membersStr) : [];
    
    let updated = false;
    let paymentsUpdated = false;
    
    // 1. Reconcile from local notifications (useful if user is in the same browser)
    notifications.forEach((n: any) => {
      if (n.type === 'payment' && n.message.includes('has purchased')) {
        const match = n.message.match(/(.+) \((.+)\) has purchased the (.+) \(₹(.+)\) via/);
        if (match) {
          const fullName = match[1].trim();
          const email = match[2].trim();
          const price = Number(match[4]);
          
          const matchingPayment = payments.find((p: any) => p.amount === price && p.status === 'pending');
          if (matchingPayment) {
            const memberId = matchingPayment.member_id;
            const exists = members.some((m: any) => m.id === memberId);
            
            if (!exists) {
              const parts = fullName.split(' ');
              const firstName = parts[0] || '';
              const lastName = parts.slice(1).join(' ') || '';
              
              members.push({
                id: memberId,
                first_name: firstName,
                last_name: lastName,
                email: email,
                username: email.split('@')[0],
                role: 'member',
                is_active: true,
                membership_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                member_memberships: []
              });
              
              updated = true;
            } else {
              const mIndex = members.findIndex((m: any) => m.id === memberId);
              if (mIndex !== -1 && members[mIndex].membership_status !== 'pending' && members[mIndex].membership_status !== 'active') {
                members[mIndex].membership_status = 'pending';
                updated = true;
              }
            }
          }
        }
      }
    });
    
    // 2. Reconcile from Database Profiles table directly (cross-browser/cross-session sync)
    try {
      const { data: dbPendingProfiles, error: dbErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('membership_status', 'pending');
        
      if (!dbErr && dbPendingProfiles && dbPendingProfiles.length > 0) {
        dbPendingProfiles.forEach((profile: any) => {
          const mIndex = members.findIndex((m: any) => m.id === profile.id);
          if (mIndex === -1) {
            members.push({
              id: profile.id,
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              email: profile.email,
              username: profile.username || profile.email.split('@')[0],
              role: profile.role || 'member',
              is_active: profile.is_active !== undefined ? profile.is_active : true,
              membership_status: 'pending',
              created_at: profile.created_at || new Date().toISOString(),
              updated_at: profile.updated_at || new Date().toISOString(),
              member_memberships: []
            });
            updated = true;
          } else if (members[mIndex].membership_status !== 'pending') {
            members[mIndex].membership_status = 'pending';
            updated = true;
          }
          
          // Reconcile Payment Payload from Database
          if (profile.admin_notes && profile.admin_notes.startsWith('PAYMENT_PAYLOAD:')) {
            try {
              const payload = JSON.parse(profile.admin_notes.substring(16));
              const payExists = payments.some((p: any) => 
                p.member_id === profile.id && 
                p.amount === payload.amount &&
                p.transaction_reference === payload.transaction_reference
              );
              
              if (!payExists) {
                payments.unshift({
                  id: `db-sync-pay-${profile.id}-${Date.now()}`,
                  member_id: profile.id,
                  membership_plan_id: payload.membership_plan_id,
                  amount: payload.amount,
                  currency: payload.currency || 'INR',
                  payment_method: payload.payment_method,
                  transaction_reference: payload.transaction_reference || null,
                  payment_proof: payload.payment_proof || null,
                  status: 'pending',
                  payment_date: payload.payment_date || new Date().toISOString(),
                  created_at: payload.payment_date || new Date().toISOString(),
                  profiles: {
                    id: profile.id,
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    email: profile.email,
                    avatar_url: profile.avatar_url || null
                  },
                  membership_plans: DUMMY_MEMBERSHIP_PLANS.find((pl: any) => pl.id === payload.membership_plan_id) || null
                });
                paymentsUpdated = true;
              }
            } catch (jsonErr) {
              console.warn('Failed to parse payment payload from admin_notes:', jsonErr);
            }
          }
        });
      }
    } catch (dbFetchErr) {
      console.warn('Database profiles fetch for reconciliation failed:', dbFetchErr);
    }
    
    if (updated) {
      localStorage.setItem('elevate_fitness_members', JSON.stringify(members));
      MOCK_MEMBERS.length = 0;
      MOCK_MEMBERS.push(...members);
    }
    
    if (paymentsUpdated) {
      localStorage.setItem('elevate_fitness_payments', JSON.stringify(payments));
      const { MOCK_PAYMENTS } = await import('./payment.service');
      MOCK_PAYMENTS.length = 0;
      MOCK_PAYMENTS.push(...payments);
    }
  } catch (e) {
    console.warn('Reconciliation failed:', e);
  }
}


export type MemberProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  role: 'member' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  membership_status: 'pending' | 'active' | 'expired' | 'suspended' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  membership_requested_at?: string;
  payment_verified_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Computed fields from joins
  member_memberships?: any[];
  attendance?: any[];
};

export const membersService = {
  async getMembers(filters?: { search?: string; status?: string; plan?: string }) {
    await reconcileMissingProfiles();
    let query = supabase
      .from('profiles')
      .select(`
        *,
        member_memberships (
          id,
          plan_id,
          start_date,
          end_date,
          status,
          membership_plans (
            name
          )
        )
      `)
      .eq('role', 'member')
      .neq('email', 'krpris9211@gmail.com');

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
    }
    
    if (filters?.status) {
      if (filters.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        query = query.eq('is_active', false);
      } else if (filters.status === 'pending') {
        query = query.eq('membership_status', 'pending');
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    let list = (data || []) as MemberProfile[];
    const dbIds = new Set(list.map(m => m.id));
    const localMembers = MOCK_MEMBERS.filter(m => !dbIds.has(m.id));
    list = [...list, ...localMembers].filter(m => m.email !== 'krpris9211@gmail.com');

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      list = list.filter(m => 
        m.first_name.toLowerCase().includes(searchLower) ||
        (m.last_name || '').toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        (m.username && m.username.toLowerCase().includes(searchLower))
      );
    }
    if (filters?.status) {
      if (filters.status === 'active') {
        list = list.filter(m => m.is_active === true);
      } else if (filters.status === 'inactive') {
        list = list.filter(m => m.is_active === false);
      } else if (filters.status === 'pending') {
        list = list.filter(m => m.membership_status === 'pending');
      }
    }
    return list;
  },

  async getMemberById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        member_memberships (
          id,
          start_date,
          end_date,
          status,
          membership_plans ( name )
        ),
        attendance (
          id,
          check_in_time,
          method
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Supabase error in getMemberById, falling back to mock:', error);
      const found = MOCK_MEMBERS.find(m => m.id === id);
      if (!found) throw new Error('Member not found');
      return found;
    }
    return data as MemberProfile;
  },

  async createMember(memberData: Partial<MemberProfile>, file?: File) {
    // Safe UUID generation for both secure and non-secure contexts
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    let avatar_url = undefined;

    if (file) {
      avatar_url = await this.uploadAvatar(id, file);
    }

    const newMember: Partial<MemberProfile> = {
      id,
      role: 'member',
      first_name: memberData.first_name,
      last_name: memberData.last_name,
      email: memberData.email,
      username: memberData.username,
      phone: memberData.phone,
      gender: memberData.gender,
      date_of_birth: memberData.date_of_birth === '' ? undefined : memberData.date_of_birth,
      address: memberData.address,
      emergency_contact: memberData.emergency_contact,
      avatar_url,
      is_active: true,
      membership_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_memberships: [],
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id,
        role: 'member',
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        username: memberData.username,
        phone: memberData.phone,
        gender: memberData.gender,
        date_of_birth: memberData.date_of_birth === '' ? null : memberData.date_of_birth,
        address: memberData.address,
        emergency_contact: memberData.emergency_contact,
        avatar_url,
      }])
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in createMember, falling back to mock:', error);
      MOCK_MEMBERS = [newMember as MemberProfile, ...MOCK_MEMBERS];
      saveMembers(MOCK_MEMBERS);
      return newMember;
    }
    return data;
  },

  async updateMember(id: string, memberData: Partial<MemberProfile>, file?: File) {
    let avatar_url = memberData.avatar_url;

    if (file) {
      avatar_url = await this.uploadAvatar(id, file);
    }

    // Save fallback columns locally in case they are missing in the DB schema
    if (typeof window !== 'undefined') {
      if (memberData.address !== undefined) localStorage.setItem(`profile_address_${id}`, memberData.address || '');
      if (memberData.emergency_contact !== undefined) localStorage.setItem(`profile_emergency_${id}`, memberData.emergency_contact || '');
      if (memberData.date_of_birth !== undefined) localStorage.setItem(`profile_dob_${id}`, memberData.date_of_birth || '');
      if (memberData.gender !== undefined) localStorage.setItem(`profile_gender_${id}`, memberData.gender || '');
    }

    const payload = {
      ...memberData,
      date_of_birth: memberData.date_of_birth === '' ? null : memberData.date_of_birth,
      avatar_url,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // If error is about a missing column (like address) or schema cache issues
      if (error.message && (error.message.includes('column') || error.code === 'PGRST200')) {
        console.warn('Update failed due to missing columns, retrying with core fields only...', error);
        
        // Strip out optional/potential missing fields from payload
        const corePayload = {
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          avatar_url,
          updated_at: new Date().toISOString(),
        };

        const retry = await supabase
          .from('profiles')
          .update(corePayload)
          .eq('id', id)
          .select()
          .single();

        if (retry.error) {
          console.warn('Supabase retry error in updateMember, falling back to mock:', retry.error);
          MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === id ? { ...m, ...payload } as MemberProfile : m);
          saveMembers(MOCK_MEMBERS);
          return payload;
        }
        data = retry.data;
      } else {
        console.warn('Supabase error in updateMember, falling back to mock:', error);
        MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === id ? { ...m, ...payload } as MemberProfile : m);
        saveMembers(MOCK_MEMBERS);
        return payload;
      }
    }

    profileService.clearProfileCache();
    return data;
  },

  async deleteMember(id: string) {
    // Soft delete
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.warn('Supabase error in deleteMember, falling back to mock:', error);
      MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === id ? { ...m, is_active: false, updated_at: new Date().toISOString() } : m);
      saveMembers(MOCK_MEMBERS);
      return;
    }
  },

  async approveMember(memberId: string, adminId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        membership_status: 'active',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        payment_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in approveMember, falling back to mock:', error);
      MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === memberId ? { 
        ...m, 
        membership_status: 'active', 
        approved_by: adminId, 
        approved_at: new Date().toISOString(), 
        payment_verified_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      } : m);
      saveMembers(MOCK_MEMBERS);

      // Auto-approve the pending payment in MOCK_PAYMENTS
      import('./payment.service').then(({ MOCK_PAYMENTS }) => {
        const payIndex = MOCK_PAYMENTS.findIndex((p: any) => p.member_id === memberId && p.status === 'pending');
        if (payIndex !== -1) {
          MOCK_PAYMENTS[payIndex].status = 'approved';
          MOCK_PAYMENTS[payIndex].verified_at = new Date().toISOString();
          MOCK_PAYMENTS[payIndex].verified_by = adminId;
          
          const planId = MOCK_PAYMENTS[payIndex].membership_plan_id;
          const plan = DUMMY_MEMBERSHIP_PLANS.find((pl: any) => pl.id === planId);
          MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === memberId ? {
            ...m,
            member_memberships: [{
              status: 'active',
              membership_plans: { name: plan?.name || 'Active Gym Pass' },
              end_date: new Date(Date.now() + (plan?.duration_days || 30) * 86400000).toISOString()
            }]
          } : m);
          saveMembers(MOCK_MEMBERS);

          localStorage.setItem('elevate_fitness_payments', JSON.stringify(MOCK_PAYMENTS));
        }
      }).catch(e => console.warn('Could not auto-approve payment in MOCK_PAYMENTS:', e));

      return MOCK_MEMBERS.find(m => m.id === memberId);
    }
    return data;
  },

  async approveMemberByUsername(username: string, adminId: string) {
    // First, find the member by username
    const { data: member, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (findError) {
      console.warn('Supabase error in approveMemberByUsername, falling back to mock:', findError);
      const found = MOCK_MEMBERS.find(m => m.username?.toLowerCase() === username.toLowerCase());
      if (!found) throw new Error('Member not found with that username.');
      return this.approveMember(found.id, adminId);
    }

    // Then update their status using the existing approve logic
    return this.approveMember(member.id, adminId);
  },

  async rejectMember(memberId: string, notes: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        membership_status: 'rejected',
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in rejectMember, falling back to mock:', error);
      MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === memberId ? {
        ...m,
        membership_status: 'rejected',
        admin_notes: notes,
        updated_at: new Date().toISOString()
      } : m);
      return MOCK_MEMBERS.find(m => m.id === memberId);
    }
    return data;
  },

  async requestChangesMember(memberId: string, notes: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        membership_status: 'pending',
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase error in requestChangesMember, falling back to mock:', error);
      MOCK_MEMBERS = MOCK_MEMBERS.map(m => m.id === memberId ? {
        ...m,
        membership_status: 'pending',
        admin_notes: notes,
        updated_at: new Date().toISOString()
      } : m);
      return MOCK_MEMBERS.find(m => m.id === memberId);
    }
    return data;
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
