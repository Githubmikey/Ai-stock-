import { InventoryItem, StockTransaction, AIForecastInsight } from '../types/inventory';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export class AIService {
  private getApiKey(): string | undefined {
    return (
      (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
      (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
      ''
    );
  }

  // Generates AI demand forecasts and replenishment recommendations
  public async getAIForecastInsights(
    items: InventoryItem[],
    transactions: StockTransaction[]
  ): Promise<AIForecastInsight[]> {
    const apiKey = this.getApiKey();

    // If no key or offline, compute intelligent heuristic forecasts immediately
    if (!apiKey) {
      return this.computeHeuristicForecasts(items, transactions);
    }

    try {
      const prompt = `
You are an expert AI Warehouse Supply Chain and Inventory Planning Assistant.
Analyze this warehouse inventory and recent transactions:

Inventory:
${JSON.stringify(
  items.map(i => ({
    sku: i.sku,
    name: i.name,
    category: i.category,
    stock: i.currentStock,
    minThreshold: i.minStockThreshold,
    maxCapacity: i.maxCapacity,
    velocity: i.velocity,
    bay: i.locationBay
  }))
)}

Recent Transactions:
${JSON.stringify(
  transactions.slice(0, 10).map(t => ({
    sku: t.sku,
    type: t.type,
    qty: t.quantity,
    time: new Date(t.timestamp).toISOString().slice(0, 10)
  }))
)}

For each SKU, return a strict JSON array of objects with:
[
  {
    "sku": "SKU-xxx",
    "name": "Item name",
    "currentStock": number,
    "burnRatePerDay": number (estimated units used/day),
    "predictedDaysRemaining": number (days until zero stock, 0 if already out),
    "recommendedReorderQty": number (optimal order quantity to bring back to healthy levels),
    "stockoutRisk": "CRITICAL" | "MODERATE" | "LOW",
    "aiRecommendation": "Concise 1-2 sentence actionable instruction for the warehouse team",
    "estimatedLeadTimeDays": number (supplier lead time estimate in days)
  }
]
Output ONLY valid JSON.
`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let response: Response | null = null;

      for (const model of modelsToTry) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  responseMimeType: 'application/json'
                }
              })
            }
          );
          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // try next model
        }
      }

      if (!response || !response.ok) {
        console.warn('Gemini API call returned error, falling back to local analytics engine');
        return this.computeHeuristicForecasts(items, transactions);
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return this.computeHeuristicForecasts(items, transactions);
    } catch (err) {
      console.warn('AI Forecast network error, using local supply chain heuristics:', err);
      return this.computeHeuristicForecasts(items, transactions);
    }
  }

  // Interactive AI Warehouse Assistant
  public async askAssistant(
    question: string,
    items: InventoryItem[],
    transactions: StockTransaction[]
  ): Promise<string> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return this.generateLocalAssistantResponse(question, items, transactions);
    }

    try {
      const systemInstruction = `
You are OmniStock AI, an intelligent warehouse operations assistant helping floor teams, logistics coordinators, and inventory supervisors.
You have live real-time access to the warehouse database:
Current SKUs count: ${items.length}
Items summary: ${items.map(i => `${i.sku} (${i.name}): ${i.currentStock} ${i.unit} in ${i.locationBay} [Min: ${i.minStockThreshold}]`).join('; ')}
Recent activity: ${transactions.slice(0, 6).map(t => `${t.type} ${t.quantity} of ${t.sku} (${t.syncStatus})`).join(', ')}

Answer concisely with operational clarity for a fast-paced warehouse environment. Format with bold headers and bullet points.
`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let response: Response | null = null;

      for (const model of modelsToTry) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${question}` }] }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 600
                }
              })
            }
          );
          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // try next model
        }
      }

      if (!response || !response.ok) {
        return this.generateLocalAssistantResponse(question, items, transactions);
      }

      const data: GeminiResponse = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || this.generateLocalAssistantResponse(question, items, transactions);
    } catch (e) {
      return this.generateLocalAssistantResponse(question, items, transactions);
    }
  }

  // Local rule-based forecasting engine (works 100% offline without API key)
  public computeHeuristicForecasts(
    items: InventoryItem[],
    transactions: StockTransaction[]
  ): AIForecastInsight[] {
    return items.map(item => {
      // Calculate daily velocity
      let burnRate = item.velocity === 'HIGH' ? 3.5 : item.velocity === 'MEDIUM' ? 1.4 : 0.4;

      // Adjust based on recent stock out transactions
      const recentOuts = transactions.filter(t => t.itemId === item.id && t.type === 'STOCK_OUT');
      if (recentOuts.length > 0) {
        const totalOutQty = recentOuts.reduce((sum, t) => sum + t.quantity, 0);
        burnRate = Math.max(burnRate, Number((totalOutQty / 3).toFixed(1)));
      }

      let predictedDays = burnRate > 0 ? Math.floor(item.currentStock / burnRate) : 99;
      if (item.currentStock === 0) predictedDays = 0;

      let risk: 'CRITICAL' | 'MODERATE' | 'LOW' = 'LOW';
      if (item.currentStock === 0 || predictedDays <= 3) {
        risk = 'CRITICAL';
      } else if (item.currentStock <= item.minStockThreshold || predictedDays <= 7) {
        risk = 'MODERATE';
      }

      // Reorder quantity calculation: aim to restock up to 80% capacity
      const targetStock = Math.round(item.maxCapacity * 0.75);
      const recommendedReorder = Math.max(0, targetStock - item.currentStock);

      let recommendation = '';
      if (item.currentStock === 0) {
        recommendation = `CRITICAL STOCKOUT: Issue emergency purchase order of ${recommendedReorder} ${item.unit} to ${item.supplier}. Fast-track dock receipt.`;
      } else if (risk === 'CRITICAL') {
        recommendation = `Stock will deplete within ~${predictedDays} days. Trigger restock order for ${recommendedReorder} ${item.unit} immediately.`;
      } else if (risk === 'MODERATE') {
        recommendation = `Below safety stock threshold (${item.minStockThreshold} ${item.unit}). Schedule standard PO replenishment of ${recommendedReorder} ${item.unit}.`;
      } else {
        recommendation = `Optimal buffer level maintained in ${item.locationBay}. Next replenishment cycle projected in ${predictedDays} days.`;
      }

      return {
        sku: item.sku,
        name: item.name,
        currentStock: item.currentStock,
        burnRatePerDay: burnRate,
        predictedDaysRemaining: predictedDays,
        recommendedReorderQty: recommendedReorder,
        stockoutRisk: risk,
        aiRecommendation: recommendation,
        estimatedLeadTimeDays: item.velocity === 'HIGH' ? 3 : 5
      };
    });
  }

  // Fallback assistant response
  private generateLocalAssistantResponse(
    question: string,
    items: InventoryItem[],
    transactions: StockTransaction[]
  ): string {
    const q = question.toLowerCase();

    if (q.includes('reorder') || q.includes('buy') || q.includes('order')) {
      const lowItems = items.filter(i => i.currentStock <= i.minStockThreshold);
      if (lowItems.length === 0) {
        return "All warehouse SKUs are currently above minimum safety buffers. No immediate purchase orders required.";
      }
      return `**AI Stock Replenishment Priority:**\n\nFound **${lowItems.length} items** requiring reorder:\n` +
        lowItems.map(i => `• **${i.sku}** (${i.name}): Stock is **${i.currentStock}** (Min: ${i.minStockThreshold}) in **${i.locationBay}**. Suggested Reorder: **${i.maxCapacity - i.currentStock} ${i.unit}**.`).join('\n');
    }

    if (q.includes('out of stock') || q.includes('empty') || q.includes('zero')) {
      const outItems = items.filter(i => i.currentStock === 0);
      if (outItems.length === 0) {
        return "There are currently zero depleted SKUs. All items have available inventory.";
      }
      return `**Critical Stockouts Detected:**\n\n` +
        outItems.map(i => `• **${i.sku}** (${i.name}) is at **0 ${i.unit}** in ${i.locationBay}. Supplier: ${i.supplier}.`).join('\n');
    }

    if (q.includes('sync') || q.includes('offline')) {
      const pendingCount = transactions.filter(t => t.syncStatus === 'PENDING').length;
      return `**Warehouse Sync Status:**\n\nThere are currently **${pendingCount} local transactions pending sync**. When mesh Wi-Fi is available, tap the **'Sync Queue'** button in the top bar to commit all records to central ERP.`;
    }

    return `**Warehouse Intelligence Summary:**\n\n` +
      `• Total Managed SKUs: **${items.length}**\n` +
      `• Items Needing Attention: **${items.filter(i => i.currentStock <= i.minStockThreshold).length}**\n` +
      `• Total Stocked Units: **${items.reduce((s, i) => s + i.currentStock, 0)}**\n` +
      `• High-Velocity Fast Movers: ${items.filter(i => i.velocity === 'HIGH').map(i => i.sku).join(', ')}\n\n` +
      `You can ask me to analyze specific bays, check reorder quantities, or review transaction velocity!`;
  }
}

export const aiService = new AIService();
