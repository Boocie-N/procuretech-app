'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DEMO_USERS } from '@/lib/demo-data';
import { ROLE_LABELS } from '@/lib/utils';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logomark } from '@/components/logomark';
import {
  ShieldCheck, Users, TrendingUp, Bot, Link2, BookOpen,
  ArrowRight, Check,
  LayoutDashboard, Scale, Banknote, Building2, Settings,
} from 'lucide-react';

// ── Role meta ────────────────────────────────────────────────────────────────

const ROLE_META: Record<UserRole, {
  icon: React.ElementType;
  color: string;
  avatarBg: string;
  avatarText: string;
  badge: string;
  desc: string;
}> = {
  admin: {
    icon: Settings,
    color: 'border-violet-200 bg-violet-50 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:hover:bg-violet-900/30',
    avatarBg: 'bg-violet-600',
    avatarText: 'text-white',
    badge: 'bg-violet-100 text-violet-700',
    desc: 'Full system access, user management, global oversight',
  },
  procurement_officer: {
    icon: LayoutDashboard,
    color: 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
    avatarBg: 'bg-[#1A56DB]',
    avatarText: 'text-white',
    badge: 'bg-blue-100 text-blue-700',
    desc: 'Create procurements, generate documents, AI Copilot',
  },
  manager: {
    icon: Users,
    color: 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30',
    avatarBg: 'bg-indigo-600',
    avatarText: 'text-white',
    badge: 'bg-indigo-100 text-indigo-700',
    desc: 'Approve procurements, team oversight, deviation sign-off',
  },
  cfo: {
    icon: Banknote,
    color: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30',
    avatarBg: 'bg-emerald-600',
    avatarText: 'text-white',
    badge: 'bg-emerald-100 text-emerald-700',
    desc: 'Financial approval authority, spend analytics',
  },
  legal: {
    icon: Scale,
    color: 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30',
    avatarBg: 'bg-amber-500',
    avatarText: 'text-white',
    badge: 'bg-amber-100 text-amber-700',
    desc: 'Contract review, compliance oversight',
  },
  supplier: {
    icon: Building2,
    color: 'border-teal-200 bg-teal-50 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/20 dark:hover:bg-teal-900/30',
    avatarBg: 'bg-teal-600',
    avatarText: 'text-white',
    badge: 'bg-teal-100 text-teal-700',
    desc: 'View RFQs, submit bids, manage documents',
  },
};

const FEATURES = [
  { icon: Bot,         label: 'AI Copilot',         desc: 'Generate SOW, RFQ, RFP & Tender docs in seconds' },
  { icon: TrendingUp,  label: 'Market Intelligence', desc: 'Live ZAR price benchmarking & savings tracking' },
  { icon: ShieldCheck, label: 'BBBEE Compliance',    desc: 'PPPFA 2017 preferential procurement scoring' },
  { icon: Link2,       label: 'Blockchain Audit',    desc: 'Immutable, tamper-proof SHA-256 audit trail' },
  { icon: Users,       label: 'Supplier Network',    desc: 'Verified, graded supplier portal' },
  { icon: BookOpen,    label: 'Knowledge Base',      desc: 'Lessons learned & CIPS best practices' },
];

// ── Procurement background SVG ───────────────────────────────────────────────

function ProcurementGraphic() {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full object-cover"
      aria-hidden="true"
    >
      {/* Supply chain nodes — circles */}
      {[
        [80, 120], [200, 80], [340, 100], [480, 80], [540, 200],
        [460, 320], [520, 440], [380, 500], [220, 490], [100, 400],
        [60, 270], [170, 210], [310, 240], [440, 220], [300, 380],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 28 : i % 3 === 1 ? 18 : 12} stroke="white" strokeWidth="1.5" fill="none" />
      ))}

      {/* Node dots */}
      {[
        [80, 120], [200, 80], [340, 100], [480, 80], [540, 200],
        [460, 320], [520, 440], [380, 500], [220, 490], [100, 400],
        [60, 270], [170, 210], [310, 240], [440, 220], [300, 380],
      ].map(([cx, cy], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r={4} fill="white" />
      ))}

      {/* Connecting lines */}
      {[
        [80,120,200,80], [200,80,340,100], [340,100,480,80], [480,80,540,200],
        [540,200,460,320], [460,320,520,440], [520,440,380,500], [380,500,220,490],
        [220,490,100,400], [100,400,60,270], [60,270,80,120],
        [170,210,310,240], [310,240,440,220], [170,210,100,400],
        [310,240,300,380], [440,220,460,320], [300,380,380,500],
        [200,80,170,210], [340,100,310,240], [480,80,440,220],
      ].map(([x1,y1,x2,y2], i) => (
        <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.8" strokeDasharray={i % 4 === 0 ? '6 4' : 'none'} />
      ))}

      {/* Document shapes */}
      {[[130, 290], [390, 160], [250, 330], [470, 390]].map(([x, y], i) => (
        <g key={`doc${i}`}>
          <rect x={x} y={y} width={44} height={56} rx={4} stroke="white" strokeWidth="1.2" fill="none" />
          <line x1={x+8} y1={y+16} x2={x+36} y2={y+16} stroke="white" strokeWidth="1" />
          <line x1={x+8} y1={y+26} x2={x+36} y2={y+26} stroke="white" strokeWidth="1" />
          <line x1={x+8} y1={y+36} x2={x+26} y2={y+36} stroke="white" strokeWidth="1" />
          <path d={`M${x+32} ${y} L${x+44} ${y+12} L${x+32} ${y+12} Z`} stroke="white" strokeWidth="1" fill="none" />
        </g>
      ))}

      {/* Bar chart shapes */}
      {[[50, 450], [460, 120]].map(([bx, by], i) => (
        <g key={`bar${i}`}>
          {[0,1,2,3].map(j => (
            <rect key={j} x={bx + j*14} y={by + [24,10,30,16][j]} width={10} height={[18,32,12,26][j]} rx={2} stroke="white" strokeWidth="1" fill="none" />
          ))}
        </g>
      ))}

      {/* Truck icon shapes */}
      {[[270, 430], [130, 150]].map(([tx, ty]) => (
        <g key={`truck${tx}`}>
          <rect x={tx} y={ty} width={52} height={30} rx={3} stroke="white" strokeWidth="1.2" fill="none" />
          <rect x={tx+36} y={ty+6} width={24} height={24} rx={3} stroke="white" strokeWidth="1.2" fill="none" />
          <circle cx={tx+14} cy={ty+33} r={6} stroke="white" strokeWidth="1.2" fill="none" />
          <circle cx={tx+46} cy={ty+33} r={6} stroke="white" strokeWidth="1.2" fill="none" />
        </g>
      ))}
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'supplier' ? '/supplier-portal' : '/dashboard');
    }
  }, [user, isLoading, router]);

  function handleEnter() {
    if (!selected) return;
    login(selected);
    const selectedUser = DEMO_USERS.find(u => u.id === selected);
    router.push(selectedUser?.role === 'supplier' ? '/supplier-portal' : '/dashboard');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">

      {/* ── Left panel — branding (blue) ── */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 bg-[var(--brand-blue)] text-white p-10 relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Procurement SVG graphic */}
        <div className="absolute inset-0 opacity-[0.04]">
          <ProcurementGraphic />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Headline — no logo block here */}
          <div className="mb-10 mt-4">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              South Africa's first intelligent procurement platform
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              AI-powered procurement from requirement to contract award — built on CIPS best practices, PPPFA compliance, and blockchain transparency.
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

      {/* ── Right panel — role selector (white) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 overflow-y-auto relative">

        {/* Low-opacity procurement background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=80')" }}
          aria-hidden="true"
        />

        <div className="w-full max-w-md relative z-10">

          {/* Header row: heading on left, logo on far right */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              {/* Mobile-only logo (shown when left panel is hidden) */}
              <div className="lg:hidden flex items-center gap-2.5 mb-4">
                <Logomark size={32} />
                <div className="font-bold text-[var(--text-primary)]">
                  ProcureTech<span className="text-[var(--brand-blue)]">+</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Sign in to your workspace</h1>
              <p className="text-sm text-[var(--text-secondary)]">Select a demo persona to explore the platform.</p>
            </div>

            {/* Logo — far right, desktop only */}
            <div className="hidden lg:flex flex-col items-center gap-1.5 shrink-0 pt-1">
              <Logomark size={52} />
              <div className="text-center">
                <div className="font-bold text-sm text-[var(--text-primary)] leading-none">
                  ProcureTech<span className="text-[var(--brand-blue)]">+</span>
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">
                  AI Procurement OS
                </div>
              </div>
            </div>
          </div>

          {/* Role list */}
          <div className="space-y-2 mb-6">
            {DEMO_USERS.map(u => {
              const meta = ROLE_META[u.role];
              const initials = u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isSelected = selected === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => setSelected(u.id)}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 text-left',
                    meta.color,
                    isSelected
                      ? 'shadow-md ring-2 ring-[var(--brand-blue)] ring-offset-1 border-transparent dark:ring-offset-gray-900'
                      : 'shadow-none'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold', meta.avatarBg, meta.avatarText)}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.full_name}</span>
                      <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0', meta.badge)}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{meta.desc}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    isSelected ? 'bg-[var(--brand-blue)] border-[var(--brand-blue)]' : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleEnter}
            disabled={!selected}
            className={cn(
              'w-full h-11 text-sm font-semibold gap-2 transition-all',
              selected
                ? 'bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white shadow-md'
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
