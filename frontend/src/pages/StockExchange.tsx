import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Layers, ShoppingCart, Rocket, Wallet } from 'lucide-react';


interface Stock {
  id: number;
  symbol: string;
  agent_uaid: string;
  company_name: string;
  price: number;
  change_24h: number;
  total_shares: number;
  available_shares: number;
  market_cap: number;
}

interface PortfolioItem {
  symbol: string;
  company_name: string;
  shares: number;
  avg_buy_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
}

export const StockExchange: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeShares, setTradeShares] = useState(10);
  const [msg, setMsg] = useState('');
  const [ipoSymbol, setIpoSymbol] = useState('');
  const [ipoName, setIpoName] = useState('');
  const [ipoPrice, setIpoPrice] = useState(100);
  const [showIpoModal, setShowIpoModal] = useState(false);

  const fetchStockData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stocks');
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
        if (data.length > 0 && !selectedStock) {
          setSelectedStock(data[0]);
        }
      }
      const portRes = await fetch('http://localhost:8000/api/stocks/portfolio/USER_MAIN');
      if (portRes.ok) {
        setPortfolio(await portRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!selectedStock) return;
    try {
      const res = await fetch('http://localhost:8000/api/stocks/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trader: 'USER_MAIN',
          symbol: selectedStock.symbol,
          shares: tradeShares,
          action
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Success! Executed ${action.toUpperCase()} ${tradeShares} shares of ${selectedStock.symbol}`);
        fetchStockData();
      } else {
        setMsg(`Error: ${data.detail}`);
      }
    } catch (err: any) {
      setMsg(`Trade failed: ${err.message}`);
    }
  };

  const handleLaunchIPO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/stocks/ipo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_uaid: 'USER_STARTUP',
          symbol: ipoSymbol,
          company_name: ipoName,
          initial_price: ipoPrice
        })
      });
      if (res.ok) {
        setShowIpoModal(false);
        setMsg(`🚀 Successfully launched IPO for $${ipoSymbol.toUpperCase()}`);
        fetchStockData();
      } else {
        const err = await res.json();
        setMsg(`IPO Error: ${err.detail}`);
      }
    } catch (err: any) {
      setMsg(`IPO launch failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold tracking-wide flex items-center space-x-2 text-slate-100">
            <TrendingUp className="w-6 h-6 text-neonGreen" />
            <span>Agent Stock Exchange (Agent NASDAQ)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trade equity shares of autonomous agent startups. Prices fluctuate based on reputation, arena battle victories, and commercial simulation earnings.
          </p>
        </div>
        <button
          onClick={() => setShowIpoModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-xs text-white shadow-lg hover:brightness-110 transition"
        >
          <Rocket className="w-4 h-4" />
          <span>Launch Agent IPO</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-neonCyan flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Main Trading Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ticker List */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Live Stock Ticker</span>
          </h3>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {stocks.map((stock) => {
              const isSelected = selectedStock?.symbol === stock.symbol;
              const isPositive = stock.change_24h >= 0;
              return (
                <div
                  key={stock.id}
                  onClick={() => setSelectedStock(stock)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-slate-100 font-mono block">${stock.symbol}</span>
                      <span className="text-[10px] text-slate-400">{stock.company_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-100 block">${stock.price.toFixed(2)}</span>
                      <span className={`text-[10px] font-semibold flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{stock.change_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle: Order Execution & Stock Detail */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-5 lg:col-span-2">
          {selectedStock ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-black text-slate-100 font-mono">${selectedStock.symbol}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      Market Cap: ${selectedStock.market_cap.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{selectedStock.company_name} • UAID: {selectedStock.agent_uaid}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-100 block">${selectedStock.price.toFixed(2)}</span>
                  <span className="text-xs text-slate-400">Avail Shares: {selectedStock.available_shares.toLocaleString()} / {selectedStock.total_shares.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Trade Form */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>Execute Order</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Number of Shares</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={tradeShares}
                      onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estimated Total</label>
                    <div className="w-full bg-slate-950 border border-slate-800/60 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold">
                      ${(tradeShares * selectedStock.price).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleTrade('buy')}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-lg"
                  >
                    BUY {tradeShares} SHARES
                  </button>
                  <button
                    onClick={() => handleTrade('sell')}
                    className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white transition shadow-lg"
                  >
                    SELL {tradeShares} SHARES
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">Select a stock to view details</div>
          )}

          {/* User Portfolio Table */}
          <div className="pt-4 border-t border-slate-900 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span>Your Holding Portfolio ({portfolio.length})</span>
            </h4>
            {portfolio.length === 0 ? (
              <div className="p-4 bg-slate-900/30 rounded-xl text-center text-xs text-slate-500">
                You do not hold any agent stock shares yet. Buy shares above to build your portfolio!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-900 text-[10px] uppercase">
                      <th className="py-2 px-3">Symbol</th>
                      <th className="py-2 px-3">Shares</th>
                      <th className="py-2 px-3">Avg Price</th>
                      <th className="py-2 px-3">Current</th>
                      <th className="py-2 px-3">Total Value</th>
                      <th className="py-2 px-3">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => {
                      const isGain = item.profit_loss >= 0;
                      return (
                        <tr key={item.symbol} className="border-b border-slate-900/40 font-mono">
                          <td className="py-2.5 px-3 font-bold text-emerald-400">${item.symbol}</td>
                          <td className="py-2.5 px-3 text-slate-200">{item.shares}</td>
                          <td className="py-2.5 px-3 text-slate-400">${item.avg_buy_price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-slate-200">${item.current_price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">${item.total_value.toFixed(2)}</td>
                          <td className={`py-2.5 px-3 font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isGain ? '+' : ''}${item.profit_loss.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IPO Modal */}
      {showIpoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-emerald-400" />
              <span>Launch New Agent Stock IPO</span>
            </h3>
            <form onSubmit={handleLaunchIPO} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CyberReasoning Labs"
                  value={ipoName}
                  onChange={(e) => setIpoName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stock Ticker Symbol (3-5 Letters)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. CRSL"
                  value={ipoSymbol}
                  onChange={(e) => setIpoSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Initial Offering Price ($)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={ipoPrice}
                  onChange={(e) => setIpoPrice(parseFloat(e.target.value) || 100)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIpoModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Confirm & Launch IPO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
