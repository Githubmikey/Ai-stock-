import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpFromLine, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  MapPin, 
  Hash, 
  User, 
  FileText 
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { storageService } from '../services/storageService';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSuccess: (updatedSku: string) => void;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('Alex Vance (Bay 4)');
  const [destination, setDestination] = useState<string>('Outbound Packing Station 2');
  const [notes, setNotes] = useState<string>('Order fulfillment dispatch');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setReferenceNumber(`DSP-${Math.floor(10000 + Math.random() * 90000)}`);
      setQuantity(item.currentStock > 0 ? 1 : 0);
      setError(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isOnline = storageService.isOnline();
  const projectedStock = Math.max(0, item.currentStock - Number(quantity || 0));
  const willBreachThreshold = projectedStock <= item.minStockThreshold;
  const willDepleteStock = projectedStock === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Dispatch quantity must be at least 1 unit');
      return;
    }

    if (quantity > item.currentStock) {
      setError(`Cannot dispatch ${quantity} units. Only ${item.currentStock} ${item.unit} available in ${item.locationBay}!`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = storageService.executeStockOut({
      sku: item.sku,
      quantity: Number(quantity),
      referenceNumber: referenceNumber.trim() || `DSP-${Date.now()}`,
      operatorName: operatorName.trim() || 'Floor Staff',
      notes: `${destination ? `[${destination}] ` : ''}${notes.trim()}`
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess(item.sku);
      onClose();
    } else {
      setError(result.error || 'Failed to dispatch stock out');
    }
  };

  const handleQuickSub = (amt: number) => {
    setQuantity(prev => Math.min(item.currentStock, Math.max(1, (Number(prev) || 0) + amt)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D1117] border border-rose-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C3E] bg-[#1C1317]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-400">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white font-mono text-base tracking-wide">
                  STOCK OUT • PICK & DISPATCH
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {isOnline ? 'ONLINE' : 'LOCAL OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Deduct dispatched items from inventory ledger
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Target Item Card */}
          <div className="bg-[#131822] border border-[#232C3E] rounded-xl p-3.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {item.sku}
                </span>
                <h3 className="font-semibold text-white text-sm mt-0.5">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Location: <strong className="text-white">{item.locationBay}</strong> • Threshold: {item.minStockThreshold} {item.unit}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Available Stock</span>
                <span className={`text-lg font-mono font-extrabold ${
                  item.currentStock === 0 ? 'text-red-500' : 'text-white'
                }`}>
                  {item.currentStock} {item.unit}
                </span>
              </div>
            </div>

            {/* Projected Stock Preview */}
            <div className="mt-3 pt-3 border-t border-[#232C3E] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Projected Balance:</span>
              <span className={`font-bold text-sm ${
                willDepleteStock ? 'text-red-400' : willBreachThreshold ? 'text-amber-400' : 'text-white'
              }`}>
                {item.currentStock} ➔ {projectedStock} {item.unit}
                <span className="text-xs font-normal text-rose-400 ml-1">
                  (-{quantity || 0})
                </span>
              </span>
            </div>

            {/* Warning if breaching threshold */}
            {willDepleteStock && (
              <div className="mt-2.5 p-2 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>Warning: This dispatch will completely deplete warehouse inventory to 0!</span>
              </div>
            )}
            {!willDepleteStock && willBreachThreshold && (
              <div className="mt-2.5 p-2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Notice: Dispatched balance will fall below safety reorder threshold ({item.minStockThreshold} {item.unit}).</span>
              </div>
            )}
          </div>

          {/* Quantity Outbound Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">
                Quantity Dispatched ({item.unit}): *
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Max Available: {item.currentStock}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={item.currentStock}
                required
                disabled={item.currentStock <= 0}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="flex-1 bg-[#161B26] border border-[#232C3E] focus:border-rose-400 rounded-lg px-3 py-2 text-white font-mono text-lg font-bold focus:outline-none"
              />
              <div className="flex gap-1.5">
                {[1, 5, 10].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    disabled={item.currentStock <= 0}
                    onClick={() => handleQuickSub(amt)}
                    className="px-2.5 py-2 bg-[#1C2333] hover:bg-[#253147] text-rose-400 font-mono text-xs font-bold rounded-lg border border-[#232C3E] transition disabled:opacity-50"
                  >
                    +{amt}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={item.currentStock <= 0}
                  onClick={() => setQuantity(item.currentStock)}
                  className="px-2.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-mono text-xs font-bold rounded-lg border border-rose-800 transition disabled:opacity-50"
                >
                  ALL
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Dispatch Reference & Order / Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Dispatch / Work Order Ref:</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. DSP-7714"
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-rose-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Destination / Assembly Line:</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Line 3 or Customer XYZ"
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-rose-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Picker / Dispatch Operator:</span>
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full bg-[#161B26] border border-[#232C3E] focus:border-rose-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Dispatch Notes:</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Priority courier, packed with fragile wrap"
              className="w-full bg-[#161B26] border border-[#232C3E] focus:border-rose-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || quantity <= 0 || item.currentStock <= 0}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(255,82,82,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM STOCK OUT (-{quantity || 0})</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
