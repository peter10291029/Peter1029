import React, { useEffect, useState } from 'react';
import { StockData } from '../types';
import ValuationChart from './ValuationChart';
import { generateAnalysisReport } from '../services/geminiService';

interface Props {
  stock: StockData;
  onAddToWatchlist: (stock: StockData) => void;
  isInWatchlist: boolean;
  onBack: () => void;
}

const StockAnalysis: React.FC<Props> = ({ stock, onAddToWatchlist, isInWatchlist, onBack }) => {
  const [report, setReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      setLoadingReport(true);
      const result = await generateAnalysisReport(stock);
      if (isMounted) {
        setReport(result);
        setLoadingReport(false);
      }
    };
    fetchReport();
    return () => { isMounted = false; };
  }, [stock]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <i className="fas fa-arrow-left"></i> 返回
        </button>
        <div className="flex gap-3">
           <button 
            onClick={() => onAddToWatchlist(stock)}
            disabled={isInWatchlist}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              isInWatchlist 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {isInWatchlist ? <><i className="fas fa-check"></i> 已加入自选</> : <><i className="fas fa-plus"></i> 加入自选</>}
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-bold text-white">{stock.symbol}</h1>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-semibold">{stock.sector}</span>
            </div>
            <p className="text-slate-400 text-lg">{stock.name}</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">当前价格</p>
              <p className="text-3xl font-bold text-white">¥{stock.price.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">今日涨跌</p>
              <p className={`text-xl font-bold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div>
            <p className="text-slate-500 text-xs mb-1">股息率 (Yield)</p>
            <p className={`text-2xl font-bold ${stock.dividendYield >= 5 ? 'text-yellow-400' : 'text-white'}`}>
              {stock.dividendYield.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">市盈率 (PE)</p>
            <p className="text-xl font-bold text-white">{stock.pe > 0 ? stock.pe.toFixed(2) : '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">总市值</p>
            <p className="text-xl font-bold text-white">{stock.marketCap}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">估值综合评分</p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stock.valuationScore && stock.valuationScore > 70 ? 'bg-emerald-500' : stock.valuationScore && stock.valuationScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${stock.valuationScore || 50}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-slate-300">{stock.valuationScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Text */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="fas fa-robot text-blue-400"></i> AI 智能分析报告
          </h3>
          {loadingReport ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                {report}
              </div>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-500">
            免责声明：分析内容由AI基于实时搜索数据生成，仅供参考，不构成投资建议。
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-1 space-y-6">
          <ValuationChart data={stock} />
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">公司简介</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {stock.description || "暂无公司简介。"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {stock.industry}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;