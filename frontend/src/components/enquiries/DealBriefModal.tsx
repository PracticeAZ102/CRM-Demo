import { useEffect, useState } from 'react';
import { X, Sparkles, ShieldCheck, Cpu } from 'lucide-react';
import type { Enquiry } from '../../types/enquiry';
import type { Quotation } from '../../types/quotation';
import type { OFMRecord } from '../../types/ofm';
import { api } from '../../services/api';
import { isLocalAiSupported, useLocalSummarizer } from '../../hooks/useLocalSummarizer';

interface DealBriefModalProps {
  enquiry: Enquiry | null;
  onClose: () => void;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Plain-text dossier of one deal; this is what the local model summarizes. */
const buildDossier = (enq: Enquiry, quotes: Quotation[], ofms: OFMRecord[]): string => {
  const lines: string[] = [
    `Enquiry ENQ-${enq.id} from ${enq.company_name} (${enq.industry_sector}), plant at ${enq.plant_location}.`,
    `Contact: ${enq.contact_person}, ${enq.designation}. Branch: ${enq.branch_region}. Assigned engineer: ${enq.assigned_engineer}. Status: ${enq.status}.`,
  ];

  if (quotes.length === 0) lines.push('No quotation has been prepared yet.');
  quotes.forEach((q) => {
    lines.push(
      `Quotation ${q.quote_number} Rev-${q.revision_no}: ${q.quantity} x ${q.prkey}, discount ${q.discount_pct}% (${q.discount_approval_status}), ` +
        `total ${inr(q.total_value)} incl. ${q.gst_type} ${q.gst_rate}%. Terms: ${q.payment_terms}; delivery ${q.delivery_weeks} weeks; ` +
        `warranty ${q.warranty_months} months; valid ${q.validity_days} days.` +
        (q.notes ? ` Notes: ${q.notes}` : ''),
    );
  });

  ofms.forEach((o) => {
    lines.push(
      `OFM ${o.ofm_number} Rev-${o.revision_no}: ${o.status}${o.is_frozen ? ' (frozen, released to factory)' : ''}. ` +
        `PO ${o.customer_po_number ?? 'not received'}${o.customer_po_value ? ` worth ${inr(o.customer_po_value)}` : ''}. ` +
        `Dispatch ${o.committed_dispatch_date ?? 'not committed'}. ` +
        `PO scrutiny: PO value ${o.po_value_verified ? 'ok' : 'pending'}, tech specs ${o.tech_specs_verified ? 'ok' : 'pending'}, ` +
        `payment terms ${o.payment_terms_verified ? 'ok' : 'pending'}, GA drawing ${o.ga_drawing_cleared ? 'cleared' : 'pending'}.` +
        (o.special_factory_instructions ? ` Factory instructions: ${o.special_factory_instructions}` : ''),
    );
  });

  return lines.join('\n');
};

/** Deterministic summary used when no on-device model is available. */
const buildFallbackSummary = (enq: Enquiry, quotes: Quotation[], ofms: OFMRecord[]): string => {
  const out: string[] = [`- ${enq.company_name} (${enq.industry_sector}) - ${enq.branch_region}, rep: ${enq.assigned_engineer}`];

  if (quotes.length === 0) {
    out.push('- No quotation yet: next step is to prepare one in CPQ');
  } else {
    const latest = quotes.reduce((a, b) => (b.revision_no > a.revision_no ? b : a));
    out.push(`- ${quotes.length} quotation revision(s); latest Rev-${latest.revision_no}: ${latest.quantity} x ${latest.prkey}, ${inr(latest.total_value)}`);
    out.push(
      latest.discount_approval_status === 'PENDING_APPROVAL'
        ? `- Discount ${latest.discount_pct}% needs Branch Manager approval`
        : `- Discount ${latest.discount_pct}% is within Sales Engineer authority`,
    );
  }

  const ofm = ofms.length ? ofms.reduce((a, b) => (b.revision_no > a.revision_no ? b : a)) : null;
  if (ofm) {
    const pending = [
      !ofm.po_value_verified && 'PO value',
      !ofm.tech_specs_verified && 'tech specs',
      !ofm.payment_terms_verified && 'payment terms',
      !ofm.ga_drawing_cleared && 'GA drawing',
    ].filter(Boolean);
    out.push(
      ofm.is_frozen
        ? `- OFM ${ofm.ofm_number} frozen and released to factory`
        : `- OFM ${ofm.ofm_number} Rev-${ofm.revision_no} open; scrutiny pending: ${pending.length ? pending.join(', ') : 'none'}`,
    );
  }
  return out.join('\n');
};

export const DealBriefModal = ({ enquiry, onClose }: DealBriefModalProps) => {
  const { run, loading, result, reset } = useLocalSummarizer();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enquiry) return;
    let cancelled = false;
    setError(null);
    reset();

    (async () => {
      try {
        const [quotes, allOfm] = await Promise.all([api.getQuotations(enquiry.id), api.getOfmList()]);
        const ofms = allOfm.filter((o) => o.enquiry_id === enquiry.id);
        if (cancelled) return;
        await run(buildDossier(enquiry, quotes, ofms), () => buildFallbackSummary(enquiry, quotes, ofms));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to build deal brief');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enquiry, run, reset]);

  if (!enquiry) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-[#cbd5e1] w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-[#2986cc] text-white flex justify-between items-start">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Sparkles size={18} /> Deal Brief
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              ENQ-{enquiry.id} &bull; {enquiry.company_name}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-white/20 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 min-h-[140px]">
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : loading || !result ? (
            <div className="text-center text-xs text-[#7a8794] py-6">
              <div className="w-7 h-7 border-2 border-[#2986cc] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Summarizing deal...
            </div>
          ) : (
            <>
              <pre className="whitespace-pre-wrap font-sans text-sm text-[#000000] leading-relaxed">{result.text}</pre>
              <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center gap-1.5 text-[10px] text-[#7a8794]">
                {result.source === 'on-device' ? (
                  <>
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Generated on this device by the browser's local AI. Deal data was not sent to any server.
                  </>
                ) : (
                  <>
                    <Cpu size={12} />
                    {isLocalAiSupported()
                      ? 'Local AI unavailable on this device; showing a standard summary.'
                      : 'Local AI not supported in this browser (try Opera); showing a standard summary.'}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};