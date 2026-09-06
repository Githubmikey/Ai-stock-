import { InventoryItem, StockTransaction, InventoryAlert, WarehouseMetrics } from '../types/inventory';

const INVENTORY_STORAGE_KEY = 'ai_stock_inventory_items_v1';
const TRANSACTIONS_STORAGE_KEY = 'ai_stock_transactions_v1';
const ALERTS_STORAGE_KEY = 'ai_stock_alerts_v1';
const OFFLINE_MODE_KEY = 'ai_stock_offline_mode_override';

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'item-001',
    sku: 'SKU-MOT-550',
    name: 'Industrial High-Torque AC Servo Motor 550W',
    category: 'Industrial Hardware',
    currentStock: 14,
    minStockThreshold: 20,
    maxCapacity: 120,
    unit: 'units',
    locationBay: 'BAY-A1-04',
    unitCost: 185.00,
    lastUpdated: Date.now() - 3600000 * 4,
    velocity: 'HIGH',
    supplier: 'Apex Dynamics Industrial',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-002',
    sku: 'SKU-LIPO-48V',
    name: 'Heavy-Duty 48V Lithium-Ion Battery Module',
    category: 'Power & Energy',
    currentStock: 8,
    minStockThreshold: 15,
    maxCapacity: 60,
    unit: 'units',
    locationBay: 'BAY-B2-09',
    unitCost: 320.00,
    lastUpdated: Date.now() - 3600000 * 8,
    velocity: 'HIGH',
    supplier: 'VoltMax Storage Tech',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-003',
    sku: 'SKU-BLT-M8-SS',
    name: 'M8 Stainless Steel Hex Flange Bolts (100-Pack)',
    category: 'Fasteners & Fittings',
    currentStock: 142,
    minStockThreshold: 50,
    maxCapacity: 400,
    unit: 'boxes',
    locationBay: 'BAY-C4-12',
    unitCost: 24.50,
    lastUpdated: Date.now() - 3600000 * 2,
    velocity: 'MEDIUM',
    supplier: 'Titan Fasteners Corp',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-004',
    sku: 'SKU-DRV-1TB-NV',
    name: 'Enterprise NVMe SSD 1TB U.2 Read-Intensive',
    category: 'Electronics & IT',
    currentStock: 3,
    minStockThreshold: 10,
    maxCapacity: 80,
    unit: 'units',
    locationBay: 'BAY-SEC-01',
    unitCost: 145.00,
    lastUpdated: Date.now() - 3600000 * 12,
    velocity: 'HIGH',
    supplier: 'SolidData Semiconductor',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-005',
    sku: 'SKU-PKG-BX-MED',
    name: 'Double-Wall Corrugated Shipping Boxes (30x30x30cm)',
    category: 'Packaging Supplies',
    currentStock: 380,
    minStockThreshold: 100,
    maxCapacity: 1000,
    unit: 'bundles',
    locationBay: 'BAY-D1-01',
    unitCost: 18.00,
    lastUpdated: Date.now() - 3600000 * 24,
    velocity: 'MEDIUM',
    supplier: 'EcoPack Logistics Supply',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-006',
    sku: 'SKU-SFT-GOGGLE',
    name: 'ANSI Z87+ Anti-Fog Protective Safety Goggles',
    category: 'Safety & PPE',
    currentStock: 0,
    minStockThreshold: 25,
    maxCapacity: 150,
    unit: 'units',
    locationBay: 'BAY-PPE-03',
    unitCost: 12.00,
    lastUpdated: Date.now() - 3600000 * 18,
    velocity: 'HIGH',
    supplier: 'SafeGuard PPE Global',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-007',
    sku: 'SKU-PLC-CPU-12',
    name: 'Programmable Logic Controller CPU Unit 16 I/O',
    category: 'Electronics & IT',
    currentStock: 19,
    minStockThreshold: 8,
    maxCapacity: 50,
    unit: 'units',
    locationBay: 'BAY-A3-02',
    unitCost: 450.00,
    lastUpdated: Date.now() - 3600000 * 6,
    velocity: 'LOW',
    supplier: 'Automation Core Inc',
    barcodeFormat: 'QR_CODE'
  },
  {
    id: 'item-008',
    sku: 'SKU-TAPE-HVY-50',
    name: 'Reinforced Filament Packing Tape 50mm x 50m',
    category: 'Packaging Supplies',
    currentStock: 28,
    minStockThreshold: 30,
    maxCapacity: 200,
    unit: 'rolls',
    locationBay: 'BAY-D2-07',
    unitCost: 6.25,
    lastUpdated: Date.now() - 3600000 * 10,
    velocity: 'MEDIUM',
    supplier: 'EcoPack Logistics Supply',
    barcodeFormat: 'QR_CODE'
  }
];

export const INITIAL_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'tx-1001',
    timestamp: Date.now() - 3600000 * 2,
    itemId: 'item-003',
    sku: 'SKU-BLT-M8-SS',
    itemName: 'M8 Stainless Steel Hex Flange Bolts (100-Pack)',
    type: 'STOCK_IN',
    quantity: 50,
    previousStock: 92,
    newStock: 142,
    referenceNumber: 'PO-9842',
    operatorName: 'Alex Mercer (Bay 3)',
    notes: 'Scheduled supplier replenishment',
    locationBay: 'BAY-C4-12',
    syncStatus: 'SYNCED',
    syncTimestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'tx-1002',
    timestamp: Date.now() - 3600000 * 4,
    itemId: 'item-001',
    sku: 'SKU-MOT-550',
    itemName: 'Industrial High-Torque AC Servo Motor 550W',
    type: 'STOCK_OUT',
    quantity: 6,
    previousStock: 20,
    newStock: 14,
    referenceNumber: 'DSP-7714',
    operatorName: 'Maria Vance (Picking Station 1)',
    notes: 'Assembly Line 4 emergency maintenance requisition',
    locationBay: 'BAY-A1-04',
    syncStatus: 'SYNCED',
    syncTimestamp: Date.now() - 3600000 * 4
  },
  {
    id: 'tx-1003',
    timestamp: Date.now() - 3600000 * 12,
    itemId: 'item-004',
    sku: 'SKU-DRV-1TB-NV',
    itemName: 'Enterprise NVMe SSD 1TB U.2 Read-Intensive',
    type: 'STOCK_OUT',
    quantity: 7,
    previousStock: 10,
    newStock: 3,
    referenceNumber: 'DSP-7689',
    operatorName: 'David Chen (Picking Station 2)',
    notes: 'Data center server rack upgrade batch',
    locationBay: 'BAY-SEC-01',
    syncStatus: 'SYNCED',
    syncTimestamp: Date.now() - 3600000 * 12
  }
];

export const INITIAL_ALERTS: InventoryAlert[] = [
  {
    id: 'alert-1',
    timestamp: Date.now() - 3600000 * 18,
    level: 'CRITICAL',
    title: 'Out of Stock Event',
    message: 'ANSI Z87+ Anti-Fog Safety Goggles reached 0 units. Replenish immediately for floor compliance.',
    sku: 'SKU-SFT-GOGGLE',
    itemId: 'item-006',
    read: false
  },
  {
    id: 'alert-2',
    timestamp: Date.now() - 3600000 * 12,
    level: 'WARNING',
    title: 'Low Stock Threshold Breached',
    message: 'Enterprise NVMe SSD 1TB stock dropped to 3 units (below minimum threshold of 10).',
    sku: 'SKU-DRV-1TB-NV',
    itemId: 'item-004',
    read: false
  },
  {
    id: 'alert-3',
    timestamp: Date.now() - 3600000 * 4,
    level: 'WARNING',
    title: 'Low Stock Reorder Needed',
    message: 'Industrial AC Servo Motor 550W reached 14 units (reorder threshold: 20 units).',
    sku: 'SKU-MOT-550',
    itemId: 'item-001',
    read: false
  }
];

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    // Ensure initial data exists
    if (!localStorage.getItem(INVENTORY_STORAGE_KEY)) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    }
    if (!localStorage.getItem(TRANSACTIONS_STORAGE_KEY)) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    if (!localStorage.getItem(ALERTS_STORAGE_KEY)) {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Network & Offline Status
  public isSimulatedOffline(): boolean {
    const val = localStorage.getItem(OFFLINE_MODE_KEY);
    return val === 'true';
  }

  public setSimulatedOffline(isOffline: boolean) {
    localStorage.setItem(OFFLINE_MODE_KEY, isOffline ? 'true' : 'false');
    this.notify();
  }

  public isOnline(): boolean {
    if (this.isSimulatedOffline()) {
      return false;
    }
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Inventory CRUD
  public getItems(): InventoryItem[] {
    try {
      const data = localStorage.getItem(INVENTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_INVENTORY_ITEMS;
    } catch (e) {
      console.error('Failed to load inventory', e);
      return INITIAL_INVENTORY_ITEMS;
    }
  }

  public getItemBySku(sku: string): InventoryItem | undefined {
    const items = this.getItems();
    const cleanSku = sku.trim().toUpperCase();
    return items.find(i => i.sku.toUpperCase() === cleanSku || i.id === sku);
  }

  public saveItem(item: InventoryItem): void {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    this.checkAndGenerateAlerts(item);
    this.notify();
  }

  // Transactions
  public getTransactions(): StockTransaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch (e) {
      console.error('Failed to load transactions', e);
      return INITIAL_TRANSACTIONS;
    }
  }

  public executeStockIn(params: {
    sku: string;
    quantity: number;
    referenceNumber: string;
    operatorName: string;
    notes?: string;
    locationBay?: string;
  }): { success: boolean; transaction?: StockTransaction; error?: string } {
    const items = this.getItems();
    const itemIndex = items.findIndex(i => i.sku.toUpperCase() === params.sku.trim().toUpperCase() || i.id === params.sku);
    
    if (itemIndex === -1) {
      return { success: false, error: `SKU '${params.sku}' not found in warehouse inventory` };
    }

    if (params.quantity <= 0) {
      return { success: false, error: 'Quantity received must be greater than 0' };
    }

    const item = items[itemIndex];
    const prevStock = item.currentStock;
    const newStock = prevStock + params.quantity;
    
    // Update item
    item.currentStock = newStock;
    item.lastUpdated = Date.now();
    if (params.locationBay && params.locationBay.trim()) {
      item.locationBay = params.locationBay.trim();
    }
    items[itemIndex] = item;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));

    // Determine sync status based on connectivity
    const online = this.isOnline();
    const syncStatus: 'SYNCED' | 'PENDING' = online ? 'SYNCED' : 'PENDING';

    const tx: StockTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      itemId: item.id,
      sku: item.sku,
      itemName: item.name,
      type: 'STOCK_IN',
      quantity: params.quantity,
      previousStock: prevStock,
      newStock: newStock,
      referenceNumber: params.referenceNumber || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      operatorName: params.operatorName || 'Warehouse Staff',
      notes: params.notes || 'Inbound scan reception',
      locationBay: item.locationBay,
      syncStatus: syncStatus,
      syncTimestamp: online ? Date.now() : undefined
    };

    const txs = this.getTransactions();
    txs.unshift(tx);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));

    this.checkAndGenerateAlerts(item);
    this.notify();

    return { success: true, transaction: tx };
  }

  public executeStockOut(params: {
    sku: string;
    quantity: number;
    referenceNumber: string;
    operatorName: string;
    notes?: string;
  }): { success: boolean; transaction?: StockTransaction; error?: string } {
    const items = this.getItems();
    const itemIndex = items.findIndex(i => i.sku.toUpperCase() === params.sku.trim().toUpperCase() || i.id === params.sku);
    
    if (itemIndex === -1) {
      return { success: false, error: `SKU '${params.sku}' not found in warehouse inventory` };
    }

    const item = items[itemIndex];
    if (params.quantity <= 0) {
      return { success: false, error: 'Dispatch quantity must be greater than 0' };
    }

    if (item.currentStock < params.quantity) {
      return { 
        success: false, 
        error: `Insufficient stock! Requested: ${params.quantity} ${item.unit}, Available: ${item.currentStock} ${item.unit}` 
      };
    }

    const prevStock = item.currentStock;
    const newStock = prevStock - params.quantity;
    
    // Update item
    item.currentStock = newStock;
    item.lastUpdated = Date.now();
    items[itemIndex] = item;
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));

    // Determine sync status based on connectivity
    const online = this.isOnline();
    const syncStatus: 'SYNCED' | 'PENDING' = online ? 'SYNCED' : 'PENDING';

    const tx: StockTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      itemId: item.id,
      sku: item.sku,
      itemName: item.name,
      type: 'STOCK_OUT',
      quantity: params.quantity,
      previousStock: prevStock,
      newStock: newStock,
      referenceNumber: params.referenceNumber || `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
      operatorName: params.operatorName || 'Warehouse Staff',
      notes: params.notes || 'Outbound picking dispatch',
      locationBay: item.locationBay,
      syncStatus: syncStatus,
      syncTimestamp: online ? Date.now() : undefined
    };

    const txs = this.getTransactions();
    txs.unshift(tx);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));

    this.checkAndGenerateAlerts(item);
    this.notify();

    return { success: true, transaction: tx };
  }

  // Alerts Management
  public getAlerts(): InventoryAlert[] {
    try {
      const data = localStorage.getItem(ALERTS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_ALERTS;
    } catch (e) {
      return INITIAL_ALERTS;
    }
  }

  public markAlertRead(alertId: string): void {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      this.notify();
    }
  }

  public markAllAlertsRead(): void {
    const alerts = this.getAlerts().map(a => ({ ...a, read: true }));
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    this.notify();
  }

  private checkAndGenerateAlerts(item: InventoryItem) {
    const alerts = this.getAlerts();
    
    // If 0 -> Critical Out of Stock
    if (item.currentStock === 0) {
      const existing = alerts.find(a => a.itemId === item.id && a.level === 'CRITICAL' && !a.read);
      if (!existing) {
        alerts.unshift({
          id: `alert-out-${Date.now()}`,
          timestamp: Date.now(),
          level: 'CRITICAL',
          title: `CRITICAL: ${item.sku} Depleted`,
          message: `${item.name} is completely out of stock in ${item.locationBay}! Immediate replenishment required.`,
          sku: item.sku,
          itemId: item.id,
          read: false
        });
      }
    } else if (item.currentStock <= item.minStockThreshold) {
      // Low Stock Alert
      const existing = alerts.find(a => a.itemId === item.id && a.level === 'WARNING' && !a.read);
      if (!existing) {
        alerts.unshift({
          id: `alert-low-${Date.now()}`,
          timestamp: Date.now(),
          level: 'WARNING',
          title: `LOW STOCK: ${item.sku}`,
          message: `Stock level is ${item.currentStock} ${item.unit}, which is at or below safety threshold (${item.minStockThreshold} ${item.unit}).`,
          sku: item.sku,
          itemId: item.id,
          read: false
        });
      }
    }

    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts.slice(0, 30)));
  }

  // Offline Synchronization
  public getPendingSyncCount(): number {
    const txs = this.getTransactions();
    return txs.filter(t => t.syncStatus === 'PENDING').length;
  }

  public async syncPendingTransactions(): Promise<{ syncedCount: number; errors: number }> {
    const txs = this.getTransactions();
    const pending = txs.filter(t => t.syncStatus === 'PENDING');
    
    if (pending.length === 0) {
      return { syncedCount: 0, errors: 0 };
    }

    // Simulate network latency / ERP sync
    await new Promise(res => setTimeout(res, 900));

    let syncedCount = 0;
    const now = Date.now();

    const updatedTxs = txs.map(t => {
      if (t.syncStatus === 'PENDING') {
        syncedCount++;
        return {
          ...t,
          syncStatus: 'SYNCED' as const,
          syncTimestamp: now
        };
      }
      return t;
    });

    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTxs));
    this.notify();

    return { syncedCount, errors: 0 };
  }

  // Dashboard Metrics Calculator
  public getMetrics(): WarehouseMetrics {
    const items = this.getItems();
    const txs = this.getTransactions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    let stockInTodayUnits = 0;
    let stockOutTodayUnits = 0;

    txs.forEach(t => {
      if (t.timestamp >= todayStart) {
        if (t.type === 'STOCK_IN') {
          stockInTodayUnits += t.quantity;
        } else if (t.type === 'STOCK_OUT') {
          stockOutTodayUnits += t.quantity;
        }
      }
    });

    const totalStockUnits = items.reduce((sum, i) => sum + i.currentStock, 0);
    const totalCapacity = items.reduce((sum, i) => sum + i.maxCapacity, 0);
    const lowStockCount = items.filter(i => i.currentStock > 0 && i.currentStock <= i.minStockThreshold).length;
    const outOfStockCount = items.filter(i => i.currentStock === 0).length;
    const pendingSyncTransactions = txs.filter(t => t.syncStatus === 'PENDING').length;

    const warehouseCapacityUtilization = totalCapacity > 0 
      ? Math.round((totalStockUnits / totalCapacity) * 100) 
      : 0;

    return {
      totalSkus: items.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      stockInTodayUnits,
      stockOutTodayUnits,
      pendingSyncTransactions,
      warehouseCapacityUtilization
    };
  }

  // Reset demo data
  public resetToSampleData(): void {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
    localStorage.removeItem(OFFLINE_MODE_KEY);
    this.notify();
  }
}

export const storageService = new StorageService();
