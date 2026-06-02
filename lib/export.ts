/**
 * Export utilities — CSV and PDF generation (client-side, no server needed)
 */

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => {
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const csvContent = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\r\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Analytics CSV ────────────────────────────────────────────────────────────

export function exportAnalyticsCSV() {
  exportToCSV('procuretech-analytics', [
    'Month', 'Actual Spend (ZAR)', 'Market Benchmark (ZAR)', 'Savings (ZAR)', 'Savings %'
  ], [
    ['Aug 2024', 420000, 480000, 60000, '12.5%'],
    ['Sep 2024', 310000, 360000, 50000, '13.9%'],
    ['Oct 2024', 580000, 630000, 50000, '7.9%'],
    ['Nov 2024', 450000, 510000, 60000, '11.8%'],
    ['Dec 2024', 290000, 305000, 15000, '4.9%'],
    ['Jan 2025', 940000, 1050000, 110000, '10.5%'],
  ]);
}

export function exportSuppliersCSV(suppliers: {
  company_name: string; province: string; bbbee_level?: number;
  status: string; total_orders: number; response_rate: number;
  quality_rating: number; grade?: { total: number; grade: string };
}[]) {
  exportToCSV('procuretech-suppliers', [
    'Company Name', 'Province', 'BBBEE Level', 'Status',
    'Orders', 'Response Rate %', 'Quality Rating', 'Grade Score', 'Grade'
  ], suppliers.map(s => [
    s.company_name, s.province, s.bbbee_level ?? 'N/A', s.status,
    s.total_orders, s.response_rate, s.quality_rating,
    s.grade?.total ?? 0, s.grade?.grade ?? 'N/A',
  ]));
}

export function exportProcurementsCSV(procurements: {
  reference: string; title: string; category: string; type: string;
  status: string; budget: number; delivery_location: string; required_by: string;
}[]) {
  exportToCSV('procuretech-procurements', [
    'Reference', 'Title', 'Category', 'Type', 'Status', 'Budget (ZAR)', 'Location', 'Required By'
  ], procurements.map(p => [
    p.reference, p.title, p.category, p.type, p.status,
    p.budget, p.delivery_location, p.required_by,
  ]));
}

export function exportAuditCSV(events: {
  block_index: number; timestamp: string; event_label: string;
  actor_name: string; actor_role: string; description: string;
  block_hash: string; prev_hash: string;
}[]) {
  exportToCSV('procuretech-audit-trail', [
    'Block #', 'Timestamp', 'Event', 'Actor', 'Role', 'Description', 'Block Hash', 'Previous Hash'
  ], events.map(e => [
    e.block_index, e.timestamp, e.event_label, e.actor_name,
    e.actor_role, e.description, e.block_hash, e.prev_hash,
  ]));
}

// ─── PDF Generation (jsPDF) ──────────────────────────────────────────────────

export async function generateEvaluationPDF(procurement: {
  reference: string; title: string; budget: number;
}, bids: {
  supplier_name: string; total_price: number; delivery_days?: number;
  ai_score?: { total: number; price_score: number; bbbee_score: number; delivery_score: number; technical_score: number; ai_narrative: string };
  recommendation?: string;
}[]) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const blue = [26, 86, 219] as [number, number, number];
  const gray = [107, 114, 128] as [number, number, number];
  const dark = [17, 24, 39] as [number, number, number];

  let y = 20;

  // Header
  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('ProcureTech+ | AI Procurement OS | Confidential', 14, 8);

  y = 28;
  doc.setTextColor(...dark);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Bid Evaluation Report', 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text(`${procurement.reference} · ${new Date().toLocaleDateString('en-ZA')}`, 14, y);

  y += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text(procurement.title, 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text(`Budget: R${procurement.budget.toLocaleString('en-ZA')}`, 14, y);

  // Divider
  y += 8;
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);

  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('Evaluation Summary', 14, y);

  // Bids table
  y += 8;
  const recommended = bids.find(b => b.recommendation === 'recommended');

  bids.forEach((bid, i) => {
    if (y > 250) { doc.addPage(); y = 20; }

    const score = bid.ai_score?.total ?? 0;
    const isRec = bid.recommendation === 'recommended';

    if (isRec) {
      doc.setFillColor(240, 253, 244);
      doc.rect(14, y - 2, 182, 28, 'F');
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.3);
      doc.rect(14, y - 2, 182, 28);
    } else {
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.rect(14, y - 2, 182, 28);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(`${i + 1}. ${bid.supplier_name}`, 18, y + 5);

    if (isRec) {
      doc.setFillColor(5, 150, 105);
      doc.roundedRect(150, y + 1, 40, 6, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('RECOMMENDED', 152, y + 5.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text(`Total: R${bid.total_price.toLocaleString('en-ZA')}  |  Delivery: ${bid.delivery_days ?? '—'} days  |  AI Score: ${score}/100`, 18, y + 13);

    if (bid.ai_score) {
      doc.text(
        `Price: ${bid.ai_score.price_score}/40  |  BBBEE: ${bid.ai_score.bbbee_score}/20  |  Delivery: ${bid.ai_score.delivery_score}/20  |  Technical: ${bid.ai_score.technical_score}/20`,
        18, y + 20
      );
    }

    y += 34;
  });

  // Recommendation narrative
  if (recommended?.ai_score?.ai_narrative) {
    y += 4;
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text('AI Recommendation', 14, y);

    y += 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);

    const lines = doc.splitTextToSize(recommended.ai_score.ai_narrative, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text('Generated by ProcureTech+ AI · Confidential · For authorised recipients only', 14, 292);
    doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' });
  }

  doc.save(`${procurement.reference.replace(/\//g, '-')}-evaluation.pdf`);
}

// ─── Rich PDF content renderer ───────────────────────────────────────────────

type ContentBlock =
  | { kind: 'h1'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'bullet'; text: string; depth: number }
  | { kind: 'numbered'; text: string; num: number }
  | { kind: 'para'; text: string }
  | { kind: 'rule' }
  | { kind: 'spacer' };

function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = raw.split('\n');
  let numCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine;
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push({ kind: 'spacer' });
      numCounter = 0;
      continue;
    }
    if (/^---+$/.test(trimmed) || /^===+$/.test(trimmed)) {
      blocks.push({ kind: 'rule' });
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ kind: 'h1', text: trimmed.slice(2) });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: trimmed.slice(4) });
      continue;
    }
    // Detect section headers: short lines ending with colon, or ALL CAPS short lines
    if (/^[A-Z][A-Z\s\d&:/-]{3,50}:?\s*$/.test(trimmed) && !trimmed.includes('.')) {
      blocks.push({ kind: 'h2', text: trimmed.replace(/:$/, '') });
      continue;
    }
    // Bullet: -, •, *, or indented -
    const bulletMatch = line.match(/^(\s*)([-•*])\s+(.+)/);
    if (bulletMatch) {
      const depth = Math.floor(bulletMatch[1].length / 2);
      blocks.push({ kind: 'bullet', text: bulletMatch[3], depth });
      numCounter = 0;
      continue;
    }
    // Numbered list
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      numCounter = parseInt(numMatch[1]);
      blocks.push({ kind: 'numbered', text: numMatch[2], num: numCounter });
      continue;
    }
    numCounter = 0;
    blocks.push({ kind: 'para', text: trimmed });
  }
  return blocks;
}

// Strip markdown bold/italic markers for clean PDF text
function cleanText(t: string) {
  return t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/__(.+?)__/g, '$1');
}

async function renderRichPDF(
  doc: InstanceType<Awaited<typeof import('jspdf')>['jsPDF']>,
  blocks: ContentBlock[],
  startY: number,
  blue: [number, number, number],
  gray: [number, number, number],
  dark: [number, number, number],
) {
  let y = startY;
  const margin = 14;
  const maxW = 182;
  const pageH = 285;

  function newPageIfNeeded(needed = 10) {
    if (y + needed > pageH) { doc.addPage(); y = 20; }
  }

  for (const block of blocks) {
    switch (block.kind) {
      case 'spacer':
        y += 3;
        break;

      case 'rule':
        newPageIfNeeded(6);
        doc.setDrawColor(...gray);
        doc.setLineWidth(0.2);
        doc.line(margin, y, margin + maxW, y);
        y += 5;
        break;

      case 'h1':
        newPageIfNeeded(14);
        y += 4;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...dark);
        doc.text(cleanText(block.text), margin, y);
        y += 3;
        doc.setDrawColor(...blue);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + maxW, y);
        y += 7;
        break;

      case 'h2':
        newPageIfNeeded(12);
        y += 4;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...dark);
        doc.text(cleanText(block.text), margin, y);
        y += 6;
        break;

      case 'h3':
        newPageIfNeeded(10);
        y += 3;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...dark);
        doc.text(cleanText(block.text), margin, y);
        y += 5;
        break;

      case 'bullet': {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...dark);
        const indent = margin + 4 + block.depth * 6;
        const bulletChar = block.depth === 0 ? '•' : '–';
        const textW = maxW - (indent - margin) - 6;
        const wrappedLines = doc.splitTextToSize(cleanText(block.text), textW);
        newPageIfNeeded(wrappedLines.length * 5 + 2);
        doc.setTextColor(...gray);
        doc.text(bulletChar, indent, y);
        doc.setTextColor(...dark);
        doc.text(wrappedLines, indent + 5, y);
        y += wrappedLines.length * 5 + 1;
        break;
      }

      case 'numbered': {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...dark);
        const textW = maxW - 12;
        const wrappedLines = doc.splitTextToSize(cleanText(block.text), textW);
        newPageIfNeeded(wrappedLines.length * 5 + 2);
        doc.setTextColor(...gray);
        doc.text(`${block.num}.`, margin + 2, y);
        doc.setTextColor(...dark);
        doc.text(wrappedLines, margin + 10, y);
        y += wrappedLines.length * 5 + 1;
        break;
      }

      case 'para': {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...dark);
        const wrappedLines = doc.splitTextToSize(cleanText(block.text), maxW);
        newPageIfNeeded(wrappedLines.length * 5.5);
        doc.text(wrappedLines, margin, y);
        y += wrappedLines.length * 5.5 + 1;
        break;
      }
    }
  }
  return y;
}

export async function generateSOWPDF(title: string, content: string, ref: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const blue = [26, 86, 219] as [number, number, number];
  const gray = [107, 114, 128] as [number, number, number];
  const dark = [17, 24, 39] as [number, number, number];

  // Header bar
  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('ProcureTech+ | AI Procurement OS | Confidential', 14, 8);

  // Title
  let y = 28;
  doc.setTextColor(...dark);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);

  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text(`${ref} · Generated ${new Date().toLocaleDateString('en-ZA')} by ProcureTech+ AI`, 14, y);

  y += 10;
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 10;

  // Render content with rich formatting
  const blocks = parseContent(content);
  await renderRichPDF(doc as any, blocks, y, blue, gray, dark);

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text('Generated by ProcureTech+ AI · Review before use', 14, 292);
    doc.text(`Page ${i} of ${pageCount}`, 196, 292, { align: 'right' });
  }

  doc.save(`${ref.replace(/\//g, '-')}-document.pdf`);
}
