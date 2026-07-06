import React from 'react';

const defaultColors = {
  // Common
  new: 'bg-sky-50 text-sky-700 border-sky-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  'in progress': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  
  // Leads
  contacted: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  demo: 'bg-amber-50 text-amber-700 border-amber-100',
  negotiation: 'bg-violet-50 text-violet-700 border-violet-100',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'closed_won': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'closed won': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  lost: 'bg-rose-50 text-rose-700 border-rose-100',
  'closed_lost': 'bg-rose-50 text-rose-700 border-rose-100',
  'closed lost': 'bg-rose-50 text-rose-700 border-rose-100',
  'not interested': 'bg-slate-50 text-slate-700 border-slate-100',
  
  // Customers
  retail: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  dealer: 'bg-violet-50 text-violet-700 border-violet-100',
  
  // Orders
  processing: 'bg-blue-50 text-blue-700 border-blue-100',
  'shipped/ready': 'bg-violet-50 text-violet-700 border-violet-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  
  // Payment
  unpaid: 'bg-rose-50 text-rose-700 border-rose-100',
  'partially paid': 'bg-amber-50 text-amber-700 border-amber-100',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  
  // Inventory
  'in stock': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'raw material': 'bg-amber-50 text-amber-700 border-amber-100',
  'finished good': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'low stock': 'bg-amber-50 text-amber-700 border-amber-100',
  'out of stock': 'bg-rose-50 text-rose-700 border-rose-100',
  
  // Invoice / Quotation
  draft: 'bg-slate-50 text-slate-700 border-slate-100',
  sent: 'bg-blue-50 text-blue-700 border-blue-100',
  overdue: 'bg-rose-50 text-rose-700 border-rose-100',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  expired: 'bg-slate-50 text-slate-700 border-slate-100',
};

const getStatusColor = (status) => {
  if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
  const key = status.toString().toLowerCase();
  return defaultColors[key] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const StatusBadge = ({ status, label }) => {
  const displayLabel = label || status;
  const colorClass = getStatusColor(status);
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
