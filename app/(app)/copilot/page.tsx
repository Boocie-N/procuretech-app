'use client';

import { useState, useRef, useEffect } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Send, Bot, User, FileText, TrendingUp, ShieldCheck, Scale, Building2, Lightbulb, Copy, Download, RefreshCw, CheckCheck, ExternalLink } from 'lucide-react';
import { DEMO_PROCUREMENTS } from '@/lib/demo-data';
import { generateSOWPDF } from '@/lib/export';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
  isDocument?: boolean; // marks long-form generated documents
}

// Detect if the user's message is requesting a document generation
function detectMode(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/\b(rfq|request for quotation)\b/)) return 'rfq';
  if (lower.match(/\b(rfp|request for proposal)\b/)) return 'rfp';
  if (lower.match(/\b(tender|tender document|bid document)\b/)) return 'rfp';
  if (lower.match(/\b(sow|scope of work|terms of reference|tor)\b/)) return 'sow';
  if (lower.match(/\b(evaluat|score|recommend|compare.*bid|bid.*compare)\b/)) return 'evaluation';
  if (lower.match(/\b(recommendation report|award report)\b/)) return 'report';
  if (lower.match(/\b(market|price|benchmark|cost|rate)\b/)) return 'market';
  return 'chat';
}

const QUICK_PROMPTS = [
  { icon: FileText,   label: 'Draft RFQ',           prompt: 'Draft a professional RFQ for 500 Dell Latitude laptops (Core i7, 16GB RAM, 512GB SSD) for our Johannesburg office. Budget R1.2M. Require BBBEE Level 1–4 suppliers. Include evaluation criteria.' },
  { icon: TrendingUp, label: 'Market price check',  prompt: 'Is R2,400 per unit a fair market price for a Core i7 laptop (16GB RAM, 512GB SSD) in South Africa right now? What is the current price range and who are the main suppliers?' },
  { icon: FileText,   label: 'Write SOW',            prompt: 'Write a comprehensive Scope of Work for security services: 3 armed security guards, 24/7 coverage, Sandton office complex, 12-month contract. Include PSIRA requirements and evaluation criteria.' },
  { icon: Scale,      label: 'Evaluate bids',        prompt: 'I have 3 laptop quotes: Supplier A: R2,280/unit (BBBEE L1, 14-day delivery, 3-yr warranty), Supplier B: R2,450/unit (BBBEE L3, 21 days, 2-yr), Supplier C: R2,190/unit (BBBEE L7, 35 days, 1-yr, VAT unverified). Evaluate using PPPFA criteria and recommend.' },
  { icon: Building2,  label: 'Find suppliers',       prompt: 'List the top BBBEE Level 1–2 IT equipment suppliers in Gauteng with strong delivery track records. Include contact details and any known pricing ranges.' },
  { icon: ShieldCheck,label: 'BBBEE compliance',     prompt: 'Explain the PPPFA 2017 preferential points system for a procurement below R50M. How should I structure the evaluation scorecard?' },
  { icon: FileText,   label: 'Draft RFP',            prompt: 'Draft an RFP for a 12-month managed IT services contract. Scope includes helpdesk support, infrastructure management, and cybersecurity monitoring for 300 users across 3 Gauteng offices.' },
  { icon: Lightbulb,  label: 'Procurement strategy', prompt: 'What is the best procurement strategy for sourcing concrete and construction materials for a R15M warehouse project in Durban? Should I use an RFQ, RFP, or public tender? What are the PFMA thresholds?' },
];

const CAPABILITIES = [
  { label: 'SOW & TOR writing',          status: 'live' },
  { label: 'RFQ / RFP / Tender drafting', status: 'live' },
  { label: 'Bid evaluation & scoring',   status: 'live' },
  { label: 'Market price benchmarking',  status: 'live' },
  { label: 'BBBEE compliance guidance',  status: 'live' },
  { label: 'Supplier recommendations',   status: 'live' },
  { label: 'PPPFA scoring calculator',   status: 'live' },
  { label: 'Auto email dispatch',        status: 'phase2' },
  { label: 'Autonomous negotiation',     status: 'phase3' },
];

async function callAI(messages: { role: string; content: string }[], mode?: string): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode: mode ?? 'chat' }),
  });
  if (!res.ok) throw new Error('AI request failed');
  const data = await res.json();
  return data.content;
}

export default function CopilotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.full_name?.split(' ')[0] ?? 'there'}! I'm your ProcureTech+ AI Copilot, powered by Claude.\n\nI'm a procurement specialist with deep knowledge of South African procurement law — PPPFA 2017, PFMA, BBBEE, National Treasury SCM framework — and the full CIPS procurement cycle.\n\nI can help you:\n• Write Scopes of Work, TORs, RFQs, RFPs, and Tender documents\n• Benchmark market prices in ZAR\n• Find and evaluate BBBEE-compliant suppliers\n• Score supplier bids using PPPFA methodology\n• Draft recommendation reports\n\nWhat are you procuring today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;

    const mode = detectMode(text);
    const isDocMode = ['rfq', 'rfp', 'sow', 'evaluation', 'report'].includes(mode);

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const response = await callAI(history, mode);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        mode,
        isDocument: isDocMode && response.length > 400,
      }]);
    } catch (e) {
      toast.error('AI request failed. Check your API key in .env.local');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I couldn\'t connect to the AI service. Please ensure your ANTHROPIC_API_KEY is set in .env.local and the dev server was restarted after adding it.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadMessagePDF(msg: Message) {
    const title = msg.mode === 'rfq' ? 'Request for Quotation' :
                  msg.mode === 'rfp' ? 'Request for Proposal' :
                  msg.mode === 'sow' ? 'Scope of Work' : 'AI Generated Document';
    await generateSOWPDF(title, msg.content, `AI/PT/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`);
    toast.success('Document downloaded as PDF');
  }

  function linkToProcurement(content: string) {
    // In a real implementation this would open a modal to pick a procurement
    // For demo, navigate to new procurement with the content pre-filled
    toast.success('Content copied — paste into the SOW field when creating a new procurement', { duration: 5000 });
    navigator.clipboard.writeText(content);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  }

  function formatContent(text: string) {
    // Simple markdown-like formatting
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
        }
        if (line === '') return <br key={i} />;
        return <p key={i}>{line}</p>;
      });
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="AI Procurement Copilot" subtitle="Powered by Claude — South Africa procurement specialist" />

      <div className="flex flex-1 overflow-hidden gap-0">

        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                {/* Avatar */}
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                  msg.role === 'assistant'
                    ? 'bg-[var(--brand-blue)] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                )}>
                  {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div className={cn('group max-w-[75%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                  <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'assistant'
                      ? 'bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-sm'
                      : 'bg-[var(--brand-blue)] text-white rounded-tr-sm'
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-1">{formatContent(msg.content)}</div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  <div className={cn('flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {msg.timestamp.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'assistant' && (
                      <>
                        <button onClick={() => copyMessage(msg.content)} title="Copy text" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                          <Copy className="w-3 h-3 text-[var(--text-tertiary)]" />
                        </button>
                        {msg.isDocument && (
                          <>
                            <button onClick={() => downloadMessagePDF(msg)} title="Download as PDF" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                              <Download className="w-3 h-3 text-[var(--text-tertiary)]" />
                            </button>
                            <button
                              onClick={() => linkToProcurement(msg.content)}
                              title="Use in procurement"
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--brand-blue-light)] text-[var(--brand-blue)] hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors text-[10px] font-medium"
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> Use in procurement
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--brand-blue)] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-blue)] typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-blue)] typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-blue)] typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border-default)] bg-white dark:bg-[var(--bg-surface)] p-4">
            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me to draft an RFQ, evaluate bids, benchmark prices, find suppliers…"
                className="flex-1 min-h-[44px] max-h-32 resize-none text-sm border-[var(--border-default)] focus:border-[var(--brand-blue)] rounded-xl"
                rows={1}
              />
              <Button
                onClick={send}
                disabled={!input.trim() || isLoading}
                className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-dark)] text-white h-11 w-11 p-0 rounded-xl shrink-0"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-2 text-center">
              Press Enter to send · Shift+Enter for new line · AI responses are generated by Claude
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-subtle)] dark:bg-[var(--bg-elevated)] flex flex-col overflow-y-auto">

          {/* Quick prompts */}
          <div className="p-4 border-b border-[var(--border-default)]">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Quick Prompts</h3>
            <div className="flex flex-col gap-1.5">
              {QUICK_PROMPTS.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => setInput(qp.prompt)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-light)] dark:hover:bg-blue-900/20 transition-all text-left group"
                >
                  <qp.icon className="w-3.5 h-3.5 text-[var(--brand-blue)] shrink-0" />
                  <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--brand-blue)]">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Capabilities</h3>
            <div className="flex flex-col gap-2">
              {CAPABILITIES.map(cap => (
                <div key={cap.label} className="flex items-center gap-2">
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap',
                    cap.status === 'live'   ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                    cap.status === 'phase2' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                    'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {cap.status === 'live' ? 'Live' : cap.status === 'phase2' ? 'Phase 2' : 'Phase 3'}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{cap.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
