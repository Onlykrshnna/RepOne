import { supabase } from '../lib/supabase';

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export type TicketCategory = 'General Inquiry' | 'Billing Issue' | 'Membership Issue' | 'Technical Issue' | 'Complaint' | 'Suggestion';
export type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed';

export interface SupportTicket {
  id: string;
  gym_id: string;
  member_id: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export const supportService = {
  async createTicket(
    ticketData: Omit<SupportTicket, 'id' | 'gym_id' | 'status' | 'created_at' | 'updated_at'>,
    file?: File
  ) {
    const gym_id = await getGymId();
    let attachment_url = undefined;

    if (file) {
      attachment_url = await this.uploadAttachment(file);
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        ...ticketData,
        gym_id,
        status: 'Open',
        attachment_url
      }])
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  async getTickets(filters?: { status?: TicketStatus; memberId?: string }) {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        )
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as SupportTicket[];
  },

  async getTicketReplies(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_replies')
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          role
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TicketReply[];
  },

  async sendTicketReply(ticketId: string, senderId: string, message: string) {
    // 1. Insert reply
    const { data, error } = await supabase
      .from('ticket_replies')
      .insert([{
        ticket_id: ticketId,
        sender_id: senderId,
        message
      }])
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          role
        )
      `)
      .single();

    if (error) throw error;

    // 2. Update ticket updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return data as TicketReply;
  },

  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  async uploadAttachment(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `tickets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('support-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('support-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async getSupportDashboardMetrics() {
    const { data: rawTickets } = await supabase.from('support_tickets').select('*');
    const tickets = rawTickets || [];

    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const pending = tickets.filter(t => t.status === 'Pending').length;
    const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

    // Categories breakdown
    const categoryCount: Record<string, number> = {};
    tickets.forEach(t => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    const categoryStats = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));

    return {
      totalTickets: total,
      openTickets: open,
      pendingTickets: pending,
      resolvedTickets: resolved,
      categoryStats
    };
  }
};
