import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  CameraOff, 
  QrCode, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { InventoryItem } from '../types/inventory';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  onSelectAction: (item: InventoryItem, actionType: 'STOCK_IN' | 'STOCK_OUT') => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  inventoryItems,
  onSelectAction
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'QUICK_SKU' | 'MANUAL'>('CAMERA');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [targetAction, setTargetAction] = useState<'STOCK_IN' | 'STOCK_OUT'>('STOCK_IN');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "warehouse-qr-scanner-viewport";

  // Match item when scannedCode changes
  useEffect(() => {
    if (scannedCode) {
      const clean = scannedCode.trim().toUpperCase();
      const found = inventoryItems.find(
        i => i.sku.toUpperCase() === clean || i.id.toUpperCase() === clean || i.name.toUpperCase().includes(clean)
      );
      setMatchedItem(found || null);
    } else {
      setMatchedItem(null);
    }
  }, [scannedCode, inventoryItems]);

  // Handle Camera scanning initialization
  useEffect(() => {
    if (!isOpen || activeTab !== 'CAMERA') {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      try {
        setCameraError(null);
        // Small delay to ensure DOM element is mounted
        await new Promise(res => setTimeout(res, 250));
        if (!isMounted) return;

        const scanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A
          ],
          verbose: false
        });
        html5QrCodeRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            // Beep audio feedback simulation
            playBeepSound();
            setScannedCode(decodedText);
            stopCamera();
          },
          () => {
            // Ignore scan errors between frames
          }
        );

        if (isMounted) {
          setIsCameraActive(true);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Camera start warning:", err);
          setCameraError(
            err?.message || "Camera access unavailable or blocked. You can use Quick SKU Presets or Manual Barcode Entry below."
          );
          setIsCameraActive(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Failed to stop scanner", e);
      }
      html5QrCodeRef.current = null;
      setIsCameraActive(false);
    }
  };

  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext might be restricted until user gesture
    }
  };

  const handleSelectQuickSku = (item: InventoryItem) => {
    playBeepSound();
    setScannedCode(item.sku);
    setMatchedItem(item);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    playBeepSound();
    setScannedCode(manualInput.trim());
  };

  const handleConfirmAction = () => {
    if (matchedItem) {
      onSelectAction(matchedItem, targetAction);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D1117] border border-[#232C3E] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232C3E] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white font-mono text-base tracking-wide flex items-center gap-2">
                WAREHOUSE SCANNER
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Stock In / Stock Out Barcode & QR Reader
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

        {/* Action Intent Selector: Stock In vs Stock Out */}
        <div className="px-5 pt-3 pb-1 bg-[#131822] border-b border-[#232C3E]">
          <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
            1. Select Scanning Target Action:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTargetAction('STOCK_IN')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-mono text-xs font-bold transition border ${
                targetAction === 'STOCK_IN'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(0,230,118,0.2)]'
                  : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span>STOCK IN (RECEIVE)</span>
            </button>
            <button
              onClick={() => setTargetAction('STOCK_OUT')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-mono text-xs font-bold transition border ${
                targetAction === 'STOCK_OUT'
                  ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(255,82,82,0.2)]'
                  : 'bg-[#161B26] border-[#232C3E] text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4 text-rose-400" />
              <span>STOCK OUT (DISPATCH)</span>
            </button>
          </div>
        </div>

        {/* Scanner Modes Tab */}
        <div className="flex border-b border-[#232C3E] bg-[#0F141D] text-xs font-mono">
          <button
            onClick={() => { setActiveTab('CAMERA'); setScannedCode(''); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition ${
              activeTab === 'CAMERA'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => { setActiveTab('QUICK_SKU'); setScannedCode(''); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition ${
              activeTab === 'QUICK_SKU'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Quick SKU Barcodes</span>
          </button>
          <button
            onClick={() => { setActiveTab('MANUAL'); setScannedCode(''); }}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition ${
              activeTab === 'MANUAL'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Manual SKU Entry</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: Camera Viewfinder */}
          {activeTab === 'CAMERA' && (
            <div>
              <div className="relative bg-black rounded-xl overflow-hidden border border-[#232C3E] aspect-square flex items-center justify-center">
                
                <div id={scannerContainerId} className="w-full h-full" />

                {/* Laser animation overlay */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-cyan-400/70 rounded-lg relative">
                      {/* Corner marks */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                      {/* Scanning laser line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#00E5FF] scanner-laser" />
                    </div>
                    <span className="mt-3 text-[11px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-800/60">
                      Align QR or Barcode inside target
                    </span>
                  </div>
                )}

                {/* Fallback error if camera blocked or denied */}
                {cameraError && (
                  <div className="p-4 text-center max-w-xs">
                    <CameraOff className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-amber-300 font-mono mb-3">
                      {cameraError}
                    </p>
                    <button
                      onClick={() => setActiveTab('QUICK_SKU')}
                      className="px-3 py-1.5 bg-cyan-500 text-black font-mono font-bold text-xs rounded-lg hover:bg-cyan-400 transition"
                    >
                      Use Quick Preset Barcodes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Quick SKU Barcode Tester */}
          {activeTab === 'QUICK_SKU' && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Simulate scanning warehouse tags:</span>
                <span className="text-cyan-400">1-Tap Scan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inventoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectQuickSku(item)}
                    className={`p-2.5 rounded-lg border text-left transition flex items-start justify-between ${
                      scannedCode === item.sku
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                        : 'bg-[#161B26] border-[#232C3E] hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-cyan-300">
                        {item.sku}
                      </div>
                      <div className="text-xs text-white font-medium line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Bay: {item.locationBay} • Stock: {item.currentStock} {item.unit}
                      </div>
                    </div>
                    <QrCode className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Manual SKU / Barcode Entry */}
          {activeTab === 'MANUAL' && (
            <form onSubmit={handleManualSearch} className="space-y-3">
              <label className="text-xs font-mono text-slate-300 block">
                Enter Barcode Number or SKU Code:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. SKU-MOT-550 or SKU-BLT-M8-SS"
                  className="flex-1 bg-[#161B26] border border-[#232C3E] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-lg transition"
                >
                  Verify
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Tip: Handheld Bluetooth warehouse barcode scanners automatically fill this field.
              </p>
            </form>
          )}

          {/* Scanned Result Detection Box */}
          {scannedCode && (
            <div className={`p-4 rounded-xl border animate-fadeIn ${
              matchedItem 
                ? 'bg-[#131E2A] border-cyan-500/60' 
                : 'bg-red-950/30 border-red-500/50'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {matchedItem ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-xs font-mono font-bold tracking-wide uppercase text-slate-300">
                      {matchedItem ? 'Item Recognized in Database' : 'Unrecognized Barcode'}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-extrabold text-cyan-300 mt-1">
                    {scannedCode}
                  </div>
                </div>
                {matchedItem && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C273B] text-cyan-300 border border-cyan-800">
                    {matchedItem.locationBay}
                  </span>
                )}
              </div>

              {matchedItem ? (
                <div className="mt-3 pt-3 border-t border-[#232C3E]/80">
                  <div className="text-sm font-semibold text-white">
                    {matchedItem.name}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1.5">
                    <span>Current Stock: <strong className="text-white">{matchedItem.currentStock} {matchedItem.unit}</strong></span>
                    <span>Safety Threshold: <strong className="text-amber-400">{matchedItem.minStockThreshold}</strong></span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-300 font-mono mt-2">
                  No matching SKU found for '{scannedCode}'. Check if the item needs to be registered in the catalog.
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#161B26] border-t border-[#232C3E] flex items-center justify-between">
          <button
            onClick={() => {
              setScannedCode('');
              setMatchedItem(null);
              if (activeTab === 'CAMERA') {
                setIsCameraActive(false);
              }
            }}
            className="text-xs font-mono text-slate-400 hover:text-white"
          >
            Clear / Re-scan
          </button>

          <button
            disabled={!matchedItem}
            onClick={handleConfirmAction}
            className={`px-5 py-2.5 rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition ${
              matchedItem
                ? targetAction === 'STOCK_IN'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(0,230,118,0.4)]'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_15px_rgba(255,82,82,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {targetAction === 'STOCK_IN' ? (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                <span>PROCEED TO STOCK IN</span>
              </>
            ) : (
              <>
                <ArrowUpFromLine className="w-4 h-4" />
                <span>PROCEED TO STOCK OUT</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
