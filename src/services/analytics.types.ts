export interface DashboardKPIs {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  expiredMembers: number;
  newMembersThisMonth: number;
  todayAttendance: number;
  weeklyAttendance: number;
  monthlyAttendance: number;
  activeMemberships: number;
  pendingPayments: number;
  todayRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerMember: number;
  membershipRenewalRate: number;
}

export interface AttendanceAnalytics {
  daily: Array<{ date: string; count: number }>;
  weekly: Array<{ week: string; count: number }>;
  monthly: Array<{ month: string; count: number }>;
  heatmap: Array<{ day: string; hour: string; count: number }>;
  peakHours: Array<{ hour: string; count: number }>;
  mostActiveMembers: Array<{ name: string; email: string; checkIns: number }>;
  leastActiveMembers: Array<{ name: string; email: string; checkIns: number }>;
}

export interface MembershipAnalytics {
  activePlans: Array<{ planName: string; count: number }>;
  mostPopularPlans: Array<{ planName: string; count: number }>;
  growth: Array<{ month: string; members: number }>;
  expiryForecast: Array<{ month: string; count: number }>;
  renewalSuccessRate: number;
  churnRate: number;
  averageDurationDays: number;
}

export interface PaymentAnalytics {
  revenueTrend: Array<{ date: string; revenue: number }>;
  dailyRevenue: Array<{ date: string; revenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  methodDistribution: Array<{ method: string; count: number }>;
  pendingVsApproved: Array<{ status: string; amount: number }>;
  collectionRate: number;
  outstandingRevenue: number;
}

export interface ClassAnalytics {
  totalClasses: number;
  totalBookings: number;
  occupancyRate: number;
  mostPopularClasses: Array<{ title: string; count: number }>;
  trainerPerformance: Array<{ trainerName: string; count: number; occupancyRate: number }>;
  cancellationRate: number;
  waitingListStats: {
    totalWaiting: number;
    avgWaitPosition: number;
  };
  noShowRate: number;
}

export interface BodyProgressAnalytics {
  updatedThisMonth: number;
  overdueUpdates: number;
  averageWeightChangeKg: number;
  averageBmiChange: number;
  bodyFatTrends: Array<{ date: string; averageFat: number }>;
  progressCompletionPercent: number;
}

export interface MemberInsights {
  newRegistrations: Array<{ date: string; count: number }>;
  activeVsInactive: Array<{ status: string; count: number }>;
  genderDistribution: Array<{ gender: string; count: number }>;
  ageDistribution: Array<{ range: string; count: number }>;
  upcomingExpirations: Array<{ name: string; email: string; daysLeft: number }>;
}

export interface AnalyticsReport {
  kpis: DashboardKPIs;
  attendance: AttendanceAnalytics;
  memberships: MembershipAnalytics;
  payments: PaymentAnalytics;
  classes: ClassAnalytics;
  progress: BodyProgressAnalytics;
  insights: MemberInsights;
}
