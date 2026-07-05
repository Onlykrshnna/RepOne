import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../lib/auth-context';
import { membersService } from '../services/members.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Phone, MapPin, AlertCircle, Calendar, Shield, Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/_member/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  if (!profile) return null;

  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    emergency_contact: profile.emergency_contact || '',
    date_of_birth: profile.date_of_birth || '',
    gender: profile.gender || '',
  });

  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => membersService.updateMember(profile.id, data),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['member', profile.id] });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Status */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm text-center pt-6 transition-all duration-300">
            <CardContent className="flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-sm border-4 border-white transition-all duration-300 hover:scale-105">
                {profile?.first_name?.[0] || 'U'}{profile?.last_name?.[0] || ''}
              </div>
              <h3 className="text-xl font-bold text-foreground">{profile?.first_name || 'User'} {profile?.last_name || ''}</h3>
              <p className="text-muted-foreground text-sm mb-4">{profile?.email}</p>
              
              <Badge 
                variant="outline" 
                className={`uppercase tracking-wider font-semibold ${
                  profile.membership_status === 'active' 
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                    : 'border-indigo-600 text-indigo-600 bg-indigo-50'
                }`}
              >
                {profile.membership_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {message && (
                  <div className={`p-4 rounded-md flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    {message.text}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="bg-background" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="bg-background" required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select 
                      id="gender" 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/90 mb-4">
                    <Phone className="h-4 w-4 text-indigo-600" /> Contact Details
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input id="emergency_contact" name="emergency_contact" placeholder="Name & Phone" value={formData.emergency_contact} onChange={handleChange} className="bg-background" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} className="bg-background" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm transition-all duration-300 hover:-translate-y-1">
                    {mutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
