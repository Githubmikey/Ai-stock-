import React from 'react';
import { 
  Boxes, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  QrCode, 
  Sparkles,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { InventoryAlert } from '../types/inventory';

interface HeaderProps {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  alerts: InventoryAlert[];
  onToggleOnline: () => void;
  onTriggerSync: () => void;
  onOpenScanner: () => void;
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
  onOpenQuickStockIn: () => void;
  onOpenQuickStockOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  pendingSyncCount,
  isSyncing,
  alerts,
  onToggleOnline,
  onTriggerSync,
  onOpenScanner,
  onOpenNotifications,
  onOpenAiAssistant,
  onOpenQuickStockIn,
  onOpenQuickStockOut
}) => {
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#0D1117] border-b border-[#232C3E] px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Brand & Warehouse Terminal Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <Boxes className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wider text-base uppercase font-mono">
                  OmniStock <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  WH-EAST-04
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                Terminal #882 • Operator: Alex Vance
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#161B26] border border-[#232C3E] text-slate-300 hover:text-white"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenScanner}
              className="p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              title="Scan QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Real-time Controls & Offline Sync Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Offline / Online Connectivity Simulator Switch */}
          <button
            onClick={onToggleOnline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Click to toggle warehouse Wi-Fi simulation (test offline sync)"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5" />
                <span>ONLINE (MESH WI-FI)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE (DEAD ZONE)</span>
              </>
            )}
          </button>

          {/* Pending Sync Queue Pill */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing || pendingSyncCount === 0 || !isOnline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
              pendingSyncCount > 0
                ? 'bg-[#1C2333] border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/50 cursor-pointer'
                : 'bg-[#161B26] border-[#232C3E] text-slate-400 cursor-default opacity-80'
            }`}
            title={
              !isOnline
                ? 'Queue stored locally in Room/IndexedDB. Reconnect to sync.'
                : pendingSyncCount > 0
                ? 'Click to sync pending operations now'
                : 'All local changes synced to warehouse ERP'
            }
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>
              {isSyncing
                ? 'SYNCING...'
                : pendingSyncCount > 0
                ? `${pendingSyncCount} QUEUED SYNC${pendingSyncCount > 1 ? 'S' : ''}`
                : 'ERP IN SYNC'}
            </span>
          </button>

          {/* Quick Stock In Button */}
          <button
            onClick={onOpenQuickStockIn}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold font-mono transition"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
            <span>STOCK IN</span>
          </button>

          {/* Quick Stock Out Button */}
          <button
            onClick={onOpenQuickStockOut}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-semibold font-mono transition"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5 text-red-400" />
            <span>STOCK OUT</span>
          </button>

          {/* AI Stock Advisor Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/50 text-xs font-mono font-semibold transition shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI ADVISOR</span>
          </button>

          {/* Desktop QR Scan Button */}
          <button
            onClick={onOpenScanner}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.3)] transition transform active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>SCAN QR CODE</span>
          </button>

          {/* Desktop Alerts Bell */}
          <button
            onClick={onOpenNotifications}
            className="hidden md:flex relative p-2 rounded-lg bg-[#161B26] border border-[#232C3E] text-slate-300 hover:text-white hover:border-slate-500 transition"
            title="Real-time Inventory Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0D1117]">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Offline Alert Banner (If simulated offline) */}
      {!isOnline && (
        <div className="mt-2.5 max-w-7xl mx-auto py-1 px-3 rounded bg-amber-950/80 border border-amber-500/50 flex items-center justify-between text-xs text-amber-200 font-mono">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>OFFLINE MODE ACTIVE:</strong> Scanning and stock in/out are running locally. Transactions are queued in local database and will auto-sync once Wi-Fi reconnects.
            </span>
          </div>
          <button
            onClick={onToggleOnline}
            className="underline hover:text-white font-bold ml-2 shrink-0"
          >
            Reconnect Wi-Fi
          </button>
        </div>
      )}
    </header>
  );
};
