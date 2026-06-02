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

export async function generateSOWPDF(title: string, content: string, ref: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const blue = [26, 86, 219] as [number, number, number];
  const gray = [107, 114, 128] as [number, number, number];
  const dark = [17, 24, 39] as [number, number, number];

  doc.setFillColor(...blue);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('ProcureTech+ | AI Procurement OS | Confidential', 14, 8);

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
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(...dark);
  const lines = doc.splitTextToSize(content, 180);
  lines.forEach((line: string) => {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.text(line, 14, y);
    y += 5.5;
  });

  doc.setFillColor(249, 250, 251);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.text('Generated by ProcureTech+ AI · Review before use', 14, 292);

  doc.save(`${ref.replace(/\//g, '-')}-sow.pdf`);
}
