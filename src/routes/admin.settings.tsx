import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import {
  Bell, Shield, Palette, Globe, Moon, Sun, Monitor,
  BellRing, BellOff, Lock, Eye, EyeOff, Key,
  Check, Save, ChevronRight, Smartphone, Mail, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';

export const Route = createFileRoute('/admin/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile } = useAuth();

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailClassReminders: true,
    emailPaymentReceipts: true,
    emailMembershipExpiry: true,
    emailPromotions: false,
    pushClassReminders: true,
    pushAttendanceConfirm: false,
    pushPaymentAlerts: true,
  });

  // Security state
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Appearance state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState('en-US');

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleChangePassword = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPwd.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences, security, and notifications.</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-muted border border-border p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-muted-foreground data-[state=active]:text-slate-900">
            <Bell className="h-4 w-4 mr-2" />Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-muted-foreground data-[state=active]:text-slate-900">
            <Shield className="h-4 w-4 mr-2" />Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-muted-foreground data-[state=active]:text-slate-900">
            <Palette className="h-4 w-4 mr-2" />Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-muted-foreground data-[state=active]:text-slate-900">
            <User className="h-4 w-4 mr-2" />Account
          </TabsTrigger>
        </TabsList>

        {/* ── NOTIFICATIONS ── */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Mail className="h-5 w-5 text-indigo-500" /> Email Notifications
              </CardTitle>
              <CardDescription className="text-muted-foreground">Choose which emails you'd like to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailClassReminders', label: 'Class Reminders', desc: 'Get reminded 1 hour before your booked class.' },
                { key: 'emailPaymentReceipts', label: 'Payment Receipts', desc: 'Receive invoice emails after every payment.' },
                { key: 'emailMembershipExpiry', label: 'Membership Expiry', desc: 'Alerts 7 days before your plan expires.' },
                { key: 'emailPromotions', label: 'Promotions & Offers', desc: 'Occasional deals and membership discounts.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground/90">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications(n => ({ ...n, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Smartphone className="h-5 w-5 text-indigo-500" /> Push Notifications
              </CardTitle>
              <CardDescription className="text-muted-foreground">Control in-app and mobile push alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'pushClassReminders', label: 'Class Reminders', desc: 'Push alert before a class starts.' },
                { key: 'pushAttendanceConfirm', label: 'Check-in Confirmation', desc: 'Notify when your gym entry is logged.' },
                { key: 'pushPaymentAlerts', label: 'Payment Alerts', desc: 'Notify on payment approval or rejection.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground/90">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications(n => ({ ...n, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotifications}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Save className="h-4 w-4" /> Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* ── SECURITY ── */}
        <TabsContent value="security" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Key className="h-5 w-5 text-indigo-500" /> Change Password
              </CardTitle>
              <CardDescription className="text-muted-foreground">Use a strong password with at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground/80">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    className="pr-10 bg-background border-border text-foreground focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-slate-700"
                  >
                    {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground/80">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    className="pr-10 bg-background border-border text-foreground focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-slate-700"
                  >
                    {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground/80">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  className="bg-background border-border text-foreground focus:border-indigo-400"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <Lock className="h-4 w-4" /> Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-indigo-500" /> Active Sessions
              </CardTitle>
              <CardDescription className="text-muted-foreground">Devices currently signed in to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { device: 'Chrome on Windows', location: 'Karachi, PK', time: 'Active now', current: true },
                { device: 'Safari on iPhone', location: 'Lahore, PK', time: '2 hours ago', current: false },
                { device: 'Firefox on macOS', location: 'Islamabad, PK', time: '3 days ago', current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                        {s.device}
                        {s.current && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Current</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                    </div>
                  </div>
                  {!s.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500 hover:bg-red-50 text-xs"
                      onClick={() => toast.success('Session terminated')}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APPEARANCE ── */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="h-5 w-5 text-indigo-500" /> Theme
              </CardTitle>
              <CardDescription className="text-muted-foreground">Select how the app looks for you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: <Sun className="h-5 w-5" />, label: 'Light' },
                  { value: 'dark', icon: <Moon className="h-5 w-5" />, label: 'Dark' },
                  { value: 'system', icon: <Monitor className="h-5 w-5" />, label: 'System' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => { setTheme(t.value as any); toast.success(`Theme set to ${t.label}`); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      theme === t.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-border text-muted-foreground hover:border-slate-300'
                    }`}
                  >
                    {t.icon}
                    <span className="text-sm font-medium">{t.label}</span>
                    {theme === t.value && <Check className="h-3 w-3 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="h-5 w-5 text-indigo-500" /> Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
                { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
                { code: 'es', label: 'Español', flag: '🇪🇸' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'ar', label: 'العربية', flag: '🇸🇦' },
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); toast.success(`Language set to ${l.label}`); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    language === l.code
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-border hover:border-slate-300 bg-card'
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                    <span className="text-lg">{l.flag}</span> {l.label}
                  </span>
                  {language === l.code && <Check className="h-4 w-4 text-indigo-600" />}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ACCOUNT ── */}
        <TabsContent value="account" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-indigo-500" /> Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Full Name', value: `${profile?.first_name || 'James'} ${profile?.last_name || 'Carter'}` },
                { label: 'Email Address', value: profile?.email || 'james.carter@example.com' },
                { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'March 15, 2024' },
                { label: 'Account Role', value: profile?.role === 'admin' ? 'Administrator' : 'Member' },
                { label: 'Membership Status', value: profile?.membership_status || 'active' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground/90 capitalize">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-red-100">
            <CardHeader>
              <CardTitle className="text-red-600 text-base">Danger Zone</CardTitle>
              <CardDescription className="text-muted-foreground">These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-red-700">Delete Account</p>
                  <p className="text-xs text-red-500 mt-0.5">Permanently remove your account and all data.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-100"
                  onClick={() => toast.error('Please contact an administrator to delete your account.')}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
