const fs = require('fs');

const file = 'src/routes/_member.dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace lines 54-89
const replaceBlock1 = `  // --- REJECTED / SUSPENDED ---
  if (!BYPASS_STATUS_BLOCKS && (displayProfile.membership_status === 'rejected' || displayProfile.membership_status === 'suspended')) {`;

const newBlock1 = `  const BYPASS_STATUS_BLOCKS = false;
  const status = displayProfile.membership_status || 'none';
  
  const isNone = !BYPASS_STATUS_BLOCKS && status === 'none';
  const isPending = !BYPASS_STATUS_BLOCKS && status === 'pending';
  const isActive = !BYPASS_STATUS_BLOCKS && status === 'active';
  const isRejected = !BYPASS_STATUS_BLOCKS && status === 'rejected';
  const isExpired = !BYPASS_STATUS_BLOCKS && status === 'expired';
  
  const isLocked = isNone || isPending || isRejected || isExpired;

  // --- SUSPENDED ONLY (Rejected moved to normal dashboard flow) ---
  if (!BYPASS_STATUS_BLOCKS && status === 'suspended') {`;

content = content.replace(replaceBlock1, newBlock1);

// Remove the old unpaid/pending block
const replaceBlock2 = `  // --- UNPAID & PENDING VARIABLES ---
  const hasPendingPayment = data?.hasPendingPayment || false;
  const hasActivePlan = !!data?.activePlan;
  
  // A user is only truly pending if they have a pending payment request
  const isPending = !BYPASS_STATUS_BLOCKS && (displayProfile.membership_status === 'pending' || hasPendingPayment) && hasPendingPayment;
  
  // A user is unpaid if they have no active plan, no pending payment, and aren't marked as expired
  const isUnpaid = !BYPASS_STATUS_BLOCKS && !hasActivePlan && !hasPendingPayment && displayProfile.membership_status !== 'expired';
  
  const isLocked = isUnpaid || isPending;`;

content = content.replace(replaceBlock2, ``);

// Replace Badge logic
const badgeRegex = /isUnpaid \? 'Unpaid Account' : isPending \? 'Paid Account - Approval Needed' : 'Active Member'/g;
content = content.replace(badgeRegex, "isNone ? 'Incomplete Registration' : isPending ? 'Pending Approval' : isRejected ? 'Payment Rejected' : isExpired ? 'Expired' : 'Active Member'");

const badgeColorRegex = /isUnpaid \? 'bg-slate-500\/10 text-slate-500 border border-slate-500\/20' :[\s\S]*?'bg-emerald-500\/10 text-emerald-500 border border-emerald-500\/20'/g;
const newBadgeColor = `isNone ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20' : 
          isPending ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
          isRejected ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
          isExpired ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
          'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'`;
content = content.replace(badgeColorRegex, newBadgeColor);

// Replace unpaid banner
const unpaidBannerRegex = /\{isUnpaid && \([\s\S]*?\)\}/g;
const newBanners = `{isNone && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg shadow-emerald-900/5 gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-full">
              <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <h4 className="text-emerald-800 dark:text-emerald-500 font-semibold text-lg">Complete Registration</h4>
              <p className="text-emerald-600 dark:text-emerald-200/80 text-sm">Purchase a membership plan to unlock all gym features.</p>
            </div>
          </div>
          <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-500 font-medium shadow-md w-full md:w-auto">
            <Link to="/buy-membership">View Plans</Link>
          </Button>
        </div>
      )}

      {isPending && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg shadow-amber-900/5 gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-full">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h4 className="text-amber-800 dark:text-amber-500 font-semibold text-lg font-bold">Payment Submitted</h4>
              <p className="text-amber-600 dark:text-amber-200/80 text-sm">Waiting for Admin Approval. Your access will unlock shortly!</p>
            </div>
          </div>
          <Button disabled className="opacity-50 cursor-not-allowed bg-amber-200 text-amber-800 border-amber-300 w-full md:w-auto font-medium shadow-md">
            Purchase Disabled
          </Button>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg shadow-red-900/5 gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h4 className="text-red-800 dark:text-red-500 font-semibold text-lg font-bold">Payment Rejected</h4>
              <p className="text-red-600 dark:text-red-200/80 text-sm">
                Your recent payment was rejected. 
                {displayProfile.admin_notes && <span className="font-semibold block mt-1">Admin notes: {displayProfile.admin_notes}</span>}
              </p>
            </div>
          </div>
          <Button asChild className="bg-red-600 text-white hover:bg-red-700 font-medium shadow-md w-full md:w-auto">
            <Link to="/buy-membership">Resubmit Payment</Link>
          </Button>
        </div>
      )}`;
content = content.replace(unpaidBannerRegex, newBanners);

// Remove the old pending banner
const pendingBannerRegex = /\{isPending && \([\s\S]*?\)\}/g;
// Replace only the second occurrence (the old one) since the first one is our new one!
// Actually, wait, unpaidBannerRegex replaced the unpaid one, and put both new ones.
// I should just replace the old pending one.
// Instead of complex regex, let me write a robust update.
fs.writeFileSync('src/routes/_member.dashboard.tsx', content, 'utf8');
