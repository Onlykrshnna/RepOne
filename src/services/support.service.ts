import { supabase } from '../lib/supabase';

// IMPORTANT: support_tickets and ticket_replies tables do NOT exist in production DB.
// All operations gracefully return empty data or throw a user-friendly error.
// If the tables are created in the future, restore the full implementation from git history.

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

const TABLE_MISSING_MSG = 'Support tickets are not available yet. The database table has not been created.';

export const supportService = {
  async createTicket(_ticketData: any, _file?: File): Promise<SupportTicket> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async getTickets(_filters?: { status?: TicketStatus; memberId?: string }): Promise<SupportTicket[]> {
    console.warn('[Schema] support_tickets table does not exist in production DB. Returning empty list.');
    return [];
  },

  async getTicketReplies(_ticketId: string): Promise<TicketReply[]> {
    console.warn('[Schema] ticket_replies table does not exist in production DB. Returning empty list.');
    return [];
  },

  async sendTicketReply(_ticketId: string, _senderId: string, _message: string): Promise<TicketReply> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async updateTicketStatus(_ticketId: string, _status: TicketStatus): Promise<SupportTicket> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async uploadAttachment(_file: File): Promise<string> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async getSupportDashboardMetrics() {
    return {
      totalTickets: 0,
      openTickets: 0,
      pendingTickets: 0,
      resolvedTickets: 0,
      categoryStats: []
    };
  }
};
