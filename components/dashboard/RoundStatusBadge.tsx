import React from 'react';
import { Clock, AlertCircle, CheckCircle, Lock, Zap, X } from 'lucide-react';

type RoundStatus = 'draft' | 'scheduled' | 'upcoming' | 'active' | 'completed' | 'finalized' | 'cancelled';

interface RoundStatusBadgeProps {
  status: RoundStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<RoundStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  draft: {
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Draft',
  },
  scheduled: {
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: <Clock className="w-3 h-3" />,
    label: 'Scheduled',
  },
  upcoming: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    icon: <Zap className="w-3 h-3" />,
    label: 'Upcoming',
  },
  active: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Active',
  },
  completed: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Completed',
  },
  finalized: {
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    icon: <Lock className="w-3 h-3" />,
    label: 'Finalized',
  },
  cancelled: {
    color: 'text-red-600',
    bg: 'bg-red-100',
    icon: <X className="w-3 h-3" />,
    label: 'Cancelled',
  },
};

export const RoundStatusBadge: React.FC<RoundStatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-2.5 py-1.5 text-xs',
    lg: 'px-3 py-2 text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.bg} ${config.color} ${sizeClasses[size]}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
