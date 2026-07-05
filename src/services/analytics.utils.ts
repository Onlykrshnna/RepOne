import { 
  subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, 
  subMonths, startOfYear, endOfYear, format 
} from 'date-fns';

export interface DateInterval {
  start: Date;
  end: Date;
}

/**
 * Returns date range start and end based on filter name.
 */
export function getDateRangeInterval(filter: string, customStart?: string, customEnd?: string): DateInterval {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
      
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    
    case '7days':
      return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      
    case '30days':
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
      
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    
    case 'this_year':
      return { start: startOfYear(now), end: endOfYear(now) };
      
    case 'custom':
      if (customStart && customEnd) {
        return { start: startOfDay(new Date(customStart)), end: endOfDay(new Date(customEnd)) };
      }
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      
    default:
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
  }
}

/**
 * Export data array to CSV format
 */
export function exportToCSV(headers: string[], rows: any[][], filename: string) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(value => {
        const str = value === null || value === undefined ? '' : String(value);
        // Escape quotes
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data array to TSV (Excel friendly) format
 */
export function exportToExcel(headers: string[], rows: any[][], filename: string) {
  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => 
      row.map(value => {
        const str = value === null || value === undefined ? '' : String(value);
        return str.replace(/\t/g, ' ');
      }).join('\t')
    )
  ].join('\n');

  const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens browser print menu for generating PDFs
 */
export function triggerPrint() {
  window.print();
}
