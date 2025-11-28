import React, { useState } from 'react';
import { screenHighDividendStocks } from '../services/geminiService';
import { ScreenerResult, StockData } from '../types';

interface Props {
  onAnalyze: (ticker: string) => void;
}

const Screener: React.FC<Props> = ({ onAnalyze }) => {
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleScreen = async () => {
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    try {
      const data = await screenHighDividendStocks();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-white mb-4">A股高股息侦探</h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-8">
          智能筛选中国A股市场中股息率严格介于 <span className="text-emerald-400 font-bold">5% 至 8%</span> 的优质公司。
          AI将为您寻找分红历史稳定、经营状况良好的标的。
        </p>
        
        <button
          onClick={handleScreen}
          disabled={loading}
          className={`
            px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all
            ${loading 
              ? 'bg-slate-700 text-slate-400 cursor-wait' 
              : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105 active:scale-95 shadow-emerald-500/20'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fas fa-circle-notch fa-spin"></i> 正在扫描市场...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fas fa-search-dollar"></i> 寻找高股息股票
            </span>
          )}
        </button>
      </div>

      {hasSearched && !loading && results.length === 0 && (
        <div className="text-center text-slate-500 py-10">
          未找到符合条件的股票，请稍后再试或调整市场环境。
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4">
          <div className="flex justify-between items-center px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="w-16">代码</div>
            <div className="flex-1">公司/理由</div>
            <div className="w-24 text-right">股息率</div>
            <div className="w-24 text-right">操作</div>
          </div>
          
          {results.map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col md:flex-row items-center gap-4 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center justify-between w-full md:w-auto md:min-w-[120px]">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                  {item.symbol.replace(/\D/g,'').slice(0,2)}
                </div>
                <div className="ml-3">
                  <div className="font-bold text-white">{item.symbol}</div>
                  <div className="text-xs text-slate-400 md:hidden">{item.name}</div>
                </div>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                 <div className="font-medium text-slate-200 hidden md:block">{item.name}</div>
                 <div className="text-xs text-slate-500 mt-1">{item.rationale}</div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-6">
                <div className="text-right">
                  <div className="text-xs text-slate-500 md:hidden">股息率</div>
                  <div className="font-bold text-emerald-400 text-lg">{item.dividendYield.toFixed(2)}%</div>
                </div>
                
                <button
                  onClick={() => onAnalyze(item.symbol)}
                  className="bg-slate-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  详细分析
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Screener;