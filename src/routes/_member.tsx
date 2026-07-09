import { createFileRoute, Outlet, redirect, Link, useLocation, useNavigate } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { useAuth } from '../lib/auth-context';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { notificationsService } from '../services/notifications.service';
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
  useSidebar,
} from '../components/ui/sidebar';
import { 
  LayoutDashboard, 
  User as UserIcon,
  ShoppingBag,
  LifeBuoy,
  CreditCard,
  LogOut,
  Settings,
  Dumbbell,
  CalendarDays,
  TrendingUp,
  MessageSquare,
  CalendarCheck,
  Lock,
  Bell
} from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeProvider } from '../lib/theme-context';
import { CompleteRegistrationForm } from '../components/CompleteRegistrationForm';

export const Route = createFileRoute('/_member')({
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
    
    // Admin trying to use member routes -> Redirect to admin dashboard
    if (profile?.role === 'admin') {
      throw redirect({ to: '/admin/dashboard' });
    }

    // Non-active members restricted to specific details-only routes
    if (profile?.membership_status !== 'active') {
      const allowedPaths = ['/dashboard', '/profile', '/membership-plans', '/buy-membership', '/payments', '/support', '/progress', '/notifications', '/attendance'];
      const isAllowed = allowedPaths.some(p => location.pathname === p || location.pathname.startsWith(`${p}/`));
      
      if (!isAllowed) {
        throw redirect({ to: '/dashboard' });
      }
    }
  },
  component: MemberLayout,
});

function getMemberNavItems(status: string) {
  const isRestricted = status !== 'active';

  return [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "My Profile", url: "/profile", icon: UserIcon },
    { title: "Progress", url: "/progress", icon: TrendingUp },
    { title: "Attendance", url: "/attendance", icon: CalendarCheck },
    { title: "Classes", url: "/classes", icon: Dumbbell, isLocked: isRestricted },
    { title: "Membership Plans", url: "/membership-plans", icon: ShoppingBag },
    { title: "Buy Membership", url: "/buy-membership", icon: CreditCard },
    { title: "Payment History", url: "/payments", icon: CreditCard },
    { title: "Support", url: "/support", icon: LifeBuoy },
  ];
}

function NotificationBellButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    return notificationsService.subscribe((notifications) => {
      setUnreadCount(notifications.filter(n => !n.read).length);
    });
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => navigate({ to: '/notifications' })} 
      className="relative text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded-full h-9 w-9 p-0"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm animate-pulse">
          {unreadCount}
        </span>
      )}
    </Button>
  );
}

function MemberLayoutInner({ currentPath, navItems, currentNav, signOut }: any) {
  const { setOpenMobile } = useSidebar();
  
  return (
    <>
      <Sidebar variant="inset" className="bg-card border-r-border">
        <SidebarHeader className="border-b border-border p-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
            <img src="/logo.png" alt="Logo" className="h-12 object-contain dark:invert-0 invert" />
            <span className="text-xs text-primary font-bold">MEMBER</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item: any) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={currentPath === item.url || currentPath.startsWith(item.url + '/')} tooltip={item.title}>
                      <Link 
                        to={item.isLocked ? '/dashboard' : item.url} 
                        className={`flex items-center text-muted-foreground hover:text-foreground ${item.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (item.isLocked) {
                            e.preventDefault();
                          } else {
                            setOpenMobile(false);
                          }
                        }}
                      >
                        <item.icon className="h-4 w-4 mr-2 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />}
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
              <SidebarMenuButton onClick={() => { signOut(); setOpenMobile(false); }} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset className="bg-background text-foreground min-h-screen overflow-x-hidden max-w-[100vw]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-muted" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Member
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
          <div className="flex items-center gap-3">
            <NotificationBellButton />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0 mt-8 w-full">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}

function MemberLayout() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  
  const currentPath = location.pathname;
  
  if (profile && !profile.username) {
    return (
      <ThemeProvider>
        <CompleteRegistrationForm profile={profile} signOut={signOut} />
      </ThemeProvider>
    );
  }

  const navItems = profile ? getMemberNavItems(profile.membership_status || 'pending') : [];
  const currentNav = navItems.find(item => currentPath === item.url || currentPath.startsWith(item.url + '/')) || navItems[0];

  return (
    <ThemeProvider>
      <SidebarProvider>
        <MemberLayoutInner currentPath={currentPath} navItems={navItems} currentNav={currentNav} signOut={signOut} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
