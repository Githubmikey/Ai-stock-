import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Check, 
  CheckCheck, 
  ArrowDownToLine, 
  Clock 
} from 'lucide-react';
import { InventoryAlert, InventoryItem } from '../types/inventory';
import { storageService } from '../services/storageService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: InventoryAlert[];
  items: InventoryItem[];
  onTriggerStockIn: (item: InventoryItem) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  items,
  onTriggerStockIn
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    storageService.markAllAlertsRead();
  };

  const handleAlertClick = (alert: InventoryAlert) => {
    storageService.markAlertRead(alert.id);
    const item = items.find(i => i.id === alert.itemId || i.sku === alert.sku);
    if (item) {
      onTriggerStockIn(item);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-[#0D1117] border-l border-[#232C3E] h-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#232C3E] bg-[#161B26] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950 border border-red-500/40 text-red-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white font-mono text-base tracking-wide">
                FLOOR NOTIFICATIONS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-time stock threshold alerts & dispatch warnings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232C3E] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-2.5 bg-[#121722] border-b border-[#232C3E] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            {alerts.filter(a => !a.read).length} unacknowledged
          </span>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {alerts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              All warehouse inventory is operating within normal safety limits.
            </div>
          ) : (
            alerts.map((alert) => {
              const isCritical = alert.level === 'CRITICAL';
              const isWarning = alert.level === 'WARNING';
              const timeFormatted = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    !alert.read
                      ? isCritical
                        ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_12px_rgba(255,82,82,0.15)]'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-500/60'
                        : 'bg-cyan-950/30 border-cyan-500/50'
                      : 'bg-[#131822] border-[#232C3E] opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isCritical ? (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <span className={`text-xs font-mono font-bold uppercase ${
                        isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {alert.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        {timeFormatted}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#232C3E]/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                      {alert.sku}
                    </span>

                    <button
                      onClick={() => handleAlertClick(alert)}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-mono text-[11px] font-bold rounded flex items-center gap-1 transition"
                    >
                      <ArrowDownToLine className="w-3 h-3 text-emerald-400" />
                      <span>Replenish Stock</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
