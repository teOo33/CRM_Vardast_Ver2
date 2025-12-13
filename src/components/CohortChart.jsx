import React, { useMemo } from 'react';
import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  CartesianGrid
} from 'recharts';

const CohortChart = ({ onboardings }) => {
  const data = useMemo(() => { const cohorts = {}; onboardings.forEach(u => { if (!u.created_at || !u.created_at.includes('T')) return; const date = new Date(u.created_at); const month = date.toLocaleDateString('fa-IR', { month: 'long' }); if (!cohorts[month]) cohorts[month] = { month, total: 0, active: 0 }; cohorts[month].total++; if (u.progress > 0) cohorts[month].active++; }); return Object.values(cohorts).map(c => ({ ...c, retention: Math.round((c.active / c.total) * 100) })); }, [onboardings]);
  return (<ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis unit="%" /><Tooltip /><Area type="monotone" dataKey="retention" stroke="#82ca9d" fill="#82ca9d" name="نرخ فعال‌سازی" /></AreaChart></ResponsiveContainer>);
};

export default CohortChart;
