import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0';
  return `$${Number(amount).toLocaleString('en-US')}`;
};

export const getStatusColor = (status) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    'partially-paid': 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
