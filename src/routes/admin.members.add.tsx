import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { membersService } from '../services/members.service';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const Route = createFileRoute('/admin/members/add')({
  component: AddMemberPage,
});

const memberSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
});

function AddMemberPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      phone: '',
      gender: '',
      date_of_birth: '',
      address: '',
      emergency_contact: '',
    },
  });

  async function onSubmit(values: z.infer<typeof memberSchema>) {
    try {
      setIsLoading(true);
      await membersService.createMember({
        ...values,
        is_active: true,
        role: 'member',
      }, file || undefined);
      
      toast.success('Member created successfully');
      navigate({ to: '/admin/members' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create member');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate({ to: '/admin/members' })} className="border-border text-foreground hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Member</h2>
          <p className="text-muted-foreground">Enter the details to create a new gym member profile.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card className="bg-card border-border text-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Email Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="john_doe" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500 " />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-foreground/80">Physical Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, Country" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-foreground/80">Emergency Contact (Name & Phone)</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe - +1 (555) 111-2222" {...field} className="bg-background border-border text-foreground placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormItem className="md:col-span-2">
                <FormLabel className="text-foreground/80">Profile Image</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="bg-background border-border text-foreground file:text-slate-700 file:border-0 file:bg-slate-100 file:px-4 file:py-1 file:mr-4 file:rounded hover:file:bg-slate-200 cursor-pointer" 
                  />
                </FormControl>
              </FormItem>

            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: '/admin/members' })} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-gold/90" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> 
              {isLoading ? 'Saving...' : 'Save Member'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
