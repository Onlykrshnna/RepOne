import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket, TicketReply, TicketStatus, TicketCategory } from '../services/support.service';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  LifeBuoy, Plus, Send, FileText, Paperclip, MessageSquare, 
  ExternalLink, Clock, AlertCircle, CheckCircle, Search, ArrowLeft, RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

export const Route = createFileRoute('/_member/support')({
  component: SupportPage,
});

function SupportPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<any>('');
  const [ticketSearch, setTicketSearch] = useState('');

  // Create Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('General Inquiry');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  // Chat/Reply State
  const [replyMsg, setReplyMsg] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Queries
  const { data: dbTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets', statusFilter, profile?.id],
    queryFn: () => supportService.getTickets({
      status: statusFilter || undefined,
      memberId: profile?.role === 'member' ? profile.id : undefined
    })
  });

  const tickets = dbTickets || [];

  const { data: dbReplies, refetch: refetchReplies } = useQuery({
    queryKey: ['ticket-replies', activeTicket?.id],
    queryFn: () => supportService.getTicketReplies(activeTicket!.id),
    enabled: !!activeTicket?.id
  });

  const replies = dbReplies || [];
  const { data: metrics } = useQuery({
    queryKey: ['support-metrics'],
    queryFn: supportService.getSupportDashboardMetrics,
    enabled: profile?.role === 'admin'
  });

  // Realtime Subscriptions
  useEffect(() => {
    // 1. Listen to support tickets changes
    const ticketsChannel = supabase
      .channel('public:support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload: any) => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['support-metrics'] });
        
        // If our currently active ticket was updated (e.g. status changes)
        if (activeTicket && payload.new && payload.new.id === activeTicket.id) {
          setActiveTicket(payload.new as SupportTicket);
        }
      })
      .subscribe();

    // 2. Listen to replies changes
    const repliesChannel = supabase
      .channel('public:ticket_replies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_replies' }, (payload: any) => {
        if (activeTicket && payload.new && payload.new.ticket_id === activeTicket.id) {
          refetchReplies();
          // Scroll bottom
          setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, [queryClient, activeTicket, refetchReplies]);

  // Scroll to bottom of chat when replies or chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isChatOpen, replies]);

  // 2. Mutations
  const createTicketMutation = useMutation({
    mutationFn: (data: { ticketData: any; file?: File }) => 
      supportService.createTicket(data.ticketData, data.file),
    onSuccess: () => {
      toast.success('Support ticket submitted successfully!');
      setSubject('');
      setDescription('');
      setAttachment(null);
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to submit ticket'),
  });

  const sendReplyMutation = useMutation({
    mutationFn: (message: string) => 
      supportService.sendTicketReply(activeTicket!.id, profile!.id, message),
    onSuccess: () => {
      setReplyMsg('');
      refetchReplies();
      // Scroll bottom
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to send reply'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: TicketStatus) => 
      supportService.updateTicketStatus(activeTicket!.id, status),
    onSuccess: (updatedTicket) => {
      toast.success('Ticket status updated');
      setActiveTicket(updatedTicket);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update status'),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicketMutation.mutate({
      ticketData: {
        member_id: profile!.id,
        category,
        subject,
        description
      },
      file: attachment || undefined
    });
  };

  const handleOpenChat = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    setIsChatOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200">Open</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-50 text-amber-600 border border-amber-200">Pending</Badge>;
      case 'Resolved':
        return <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200">Resolved</Badge>;
      case 'Closed':
        return <Badge variant="outline" className="border-slate-300 text-muted-foreground/75">Closed</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground">Support Desk</h2>
          <p className="text-muted-foreground">Contact gym help desk, report issues, and resolve complaints.</p>
        </div>
        {profile?.role === 'member' && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" /> Open Support Ticket
          </Button>
        )}
      </div>

      {profile?.role === 'admin' && metrics && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-indigo-600">{metrics.openTickets}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Open Tickets</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-amber-500">{metrics.pendingTickets}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Pending</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-emerald-500">{metrics.resolvedTickets}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Resolved Tickets</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-foreground">{metrics.totalTickets}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Total inquiries</div>
          </Card>
        </div>
      )}

      {/* Roster of tickets */}
      <Card className="bg-card border-border text-foreground shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <CardTitle>Inquiries & Issues</CardTitle>
            <CardDescription>{profile?.role === 'admin' ? ' Roster of all support logs.' : 'Your active tickets and help threads.'}</CardDescription>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/75" />
              <Input
                placeholder="Search subject..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="pl-9 bg-background border-border text-slate-950 w-full sm:w-[200px] h-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ticketsLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground/75 italic">No tickets found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets
                .filter(t => t.subject.toLowerCase().includes(ticketSearch.toLowerCase()))
                .map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenChat(ticket)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-base">{ticket.subject}</span>
                        <Badge variant="outline" className="border-indigo-100 text-indigo-600 bg-indigo-50 text-[10px] uppercase font-bold">
                          {ticket.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground/75 font-medium">
                        {profile?.role === 'admin' ? `Submitted by: ${ticket.profiles?.first_name} ${ticket.profiles?.last_name} | ` : ''}
                        Last updated: {new Date(ticket.updated_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {getStatusBadge(ticket.status)}
                      <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50/50">
                        Chat <MessageSquare className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====================================================
          1. Create Ticket Dialog Modal (Member only)
      ==================================================== */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Open Support Ticket</DialogTitle>
            <DialogDescription>Let us know how we can assist you today.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Billing Issue">Billing Issue</option>
                <option value="Membership Issue">Membership Issue</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Complaint">Complaint</option>
                <option value="Suggestion">Suggestion</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Summary of issue"
                className="bg-background border-border text-foreground"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Details / Description *</Label>
              <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Provide details about your query..."
                className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Upload Attachment (Image/PDF - optional)</Label>
              <div className="flex gap-2 items-center bg-background p-2 border border-border border-dashed rounded-lg">
                <Paperclip className="h-4 w-4 text-muted-foreground/75" />
                <input 
                  type="file" 
                  id="attachment" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange} 
                  className="text-xs text-muted-foreground focus:outline-none"
                />
              </div>
              {attachment && <span className="text-[10px] text-muted-foreground font-mono block">{attachment.name}</span>}
            </div>

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" className="border-border text-foreground/80 bg-card" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTicketMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====================================================
          2. Ticket Details & Chat Conversation Dialog
      ==================================================== */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border text-foreground flex flex-col h-[85vh]">
          {activeTicket && (
            <>
              <DialogHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      {activeTicket.subject}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground/75">Category: {activeTicket.category} | Created: {new Date(activeTicket.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activeTicket.status)}
                    {profile?.role === 'admin' && (
                      <select
                        value={activeTicket.status}
                        onChange={(e) => updateStatusMutation.mutate(e.target.value as any)}
                        className="h-8 rounded border border-border bg-background text-xs px-2 text-foreground focus:outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Main Ticket Description Box */}
              <div className="bg-background p-4 rounded-xl border border-border/50 text-sm space-y-2 mt-2">
                <div className="font-bold text-foreground/90">Issue Details:</div>
                <p className="text-foreground/80 leading-relaxed font-medium">{activeTicket.description}</p>
                {activeTicket.attachment_url && (
                  <div className="pt-2 border-t border-border mt-2 flex justify-end">
                    <a 
                      href={activeTicket.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      View File Attachment <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Chat Thread Container */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50/50 border border-border/50 rounded-xl my-3">
                {replies.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground/75 py-12 italic">No replies posted. Type message below to start chat.</div>
                ) : (
                  replies.map((reply) => {
                    const isAdmin = reply.profiles?.role === 'admin';
                    const isOwn = reply.sender_id === profile!.id;

                    return (
                      <div 
                        key={reply.id} 
                        className={`flex flex-col max-w-[80%] rounded-xl p-3 ${
                          isOwn 
                            ? 'bg-indigo-600 text-white ml-auto' 
                            : 'bg-card text-foreground border border-border mr-auto'
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase mb-1 ${isOwn ? 'text-indigo-100' : 'text-muted-foreground/75'}`}>
                          {reply.profiles?.first_name} {isAdmin ? '(Admin)' : ''}
                        </span>
                        <p className="text-sm font-semibold">{reply.message}</p>
                        <span className={`text-[8px] text-right mt-1 font-medium ${isOwn ? 'text-indigo-200' : 'text-muted-foreground/75'}`}>
                          {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input reply box */}
              {activeTicket.status !== 'Closed' ? (
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Input
                    placeholder="Type reply message..."
                    value={replyMsg}
                    onChange={(e) => setReplyMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && replyMsg) {
                        sendReplyMutation.mutate(replyMsg);
                      }
                    }}
                    className="bg-background border-border text-foreground h-10"
                  />
                  <Button 
                    onClick={() => sendReplyMutation.mutate(replyMsg)}
                    disabled={sendReplyMutation.isPending || !replyMsg}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-10 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-xs text-muted-foreground/75 italic py-2">
                  This support ticket is closed and cannot receive replies.
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
