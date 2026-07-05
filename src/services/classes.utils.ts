/**
 * Helper to display days list as a reader-friendly string.
 * e.g. ['Monday', 'Wednesday', 'Friday'] -> 'Mon, Wed, Fri'
 */
export function formatClassDays(days: string[]): string {
  if (!days || days.length === 0) return 'No days selected';
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) {
    return 'Weekdays';
  }
  if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
    return 'Weekends';
  }
  
  return days
    .map((day) => day.slice(0, 3))
    .join(', ');
}

/**
 * Checks if a class is scheduled for today.
 */
export function isClassScheduledToday(days: string[]): boolean {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = weekdays[new Date().getDay()];
  return days.includes(todayName);
}

/**
 * Formats standard 24h TIME string to 12h AM/PM format.
 * e.g., '14:30:00' -> '02:30 PM'
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const formattedHours = hours12.toString().padStart(2, '0');
  return `${formattedHours}:${minutesStr} ${ampm}`;
}

/**
 * Check if the class is upcoming or past based on current time.
 */
export function isClassUpcoming(startTimeStr: string, days: string[]): boolean {
  if (!isClassScheduledToday(days)) {
    // If not today, we assume it's upcoming if it's in the schedule schedule list
    return true; 
  }
  
  const today = new Date();
  const [hours, minutes] = startTimeStr.split(':').map(Number);
  const classTime = new Date();
  classTime.setHours(hours, minutes, 0, 0);
  
  return classTime > today;
}
