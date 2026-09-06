import React, { useState } from 'react';
import { 
  ClipboardList, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw,
  User,
  Hash,
  MapPin
} from 'lucide-react';
import { StockTransaction } from '../types/inventory';

interface TransactionAuditLogProps {
  transactions: StockTransaction[];
  isOnline: boolean;
  onTriggerSync: () => void;
}

export const TransactionAuditLog: React.FC<TransactionAuditLogProps> = ({
  transactions,
  isOnline,
  onTriggerSync
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'STOCK_IN' | 'STOCK_OUT' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.operatorName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'STOCK_IN') matchesFilter = t.type === 'STOCK_IN';
    else if (filterType === 'STOCK_OUT') matchesFilter = t.type === 'STOCK_OUT';
    else if (filterType === 'PENDING') matchesFilter = t.syncStatus === 'PENDING';

    return matchesSearch && matchesFilter;
  });

  const pendingCount = transactions.filter(t => t.syncStatus === 'PENDING').length;

  return (
    <div className="bg-[#0D1117] border border-[#232C3E] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#161B26] border border-[#232C3E] text-cyan-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-white font-mono text-base tracking-wide flex items-center gap-2">
              AUDIT TRANSACTION LEDGER
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1C2333] text-slate-300 border border-[#232C3E] font-normal">
                {transactions.length} total
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Traceable stock in / stock out history with offline sync stamps
            </p>
          </div>
        </div>

        {/* Search & Sync Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ref, SKU, staff..."
              className="bg-[#161B26] border border-[#232C3E] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
            />
          </div>

          {pendingCount > 0 && isOnline && (
            <button
              onClick={onTriggerSync}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 text-cyan-300 font-mono text-xs font-bold rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 text-xs font-mono border-t border-[#1C2333] pt-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1 rounded-lg border transition ${
            filterType === 'ALL'
              ? 'bg-[#1C2333] border-slate-400 text-white font-bold'
              : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilterType('STOCK_IN')}
          className={`px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${
            filterType === 'STOCK_IN'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
              : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
          <span>Stock In</span>
        </button>
        <button
          onClick={() => setFilterType('STOCK_OUT')}
          className={`px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${
            filterType === 'STOCK_OUT'
              ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
              : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpFromLine className="w-3.5 h-3.5 text-rose-400" />
          <span>Stock Out</span>
        </button>
        <button
          onClick={() => setFilterType('PENDING')}
          className={`px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${
            filterType === 'PENDING'
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
              : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Offline Queued ({pendingCount})</span>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-xl border border-[#232C3E] bg-[#121722]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#161B26] text-slate-400 uppercase tracking-wider border-b border-[#232C3E]">
            <tr>
              <th className="py-2.5 px-3">Type & Ref</th>
              <th className="py-2.5 px-3">SKU & Item</th>
              <th className="py-2.5 px-3 text-center">Movement</th>
              <th className="py-2.5 px-3 text-center">Balance</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Operator</th>
              <th className="py-2.5 px-3 text-right">Sync Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2333]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No matching transactions recorded
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isStockIn = tx.type === 'STOCK_IN';
                const formattedTime = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const formattedDate = new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <tr key={tx.id} className="hover:bg-[#161B26]/60 transition">
                    
                    {/* Type & Ref */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded ${
                          isStockIn 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {isStockIn ? <ArrowDownToLine className="w-3.5 h-3.5" /> : <ArrowUpFromLine className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <Hash className="w-3 h-3 text-slate-400" />
                            {tx.referenceNumber}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {formattedDate} • {formattedTime}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU & Item */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-cyan-300">
                        {tx.sku}
                      </div>
                      <div className="text-slate-300 line-clamp-1 max-w-[200px]">
                        {tx.itemName}
                      </div>
                      {tx.notes && (
                        <div className="text-[10px] text-slate-500 italic line-clamp-1">
                          "{tx.notes}"
                        </div>
                      )}
                    </td>

                    {/* Movement (+ / -) */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-sm ${
                        isStockIn 
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' 
                          : 'text-rose-400 bg-rose-950/60 border border-rose-800'
                      }`}>
                        {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-3 text-center text-slate-300">
                      <span className="text-slate-500">{tx.previousStock}</span>
                      <span className="mx-1 text-slate-600">➔</span>
                      <span className="font-bold text-white">{tx.newStock}</span>
                    </td>

                    {/* Location Bay */}
                    <td className="py-3 px-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {tx.locationBay}
                      </span>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {tx.operatorName}
                      </span>
                    </td>

                    {/* Sync Status */}
                    <td className="py-3 px-3 text-right">
                      {tx.syncStatus === 'SYNCED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          SYNCED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700 animate-pulse">
                          <Clock className="w-3 h-3" />
                          QUEUED OFFLINE
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
  );
};
