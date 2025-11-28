import React from 'react';
import { StockData } from '../types';

interface Props {
  stock: StockData;
  onRemove?: (symbol: string) => void;
  onSelect: (stock: StockData) => void;
}

const StockCard: React.FC<Props> = ({ stock, onRemove, onSelect }) => {
  const isPositive = stock.changePercent >= 0;

  return (
    <div 
      className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer group relative shadow-lg"
      onClick={() => onSelect(stock)}
    >
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(stock.symbol); }}
          className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i className="fas fa-trash"></i>
        </button>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-white">{stock.symbol}</h3>
          <p className="text-xs text-slate-400 truncate max-w-[150px]">{stock.name}</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          <div className="font-bold text-lg">¥{stock.price.toFixed(2)}</div>
          <div className="text-xs font-medium flex items-center justify-end">
            {isPositive ? <i className="fas fa-caret-up mr-1"></i> : <i className="fas fa-caret-down mr-1"></i>}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
        <div>
          <div className="text-xs text-slate-500 mb-1">股息率</div>
          <div className={`font-semibold ${stock.dividendYield >= 5 ? 'text-yellow-400' : 'text-slate-200'}`}>
            {stock.dividendYield.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">市盈率 (PE)</div>
          <div className="font-semibold text-slate-200">{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;