import React, { useState } from 'react';
import { X, Plus, Boxes, MapPin, Hash, ShieldCheck, Tag } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { storageService } from '../services/storageService';

interface AddNewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: InventoryItem) => void;
}

export const AddNewItemModal: React.FC<AddNewItemModalProps> = ({
  isOpen,
  onClose,
  onItemAdded
}) => {
  const [sku, setSku] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Industrial Hardware');
  const [initialStock, setInitialStock] = useState<number>(20);
  const [minThreshold, setMinThreshold] = useState<number>(10);
  const [maxCapacity, setMaxCapacity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('units');
  const [locationBay, setLocationBay] = useState<string>('BAY-A1-01');
  const [unitCost, setUnitCost] = useState<number>(25.00);
  const [supplier, setSupplier] = useState<string>('OmniStock Industrial Logistics');
  const [velocity, setVelocity] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) {
      setError('SKU identifier is required');
      return;
    }
    if (!name.trim()) {
      setError('Item description name is required');
      return;
    }

    const cleanSku = sku.trim().toUpperCase();
    const existing = storageService.getItemBySku(cleanSku);
    if (existing) {
      setError(`An item with SKU '${cleanSku}' already exists in inventory!`);
      return;
    }

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      sku: cleanSku,
      name: name.trim(),
      category: category.trim(),
      currentStock: Number(initialStock) || 0,
      minStockThreshold: Number(minThreshold) || 5,
      maxCapacity: Number(maxCapacity) || 100,
      unit: unit.trim() || 'units',
      locationBay: locationBay.trim() || 'BAY-GEN-01',
      unitCost: Number(unitCost) || 0,
      lastUpdated: Date.now(),
      velocity: velocity,
      supplier: supplier.trim() || 'Direct Manufacturer',
      barcodeFormat: 'QR_CODE'
    };

    storageService.saveItem(newItem);
    onItemAdded(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D1117] border border-[#232C3E] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C3E] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white font-mono text-base tracking-wide">
                REGISTER NEW WAREHOUSE SKU
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Create item profile & generate QR tracking tag
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          
          {/* SKU & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                SKU Identifier Code: *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SKU-SEN-PRX"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              >
                <option value="Industrial Hardware">Industrial Hardware</option>
                <option value="Power & Energy">Power & Energy</option>
                <option value="Fasteners & Fittings">Fasteners & Fittings</option>
                <option value="Electronics & IT">Electronics & IT</option>
                <option value="Packaging Supplies">Packaging Supplies</option>
                <option value="Safety & PPE">Safety & PPE</option>
              </select>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
              Item Name / Description: *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Optical Proximity Sensor 24V M12 Shielded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Stock, Min Threshold, Max Capacity */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                Initial Stock:
              </label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono font-bold text-amber-300 block mb-1">
                Min Reorder Pt:
              </label>
              <input
                type="number"
                min="1"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value) || 1)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                Max Capacity:
              </label>
              <input
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 100)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Bay Location & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Assigned Storage Bay:
              </label>
              <input
                type="text"
                placeholder="e.g. BAY-B1-02"
                value={locationBay}
                onChange={(e) => setLocationBay(e.target.value)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Unit of Measure:
              </label>
              <input
                type="text"
                placeholder="units, boxes, reels"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Supplier & Velocity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Supplier:
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Expected Velocity:
              </label>
              <select
                value={velocity}
                onChange={(e) => setVelocity(e.target.value as any)}
                className="w-full bg-[#161B26] border border-[#232C3E] focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              >
                <option value="HIGH">HIGH (Fast moving)</option>
                <option value="MEDIUM">MEDIUM (Standard)</option>
                <option value="LOW">LOW (Slow/Buffer)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-[#232C3E] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-lg shadow-[0_0_12px_rgba(0,229,255,0.3)] transition"
            >
              REGISTER SKU & GENERATE QR
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
