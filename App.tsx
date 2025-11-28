import React, { useState, useEffect } from 'react';
import { StockData, ViewState } from './types';
import { searchStockInfo } from './services/geminiService';
import Dashboard from './components/Dashboard';
import StockAnalysis from './components/StockAnalysis';
import Screener from './components/Screener';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [watchlist, setWatchlist] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load watchlist from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yieldscout_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // Save watchlist to local storage when changed
  useEffect(() => {
    localStorage.setItem('yieldscout_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const data = await searchStockInfo(searchQuery);
      setSelectedStock(data);
      setView(ViewState.ANALYSIS);
      setSearchQuery('');
    } catch (err: any) {
      setError("无法找到该股票数据，请检查代码是否正确（如：600519）。");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyzeFromScreener = async (ticker: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const data = await searchStockInfo(ticker);
      setSelectedStock(data);
      setView(ViewState.ANALYSIS);
    } catch (err) {
      setError(`无法获取 ${ticker} 的详细信息`);
    } finally {
      setIsSearching(false);
    }
  };

  const addToWatchlist = (stock: StockData) => {
    if (!watchlist.find(s => s.symbol === stock.symbol)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s.symbol !== symbol));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setView(ViewState.DASHBOARD)}
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">
                  <i className="fas fa-chart-line"></i>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">A股股息侦探</span>
              </div>
              
              <div className="hidden md:flex items-baseline space-x-4">
                <button 
                  onClick={() => setView(ViewState.DASHBOARD)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === ViewState.DASHBOARD ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  仪表盘
                </button>
                <button 
                  onClick={() => setView(ViewState.SCREENER)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === ViewState.SCREENER ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  高股息选股
                </button>
              </div>
            </div>

            <div className="flex-1 max-w-md ml-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="输入股票代码/名称 (如 600519)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <i className="fas fa-circle-notch fa-spin text-slate-400 text-xs"></i>
                  ) : (
                    <i className="fas fa-search text-slate-500 text-xs"></i>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Simplified) */}
      <div className="md:hidden border-b border-slate-800 bg-slate-900">
         <div className="flex justify-around p-2">
            <button onClick={() => setView(ViewState.DASHBOARD)} className={`p-2 text-sm ${view === ViewState.DASHBOARD ? 'text-white' : 'text-slate-500'}`}>仪表盘</button>
            <button onClick={() => setView(ViewState.SCREENER)} className={`p-2 text-sm ${view === ViewState.SCREENER ? 'text-white' : 'text-slate-500'}`}>选股器</button>
         </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-white"><i className="fas fa-times"></i></button>
          </div>
        )}

        {view === ViewState.DASHBOARD && (
          <Dashboard 
            watchlist={watchlist} 
            onSelectStock={(stock) => {
              setSelectedStock(stock);
              setView(ViewState.ANALYSIS);
            }}
            onRemoveFromWatchlist={removeFromWatchlist}
          />
        )}

        {view === ViewState.ANALYSIS && selectedStock && (
          <StockAnalysis 
            stock={selectedStock} 
            onAddToWatchlist={addToWatchlist}
            isInWatchlist={!!watchlist.find(s => s.symbol === selectedStock.symbol)}
            onBack={() => setView(ViewState.DASHBOARD)}
          />
        )}

        {view === ViewState.SCREENER && (
          <Screener onAnalyze={handleAnalyzeFromScreener} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm mb-2">
            A股股息侦探 (YieldScout China). 数据基于 AI 搜索生成.
          </p>
          <p className="text-slate-700 text-xs">
            免责声明：本应用提供的信息仅供教育和参考，不构成任何投资建议。
            所有股票数据均通过 AI 实时搜索获取，可能存在延迟或误差。
            投资有风险，入市需谨慎。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;