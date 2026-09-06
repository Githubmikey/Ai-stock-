import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  QrCode, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Plus,
  Boxes
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface InventoryListProps {
  items: InventoryItem[];
  filterMode: 'ALL' | 'LOW_STOCK';
  onResetFilterMode: () => void;
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  onShowQr: (item: InventoryItem) => void;
  onShowAiForecastForItem: (item: InventoryItem) => void;
  onAddNewItem: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  filterMode,
  onResetFilterMode,
  onStockIn,
  onStockOut,
  onShowQr,
  onShowAiForecastForItem,
  onAddNewItem
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OUT' | 'LOW' | 'HEALTHY'>(
    filterMode === 'LOW_STOCK' ? 'LOW' : 'ALL'
  );

  // Sync if filterMode prop changes
  React.useEffect(() => {
    if (filterMode === 'LOW_STOCK') {
      setStatusFilter('LOW');
    }
  }, [filterMode]);

  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationBay.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'OUT') {
      matchesStatus = item.currentStock === 0;
    } else if (statusFilter === 'LOW') {
      matchesStatus = item.currentStock <= item.minStockThreshold;
    } else if (statusFilter === 'HEALTHY') {
      matchesStatus = item.currentStock > item.minStockThreshold;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-[#0D1117] border border-[#232C3E] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* Top Title & Quick Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#161B26] border border-[#232C3E] text-cyan-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-white font-mono text-base tracking-wide flex items-center gap-2">
              WAREHOUSE STOCK INVENTORY
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1C2333] text-slate-300 border border-[#232C3E] font-normal">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live floor stock levels, bin locations, and QR tags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, bay, name..."
              className="w-full bg-[#161B26] border border-[#232C3E] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Add New SKU Button */}
          <button
            onClick={onAddNewItem}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1C2333] hover:bg-[#253147] border border-[#232C3E] hover:border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold rounded-lg transition shrink-0"
            title="Register new SKU in warehouse database"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Add SKU</span>
          </button>
        </div>
      </div>

      {/* Category & Status Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-[#1C2333]">
        
        {/* Category Scrollable Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300 font-bold'
                  : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Dropdown/Buttons */}
        <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
          <button
            onClick={() => { setStatusFilter('ALL'); onResetFilterMode(); }}
            className={`px-2.5 py-1 rounded-lg border transition ${
              statusFilter === 'ALL'
                ? 'bg-[#1C2333] border-slate-400 text-white font-bold'
                : 'bg-[#131822] border-[#232C3E] text-slate-400'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStatusFilter('LOW')}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              statusFilter === 'LOW'
                ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                : 'bg-[#131822] border-[#232C3E] text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Low Stock</span>
          </button>
          <button
            onClick={() => setStatusFilter('OUT')}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
              statusFilter === 'OUT'
                ? 'bg-red-950 border-red-500 text-red-300 font-bold'
                : 'bg-[#131822] border-[#232C3E] text-red-400/80 hover:text-red-300'
            }`}
          >
            <XCircle className="w-3 h-3 text-red-400" />
            <span>Depleted</span>
          </button>
        </div>

      </div>

      {/* Items Grid / Table View */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#232C3E] rounded-xl">
          <Boxes className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="font-mono text-sm text-slate-400">No inventory matches your search filter</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setStatusFilter('ALL'); }}
            className="mt-3 text-xs font-mono text-cyan-400 underline hover:text-cyan-300"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const isOutOfStock = item.currentStock === 0;
            const isLowStock = item.currentStock > 0 && item.currentStock <= item.minStockThreshold;
            const capacityPercent = Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100));

            return (
              <div
                key={item.id}
                className={`bg-[#131822] border rounded-xl p-4 flex flex-col justify-between transition group hover:shadow-xl ${
                  isOutOfStock
                    ? 'border-red-500/50 bg-red-950/10'
                    : isLowStock
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-[#232C3E] hover:border-slate-600'
                }`}
              >
                {/* Header: SKU, Bay, Velocity */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-extrabold text-xs text-cyan-400 tracking-wider bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                        {item.sku}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1C2333] text-slate-300 border border-[#232C3E] flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 inline" />
                        {item.locationBay}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      item.velocity === 'HIGH'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : item.velocity === 'MEDIUM'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.velocity} VEL
                    </span>
                  </div>

                  {/* Name & Supplier */}
                  <h3 className="font-semibold text-white text-sm mt-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                    {item.category} • {item.supplier}
                  </p>
                </div>

                {/* Stock Level Gauge */}
                <div className="my-3 pt-3 border-t border-[#1C2333]">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xl font-mono font-extrabold ${
                        isOutOfStock 
                          ? 'text-red-400' 
                          : isLowStock 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                      }`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        / {item.maxCapacity} {item.unit}
                      </span>
                    </div>

                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      isOutOfStock
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : isLowStock
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {isOutOfStock ? 'DEPLETED' : isLowStock ? 'LOW STOCK' : 'HEALTHY'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 h-1.5 bg-[#1C2333] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOutOfStock
                          ? 'bg-red-500'
                          : isLowStock
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(4, capacityPercent)}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Reorder at: {item.minStockThreshold} {item.unit}</span>
                    <span>${item.unitCost.toFixed(2)}/unit</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-[#1C2333] grid grid-cols-4 gap-1.5 text-xs font-mono">
                  
                  {/* View QR Code */}
                  <button
                    onClick={() => onShowQr(item)}
                    className="p-2 rounded-lg bg-[#161B26] hover:bg-[#1C2333] text-cyan-300 border border-[#232C3E] hover:border-cyan-500/40 flex items-center justify-center transition"
                    title="View & Print QR Bin Tag"
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                  </button>

                  {/* Stock In */}
                  <button
                    onClick={() => onStockIn(item)}
                    className="col-span-1 p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-1 transition"
                    title="Receive Inbound Stock"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">IN</span>
                  </button>

                  {/* Stock Out */}
                  <button
                    onClick={() => onStockOut(item)}
                    disabled={isOutOfStock}
                    className={`col-span-1 p-2 rounded-lg border font-bold flex items-center justify-center gap-1 transition ${
                      isOutOfStock
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-rose-950/60 hover:bg-rose-900 border-rose-500/40 text-rose-300'
                    }`}
                    title="Dispatch Outbound Stock"
                  >
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px]">OUT</span>
                  </button>

                  {/* AI Forecast */}
                  <button
                    onClick={() => onShowAiForecastForItem(item)}
                    className="p-2 rounded-lg bg-purple-950/50 hover:bg-purple-900 border border-purple-500/40 text-purple-300 flex items-center justify-center transition"
                    title="AI Burn Rate & Forecast"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
