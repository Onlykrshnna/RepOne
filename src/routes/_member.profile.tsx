import { useState, useEffect, useRef, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../lib/auth-context';
import { membersService } from '../services/members.service';
import { profileService } from '../services/profile.service';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Phone, MapPin, AlertCircle, Shield, Save, Loader2, Camera, CheckCircle2, XCircle, X } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_member/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useAuth();
  if (!profile) return null;
  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: any }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: latestProfile } = useQuery({
    queryKey: ['member-profile', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const displayProfile = latestProfile || profile;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    address: '',
    emergency_contact: '',
    date_of_birth: '',
    gender: '',
  });

  const [initialData, setInitialData] = useState(formData);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (displayProfile) {
      const newFormState = {
        first_name: displayProfile.first_name || '',
        last_name: displayProfile.last_name || '',
        username: displayProfile.username || '',
        phone: displayProfile.phone || '',
        address: displayProfile.address || '',
        emergency_contact: displayProfile.emergency_contact || '',
        date_of_birth: displayProfile.date_of_birth || '',
        gender: displayProfile.gender || '',
      };
      setFormData(newFormState);
      setInitialData(newFormState);
    }
  }, [displayProfile]);

  useEffect(() => {
    if (formData.username === initialData.username) {
      setUsernameStatus('idle');
      return;
    }
    
    if (!formData.username) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const isUnique = await profileService.checkUsernameUnique(formData.username, profile.id);
      setUsernameStatus(isUnique ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, initialData.username, profile.id]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => membersService.updateMember(profile.id, data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['member-profile', profile.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDiscard = () => {
    setFormData(initialData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === 'taken') {
      toast.error('Username is already taken.');
      return;
    }
    mutation.mutate(formData);
  };

  // Avatar Upload Logic
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const processAndUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a canvas to crop and compress
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height, 400); // Max 400x400
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Calculate crop
      const startX = img.width > img.height ? (img.width - img.height) / 2 : 0;
      const startY = img.height > img.width ? (img.height - img.width) / 2 : 0;
      const side = Math.min(img.width, img.height);

      ctx.drawImage(img, startX, startY, side, side, 0, 0, size, size);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas to Blob failed'));
        }, 'image/webp', 0.8);
      });

      const processedFile = new File([blob], 'avatar.webp', { type: 'image/webp' });

      // Upload using membersService
      await membersService.updateMember(profile.id, { avatar_url: displayProfile.avatar_url }, processedFile);
      toast.success('Profile picture updated!');
      queryClient.invalidateQueries({ queryKey: ['member-profile', profile.id] });
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to process and upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file input
    if (confirm('Are you sure you want to remove your profile picture?')) {
      setIsUploading(true);
      try {
        await membersService.updateMember(profile.id, { avatar_url: undefined });
        toast.success('Profile picture removed!');
        queryClient.invalidateQueries({ queryKey: ['member-profile', profile.id] });
      } catch (error: any) {
        toast.error('Failed to remove image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-foreground">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your premium account details.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar & Status */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm text-center pt-8 pb-6 transition-all duration-300">
            <CardContent className="flex flex-col items-center">
              <div 
                className="relative w-32 h-32 rounded-full mb-4 group cursor-pointer"
                onClick={handleAvatarClick}
              >
                {displayProfile?.avatar_url ? (
                  <img 
                    src={displayProfile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full shadow-md border-4 border-white transition-all duration-300 group-hover:brightness-75"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md border-4 border-white transition-all duration-300 group-hover:brightness-75">
                    {displayProfile?.first_name?.[0] || 'U'}{displayProfile?.last_name?.[0] || ''}
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin drop-shadow-md" />
                  ) : (
                    <Camera className="h-8 w-8 text-white drop-shadow-md" />
                  )}
                </div>

                {displayProfile?.avatar_url && !isUploading && (
                  <button 
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={processAndUploadImage} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />

              <h3 className="text-xl font-bold text-foreground">{displayProfile?.first_name || ''} {displayProfile?.last_name || ''}</h3>
              <p className="text-muted-foreground text-sm mb-4 font-medium">{displayProfile?.email}</p>
              
              <Badge 
                variant="outline" 
                className={`uppercase tracking-wider font-semibold py-1 px-3 ${
                  displayProfile.membership_status === 'active' 
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                    : 'border-indigo-600 text-indigo-600 bg-indigo-50'
                }`}
              >
                {displayProfile.membership_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-sm transition-all duration-300">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-foreground/80 font-semibold">First Name</Label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="bg-background focus-visible:ring-indigo-500" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-foreground/80 font-semibold">Last Name</Label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="bg-background focus-visible:ring-indigo-500" required />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground/80 font-semibold">Username</Label>
                    <div className="relative">
                      <Input 
                        id="username" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        className={`bg-background focus-visible:ring-indigo-500 ${
                          usernameStatus === 'taken' ? 'border-red-500 focus-visible:ring-red-500' : 
                          usernameStatus === 'available' ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''
                        }`} 
                        placeholder="Choose a unique username"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
                        {usernameStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {usernameStatus === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                    {usernameStatus === 'taken' && <p className="text-xs text-red-500 mt-1">This username is already taken.</p>}
                    {usernameStatus === 'available' && <p className="text-xs text-emerald-500 mt-1">Username available!</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-foreground/80 font-semibold">Date of Birth</Label>
                    <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="bg-background focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-foreground/80 font-semibold">Gender</Label>
                    <select 
                      id="gender" 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground/80 font-semibold">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="bg-background focus-visible:ring-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="address" className="text-foreground/80 font-semibold">Full Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} className="bg-background focus-visible:ring-indigo-500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact" className="text-foreground/80 font-semibold">Emergency Contact</Label>
                  <Input id="emergency_contact" name="emergency_contact" placeholder="Name & Phone" value={formData.emergency_contact} onChange={handleChange} className="bg-background focus-visible:ring-indigo-500" />
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/50">
                  {isDirty && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleDiscard}
                      disabled={mutation.isPending} 
                      className="w-full sm:w-auto hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      Discard Changes
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending || !isDirty || usernameStatus === 'taken' || usernameStatus === 'checking'} 
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-sm transition-all duration-300 disabled:opacity-50"
                  >
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
