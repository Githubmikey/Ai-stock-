import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  DashboardKpiCards 
} from './components/DashboardKpiCards';
import { 
  InventoryList 
} from './components/InventoryList';
import { 
  TransactionAuditLog 
} from './components/TransactionAuditLog';
import { 
  AIForecastPanel 
} from './components/AIForecastPanel';
import { 
  QrScannerModal 
} from './components/QrScannerModal';
import { 
  StockInModal 
} from './components/StockInModal';
import { 
  StockOutModal 
} from './components/StockOutModal';
import { 
  ItemQrCodeModal 
} from './components/ItemQrCodeModal';
import { 
  NotificationDrawer 
} from './components/NotificationDrawer';
import { 
  AddNewItemModal 
} from './components/AddNewItemModal';
import { 
  storageService 
} from './services/storageService';
import { 
  InventoryItem, 
  StockTransaction, 
  InventoryAlert, 
  WarehouseMetrics 
} from './types/inventory';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers,
  Database,
  RotateCcw
} from 'lucide-react';

export function App() {
  // Database States
  const [items, setItems] = useState<InventoryItem[]>(storageService.getItems());
  const [transactions, setTransactions] = useState<StockTransaction[]>(storageService.getTransactions());
  const [alerts, setAlerts] = useState<InventoryAlert[]>(storageService.getAlerts());
  const [metrics, setMetrics] = useState<WarehouseMetrics>(storageService.getMetrics());

  // Connectivity & Sync States
  const [isOnline, setIsOnline] = useState<boolean>(storageService.isOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(storageService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Active View Tab
  const [activeView, setActiveView] = useState<'INVENTORY' | 'AI_FORECAST' | 'AUDIT_LOG'>('INVENTORY');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW_STOCK'>('ALL');

  // Modal Control States
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAddNewItemOpen, setIsAddNewItemOpen] = useState<boolean>(false);
  const [stockInTargetItem, setStockInTargetItem] = useState<InventoryItem | null>(null);
  const [stockOutTargetItem, setStockOutTargetItem] = useState<InventoryItem | null>(null);
  const [qrCodeTargetItem, setQrCodeTargetItem] = useState<InventoryItem | null>(null);
  const [selectedItemForForecast, setSelectedItemForForecast] = useState<InventoryItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const refreshData = () => {
      setItems(storageService.getItems());
      setTransactions(storageService.getTransactions());
      setAlerts(storageService.getAlerts());
      setMetrics(storageService.getMetrics());
      setPendingSyncCount(storageService.getPendingSyncCount());
      setIsOnline(storageService.isOnline());
    };

    const unsubscribe = storageService.subscribe(refreshData);

    const handleOnlineEvent = () => refreshData();
    const handleOfflineEvent = () => refreshData();
    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Connectivity toggle
  const handleToggleOnline = () => {
    const newOfflineState = !storageService.isSimulatedOffline();
    storageService.setSimulatedOffline(newOfflineState);
    if (!newOfflineState) {
      showToast('Warehouse Wi-Fi connection restored. Ready to sync.', 'success');
      // Auto-sync if pending
      if (storageService.getPendingSyncCount() > 0) {
        handleTriggerSync();
      }
    } else {
      showToast('Entered Warehouse Dead Zone. Operating in Local Offline Mode.', 'warning');
    }
  };

  // Trigger manual or auto sync
  const handleTriggerSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      const result = await storageService.syncPendingTransactions();
      if (result.syncedCount > 0) {
        showToast(`Successfully synced ${result.syncedCount} queued transactions to central ERP!`, 'success');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Scanned item action router
  const handleScannerSelectAction = (item: InventoryItem, actionType: 'STOCK_IN' | 'STOCK_OUT') => {
    if (actionType === 'STOCK_IN') {
      setStockInTargetItem(item);
    } else {
      setStockOutTargetItem(item);
    }
  };

  // Quick Action Buttons from header
  const handleQuickStockIn = () => {
    if (items.length > 0) {
      // Pick first low stock item or default
      const candidate = items.find(i => i.currentStock <= i.minStockThreshold) || items[0];
      setStockInTargetItem(candidate);
    }
  };

  const handleQuickStockOut = () => {
    if (items.length > 0) {
      const candidate = items.find(i => i.currentStock > 0) || items[0];
      setStockOutTargetItem(candidate);
    }
  };

  return (
    <div className="min-h-screen bg-[#090C10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Header Bar with Real-time Status */}
      <Header
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        isSyncing={isSyncing}
        alerts={alerts}
        onToggleOnline={handleToggleOnline}
        onTriggerSync={handleTriggerSync}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAiAssistant={() => {
          setActiveView('AI_FORECAST');
          setSelectedItemForForecast(null);
        }}
        onOpenQuickStockIn={handleQuickStockIn}
        onOpenQuickStockOut={handleQuickStockOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between shadow-2xl animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : 'bg-amber-950/90 border-amber-500/60 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs font-bold underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. Warehouse KPI Metric Cards */}
        <DashboardKpiCards
          metrics={metrics}
          isOnline={isOnline}
          onFilterLowStock={() => {
            setActiveView('INVENTORY');
            setFilterMode('LOW_STOCK');
          }}
          onFilterAll={() => {
            setActiveView('INVENTORY');
            setFilterMode('ALL');
          }}
          onTriggerSync={handleTriggerSync}
        />

        {/* 3. Navigation View Switcher Bar */}
        <div className="flex items-center justify-between bg-[#0D1117] border border-[#232C3E] rounded-xl p-1.5 shadow-lg">
          <div className="flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveView('INVENTORY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeView === 'INVENTORY'
                  ? 'bg-[#1C2333] text-white border border-[#232C3E] shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Inventory & Bays</span>
            </button>

            <button
              onClick={() => setActiveView('AI_FORECAST')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeView === 'AI_FORECAST'
                  ? 'bg-purple-950 text-purple-200 border border-purple-600/50 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Stock Advisor</span>
            </button>

            <button
              onClick={() => setActiveView('AUDIT_LOG')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                activeView === 'AUDIT_LOG'
                  ? 'bg-[#1C2333] text-white border border-[#232C3E] shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span>Audit Ledger ({transactions.length})</span>
            </button>
          </div>

          {/* Quick Scanner Action in Navigation Bar */}
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-lg transition shadow-[0_0_10px_rgba(0,229,255,0.3)]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Fast Scan</span>
            </button>
          </div>
        </div>

        {/* 4. Active Main Content View */}
        {activeView === 'INVENTORY' && (
          <InventoryList
            items={items}
            filterMode={filterMode}
            onResetFilterMode={() => setFilterMode('ALL')}
            onStockIn={(item) => setStockInTargetItem(item)}
            onStockOut={(item) => setStockOutTargetItem(item)}
            onShowQr={(item) => setQrCodeTargetItem(item)}
            onShowAiForecastForItem={(item) => {
              setSelectedItemForForecast(item);
              setActiveView('AI_FORECAST');
            }}
            onAddNewItem={() => setIsAddNewItemOpen(true)}
          />
        )}

        {activeView === 'AI_FORECAST' && (
          <AIForecastPanel
            items={items}
            transactions={transactions}
            selectedItemForForecast={selectedItemForForecast}
            onClearSelectedItem={() => setSelectedItemForForecast(null)}
            onQuickReorder={(sku) => {
              const item = items.find(i => i.sku === sku);
              if (item) {
                setStockInTargetItem(item);
              }
            }}
          />
        )}

        {activeView === 'AUDIT_LOG' && (
          <TransactionAuditLog
            transactions={transactions}
            isOnline={isOnline}
            onTriggerSync={handleTriggerSync}
          />
        )}

        {/* Warehouse Terminal Status Footer */}
        <footer className="pt-6 pb-4 border-t border-[#1C2333] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-3">
          <div className="flex items-center gap-3">
            <span>OmniStock AI • Industrial Warehouse Operating System</span>
            <span>•</span>
            <span className="text-slate-400">Offline-First Room/IndexedDB Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Reset warehouse inventory to original sample state?')) {
                  storageService.resetToSampleData();
                  showToast('Inventory reset to default warehouse catalog.', 'success');
                }
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition"
              title="Reset mock data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample DB</span>
            </button>
            <span className="text-cyan-500/70 font-semibold">Terminal Active</span>
          </div>
        </footer>

      </main>

      {/* MODALS */}
      {/* 1. Barcode & QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventoryItems={items}
        onSelectAction={handleScannerSelectAction}
      />

      {/* 2. Stock In Modal */}
      <StockInModal
        isOpen={stockInTargetItem !== null}
        onClose={() => setStockInTargetItem(null)}
        item={stockInTargetItem}
        onSuccess={(sku) => {
          showToast(`Stock In verified! Added units for ${sku}. Recorded in audit ledger.`, 'success');
        }}
      />

      {/* 3. Stock Out Modal */}
      <StockOutModal
        isOpen={stockOutTargetItem !== null}
        onClose={() => setStockOutTargetItem(null)}
        item={stockOutTargetItem}
        onSuccess={(sku) => {
          showToast(`Stock Out dispatched! Deducted units for ${sku}.`, 'success');
        }}
      />

      {/* 4. Item QR Code & Label Print Modal */}
      <ItemQrCodeModal
        isOpen={qrCodeTargetItem !== null}
        onClose={() => setQrCodeTargetItem(null)}
        item={qrCodeTargetItem}
        onQuickAction={(item, action) => {
          if (action === 'STOCK_IN') setStockInTargetItem(item);
          else setStockOutTargetItem(item);
        }}
      />

      {/* 5. Notification Center Slide-out */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        items={items}
        onTriggerStockIn={(item) => setStockInTargetItem(item)}
      />

      {/* 6. Add New SKU Modal */}
      <AddNewItemModal
        isOpen={isAddNewItemOpen}
        onClose={() => setIsAddNewItemOpen(false)}
        onItemAdded={(item) => {
          showToast(`Registered new SKU ${item.sku} in ${item.locationBay}!`, 'success');
          setQrCodeTargetItem(item);
        }}
      />

    </div>
  );
}
