import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  Clock, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { InventoryItem, StockTransaction, AIForecastInsight } from '../types/inventory';
import { aiService } from '../services/aiService';

interface AIForecastPanelProps {
  items: InventoryItem[];
  transactions: StockTransaction[];
  selectedItemForForecast: InventoryItem | null;
  onClearSelectedItem: () => void;
  onQuickReorder: (sku: string) => void;
}

export const AIForecastPanel: React.FC<AIForecastPanelProps> = ({
  items,
  transactions,
  selectedItemForForecast,
  onClearSelectedItem,
  onQuickReorder
}) => {
  const [forecasts, setForecasts] = useState<AIForecastInsight[]>([]);
  const [isLoadingForecasts, setIsLoadingForecasts] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'FORECASTS' | 'ASSISTANT'>('FORECASTS');

  // AI Assistant Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: "Hello! I am OmniStock AI, your warehouse floor intelligence assistant. I analyze real-time scan telemetry, consumption burn rates, and bay storage metrics. What can I calculate for you today?"
    }
  ]);
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);

  // Load forecasts on mount or when items/transactions change
  useEffect(() => {
    let isMounted = true;
    const fetchForecasts = async () => {
      setIsLoadingForecasts(true);
      try {
        const insights = await aiService.getAIForecastInsights(items, transactions);
        if (isMounted) {
          setForecasts(insights);
        }
      } catch (e) {
        if (isMounted) {
          setForecasts(aiService.computeHeuristicForecasts(items, transactions));
        }
      } finally {
        if (isMounted) {
          setIsLoadingForecasts(false);
        }
      }
    };

    fetchForecasts();
    return () => { isMounted = false; };
  }, [items, transactions]);

  // Handle Chat submit
  const handleSendChat = async (questionText?: string) => {
    const textToSend = questionText || chatInput;
    if (!textToSend.trim() || isAiResponding) return;

    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInput('');
    setIsAiResponding(true);

    try {
      const response = await aiService.askAssistant(textToSend, items, transactions);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I analyzed our local warehouse database. Please ensure connection to central ERP if querying external supply chains." 
      }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const criticalForecasts = forecasts.filter(f => f.stockoutRisk === 'CRITICAL' || f.currentStock === 0);

  return (
    <div className="bg-[#0D1117] border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-950 border border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-white font-mono text-base tracking-wide">
                AI STOCK FORECAST & ADVISOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                GEMINI 2.5 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Predictive burn rates, stockout warnings, and automated reorder planner
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#161B26] p-1 rounded-xl border border-[#232C3E] text-xs font-mono">
          <button
            onClick={() => setActiveTab('FORECASTS')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${
              activeTab === 'FORECASTS'
                ? 'bg-purple-950 text-purple-200 border border-purple-600/60 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Replenishment Planner
          </button>
          <button
            onClick={() => setActiveTab('ASSISTANT')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1 ${
              activeTab === 'ASSISTANT'
                ? 'bg-purple-950 text-purple-200 border border-purple-600/60 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Selected Item Indicator (If triggered from item list) */}
      {selectedItemForForecast && (
        <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl flex items-center justify-between text-xs font-mono text-purple-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Inspecting AI metrics for: <strong>{selectedItemForForecast.sku}</strong> ({selectedItemForForecast.name})
            </span>
          </div>
          <button
            onClick={onClearSelectedItem}
            className="text-[11px] underline hover:text-white"
          >
            Show All SKUs
          </button>
        </div>
      )}

      {/* TAB 1: Replenishment Planner Cards */}
      {activeTab === 'FORECASTS' && (
        <div className="space-y-3">
          
          {/* Summary insight bar */}
          <div className="p-3 rounded-xl bg-[#131822] border border-[#232C3E] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">
                AI Stockout Hazard Alert: <strong className="text-amber-400">{criticalForecasts.length} SKU{criticalForecasts.length === 1 ? '' : 's'}</strong> projected to deplete within 7 days.
              </span>
            </div>
            <button
              onClick={() => {
                setIsLoadingForecasts(true);
                aiService.getAIForecastInsights(items, transactions).then(res => {
                  setForecasts(res);
                  setIsLoadingForecasts(false);
                });
              }}
              className="flex items-center gap-1 text-purple-300 hover:text-purple-200 text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingForecasts ? 'animate-spin' : ''}`} />
              <span>Re-run AI Analysis</span>
            </button>
          </div>

          {/* Cards Grid */}
          {isLoadingForecasts ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="font-mono text-xs text-purple-300">
                Gemini AI is analyzing real-time floor telemetry and stock velocity...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(selectedItemForForecast 
                ? forecasts.filter(f => f.sku === selectedItemForForecast.sku)
                : forecasts
              ).map((f) => {
                const isCritical = f.stockoutRisk === 'CRITICAL' || f.currentStock === 0;
                const isModerate = f.stockoutRisk === 'MODERATE';

                return (
                  <div
                    key={f.sku}
                    className={`bg-[#131822] border rounded-xl p-4 flex flex-col justify-between transition ${
                      isCritical
                        ? 'border-red-500/50 bg-red-950/10 shadow-[0_0_15px_rgba(255,82,82,0.1)]'
                        : isModerate
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : 'border-[#232C3E]'
                    }`}
                  >
                    <div>
                      {/* Top Bar: SKU & Risk Badge */}
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-extrabold text-xs text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                          {f.sku}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            : isModerate
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {isCritical ? 'CRITICAL DEPLETION' : isModerate ? 'REORDER WINDOW' : 'OPTIMAL'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-white text-sm mt-2 line-clamp-1">
                        {f.name}
                      </h3>

                      {/* Burn & Days Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1C2333] text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Depletion Projection:</span>
                          <span className={`font-extrabold text-sm flex items-center gap-1 ${
                            isCritical ? 'text-red-400' : 'text-slate-200'
                          }`}>
                            <Clock className="w-3.5 h-3.5 inline" />
                            {f.currentStock === 0 ? 'Depleted (0 days)' : `~${f.predictedDaysRemaining} days left`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Daily Velocity Burn:</span>
                          <span className="font-bold text-sm text-cyan-300 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5 inline" />
                            {f.burnRatePerDay} units/day
                          </span>
                        </div>
                      </div>

                      {/* AI Strategic Instruction */}
                      <div className="mt-3 p-2.5 rounded-lg bg-[#0D1117] border border-[#232C3E] text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-1 text-purple-400 text-[10px] font-bold uppercase mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Replenishment Instruction:</span>
                        </div>
                        <p className="line-clamp-3 text-[11px] leading-relaxed">
                          {f.aiRecommendation}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-3 pt-3 border-t border-[#1C2333] flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 text-[11px]">
                        Rec. Order: <strong className="text-emerald-400">+{f.recommendedReorderQty}</strong>
                      </span>
                      <button
                        onClick={() => onQuickReorder(f.sku)}
                        className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold text-xs flex items-center gap-1 transition"
                      >
                        <span>Stock In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: Conversational AI Copilot Assistant */}
      {activeTab === 'ASSISTANT' && (
        <div className="bg-[#121722] border border-[#232C3E] rounded-xl p-4 flex flex-col h-[480px]">
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 text-xs font-mono leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-600/50 flex items-center justify-center text-purple-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200'
                      : 'bg-[#161B26] border border-[#232C3E] text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isAiResponding && (
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>OmniStock AI is processing floor database telemetry...</span>
              </div>
            )}
          </div>

          {/* Preset Prompts */}
          <div className="pt-3 border-t border-[#1C2333] flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 text-[11px] font-mono">
            {[
              "Which items need immediate reorder today?",
              "Recommend warehouse bin slotting optimization",
              "What is our critical stockout risk summary?",
              "Calculate today's dispatch velocity"
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSendChat(prompt)}
                className="px-2.5 py-1 rounded bg-[#1C2333] hover:bg-[#253147] border border-[#232C3E] text-slate-300 whitespace-nowrap transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask OmniStock AI anything about warehouse stock, bays, reorders..."
              className="flex-1 bg-[#161B26] border border-[#232C3E] focus:border-purple-400 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAiResponding || !chatInput.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
