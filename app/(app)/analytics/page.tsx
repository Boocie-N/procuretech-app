'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, ShieldCheck, Download } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

// ─── Chart Data ───────────────────────────────────────────────────────────────

const SPEND_BY_CATEGORY = [
  { name: 'IT Equipment', value: 1_200_000 },
  { name: 'Construction', value: 890_000 },
  { name: 'Security', value: 560_000 },
  { name: 'Facilities', value: 340_000 },
];

const PIE_COLORS = ['#1A56DB', '#3F83F8', '#76A9FA', '#A4CAFE'];

const MONTHLY_SAVINGS = [
  { month: 'Aug', actual: 420_000, benchmark: 480_000, savings: 60_000 },
  { month: 'Sep', actual: 310_000, benchmark: 360_000, savings: 50_000 },
  { month: 'Oct', actual: 580_000, benchmark: 630_000, savings: 50_000 },
  { month: 'Nov', actual: 450_000, benchmark: 510_000, savings: 60_000 },
  { month: 'Dec', actual: 290_000, benchmark: 305_000, savings: 15_000 },
  { month: 'Jan', actual: 940_000, benchmark: 1_050_000, savings: 110_000 },
];

const CYCLE_TIME_TREND = [
  { month: 'Aug', avgDays: 22 },
  { month: 'Sep', avgDays: 20 },
  { month: 'Oct', avgDays: 19 },
  { month: 'Nov', avgDays: 21 },
  { month: 'Dec', avgDays: 17 },
  { month: 'Jan', avgDays: 15 },
];

const BBBEE_SPEND = [
  { level: 'Level 1', spend: 1_620_000 },
  { level: 'Level 2', spend: 820_000 },
  { level: 'Level 3', spend: 310_000 },
  { level: 'Level 4+', spend: 240_000 },
];

const SUPPLIER_PERFORMANCE = [
  { name: 'Ndalo Security', quality: 4.9 },
  { name: 'Mecer IT', quality: 4.8 },
  { name: 'BuildRight', quality: 4.7 },
  { name: 'AfriTech', quality: 4.5 },
  { name: 'TechPro', quality: 4.1 },
];

function formatR(value: number) {
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(0)}k`;
  return `R${value}`;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('last_6_months');

  const kpis = [
    {
      label: 'Total Spend',
      value: 'R2.99M',
      change: '+12.4%',
      positive: false,
      icon: <DollarSign className="w-5 h-5 text-[var(--brand-blue)]" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Savings vs Market',
      value: 'R184k',
      change: '11.4% saved',
      positive: true,
      icon: <TrendingDown className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50 border-green-200',
    },
    {
      label: 'Avg Cycle Time',
      value: '18 days',
      change: '-4 days vs prior period',
      positive: true,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Active Suppliers',
      value: '284',
      change: '+18 this period',
      positive: true,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200',
    },
    {
      label: 'Compliance Rate',
      value: '94%',
      change: '+2% vs prior period',
      positive: true,
      icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Analytics & Data"
        subtitle="Procurement spend, savings, and performance insights"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs border border-[var(--border-default)] rounded-lg px-3 h-8 bg-white text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-blue)]"
            >
              <option value="last_3_months">Last 3 months</option>
              <option value="last_6_months">Last 6 months</option>
              <option value="this_year">This financial year</option>
              <option value="last_year">Last financial year</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => toast.success('Analytics report exported')}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-5 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`border rounded-xl p-4 ${kpi.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-tertiary)]">{kpi.label}</p>
                <div className="p-1.5 bg-white rounded-lg shadow-sm">{kpi.icon}</div>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)]">{kpi.value}</p>
              <p className={`text-xs mt-1 flex items-center gap-0.5 ${kpi.positive ? 'text-green-700' : 'text-[var(--text-tertiary)]'}`}>
                {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </p>
            </div>
          ))}
        </div>

        {/* Row 1: Pie + Bar */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="Spend by Category" subtitle="Total procurement spend breakdown — current period">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={SPEND_BY_CATEGORY}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {SPEND_BY_CATEGORY.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${formatR(value as number)}`, 'Spend']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Savings vs Market Benchmark" subtitle="Actual spend vs market benchmark price — ZAR">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_SAVINGS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatR(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [formatR(value as number), '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="actual" name="Actual Spend" fill="#1A56DB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="benchmark" name="Market Benchmark" fill="#A4CAFE" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 2: Full-width line chart */}
        <ChartCard title="Procurement Cycle Time Trend" subtitle="Average days from need identification to award — last 6 months">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={CYCLE_TIME_TREND} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis unit=" days" tick={{ fontSize: 11 }} domain={[10, 30]} />
              <Tooltip formatter={(value) => [`${value} days`, 'Cycle Time']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="avgDays"
                name="Avg Cycle Days"
                stroke="#1A56DB"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#1A56DB' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Row 3: BBBEE + Supplier Performance */}
        <div className="grid grid-cols-2 gap-5">
          <ChartCard title="BBBEE Spend Distribution" subtitle="Spend allocated by BBBEE level — PPPFA compliance view">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={BBBEE_SPEND} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(v) => formatR(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="level" tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(value) => [formatR(value as number), 'Spend']} />
                <Bar dataKey="spend" name="Spend" fill="#1A56DB" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Supplier Performance" subtitle="Top 5 suppliers by quality rating (/5)">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={SUPPLIER_PERFORMANCE} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(value) => [`${(value as number).toFixed(1)} / 5.0`, 'Quality Rating']} />
                <Bar dataKey="quality" name="Quality Rating" fill="#3F83F8" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
