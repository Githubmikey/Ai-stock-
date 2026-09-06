import React, { useRef } from 'react';
import { X, Printer, Download, QrCode, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem } from '../types/inventory';

interface ItemQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onQuickAction: (item: InventoryItem, action: 'STOCK_IN' | 'STOCK_OUT') => void;
}

export const ItemQrCodeModal: React.FC<ItemQrCodeModalProps> = ({
  isOpen,
  onClose,
  item,
  onQuickAction
}) => {
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !item) return null;

  // Format QR payload: structured with SKU, Location Bay, and Name for standard warehouse scanners
  const qrPayload = item.sku;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D1117] border border-[#232C3E] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C3E] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white font-mono text-base tracking-wide">
                WAREHOUSE QR LABEL
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Physical bin tag & barcode identifier
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

        {/* Body Printable Tag */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          
          {/* Printable Thermal Label Frame */}
          <div 
            ref={printableAreaRef}
            className="bg-white text-black p-5 rounded-xl border-2 border-dashed border-slate-400 shadow-xl flex flex-col items-center text-center max-w-[280px] w-full"
          >
            <div className="text-[10px] font-mono tracking-widest font-extrabold text-slate-700 uppercase border-b pb-1 mb-2 w-full">
              OMNISTOCK AI • BIN TAG
            </div>

            {/* High-Contrast Crisp QR Code */}
            <div className="p-2 bg-white rounded-lg shadow-inner">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Barcode & SKU Typography */}
            <div className="mt-2 w-full">
              <div className="font-mono text-lg font-black tracking-widest text-black">
                {item.sku}
              </div>
              <div className="font-semibold text-xs text-slate-900 line-clamp-2 mt-0.5">
                {item.name}
              </div>
            </div>

            {/* Storage Bay & Thresholds */}
            <div className="mt-2 pt-2 border-t border-slate-300 w-full flex items-center justify-between text-[11px] font-mono text-slate-800">
              <span>BAY: <strong>{item.locationBay}</strong></span>
              <span>MIN: <strong>{item.minStockThreshold} {item.unit}</strong></span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-mono text-center max-w-xs">
            Hold this QR code up to your warehouse terminal camera or mobile phone scanner to immediately trigger Stock In / Stock Out.
          </p>

          {/* Quick Action Simulation Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                onQuickAction(item, 'STOCK_IN');
                onClose();
              }}
              className="py-2 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span>Stock In Item</span>
            </button>

            <button
              onClick={() => {
                onQuickAction(item, 'STOCK_OUT');
                onClose();
              }}
              className="py-2 px-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:bg-rose-900 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
            >
              <ArrowUpFromLine className="w-4 h-4 text-rose-400" />
              <span>Stock Out Item</span>
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-[#161B26] border-t border-[#232C3E] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Format: ISO/IEC 18004 QR
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.3)] transition"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT LABEL</span>
          </button>
        </div>

      </div>
    </div>
  );
};
