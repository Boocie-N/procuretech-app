import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt — grounds Claude in SA procurement context
const SYSTEM_PROMPT = `You are ProcureTech+ AI, an expert procurement assistant specialised in South African and African procurement, tendering, and supply chain management.

You have deep expertise in:
- CIPS Procurement Cycle (all stages)
- South African procurement legislation: PPPFA 2017, PFMA, MFMA, National Treasury SCM Framework
- BBBEE Act and preferential procurement scoring (90/10 and 80/20 rules)
- Standard procurement thresholds: R2K petty cash, R30K three quotes, R500K competitive bidding, >R500K formal tender
- CIPC company registration and SARS tax clearance requirements
- Central Supplier Database (CSD) for government suppliers
- ISO 20400 Sustainable Procurement
- RFQ, RFP, Tender document drafting
- Scope of Work (SOW) and Terms of Reference (TOR) writing
- Market intelligence and price benchmarking for the South African market
- Supplier evaluation methodologies including the three-envelope system
- Conflict of interest management and deviation registers
- Contract management and supplier performance monitoring

When generating documents (RFQ, RFP, SOW, TOR, evaluation matrices, recommendation reports):
- Use professional, formal procurement language
- Include all legally required clauses for South African procurement
- Apply BBBEE scoring per PPPFA 2017 regulations
- Reference relevant legislation where appropriate
- Use ZAR (South African Rand) as currency
- Consider local market conditions (load shedding impact on delivery, logistics costs, etc.)

When giving market intelligence:
- Provide realistic South African market price ranges
- Consider current economic conditions (inflation, exchange rate impacts on imported goods)
- Recommend BBBEE-compliant suppliers where possible
- Flag pricing anomalies and potential savings

Always be concise, professional, and action-oriented. Format responses clearly with sections when generating documents.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request: messages array required' }, { status: 400 });
    }

    // Build system prompt with context if provided
    let systemPrompt = SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\nCurrent procurement context:\n${JSON.stringify(context, null, 2)}`;
    }

    // Mode-specific instructions
    const modeInstructions: Record<string, string> = {
      sow: '\n\nYou are drafting a Scope of Work. Structure it with: Background, Objectives, Scope, Deliverables, Timeline, Compliance Requirements, and Evaluation Criteria.',
      rfq: '\n\nYou are generating an RFQ document. Include: Header, Item Description, Specifications, Delivery Requirements, BBBEE Requirements, Evaluation Criteria (with weightings), Submission Instructions, and Standard Compliance Clauses.',
      rfp: '\n\nYou are generating an RFP document. Include: Background, Objectives, Scope of Work, Deliverables, Proposal Requirements, Evaluation Criteria, BBBEE Requirements, Submission Requirements, and Terms & Conditions.',
      evaluation: '\n\nYou are evaluating supplier bids. Provide structured scoring, identify strengths/weaknesses/risks, flag compliance gaps, and give a clear recommendation with justification.',
      report: '\n\nYou are drafting a procurement recommendation report. Include: Executive Summary, Procurement Background, Evaluation Methodology, Supplier Comparison, Recommendation with justification, Risk Assessment, and Next Steps.',
      market: '\n\nYou are conducting market intelligence analysis. Provide: Current price ranges (ZAR), market trends, recommended suppliers/OEMs/distributors, pricing anomalies, and savings opportunities.',
      chat: '',
    };

    if (mode && modeInstructions[mode]) {
      systemPrompt += modeInstructions[mode];
    }

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({
      content: text,
      usage: response.usage,
      model: response.model,
    });

  } catch (error) {
    console.error('AI route error:', error);
    const message = error instanceof Error ? error.message : 'AI request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
