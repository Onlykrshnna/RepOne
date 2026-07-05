export function calculateStreaks(attendanceRecords: any[]) {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastCheckIn: null
    };
  }

  // Extract unique dates as YYYY-MM-DD
  const uniqueDates = Array.from(new Set(
    attendanceRecords.map(r => {
      const d = new Date(r.check_in_time);
      return d.toISOString().split('T')[0];
    })
  )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Descending order (newest first)

  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastCheckIn: null };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let isStreakActive = true;

  // Check if current streak is alive (they checked in today or yesterday)
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    currentStreak = 1;
  } else {
    isStreakActive = false; // streak broken
  }

  // Iterate to find streaks
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const curr = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffTime = Math.abs(curr.getTime() - next.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (isStreakActive) currentStreak = tempStreak;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 1;
      isStreakActive = false;
    }
  }

  if (tempStreak > longestStreak) longestStreak = tempStreak;
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  return {
    currentStreak,
    longestStreak,
    totalDays: uniqueDates.length,
    lastCheckIn: uniqueDates[0]
  };
}
