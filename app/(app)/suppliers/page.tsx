'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Star, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DEMO_SUPPLIERS } from '@/lib/demo-data';
import type { Supplier } from '@/types';

const PROVINCE_LABELS: Record<string, string> = {
  GP: 'Gauteng', WC: 'Western Cape', KZN: 'KwaZulu-Natal', EC: 'Eastern Cape',
  FS: 'Free State', LP: 'Limpopo', MP: 'Mpumalanga', NC: 'Northern Cape', NW: 'North West',
};

const CATEGORY_LABELS: Record<string, string> = {
  it_equipment: 'IT Equipment', office_supplies: 'Office Supplies', construction: 'Construction',
  professional_services: 'Professional Services', facilities: 'Facilities', logistics: 'Logistics',
  security: 'Security', healthcare: 'Healthcare', marketing: 'Marketing', other: 'Other',
};

function getBBBEEBadgeColor(level?: number): string {
  if (!level) return 'bg-gray-100 text-gray-600';
  if (level <= 2) return 'bg-green-100 text-green-800';
  if (level <= 4) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function getStatusBadgeColor(status: string): string {
  const map: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    conditional: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

function getGradeColor(grade?: string): string {
  const map: Record<string, string> = { A: 'text-green-700', B: 'text-blue-700', C: 'text-amber-700', D: 'text-orange-700', F: 'text-red-700' };
  return map[grade ?? ''] ?? 'text-gray-600';
}

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
      <span className="text-xs text-[var(--text-tertiary)] ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{supplier.company_name}</h3>
          {supplier.trading_name && (
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">t/a {supplier.trading_name}</p>
          )}
        </div>
        <div className={`text-lg font-black ${getGradeColor(supplier.grade?.grade)} shrink-0`}>
          {supplier.grade?.grade ?? '–'}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {supplier.bbbee_level && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBBBEEBadgeColor(supplier.bbbee_level)}`}>
            BBBEE L{supplier.bbbee_level}
          </span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeColor(supplier.status)}`}>
          {supplier.status}
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">{PROVINCE_LABELS[supplier.province] ?? supplier.province}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {supplier.categories.slice(0, 2).map((cat) => (
          <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {CATEGORY_LABELS[cat] ?? cat}
          </span>
        ))}
        {supplier.categories.length > 2 && (
          <span className="text-xs text-[var(--text-tertiary)]">+{supplier.categories.length - 2}</span>
        )}
      </div>

      <div className="mb-3">
        <StarsDisplay rating={supplier.quality_rating} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs font-bold text-[var(--text-primary)]">{supplier.response_rate}%</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">Response</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs font-bold text-[var(--text-primary)]">{supplier.on_time_delivery_rate}%</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">On-time</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs font-bold text-[var(--text-primary)]">{supplier.total_orders}</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">Orders</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">Score: {supplier.grade?.total ?? 0}/100</span>
        <Link href={`/suppliers/${supplier.id}`}>
          <Button size="sm" variant="outline" className="h-7 text-xs">View Profile</Button>
        </Link>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [bbbeeFilter, setBbbeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return DEMO_SUPPLIERS.filter((s) => {
      if (search && !s.company_name.toLowerCase().includes(search.toLowerCase()) && !(s.trading_name?.toLowerCase().includes(search.toLowerCase()))) return false;
      if (categoryFilter !== 'all' && !s.categories.includes(categoryFilter as never)) return false;
      if (provinceFilter !== 'all' && s.province !== provinceFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (bbbeeFilter !== 'all') {
        const level = s.bbbee_level ?? 0;
        if (bbbeeFilter === '1-2' && level > 2) return false;
        if (bbbeeFilter === '3-4' && (level < 3 || level > 4)) return false;
        if (bbbeeFilter === '5+' && level < 5) return false;
      }
      return true;
    });
  }, [search, categoryFilter, provinceFilter, bbbeeFilter, statusFilter]);

  const approved = DEMO_SUPPLIERS.filter((s) => s.status === 'approved').length;
  const pending = DEMO_SUPPLIERS.filter((s) => s.status === 'pending').length;
  const avgGrade = (DEMO_SUPPLIERS.reduce((sum, s) => sum + (s.grade?.total ?? 0), 0) / DEMO_SUPPLIERS.length).toFixed(0);

  const provinces = Array.from(new Set(DEMO_SUPPLIERS.map((s) => s.province)));
  const categories = Array.from(new Set(DEMO_SUPPLIERS.flatMap((s) => s.categories)));

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Supplier Network"
        subtitle={`${DEMO_SUPPLIERS.length} registered suppliers`}
        actions={
          <Link href="/supplier-portal/register">
            <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-blue-700 text-white gap-1.5 h-8 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Register New Supplier
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Suppliers', value: DEMO_SUPPLIERS.length, icon: <Users className="w-5 h-5 text-[var(--brand-blue)]" />, color: 'bg-blue-50 border-blue-200' },
            { label: 'Approved', value: approved, icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-200' },
            { label: 'Pending Review', value: pending, icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 border-amber-200' },
            { label: 'Avg Grade Score', value: `${avgGrade}/100`, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, color: 'bg-purple-50 border-purple-200' },
          ].map((stat) => (
            <div key={stat.label} className={`border rounded-xl p-4 flex items-center gap-3 ${stat.color}`}>
              <div className="p-2 bg-white rounded-lg shadow-sm">{stat.icon}</div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { if (v) setCategoryFilter(v); }}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={provinceFilter} onValueChange={(v) => { if (v) setProvinceFilter(v); }}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Province" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Provinces</SelectItem>
              {provinces.map((p) => <SelectItem key={p} value={p}>{PROVINCE_LABELS[p] ?? p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={bbbeeFilter} onValueChange={(v) => { if (v) setBbbeeFilter(v); }}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="BBBEE" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All BBBEE</SelectItem>
              <SelectItem value="1-2">Level 1–2</SelectItem>
              <SelectItem value="3-4">Level 3–4</SelectItem>
              <SelectItem value="5+">Level 5+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid of supplier cards */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            {filtered.length} supplier{filtered.length !== 1 ? 's' : ''} found
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-[var(--text-tertiary)]">
                No suppliers match the current filters.
              </div>
            )}
          </div>
        </div>

        {/* Full table */}
        <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border-default)] bg-gray-50">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Supplier Directory — Full Table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  {['Company', 'BBBEE', 'Status', 'Grade', 'Province', 'Categories', 'Response %', 'Quality', 'Orders', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id} className={`border-b border-[var(--border-default)] hover:bg-gray-50 ${idx === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{s.company_name}</p>
                      {s.trading_name && <p className="text-xs text-[var(--text-tertiary)]">t/a {s.trading_name}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {s.bbbee_level ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBBBEEBadgeColor(s.bbbee_level)}`}>
                          L{s.bbbee_level}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadgeColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-base ${getGradeColor(s.grade?.grade)}`}>{s.grade?.grade ?? '–'}</span>
                      <span className="text-xs text-[var(--text-tertiary)] ml-1">({s.grade?.total ?? 0})</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{PROVINCE_LABELS[s.province] ?? s.province}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.categories.slice(0, 2).map((c) => (
                          <span key={c} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {CATEGORY_LABELS[c] ?? c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{s.response_rate}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{s.quality_rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{s.total_orders}</td>
                    <td className="px-4 py-3">
                      <Link href={`/suppliers/${s.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
