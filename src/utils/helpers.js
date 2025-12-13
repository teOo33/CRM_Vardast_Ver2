import { differenceInHours, subDays, subYears, isAfter, isBefore, isValid } from 'date-fns';
import jalaali from 'jalaali-js';

// --- Helpers Safe Functions ---
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    if (dateStr instanceof Date) return dateStr.toLocaleDateString('fa-IR');
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const d = new Date(dateStr);
      return isValid(d) ? d.toLocaleDateString('fa-IR') : dateStr;
    }
    return String(dateStr);
  } catch (e) {
    return String(dateStr);
  }
};

export const checkSLA = (item) => {
  if (!item?.created_at || typeof item.created_at !== 'string' || !item.created_at.includes('T')) return false; 
  if (item.flag !== 'پیگیری فوری') return false;
  const openStatuses = ['باز', 'بررسی نشده'];
  if (!openStatuses.includes(item.status)) return false;
  try {
    const created = new Date(item.created_at);
    if (!isValid(created)) return false;
    const diff = differenceInHours(new Date(), created);
    return diff >= 2;
  } catch { return false; }
};

export const parsePersianDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string' && dateStr.includes('T')) return new Date(dateStr);
  
  try {
    const normalized = String(dateStr).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    const parts = normalized.split('/');
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const g = jalaali.toGregorian(y, m, d);
            return new Date(g.gy, g.gm - 1, g.gd);
        }
    }
  } catch (e) { console.error("Date parse error", e); }
  return null;
};

export const normalizeDate = (item) => {
    const dateField = item.created_at || item.frozen_at || item.requested_at || item.date;
    if (!dateField) return null;
    if (dateField instanceof Date) return dateField;
    return parsePersianDate(dateField);
};

export const filterDataByTime = (data, range, customRange) => {
    if (!data) return [];
    if (!range && !customRange) return data;
    
    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (customRange && customRange.length === 2) {
        startDate = customRange[0].toDate();
        endDate = customRange[1].toDate();
        endDate.setHours(23, 59, 59, 999);
    } else {
        switch (range) {
            case '1d': startDate = subDays(now, 1); break;
            case '7d': startDate = subDays(now, 7); break;
            case '30d': startDate = subDays(now, 30); break;
            case '1y': startDate = subYears(now, 1); break;
            default: return data;
        }
    }

    return data.filter(item => {
        const date = normalizeDate(item);
        if (!date || !isValid(date)) return false;
        return isAfter(date, startDate) && isBefore(date, endDate);
    });
};

export const downloadCSV = (data, fileName) => {
  if (!data || !data.length) return alert('داده‌ای وجود ندارد.');
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((f) => `"${(row[f] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};
