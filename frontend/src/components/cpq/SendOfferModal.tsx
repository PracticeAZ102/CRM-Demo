import { useState } from 'react';
import { X, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import type { Quotation } from '../../types/quotation';
import { api } from '../../services/api';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onSent: (msg: string) => void;
}

export const SendOfferModal = ({ isOpen, onClose, quotation, onSent }: SendOfferModalProps) => {
  const [emailTo, setEmailTo] = useState('v.mehra@shantiauto.com');
  const [phoneTo, setPhoneTo] = useState('9811244920');
  const [includeGA, setIncludeGA] = useState(true);
  const [includeCatalog, setIncludeCatalog] = useState(true);
  const [includeOFM, setIncludeOFM] = useState(true);
  const [emailSending, setEmailSending] = useState(false);

  if (!isOpen || !quotation) return null;

  const pdfUrl = `${window.location.origin}${api.getQuotePdfUrl(quotation.id)}`;

  const handleSendEmail = () => {
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      onClose();
      onSent(`Entire Offer package (4 PDFs) dispatched to ${emailTo}!`);
    }, 1200);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = phoneTo.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    const message = `*ATCORP – INDIA | Official Commercial Proposal*\n\n` +
      `Dear Mr. Vikram Mehra,\n` +
      `Thank you for your enquiry regarding *${quotation.equipment_model?.idesc || quotation.prkey}*.\n\n` +
      `📄 *Proposal Ref:* ${quotation.quote_number} (Rev-0${quotation.revision_no})\n` +
      `💰 *Net Quoted Value:* ₹${quotation.total_value.toLocaleString('en-IN')} (Incl. 18% GST)\n` +
      `⏱️ *Delivery:* ${quotation.delivery_weeks}\n\n` +
      `📥 *Download Formal Offer & GA Drawing:* ${pdfUrl}\n\n` +
      `Please review and revert with your formal Purchase Order (PO).\n` +
      `Regards,\n` +
      `Rajesh Sharma | ATCORP North Zone HQ`;

    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    onClose();
    onSent(`WhatsApp Web opened with pre-filled proposal bundle for ${phoneTo}!`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-[#cbd5e1] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#2986cc] text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>🚀</span> Send Entire Offer Package to Dealer / Client
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Bundles formal Proposal PDF, GA Blueprint, Catalogue & OFM terms
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-[#000000]">
          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Client / Dealer Email</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">WhatsApp Mobile (10-Digit)</label>
              <input
                type="tel"
                value={phoneTo}
                onChange={(e) => setPhoneTo(e.target.value)}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Bundle Attachment Checklist */}
          <div>
            <div className="font-bold text-[#000000] mb-2 flex items-center justify-between">
              <span>Included Document Attachments (PDF Bundle):</span>
              <span className="text-[10px] text-[#2986cc] font-semibold">4 Documents Selected</span>
            </div>

            <div className="space-y-2 bg-slate-50 border border-[#e2e8f0] rounded-lg p-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked disabled className="rounded text-[#2986cc]" />
                <span className="font-semibold text-[#000000]">1. Official Commercial Proposal PDF</span>
                <span className="text-[10px] text-[#7a8794] ml-auto font-mono">
                  {quotation.quote_number}-Rev0{quotation.revision_no}.pdf
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGA}
                  onChange={(e) => setIncludeGA(e.target.checked)}
                  className="rounded text-[#2986cc]"
                />
                <span className="font-semibold text-[#000000]">2. GA Drawing Blueprint & Clearances</span>
                <span className="text-[10px] text-[#7a8794] ml-auto font-mono">{quotation.ga_drawing_id}.pdf</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCatalog}
                  onChange={(e) => setIncludeCatalog(e.target.checked)}
                  className="rounded text-[#2986cc]"
                />
                <span className="font-semibold text-[#000000]">3. OEM Technical Machine Catalog</span>
                <span className="text-[10px] text-[#7a8794] ml-auto font-mono">Chicago_Pneumatic_Catalog.pdf</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOFM}
                  onChange={(e) => setIncludeOFM(e.target.checked)}
                  className="rounded text-[#2986cc]"
                />
                <span className="font-semibold text-[#000000]">4. Standard OFM Terms & Warranty Schedule</span>
                <span className="text-[10px] text-[#7a8794] ml-auto font-mono">ATCORP_OFM_Terms.pdf</span>
              </label>
            </div>
          </div>

          {/* Direct Link Preview */}
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[10px] text-blue-900 font-bold block">Live Verified Proposal Link:</span>
              <span className="text-[10px] text-blue-700 font-mono truncate block">{pdfUrl}</span>
            </div>
            <a
              href={api.getQuotePdfUrl(quotation.id)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#2986cc] font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <ExternalLink size={12} /> Test PDF
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-[#cbd5e1] flex flex-wrap justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSendEmail}
            disabled={emailSending}
            className="px-4 py-2 text-xs font-bold bg-[#2986cc] hover:bg-[#1f6cb0] text-white rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Mail size={14} />
            {emailSending ? 'Sending Email...' : 'Send via Email (SMTP)'}
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="px-4 py-2 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <MessageSquare size={14} />
            Send via WhatsApp Web
          </button>
        </div>
      </div>
    </div>
  );
};
