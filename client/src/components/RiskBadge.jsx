import React from 'react';

const RiskBadge = ({ level = 'LOW', score }) => {
  let badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotStyles = 'bg-emerald-500';

  switch (level?.toUpperCase()) {
    case 'MEDIUM':
      badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
      dotStyles = 'bg-amber-500';
      break;
    case 'HIGH':
      badgeStyles = 'bg-orange-50 text-orange-700 border-orange-200';
      dotStyles = 'bg-orange-500';
      break;
    case 'CRITICAL':
      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
      dotStyles = 'bg-rose-500 animate-pulse';
      break;
    default: // LOW
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotStyles = 'bg-emerald-500';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${badgeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`}></span>
      {level}
      {score !== undefined && score !== null ? ` (${score})` : ''}
    </span>
  );
};

export default RiskBadge;
