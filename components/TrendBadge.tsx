import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Props {
  status: 'improving' | 'maintaining' | 'declining' | 'new';
  percent: number;
}

export const TrendBadge: React.FC<Props> = ({ status, percent }) => {
  const styles = {
    improving: 'bg-green-500/10 text-green-500 border-green-500/20',
    maintaining: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    declining: 'bg-red-500/10 text-red-500 border-red-500/20',
    new: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  const icons = {
    improving: <ArrowUpRight size={14} className="mr-1" />,
    maintaining: <Minus size={14} className="mr-1" />,
    declining: <ArrowDownRight size={14} className="mr-1" />,
    new: null,
  };

  const labels = {
    improving: 'Mejorando',
    maintaining: 'Estable',
    declining: 'Bajó',
    new: 'Nuevo',
  };

  const displayPercent = percent > 0 ? `+${percent}%` : `${percent}%`;

  return (
    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      <span>{status === 'new' ? 'Sin datos' : `${labels[status]} (${displayPercent})`}</span>
    </div>
  );
};
