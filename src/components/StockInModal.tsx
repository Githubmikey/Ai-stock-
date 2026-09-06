import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownToLine, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Hash, 
  User, 
  FileText,
  Boxes
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { storageService } from '../services/storageService';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSuccess: (updatedSku: string) => void;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState<number>(10);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [locationBay, setLocationBay] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('Alex Vance (Bay 4)');
  const [notes, setNotes] = useState<string>('Dock Inbound Reception');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setLocationBay(item.locationBay);
      setReferenceNumber(`PO-${Math.floor(10000 + Math.random() * 90000)}`);
      setQuantity(item.velocity === 'HIGH' ? 25 : 10);
      setError(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isOnline = storageService.isOnline();
  const projectedStock = item.currentStock + Number(quantity || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Quantity received must be at least 1 unit');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = storageService.executeStockIn({
      sku: item.sku,
      quantity: Number(quantity),
      referenceNumber: referenceNumber.trim() || `PO-${Date.now()}`,
      operatorName: operatorName.trim() || 'Floor Staff',
      locationBay: locationBay.trim() || item.locationBay,
      notes: notes.trim()
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess(item.sku);
      onClose();
    } else {
      setError(result.error || 'Failed to execute stock in');
    }
  };

  const handleQuickAdd = (amount: number) => {
    setQuantity(prev => Math.max(1, (Number(prev) || 0) + amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D1117] border border-emerald-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C3E] bg-[#121A1E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white font-mono text-base tracking-wide">
                  STOCK IN • RECEIVING
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {isOnline ? 'ONLINE' : 'LOCAL OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Log inbound warehouse goods & update inventory
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
                  Category: {item.category} • Supplier: {item.supplier}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Current Stock</span>
                <span className="text-lg font-mono font-extrabold text-white">
                  {item.currentStock} {item.unit}
                </span>
              </div>
            </div>

            {/* Projected Stock Preview */}
            <div className="mt-3 pt-3 border-t border-[#232C3E] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Projected On-Hand:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {item.currentStock} ➔ {projectedStock} {item.unit}
                <span className="text-xs font-normal text-emerald-500 ml-1">
                  (+{quantity || 0})
                </span>
              </span>
            </div>
          </div>

          {/* Quantity Inbound Input */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
              Quantity Received ({item.unit}): *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="flex-1 bg-[#161B26] border border-[#232C3E] focus:border-emerald-400 rounded-lg px-3 py-2 text-white font-mono text-lg font-bold focus:outline-none"
              />
              <div className="flex gap-1.5">
                {[5, 10, 25, 50].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="px-2.5 py-2 bg-[#1C2333] hover:bg-[#253147] text-emerald-400 font-mono text-xs font-bold rounded-lg border border-[#232C3E] transition"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid: PO Reference & Bay Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>PO / Shipment Ref:</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. PO-9842"
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-emerald-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Storage Bay Location:</span>
              </label>
              <input
                type="text"
                value={locationBay}
                onChange={(e) => setLocationBay(e.target.value)}
                placeholder="e.g. BAY-A1-04"
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-emerald-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Receiving Operator:</span>
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full bg-[#161B26] border border-[#232C3E] focus:border-emerald-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Inbound Inspection Notes:</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Packaging intact, seal verified, temperature compliant"
              className="w-full bg-[#161B26] border border-[#232C3E] focus:border-emerald-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Offline Sync Banner info */}
          {!isOnline && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-mono">
              ⚡ <strong>Offline Mode:</strong> Transaction will be recorded locally in Room/IndexedDB and synced when Wi-Fi connects.
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
              disabled={isSubmitting || quantity <= 0}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,230,118,0.4)] transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM STOCK IN (+{quantity || 0})</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
