import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StockData } from '../types';

interface Props {
  data: StockData;
}

const ValuationChart: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: '市盈率 PE', value: data.pe, benchmark: 20 }, // Simplified benchmark
    { name: '市净率 PB', value: data.pb, benchmark: 3 },
    { name: '市销率 PS', value: data.ps, benchmark: 5 },
  ];

  return (
    <div className="h-64 w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 mb-4">估值指标分析</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={70} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value > entry.benchmark ? '#ef4444' : '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
        <span>* 数值越低通常代表估值越有优势</span>
        <div className="flex gap-2">
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> 合理/低估</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> 偏高/高估</span>
        </div>
      </div>
    </div>
  );
};

export default ValuationChart;