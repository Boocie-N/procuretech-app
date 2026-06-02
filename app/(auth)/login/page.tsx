'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DEMO_USERS } from '@/lib/demo-data';
import { ROLE_LABELS } from '@/lib/utils';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Logomark } from '@/components/logomark';
import {
  ShieldCheck, Users, TrendingUp, Bot, Link2, BookOpen,
  ArrowRight, CheckCircle2, Building2,
} from 'lucide-react';

const ROLE_COLORS: Record<UserRole, string> = {
  admin:                'border-purple-200 bg-purple-50 hover:border-purple-400 dark:border-purple-800 dark:bg-purple-900/20',
  procurement_officer:  'border-blue-200 bg-blue-50 hover:border-blue-400 dark:border-blue-800 dark:bg-blue-900/20',
  manager:              'border-indigo-200 bg-indigo-50 hover:border-indigo-400 dark:border-indigo-800 dark:bg-indigo-900/20',
  cfo:                  'border-green-200 bg-green-50 hover:border-green-400 dark:border-green-800 dark:bg-green-900/20',
  legal:                'border-amber-200 bg-amber-50 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-900/20',
  supplier:             'border-gray-200 bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/20',
};

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  admin:                'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  procurement_officer:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  manager:              'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  cfo:                  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  legal:                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  supplier:             'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin:                'Full platform access — users, settings, all procurements, global oversight.',
  procurement_officer:  'Creates and manages procurements, generates RFQ/RFP/Tenders, AI Copilot access.',
  manager:              'Reviews and approves procurements, full pipeline visibility, deviation sign-off.',
  cfo:                  'Financial approval authority, spend analytics, budget management.',
  legal:                'Contract review and approval, compliance oversight.',
  supplier:             'Supplier portal — view RFQs, submit bids, manage company profile and documents.',
};

const FEATURES = [
  { icon: Bot,        label: 'AI Copilot',          desc: 'Generate SOW, RFQ, RFP & Tender docs' },
  { icon: TrendingUp, label: 'Market Intelligence',  desc: 'Live price benchmarking (ZAR)' },
  { icon: ShieldCheck,label: 'BBBEE Compliance',     desc: 'PPPFA 2017 preferential scoring' },
  { icon: Link2,      label: 'Blockchain Audit',     desc: 'Immutable, tamper-proof audit trail' },
  { icon: Users,      label: 'Supplier Portal',      desc: 'Verified, graded supplier network' },
  { icon: BookOpen,   label: 'Knowledge Base',       desc: 'Lessons learned & best practices' },
];

export default function LoginPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // Already logged in — skip login screen
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'supplier' ? '/supplier-portal' : '/dashboard');
    }
  }, [user, isLoading, router]);

  function handleEnter() {
    if (!selected) return;
    login(selected);
    // Suppliers go to their own portal
    const user = DEMO_USERS.find(u => u.id === selected);
    router.push(user?.role === 'supplier' ? '/supplier-portal' : '/dashboard');
  }

  // Non-supplier users for the main grid
  const internalUsers = DEMO_USERS.filter(u => u.role !== 'supplier');
  const supplierUser  = DEMO_USERS.find(u => u.role === 'supplier');

  return (
    <div className="min-h-screen bg-[var(--bg-base)] dark:bg-[var(--bg-base)] flex">

      {/* Left panel — branding & features */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 bg-[var(--brand-blue)] text-white p-10 relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <Logomark size={40} />
            <div>
              <div className="font-bold text-xl leading-none">ProcureTech<span className="opacity-60">+</span></div>
              <div className="text-xs text-blue-200 mt-0.5 uppercase tracking-wider">AI Procurement OS</div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold leading-tight mb-3">
              Africa's most intelligent procurement platform
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              AI-powered procurement from requirement to contract award. Built on CIPS best practices, PPPFA compliance, and blockchain transparency.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-4 flex-1">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">{f.label}</div>
                  <div className="text-blue-200 text-xs mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-blue-200 text-xs">South Africa · PPPFA 2017 · CIPS Standard · BBBEE Compliant</p>
          </div>
        </div>
      </div>

      {/* Right panel — role selector */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-xl">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logomark size={32} />
            <div className="font-bold text-[var(--text-primary)]">ProcureTech<span className="text-[var(--brand-blue)]">+</span></div>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Select your role</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-7">
            This is a demo — choose any role to explore its capabilities and permissions.
          </p>

          {/* Internal role cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {internalUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelected(user.id)}
                className={cn(
                  'relative text-left p-4 rounded-xl border-2 transition-all duration-150',
                  ROLE_COLORS[user.role],
                  selected === user.id ? 'ring-2 ring-[var(--brand-blue)] ring-offset-2 dark:ring-offset-gray-900' : '',
                )}
              >
                {selected === user.id && (
                  <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[var(--brand-blue)]" />
                )}
                <div className="mb-2">
                  <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full', ROLE_BADGE_COLORS[user.role])}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
                <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">{user.full_name}</div>
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {ROLE_DESCRIPTIONS[user.role]}
                </div>
              </button>
            ))}
          </div>

          {/* Supplier card — full width */}
          {supplierUser && (
            <button
              onClick={() => setSelected(supplierUser.id)}
              className={cn(
                'relative w-full text-left p-4 rounded-xl border-2 transition-all duration-150 mb-6',
                ROLE_COLORS[supplierUser.role],
                selected === supplierUser.id ? 'ring-2 ring-[var(--brand-blue)] ring-offset-2 dark:ring-offset-gray-900' : '',
              )}
            >
              {selected === supplierUser.id && (
                <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[var(--brand-blue)]" />
              )}
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[var(--text-secondary)] mt-0.5 shrink-0" />
                <div>
                  <div className="mb-1">
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full', ROLE_BADGE_COLORS['supplier'])}>
                      Supplier Portal
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">{supplierUser.full_name} — Mecer IT Solutions</div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {ROLE_DESCRIPTIONS['supplier']} Register, upload compliance documents, and view RFQs you've been invited to.
                  </div>
                </div>
              </div>
            </button>
          )}

          <Button
            onClick={handleEnter}
            disabled={!selected}
            className={cn(
              'w-full h-11 text-sm font-medium gap-2 transition-all',
              selected
                ? 'bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
            )}
          >
            Enter Platform
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs text-[var(--text-tertiary)] mt-4">
            Demo version · No real data is used or stored externally
          </p>
        </div>
      </div>
    </div>
  );
}
