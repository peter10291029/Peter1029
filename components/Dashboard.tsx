import React from 'react';
import { StockData } from '../types';
import StockCard from './StockCard';

interface Props {
  watchlist: StockData[];
  onSelectStock: (stock: StockData) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
}

const Dashboard: React.FC<Props> = ({ watchlist, onSelectStock, onRemoveFromWatchlist }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">市场概览</h2>
          <p className="text-slate-400 text-sm">您的自选股及关键指标实时监控。</p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          <i className="fas fa-clock mr-2"></i>
          市场状态: <span className="text-emerald-400 font-semibold">实时分析中</span>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
            <i className="fas fa-plus"></i>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">暂无自选股</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            使用上方搜索栏查找股票，或使用“高股息选股”功能发现 5%-8% 股息率的优质标的。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((stock) => (
            <StockCard 
              key={stock.symbol} 
              stock={stock} 
              onSelect={onSelectStock}
              onRemove={onRemoveFromWatchlist}
            />
          ))}
        </div>
      )}
      
      <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-6 flex items-start gap-4">
        <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
          <i className="fas fa-lightbulb text-xl"></i>
        </div>
        <div>
          <h4 className="font-semibold text-blue-100 mb-1">策略提示：高股息陷阱与机会</h4>
          <p className="text-sm text-blue-200/70">
            5%-8% 的股息率通常代表了收益与风险的平衡。
            过高的股息率（>8%）可能意味着市场对公司前景感到悲观（导致股价大幅下跌）或分红不可持续。
            投资前请务必检查派息比率和公司现金流。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;