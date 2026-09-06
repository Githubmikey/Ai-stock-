import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Layers, 
  CloudOff, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { WarehouseMetrics } from '../types/inventory';

interface DashboardKpiCardsProps {
  metrics: WarehouseMetrics;
  isOnline: boolean;
  onFilterLowStock: () => void;
  onFilterAll: () => void;
  onTriggerSync: () => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  metrics,
  isOnline,
  onFilterLowStock,
  onFilterAll,
  onTriggerSync
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* 1. Total SKUs */}
      <div 
        onClick={onFilterAll}
        className="cursor-pointer bg-[#131822] border border-[#232C3E] hover:border-cyan-500/50 rounded-xl p-3.5 flex flex-col justify-between transition group shadow-lg"
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold">Total SKUs</span>
          <Package className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            {metrics.totalSkus}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">Active Catalog</p>
        </div>
      </div>

      {/* 2. Total Units Stocked */}
      <div className="bg-[#131822] border border-[#232C3E] rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold">On-Hand Units</span>
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold font-mono text-emerald-400 tracking-tight">
            {metrics.totalStockUnits.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1.5 bg-[#1C2333] rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${Math.min(100, metrics.warehouseCapacityUtilization)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {metrics.warehouseCapacityUtilization}% cap
            </span>
          </div>
        </div>
      </div>

      {/* 3. Low & Depleted Stock Warning */}
      <div 
        onClick={onFilterLowStock}
        className={`cursor-pointer rounded-xl p-3.5 flex flex-col justify-between transition border shadow-lg ${
          metrics.lowStockCount > 0 || metrics.outOfStockCount > 0
            ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 hover:bg-amber-950/30'
            : 'bg-[#131822] border-[#232C3E] hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold">Alert Threshold</span>
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-amber-400 tracking-tight">
              {metrics.lowStockCount + metrics.outOfStockCount}
            </span>
            {metrics.outOfStockCount > 0 && (
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800">
                {metrics.outOfStockCount} Out
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-300/80 font-mono mt-0.5">
            {metrics.lowStockCount} below safety stock
          </p>
        </div>
      </div>

      {/* 4. Inbound Received Today */}
      <div className="bg-[#131822] border border-[#232C3E] rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold">Stock In (Today)</span>
          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            +{metrics.stockInTodayUnits}
          </div>
          <p className="text-[11px] text-emerald-400/80 font-mono mt-0.5 flex items-center gap-1">
            <Activity className="w-3 h-3 inline" /> Received at dock
          </p>
        </div>
      </div>

      {/* 5. Outbound Dispatched Today */}
      <div className="bg-[#131822] border border-[#232C3E] rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-rose-400">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold">Stock Out (Today)</span>
          <ArrowUpRight className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            -{metrics.stockOutTodayUnits}
          </div>
          <p className="text-[11px] text-rose-400/80 font-mono mt-0.5">
            Picked & Dispatched
          </p>
        </div>
      </div>

      {/* 6. Offline Pending Syncs */}
      <div className={`rounded-xl p-3.5 flex flex-col justify-between border shadow-lg ${
        metrics.pendingSyncTransactions > 0
          ? 'bg-cyan-950/20 border-cyan-500/40'
          : 'bg-[#131822] border-[#232C3E]'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-slate-400">
            Offline Queue
          </span>
          {metrics.pendingSyncTransactions > 0 ? (
            <CloudOff className="w-4 h-4 text-cyan-400 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {metrics.pendingSyncTransactions}
            </span>
            {metrics.pendingSyncTransactions > 0 && isOnline && (
              <button
                onClick={onTriggerSync}
                className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-700 px-2 py-0.5 rounded hover:bg-cyan-900 transition"
              >
                SYNC NOW
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {metrics.pendingSyncTransactions > 0
              ? `${metrics.pendingSyncTransactions} tx pending commit`
              : 'Local DB Synced'}
          </p>
        </div>
      </div>

    </div>
  );
};
