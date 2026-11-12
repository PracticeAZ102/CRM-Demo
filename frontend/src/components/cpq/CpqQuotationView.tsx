import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Send,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Building,
  MapPin,
  Compass
} from 'lucide-react';
import type { Quotation } from '../../types/quotation';
import type { EquipmentModel } from '../../types/equipment_model';
import { api } from '../../services/api';
import { SendOfferModal } from './SendOfferModal';

export const CpqQuotationView = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [activeQuoteId, setActiveQuoteId] = useState<string>('QUO-43382-R01');
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedPrkey, setSelectedPrkey] = useState<string>('CP-CPM-15-FS-8');
  const [quantity, setQuantity] = useState<number>(1);
  const [discountPct, setDiscountPct] = useState<number>(10.0);
  const [packagingPct, setPackagingPct] = useState<number>(2.0);
  const [freightTerms, setFreightTerms] = useState<string>('Ex-Works');
  const [freightAmount, setFreightAmount] = useState<number>(0);
  const [installationCharges, setInstallationCharges] = useState<number>(15000);
  const [gstType, setGstType] = useState<string>('IGST');

  // Calculated fields
  const [calcBaseClp, setCalcBaseClp] = useState<number>(485000);
  const [calcDiscountAmt, setCalcDiscountAmt] = useState<number>(48500);
  const [calcTaxable, setCalcTaxable] = useState<number>(460230);
  const [calcGst, setCalcGst] = useState<number>(82841);
  const [calcTotal, setCalcTotal] = useState<number>(543071);
  const [winProb, setWinProb] = useState<number>(88);
  const [approvalStatus, setApprovalStatus] = useState<string>('APPROVED');

  // Modals & Toast
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [quotesList, modelsList] = await Promise.all([
        api.getQuotations('43382'),
        api.getModels(),
      ]);
      setQuotations(quotesList);
      setModels(modelsList);

      if (quotesList.length > 0) {
        const current = quotesList.find((q) => q.id === activeQuoteId) || quotesList[0];
        setActiveQuoteId(current.id);
        setSelectedPrkey(current.prkey);
        setQuantity(current.quantity);
        setDiscountPct(current.discount_pct);
        setPackagingPct(current.packaging_pct);
        setFreightTerms(current.freight_terms);
        setFreightAmount(current.freight_amount);
        setInstallationCharges(current.installation_charges);
        setGstType(current.gst_type);
        setApprovalStatus(current.discount_approval_status);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate whenever inputs change
  useEffect(() => {
    if (!selectedPrkey) return;
    const recalculate = async () => {
      try {
        const res = await api.calculateQuote({
          prkey: selectedPrkey,
          quantity,
          discount_pct: discountPct,
          packaging_pct: packagingPct,
          freight_terms: freightTerms,
          freight_amount: freightAmount,
          installation_charges: installationCharges,
          gst_type: gstType,
        });
        setCalcBaseClp(res.base_clp);
        setCalcDiscountAmt(res.total_discount);
        setCalcTaxable(res.taxable_value);
        setCalcGst(res.gst_amount);
        setCalcTotal(res.total_value);
        setWinProb(res.win_probability_pct);
        setApprovalStatus(res.discount_approval_status);
      } catch (err) {
        // Fallback local calculation
        const model = models.find((m) => m.prkey === selectedPrkey);
        if (model) {
          const base = model.clp * quantity;
          const disc = (base * discountPct) / 100;
          const pkg = ((base - disc) * packagingPct) / 100;
          const frt = freightTerms === 'Ex-Works' ? 0 : freightAmount;
          const tax = base - disc + pkg + frt + installationCharges;
          const gst = tax * 0.18;
          setCalcBaseClp(model.clp);
          setCalcDiscountAmt(disc);
          setCalcTaxable(tax);
          setCalcGst(gst);
          setCalcTotal(tax + gst);
          setApprovalStatus(discountPct > 15 ? 'PENDING_APPROVAL' : 'APPROVED');
        }
      }
    };
    recalculate();
  }, [selectedPrkey, quantity, discountPct, packagingPct, freightTerms, freightAmount, installationCharges, gstType, models]);

  const handleSelectRevision = (quote: Quotation) => {
    setActiveQuoteId(quote.id);
    setSelectedPrkey(quote.prkey);
    setQuantity(quote.quantity);
    setDiscountPct(quote.discount_pct);
    setPackagingPct(quote.packaging_pct);
    setFreightTerms(quote.freight_terms);
    setFreightAmount(quote.freight_amount);
    setInstallationCharges(quote.installation_charges);
    setGstType(quote.gst_type);
    setApprovalStatus(quote.discount_approval_status);
  };

  const handleSave = async () => {
    try {
      await api.updateQuotation(activeQuoteId, {
        prkey: selectedPrkey,
        quantity,
        discount_pct: discountPct,
        packaging_pct: packagingPct,
        freight_terms: freightTerms as any,
        freight_amount: freightAmount,
        installation_charges: installationCharges,
        gst_type: gstType as any,
      });
      showToast(`Quotation ${activeQuoteId} updated and recalculated!`);
      loadData();
    } catch (err: any) {
      showToast(`Error updating: ${err.message}`);
    }
  };

  const handleCreateRevision = async () => {
    try {
      const rev = await api.reviseQuotation(activeQuoteId);
      showToast(`Created new revision ${rev.id} under Enquiry #43382!`);
      setActiveQuoteId(rev.id);
      loadData();
    } catch (err: any) {
      showToast(`Error creating revision: ${err.message}`);
    }
  };

  const activeQuote = quotations.find((q) => q.id === activeQuoteId) || quotations[0] || null;
  const currentModel = models.find((m) => m.prkey === selectedPrkey);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#7a8794]">
        <div className="w-8 h-8 border-2 border-[#2986cc] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading CPQ Commercial Engine...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-[#6aa84f]">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Enquiry Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-[#000000]">
              CPQ Quotation Engine & Commercial Terms
            </h2>
            <span className="bg-[#2986cc]/10 text-[#2986cc] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2986cc]/20 font-mono">
              ENQ #43382
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569] mt-2">
            <span className="flex items-center gap-1 font-semibold text-[#000000]">
              <Building size={14} className="text-[#2986cc]" /> Shanti Auto Components Pvt Ltd
            </span>
            <span>• Attn: Vikram Mehra (DGM - Utility)</span>
            <span className="flex items-center gap-1 text-[#7a8794]">
              <MapPin size={13} /> IMT Manesar, Gurugram (Haryana)
            </span>
            <span>• GSTIN: 06AABCS1429B1Z2</span>
          </div>
        </div>

        {/* Revision Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Revision Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {quotations.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectRevision(q)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  q.id === activeQuoteId
                    ? 'bg-white text-[#2986cc] shadow-xs border border-[#cbd5e1]'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                Rev-0{q.revision_no}
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateRevision}
            className="px-3 py-1.5 bg-white text-[#2e4350] border border-[#cbd5e1] rounded-lg text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1 shadow-xs"
            title="Create next revision under same Enquiry"
          >
            <PlusCircle size={14} className="text-[#2986cc]" />
            <span>New Rev</span>
          </button>

          <a
            href={activeQuote ? api.getQuotePdfUrl(activeQuote.id) : '#'}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-white text-[#2986cc] border border-[#2986cc] rounded-lg text-xs font-bold hover:bg-[#2986cc]/5 transition flex items-center gap-1.5 shadow-xs"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </a>

          <button
            onClick={() => setIsSendModalOpen(true)}
            className="px-4 py-1.5 bg-[#2986cc] text-white rounded-lg text-xs font-bold hover:bg-[#1f6cb0] transition flex items-center gap-1.5 shadow-xs"
          >
            <Send size={14} />
            <span>Send Entire Offer</span>
          </button>
        </div>
      </div>

      {/* Main CPQ Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Sizing & Commercial Math Inputs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Equipment Model Sizing Card */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 className="font-bold text-sm text-[#000000] flex items-center gap-2">
                <Compass size={16} className="text-[#2986cc]" /> Equipment Model Selection & Technical Parameters
              </h3>
              <span className="text-[11px] font-mono text-[#7a8794]">
                Blueprint: <b className="text-[#000000]">{activeQuote?.ga_drawing_id || 'GAD-CP-CPM15'}</b>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Model Picker */}
              <div className="md:col-span-2">
                <label className="block font-bold text-[#000000] mb-1">
                  Select Machine Model (from Model Master)
                </label>
                <select
                  value={selectedPrkey}
                  onChange={(e) => setSelectedPrkey(e.target.value)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-medium text-xs focus:ring-2 focus:ring-[#2986cc] outline-hidden bg-white"
                >
                  {models.map((m) => (
                    <option key={m.prkey} value={m.prkey}>
                      {m.prkey} — {m.idesc} (₹{m.clp.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Readonly Specs of Selected Machine */}
              {currentModel && (
                <>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#7a8794] block">Motor Rating & Drive</span>
                    <span className="font-semibold text-sm text-[#000000] block">{currentModel.motor}</span>
                    <span className="text-[11px] text-[#2986cc] font-medium">Drive Type: {currentModel.vsd_fs}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#7a8794] block">Flow & Operating Pressure</span>
                    <span className="font-semibold text-sm text-[#000000] block">{currentModel.fad_cfm}</span>
                    <span className="text-[11px] text-[#2986cc] font-medium">Max Pressure: {currentModel.maximum_pressure}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Commercial Terms & Pricing Matrix */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 className="font-bold text-sm text-[#000000] flex items-center gap-2">
                <FileText size={16} className="text-[#2986cc]" /> Commercial Quotation Parameters
              </h3>
              {approvalStatus === 'APPROVED' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Auto-Approved (Rep Authority)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={12} /> Approval Required (&gt; 15% Discount)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Quantity */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-bold focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>

              {/* Discount % */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#000000]">Discount Offered (%)</label>
                  <span className={`text-[11px] font-bold ${discountPct > 15 ? 'text-amber-600' : 'text-[#6aa84f]'}`}>
                    {discountPct}%
                  </span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-bold focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
                <span className="text-[10px] text-[#7a8794]">Threshold: &le;15% standard</span>
              </div>

              {/* Packaging & Forwarding % */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">P&F Charges (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={packagingPct}
                  onChange={(e) => setPackagingPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
                <span className="text-[10px] text-[#7a8794]">Standard: 2.0%</span>
              </div>

              {/* Freight Terms */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Freight Basis</label>
                <select
                  value={freightTerms}
                  onChange={(e) => setFreightTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-medium focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                >
                  <option value="Ex-Works">Ex-Works (Customer Transit)</option>
                  <option value="FOR Destination">FOR Site (Freight Paid by ATCORP)</option>
                </select>
              </div>

              {/* Freight Amount (if FOR) */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">Freight Amount (₹)</label>
                <input
                  type="number"
                  disabled={freightTerms === 'Ex-Works'}
                  value={freightTerms === 'Ex-Works' ? 0 : freightAmount}
                  onChange={(e) => setFreightAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* E&C Installation */}
              <div>
                <label className="block font-bold text-[#000000] mb-1">E&C / Commissioning (₹)</label>
                <input
                  type="number"
                  value={installationCharges}
                  onChange={(e) => setInstallationCharges(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-[#2986cc] outline-hidden"
                />
              </div>

              {/* GST Type */}
              <div className="sm:col-span-3">
                <label className="block font-bold text-[#000000] mb-1">GST Tax Jurisdiction</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      gstType === 'IGST'
                        ? 'border-[#2986cc] bg-blue-50/50 text-[#2986cc] font-bold'
                        : 'border-[#cbd5e1] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gst"
                      checked={gstType === 'IGST'}
                      onChange={() => setGstType('IGST')}
                      className="text-[#2986cc]"
                    />
                    <span>Inter-state Supply: IGST @ 18%</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      gstType === 'CGST_SGST'
                        ? 'border-[#2986cc] bg-blue-50/50 text-[#2986cc] font-bold'
                        : 'border-[#cbd5e1] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gst"
                      checked={gstType === 'CGST_SGST'}
                      onChange={() => setGstType('CGST_SGST')}
                      className="text-[#2986cc]"
                    />
                    <span>Intra-state Supply: CGST (9%) + SGST (9%)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-[#e2e8f0] flex justify-end">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-[#2986cc] text-white text-xs font-bold rounded-lg hover:bg-[#1f6cb0] transition shadow-xs"
              >
                Save & Recalculate Quotation
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Price Summary & Data Science Win Probability (1 col) */}
        <div className="space-y-4">
          {/* Data Science Win-Rate Forecaster Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-[#142229] text-white p-5 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#6aa84f]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ML Win-Rate Forecaster
                </span>
              </div>
              <span className="text-[10px] bg-white/10 text-emerald-400 font-mono px-2 py-0.5 rounded">
                Live Model
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-3xl font-black text-white">{winProb}%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Estimated Deal Close Probability</div>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-[#6aa84f] border-t-transparent flex items-center justify-center font-bold text-xs text-white">
                {winProb}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#6aa84f] h-full rounded-full transition-all duration-500"
                style={{ width: `${winProb}%` }}
              ></div>
            </div>

            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-[11px] text-slate-300 leading-relaxed">
              💡 <b>Data Science Guidance:</b> At {discountPct}% discount, your proposal matches historical won quotes for automotive Tier-1 ancillaries in NCR. Raising discount above 15% yields diminishing returns.
            </div>
          </div>

          {/* Commercial Breakdown Card */}
          <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#000000] border-b border-[#e2e8f0] pb-2">
              Commercial Price Summary
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-[#7a8794]">Base CLP (List Price):</span>
                <span className="font-semibold text-[#000000]">
                  ₹{(calcBaseClp * quantity).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#7a8794]">Special Discount ({discountPct}%):</span>
                <span className="font-semibold text-emerald-600">
                  - ₹{calcDiscountAmt.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#7a8794]">Packaging & Forwarding:</span>
                <span className="font-semibold text-[#000000]">
                  ₹{((calcBaseClp * quantity - calcDiscountAmt) * packagingPct / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#7a8794]">Freight & Insurance ({freightTerms}):</span>
                <span className="font-semibold text-[#000000]">
                  ₹{(freightTerms === 'Ex-Works' ? 0 : freightAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#7a8794]">Erection & Commissioning:</span>
                <span className="font-semibold text-[#000000]">
                  ₹{installationCharges.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between pt-2 bg-slate-50 p-2 rounded font-bold">
                <span className="text-[#000000]">Total Taxable Amount:</span>
                <span className="text-[#2986cc]">₹{calcTaxable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#7a8794]">Goods & Services Tax (GST 18%):</span>
                <span className="font-semibold text-[#000000]">
                  ₹{calcGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Net Total Highlight */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl mt-3 text-center">
              <span className="text-[10px] font-bold text-[#2986cc] uppercase tracking-wider block">
                Net Proposal Value (FOR Site)
              </span>
              <span className="text-2xl font-black text-[#000000] block mt-0.5">
                ₹{calcTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-[#7a8794] block mt-0.5">Inclusive of 18% GST & Freight</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Send Entire Offer */}
      <SendOfferModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        quotation={activeQuote}
        onSent={(msg) => showToast(msg)}
      />
    </div>
  );
};

