import { createFileRoute, Outlet, redirect, Link, useLocation } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { useAuth } from '../lib/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '../components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  LogOut,
  Settings,
  Dumbbell,
  Receipt,
  BarChart2,
  Ticket,
  MessageSquare,
  ClipboardList,
  QrCode
} from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeProvider } from '../lib/theme-context';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return;
    


    const session = await authService.getSession();
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    const profile = await profileService.getProfile(session.user.id);
    
    // If not admin, redirect to member login
    if (!profile || profile.role !== 'admin') {
      throw redirect({
        to: '/login',
        search: { error: 'unauthorized_admin' }
      });
    }
  },
  component: AdminLayout,
});

const adminNavItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Requests", url: "/admin/membership-requests", icon: ClipboardList },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Attendance", url: "/admin/attendance", icon: CalendarCheck },
  { title: "Memberships", url: "/admin/memberships", icon: CreditCard },
  { title: "Classes", url: "/admin/classes", icon: Dumbbell },
  { title: "Payments", url: "/admin/payments", icon: Receipt },
  { title: "Reports", url: "/admin/reports", icon: BarChart2 },
  { title: "Guest Pass", url: "/admin/guest-passes", icon: Ticket },
  { title: "QR Management", url: "/admin/qr-management", icon: QrCode },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
];

function AdminLayout() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const currentPath = location.pathname;



  const currentNav = adminNavItems.find(item => currentPath === item.url || currentPath.startsWith(item.url + '/')) || adminNavItems[0];

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar variant="inset" className="bg-card border-r-border">
          <SidebarHeader className="border-b border-border p-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="font-display tracking-tight text-xl text-foreground">XYZ Fitness</span>
              <span className="text-xs text-indigo-600 font-semibold tracking-wide">ADMIN</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground">Console</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={currentPath === item.url || currentPath.startsWith(item.url + '/')} tooltip={item.title}>
                        <Link to={item.url} className="text-foreground/80 hover:text-foreground">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link to="/admin/settings" className="text-foreground/80 hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} className="text-foreground/80 hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-card text-foreground min-h-screen">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-muted" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
                      Admin Portal
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">
                      {currentNav?.title || 'Dashboard'}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0 mt-8">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
