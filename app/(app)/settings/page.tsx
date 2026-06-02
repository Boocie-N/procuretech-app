'use client';

import { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/layout/theme-provider';
import { ROLE_LABELS } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  User, Building2, Bell, Shield, Workflow, Moon, Sun,
  Save, Upload, ChevronRight, Check,
} from 'lucide-react';

const APPROVAL_CHAIN = [
  { step: 1, role: 'Procurement Officer', threshold: 'All procurements',      can_approve: false },
  { step: 2, role: 'Procurement Manager', threshold: 'All procurements',      can_approve: true  },
  { step: 3, role: 'CFO',                 threshold: 'Above R100,000',        can_approve: true  },
  { step: 4, role: 'Legal',              threshold: 'Contracts > R500,000',   can_approve: true  },
];

const NOTIFICATION_SETTINGS = [
  { id: 'new_rfq',        label: 'New RFQ created',                   email: true,  inApp: true  },
  { id: 'bid_received',   label: 'Bid/quote received',                email: true,  inApp: true  },
  { id: 'eval_complete',  label: 'Evaluation completed',              email: true,  inApp: true  },
  { id: 'approval_req',   label: 'Approval required (my queue)',      email: true,  inApp: true  },
  { id: 'approval_done',  label: 'Approval granted/rejected',         email: true,  inApp: true  },
  { id: 'contract_exp',   label: 'Contract expiring within 90 days',  email: true,  inApp: false },
  { id: 'bbbee_exp',      label: 'Supplier BBBEE certificate expiry', email: false, inApp: true  },
  { id: 'po_issued',      label: 'Purchase order issued',             email: true,  inApp: true  },
];

const SUPPLIER_NOTIFICATION_SETTINGS = [
  { id: 'rfq_invite',     label: 'RFQ invitation received',           email: true,  inApp: true  },
  { id: 'rfq_closing',    label: 'RFQ closing reminder (48 hrs)',     email: true,  inApp: true  },
  { id: 'bid_outcome',    label: 'Bid outcome (recommended/awarded)',  email: true,  inApp: true  },
  { id: 'po_issued',      label: 'Purchase order issued to me',       email: true,  inApp: true  },
  { id: 'doc_expiry',     label: 'Document expiring within 60 days',  email: true,  inApp: true  },
  { id: 'grade_change',   label: 'Supplier grade updated',            email: false, inApp: true  },
  { id: 'payment',        label: 'Payment / remittance advice',       email: true,  inApp: false },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: '+27 82 123 4567',
    job_title: ROLE_LABELS[user?.role ?? 'procurement_officer'],
    department: 'Supply Chain Management',
  });

  const [org, setOrg] = useState({
    name: 'ProcureTech Demo Organisation',
    reg_number: '2020/123456/07',
    vat_number: '4560123456',
    address: '1 Innovation Place, Sandton, Johannesburg, 2196',
    province: 'Gauteng',
    procurement_threshold_petty: '2000',
    procurement_threshold_quotes: '30000',
    procurement_threshold_tender: '500000',
    bbbee_default: 'level_1_4',
    min_quotes: '3',
  });

  const isSupplier = user?.role === 'supplier';
  const [notifs, setNotifs] = useState(
    isSupplier ? SUPPLIER_NOTIFICATION_SETTINGS : NOTIFICATION_SETTINGS
  );

  const initials = user?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  function toggleNotif(id: string, field: 'email' | 'inApp') {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, [field]: !n[field as keyof typeof n] } : n));
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar
        title="Settings"
        subtitle={isSupplier ? 'Notification preferences and account security' : 'Profile, organisation, notifications and platform configuration'}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue={isSupplier ? 'notifs' : 'profile'} className="max-w-3xl">
          <TabsList className="mb-6">
            {!isSupplier && <TabsTrigger value="profile"  className="gap-1.5"><User className="w-3.5 h-3.5" /> Profile</TabsTrigger>}
            {!isSupplier && <TabsTrigger value="org"      className="gap-1.5"><Building2 className="w-3.5 h-3.5" /> Organisation</TabsTrigger>}
            <TabsTrigger value="notifs"   className="gap-1.5"><Bell className="w-3.5 h-3.5" /> Notifications</TabsTrigger>
            {!isSupplier && <TabsTrigger value="workflow" className="gap-1.5"><Workflow className="w-3.5 h-3.5" /> Approvals</TabsTrigger>}
            <TabsTrigger value="security" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
          </TabsList>

          {/* ── Profile ── */}
          <TabsContent value="profile">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[var(--brand-blue)] text-white text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{profile.full_name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{ROLE_LABELS[user?.role ?? 'procurement_officer']}</div>
                  <button className="text-xs text-[var(--brand-blue)] hover:underline mt-1 flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Change photo
                  </button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Job Title</Label>
                  <Input value={profile.job_title} onChange={e => setProfile(p => ({ ...p, job_title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <div className="flex items-center h-10 px-3 rounded-lg border border-[var(--border-default)] bg-gray-50 dark:bg-white/5">
                    <Badge variant="outline" className="text-xs">{ROLE_LABELS[user?.role ?? 'procurement_officer']}</Badge>
                    <span className="text-xs text-[var(--text-tertiary)] ml-2">— managed by admin</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Appearance */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Appearance</h3>
                <div className="flex gap-3">
                  {(['light', 'dark'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => theme !== t && toggleTheme()}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm transition-all',
                        theme === t
                          ? 'border-[var(--brand-blue)] bg-[var(--brand-blue-light)] text-[var(--brand-blue)]'
                          : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-gray-400'
                      )}
                    >
                      {t === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {t === 'light' ? 'Light Mode' : 'Dark Mode'}
                      {theme === t && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white gap-1.5" onClick={() => toast.success('Profile updated successfully')}>
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Organisation ── */}
          <TabsContent value="org">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Organisation Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2"><Label>Organisation Name</Label><Input value={org.name} onChange={e => setOrg(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>CIPC Registration Number</Label><Input value={org.reg_number} onChange={e => setOrg(p => ({ ...p, reg_number: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>VAT Number</Label><Input value={org.vat_number} onChange={e => setOrg(p => ({ ...p, vat_number: e.target.value }))} /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Physical Address</Label><Input value={org.address} onChange={e => setOrg(p => ({ ...p, address: e.target.value }))} /></div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Procurement Thresholds (ZAR)</h3>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">Based on National Treasury SCM Framework and PFMA guidelines.</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Petty Cash Limit</Label>
                    <Input type="number" value={org.procurement_threshold_petty} onChange={e => setOrg(p => ({ ...p, procurement_threshold_petty: e.target.value }))} />
                    <p className="text-[10px] text-[var(--text-tertiary)]">No quotes required below this</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Three-Quote Limit</Label>
                    <Input type="number" value={org.procurement_threshold_quotes} onChange={e => setOrg(p => ({ ...p, procurement_threshold_quotes: e.target.value }))} />
                    <p className="text-[10px] text-[var(--text-tertiary)]">Min 3 quotes below this</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Formal Tender Threshold</Label>
                    <Input type="number" value={org.procurement_threshold_tender} onChange={e => setOrg(p => ({ ...p, procurement_threshold_tender: e.target.value }))} />
                    <p className="text-[10px] text-[var(--text-tertiary)]">Open tender above this</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Default Procurement Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Default BBBEE Requirement</Label>
                    <select className="w-full border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[var(--bg-surface)]" value={org.bbbee_default} onChange={e => setOrg(p => ({ ...p, bbbee_default: e.target.value }))}>
                      <option value="level_1_2">Level 1–2 only</option>
                      <option value="level_1_4">Level 1–4 preferred</option>
                      <option value="level_1_6">Level 1–6 acceptable</option>
                      <option value="any">Any level</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Minimum Quotes Required</Label>
                    <Input type="number" min="1" max="10" value={org.min_quotes} onChange={e => setOrg(p => ({ ...p, min_quotes: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white gap-1.5" onClick={() => toast.success('Organisation settings saved')}>
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifs">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border-default)] grid grid-cols-3">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Event</span>
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">Email</span>
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">In-App</span>
              </div>
              <div className="divide-y divide-[var(--border-default)]">
                {notifs.map(n => (
                  <div key={n.id} className="px-6 py-3.5 grid grid-cols-3 items-center hover:bg-gray-50 dark:hover:bg-white/5">
                    <span className="text-sm text-[var(--text-primary)]">{n.label}</span>
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleNotif(n.id, 'email')}
                        aria-checked={n.email}
                        role="switch"
                        className={cn('w-11 h-6 rounded-full transition-colors relative overflow-hidden', n.email ? 'bg-[var(--brand-blue)]' : 'bg-gray-200 dark:bg-gray-700')}
                      >
                        <span className={cn('absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', n.email ? 'translate-x-5' : 'translate-x-0')} />
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleNotif(n.id, 'inApp')}
                        aria-checked={n.inApp}
                        role="switch"
                        className={cn('w-11 h-6 rounded-full transition-colors relative overflow-hidden', n.inApp ? 'bg-[var(--brand-blue)]' : 'bg-gray-200 dark:bg-gray-700')}
                      >
                        <span className={cn('absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', n.inApp ? 'translate-x-5' : 'translate-x-0')} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-[var(--border-default)] flex justify-end">
                <Button className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white gap-1.5" onClick={() => toast.success('Notification preferences saved')}>
                  <Save className="w-4 h-4" /> Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Approval Workflow ── */}
          <TabsContent value="workflow">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm p-6">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Approval Chain Configuration</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Default approval workflow applied to all procurements. Steps are sequential — each must approve before the next is notified.</p>
              </div>
              <div className="space-y-3">
                {APPROVAL_CHAIN.map((step, i) => (
                  <div key={step.step} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-default)] bg-gray-50 dark:bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-blue)] text-white flex items-center justify-center text-sm font-bold shrink-0">{step.step}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{step.role}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">Applies to: {step.threshold}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">{step.can_approve ? 'Can approve' : 'Submitter only'}</Badge>
                    {i < APPROVAL_CHAIN.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Custom approval chains per procurement category and value threshold are available in the Enterprise plan. Contact your system administrator to configure.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── Security ── */}
          <TabsContent value="security">
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-sm p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Change Password</h3>
                <div className="space-y-3 max-w-sm">
                  <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-1.5"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <Button className="bg-[var(--brand-blue)] text-white gap-1.5 w-full" onClick={() => toast.success('Password updated successfully')}>
                    <Save className="w-4 h-4" /> Update Password
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Active Sessions</h3>
                <div className="space-y-2">
                  {[
                    { device: 'Windows PC — Chrome', location: 'Johannesburg, ZA', current: true, time: 'Now' },
                    { device: 'iPhone 15 — Safari', location: 'Sandton, ZA', current: false, time: '2 hours ago' },
                  ].map(s => (
                    <div key={s.device} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)]">
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{s.device}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{s.location} · {s.time}</div>
                      </div>
                      {s.current
                        ? <Badge className="bg-green-100 text-green-700 text-xs">This device</Badge>
                        : <Button size="sm" variant="outline" className="text-xs h-7 text-red-500 border-red-300" onClick={() => toast.success('Session revoked')}>Revoke</Button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
