import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { guestPassService, GuestPass } from '../services/guest-pass.service';
import { useAuth } from '../lib/auth-context';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  X,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Trash2,
  QrCode,
  User,
  Phone,
  Mail,
  ScanLine,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export const Route = createFileRoute('/admin/guest-passes')({
  component: GuestPassPage,
});

function getPassStatus(pass: GuestPass): 'used' | 'expired' | 'active' {
  if (pass.is_used) return 'used';
  if (new Date(pass.valid_until) < new Date()) return 'expired';
  return 'active';
}

function StatusBadge({ status }: { status: 'used' | 'expired' | 'active' }) {
  if (status === 'active')
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
        Active
      </Badge>
    );
  if (status === 'used')
    return (
      <Badge className="bg-muted text-muted-foreground border border-border">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Used
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-700 border border-red-200">
      <XCircle className="w-3 h-3 mr-1" />
      Expired
    </Badge>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded text-muted-foreground/75 hover:text-slate-700 hover:bg-muted transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function GuestQRModal({ pass }: { pass: GuestPass }) {
  const [open, setOpen] = useState(false);
  const checkinUrl = `${window.location.origin}/checkin?guestId=${pass.id}`;
  const whatsappUrl = `whatsapp://send?text=Here is your guest pass for Atlas Gym! %0A%0AClick the link to check in: %0A${encodeURIComponent(checkinUrl)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 border-border bg-card">
          <QrCode className="h-4 w-4 text-emerald-600" />
          <span className="text-xs">View QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <QrCode className="h-5 w-5 text-emerald-500" />
            Guest QR Pass
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {pass.guest_name}'s unique access code.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <QRCode value={checkinUrl} size={200} level="H" fgColor="#0f172a" />
          </div>
          <div className="text-center space-y-1 w-full">
            <p className="font-mono font-bold text-lg text-indigo-700 bg-indigo-50 py-1 rounded border border-indigo-100">
              {pass.pass_code}
            </p>
            <p className="text-xs text-muted-foreground">Valid until {new Date(pass.valid_until).toLocaleDateString()}</p>
          </div>
          <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Share via WhatsApp
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreatePassModal({ onCreated }: { onCreated: () => void }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    valid_days: '1',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: () =>
      guestPassService.createPass({
        generated_by: profile!.id,
        guest_name: form.guest_name,
        guest_phone: form.guest_phone || undefined,
        guest_email: form.guest_email || undefined,
        valid_days: parseInt(form.valid_days),
        notes: form.notes || undefined,
      }),
    onSuccess: (newPass) => {
      toast.success(`Pass created: ${newPass.pass_code}`, {
        description: `Valid for ${form.valid_days} day(s)`,
      });
      setOpen(false);
      setForm({ guest_name: '', guest_phone: '', guest_email: '', valid_days: '1', notes: '' });
      onCreated();
    },
    onError: () => toast.error('Failed to create guest pass'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Generate Pass
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Ticket className="h-5 w-5 text-indigo-500" />
            Generate Guest Pass
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a time-limited access pass for a guest visitor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="guest_name" className="text-sm font-medium text-foreground/80">
              Guest Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
              <Input
                id="guest_name"
                placeholder="Full name"
                className="pl-9 bg-background border-border focus:border-indigo-400 text-foreground"
                value={form.guest_name}
                onChange={(e) => setForm(f => ({ ...f, guest_name: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guest_phone" className="text-sm font-medium text-foreground/80">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
                <Input
                  id="guest_phone"
                  placeholder="+1 555-0000"
                  className="pl-9 bg-background border-border focus:border-indigo-400 text-foreground"
                  value={form.guest_phone}
                  onChange={(e) => setForm(f => ({ ...f, guest_phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest_email" className="text-sm font-medium text-foreground/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
                <Input
                  id="guest_email"
                  placeholder="guest@email.com"
                  className="pl-9 bg-background border-border focus:border-indigo-400 text-foreground"
                  value={form.guest_email}
                  onChange={(e) => setForm(f => ({ ...f, guest_email: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/80">Validity Period</Label>
            <Select value={form.valid_days} onValueChange={(v) => setForm(f => ({ ...f, valid_days: v }))}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">1 Week</SelectItem>
                <SelectItem value="14">2 Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-foreground/80">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="e.g. Friend of member John"
              className="bg-background border-border focus:border-indigo-400 text-foreground"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5"
            disabled={!form.guest_name.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><QrCode className="h-4 w-4 mr-2" />Generate Pass</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScanModal() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<GuestPass | null | 'not-found'>(null);
  const { profile } = useAuth();

  const markUsedMutation = useMutation({
    mutationFn: () => guestPassService.markUsed((result as GuestPass).id, profile!.id),
    onSuccess: () => {
      toast.success('Guest pass marked as used');
      setResult(null);
      setCode('');
      setOpen(false);
    },
    onError: () => toast.error('Failed to mark pass as used'),
  });

  const handleLookup = async () => {
    if (!code.trim()) return;
    const pass = await guestPassService.getPassByCode(code.trim());
    setResult(pass ?? 'not-found');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setCode(''); setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border text-foreground/80 hover:bg-muted/50 gap-2">
          <ScanLine className="h-4 w-4" />
          Scan / Verify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-card border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ScanLine className="h-5 w-5 text-indigo-500" />
            Verify Guest Pass
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the 12-character pass code to look up a guest pass.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="GP-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="font-mono bg-background border-border text-foreground focus:border-indigo-400"
            />
            <Button onClick={handleLookup} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Look Up
            </Button>
          </div>

          {result === 'not-found' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700 text-sm font-medium">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
              Pass not found. Check the code and try again.
            </div>
          )}

          {result && result !== 'not-found' && (() => {
            const status = getPassStatus(result);
            return (
              <div className={`rounded-lg p-4 border ${
                status === 'active' ? 'bg-emerald-50 border-emerald-200' :
                status === 'used' ? 'bg-background border-border' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-foreground">{result.guest_name}</span>
                  <StatusBadge status={status} />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Code: <span className="font-mono font-semibold text-foreground/80">{result.pass_code}</span></div>
                  <div>Valid until: {new Date(result.valid_until).toLocaleString()}</div>
                  {result.notes && <div>Notes: {result.notes}</div>}
                </div>
                {status === 'active' && (
                  <Button
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                    onClick={() => markUsedMutation.mutate()}
                    disabled={markUsedMutation.isPending}
                  >
                    {markUsedMutation.isPending ? 'Marking...' : 'Mark as Used & Allow Entry'}
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PassCard({ pass, onDelete }: { pass: GuestPass; onDelete: (id: string) => void }) {
  const status = getPassStatus(pass);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`bg-card border transition-shadow hover:shadow-md ${
        status === 'active' ? 'border-border' :
        status === 'used' ? 'border-border/50 opacity-70' :
        'border-red-100 opacity-60'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                  {pass.guest_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm truncate">{pass.guest_name}</p>
                  {pass.guest_email && (
                    <p className="text-xs text-muted-foreground truncate">{pass.guest_email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {pass.pass_code}
                </span>
                <CopyButton text={pass.pass_code} />
                <StatusBadge status={status} />
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires {new Date(pass.valid_until).toLocaleDateString()}
                </span>
                {pass.guest_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {pass.guest_phone}
                  </span>
                )}
              </div>

              {pass.notes && (
                <p className="mt-2 text-xs text-muted-foreground/75 italic truncate">{pass.notes}</p>
              )}

              {status === 'used' && pass.used_at && (
                <p className="mt-1.5 text-xs text-muted-foreground/75">
                  Used: {new Date(pass.used_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground/75 hover:text-slate-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border border-border shadow-lg">
                  <DropdownMenuItem
                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => onDelete(pass.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Pass
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {status === 'active' && (
                <div className="mt-4">
                  <GuestQRModal pass={pass} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function GuestPassPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');

  const { data: dbPasses = [], isLoading } = useQuery({
    queryKey: ['guest-passes'],
    queryFn: () => guestPassService.getPasses(100),
    staleTime: 30_000,
  });

  const passes = dbPasses.length > 0 ? dbPasses : [];

  const { data: stats } = useQuery({
    queryKey: ['guest-pass-stats'],
    queryFn: () => guestPassService.getStats(),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => guestPassService.deletePass(id),
    onSuccess: () => {
      toast.success('Pass deleted');
      queryClient.invalidateQueries({ queryKey: ['guest-passes'] });
      queryClient.invalidateQueries({ queryKey: ['guest-pass-stats'] });
    },
    onError: () => toast.error('Failed to delete pass'),
  });

  const filtered = passes.filter((p) => {
    const status = getPassStatus(p);
    if (filter !== 'all' && status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.guest_name.toLowerCase().includes(q) ||
      p.pass_code.toLowerCase().includes(q) ||
      p.guest_email?.toLowerCase().includes(q)
    );
  });

  const statsData = [
    { label: 'Total Generated', value: stats?.total ?? passes.length, color: 'text-foreground/80', bg: 'bg-background border-border' },
    { label: 'Active Passes', value: stats?.active ?? filtered.filter(p => getPassStatus(p) === 'active').length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Used', value: stats?.used ?? filtered.filter(p => getPassStatus(p) === 'used').length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Expired', value: stats?.expired ?? filtered.filter(p => getPassStatus(p) === 'expired').length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Guest Passes</h2>
          <p className="text-muted-foreground text-sm mt-1">Generate, track, and verify single-use guest access passes.</p>
        </div>
        <div className="flex items-center gap-2">
          <ScanModal />
          <CreatePassModal onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['guest-passes'] });
            queryClient.invalidateQueries({ queryKey: ['guest-pass-stats'] });
          }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsData.map((s) => (
          <Card key={s.label} className={`border ${s.bg}`}>
            <CardContent className="p-4">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
          <Input
            placeholder="Search by name, email, or pass code…"
            className="pl-9 bg-card border-border text-foreground"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {(['all', 'active', 'used', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-card text-muted-foreground border-border hover:border-indigo-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Pass List */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-muted rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-background">
          <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {search || filter !== 'all' ? 'No passes match your search.' : 'No guest passes yet.'}
          </p>
          <p className="text-muted-foreground/75 text-sm mt-1">Click "Generate Pass" to create one.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((pass) => (
              <PassCard
                key={pass.id}
                pass={pass}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
