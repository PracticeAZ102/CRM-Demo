import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { SalesTarget } from '../../types/activity';
import {
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export const TargetsView: React.FC = () => {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTargets();
      setTargets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales targets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const totalTargetUnits = targets.reduce((acc, t) => acc + t.target_units, 0);
  const totalAchievedUnits = targets.reduce((acc, t) => acc + t.achieved_units, 0);
  const totalTargetRev = targets.reduce((acc, t) => acc + t.target_revenue, 0);
  const totalAchievedRev = targets.reduce((acc, t) => acc + t.achieved_revenue, 0);

  const overallUnitPct = totalTargetUnits > 0 ? Math.round((totalAchievedUnits / totalTargetUnits) * 100) : 0;
  const overallRevPct = totalTargetRev > 0 ? Math.round((totalAchievedRev / totalTargetRev) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="text-[#2986cc]" size={20} />
            FY 2026-27 Sales Target Governance
          </h2>
          <p className="text-xs text-slate-500">
            Monthly unit quotas vs. invoiced shipments for Chicago Pneumatic screw compressors and Gem systems.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTargets}
            className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href={api.getExportExcelUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition"
          >
            <FileSpreadsheet size={14} />
            <span>Export Master Catalog</span>
          </a>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Annual Target Units</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalTargetUnits} Units</div>
          <div className="text-[11px] text-slate-500 mt-1">FY 2026-27 full year commitment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">YTD Achieved Units</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#6aa84f]">{totalAchievedUnits} Units</span>
            <span className="text-xs font-bold text-slate-500">({overallUnitPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-[#6aa84f] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallUnitPct, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Target Revenue</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{(totalTargetRev / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-1">₹{totalTargetRev.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Achieved Revenue</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#2986cc]">
              ₹{(totalAchievedRev / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-xs font-bold text-slate-500">({overallRevPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-[#2986cc] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallRevPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">FY 2026-27 Monthly Breakdown</h3>
          <p className="text-xs text-slate-500">Quota vs. actual units achieved & revenue realization</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Month</th>
                <th className="py-2.5 px-4 text-center">Target Units</th>
                <th className="py-2.5 px-4 text-center">Achieved Units</th>
                <th className="py-2.5 px-4 text-center">Unit Fulfillment</th>
                <th className="py-2.5 px-4 text-right">Target Rev (₹)</th>
                <th className="py-2.5 px-4 text-right">Achieved Rev (₹)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && targets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#2986cc]" />
                    Loading monthly sales targets from local database...
                  </td>
                </tr>
              ) : targets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No sales targets configured for FY 2026-27.
                  </td>
                </tr>
              ) : (
                targets.map((row) => {
                  const pct = row.target_units > 0 ? Math.round((row.achieved_units / row.target_units) * 100) : 0;
                  const isCurrent = row.month.includes('November 2026');
                  const isPast = ['April', 'May', 'June', 'July', 'August', 'September', 'October'].some((m) =>
                    row.month.includes(m)
                  );

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isCurrent ? 'bg-blue-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar size={13} className={isCurrent ? 'text-[#2986cc]' : 'text-slate-400'} />
                          {row.month}
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-[#2986cc] text-white text-[9px] rounded font-bold uppercase">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {row.target_units}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-900">
                        {row.achieved_units}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 100
                                  ? 'bg-[#6aa84f]'
                                  : pct > 50
                                  ? 'bg-[#2986cc]'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 w-9">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        ₹{row.target_revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{row.achieved_revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPast ? (
                          pct >= 100 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={11} /> Met
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertCircle size={11} /> Deficit
                            </span>
                          )
                        ) : isCurrent ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                            Upcoming
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
