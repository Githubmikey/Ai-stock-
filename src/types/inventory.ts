export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStockThreshold: number;
  maxCapacity: number;
  unit: string;
  locationBay: string;
  unitCost: number;
  lastUpdated: number;
  velocity: 'HIGH' | 'MEDIUM' | 'LOW';
  supplier: string;
  barcodeFormat: 'QR_CODE' | 'CODE_128';
}

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';

export type SyncStatusType = 'SYNCED' | 'PENDING' | 'SYNCING' | 'FAILED';

export interface StockTransaction {
  id: string;
  timestamp: number;
  itemId: string;
  sku: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber: string; // e.g., PO-8492 or DSP-3912
  operatorName: string;
  notes?: string;
  locationBay: string;
  syncStatus: SyncStatusType;
  syncTimestamp?: number;
}

export interface InventoryAlert {
  id: string;
  timestamp: number;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  sku: string;
  itemId: string;
  read: boolean;
}

export interface AIForecastInsight {
  sku: string;
  name: string;
  currentStock: number;
  burnRatePerDay: number;
  predictedDaysRemaining: number;
  recommendedReorderQty: number;
  stockoutRisk: 'CRITICAL' | 'MODERATE' | 'LOW';
  aiRecommendation: string;
  estimatedLeadTimeDays: number;
}

export interface WarehouseMetrics {
  totalSkus: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockInTodayUnits: number;
  stockOutTodayUnits: number;
  pendingSyncTransactions: number;
  warehouseCapacityUtilization: number;
}
