/**
 * DUMMY DATA — used as fallbacks when Supabase returns empty arrays.
 * Realistic, image-rich mock data for every module.
 */

// Unsplash portrait IDs for consistent fake avatars
const AVATAR_BASE = 'https://api.dicebear.com/9.x/avataaars/svg?seed=';

export const DUMMY_MEMBERS: any[] = [];

export const DUMMY_PAYMENTS: any[] = [];
export const DUMMY_ATTENDANCE: any[] = [];
export const DUMMY_CLASSES: any[] = [];
export const DUMMY_BOOKINGS: any[] = [];
export const DUMMY_PROGRESS: any[] = [];
export const DUMMY_ANALYTICS: any = {
  totalMembers: 2,
  activeMembers: 1,
  pendingMembers: 1,
  expiredMembers: 0,
  newMembersThisMonth: 2,
  todayAttendance: 0,
  weekAttendance: 0,
  monthAttendance: 0,
  activeMemberships: 1,
  pendingPayments: 1,
  todayRevenue: 0,
  monthRevenue: 2999,
  yearRevenue: 2999,
  avgRevenuePerMember: 1499.5,
  membershipRetentionRate: 100,
  revenueChart: [],
  membershipChart: [],
  attendanceChart: [],
  topClasses: [],
};
export const DUMMY_MEMBERSHIP_REQUESTS: any[] = [];
export const DUMMY_GUEST_PASSES: any[] = [];
export const DUMMY_FEEDBACK: any[] = [];
export const DUMMY_MEMBERSHIP_PLANS: any[] = [
  {
    id: 'mock-basic',
    name: 'Basic Pass',
    description: 'Perfect for casual gym goers looking to stay active.',
    price: 1999,
    duration_days: 30,
    features: ['Access to gym floor & weights', 'Standard locker access', '1 Trainer consult / month', 'Free high-speed WiFi'],
    is_active: true
  },
  {
    id: 'mock-elite',
    name: 'Elite Gym Pass',
    description: 'Our most popular option for dedicated fitness enthusiasts.',
    price: 2999,
    duration_days: 90,
    features: ['24/7 Gym access', 'Unlimited fitness group classes', 'Free sauna & steam rooms', 'Personalized nutrition guide', '4 Trainer consults / month'],
    is_active: true
  },
  {
    id: 'mock-vip',
    name: 'VIP Unlimited',
    description: 'All-inclusive premium experience with absolute freedom.',
    price: 4999,
    duration_days: 180,
    features: ['All Elite features included', '1-on-1 Dedicated Trainer', 'Complimentary towels & laundry', 'VIP lounge access', 'Free pre-workout drinks', '10% Discount on merchandise'],
    is_active: true
  }
];
export const DUMMY_SUPPORT_TICKETS: any[] = [];
export const DUMMY_TICKET_REPLIES: any[] = [];

