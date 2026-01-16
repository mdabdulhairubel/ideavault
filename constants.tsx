import { Status, Channel } from './types';

export const DEFAULT_STATUSES: Omit<Status, 'id'>[] = [
  { name: 'Initial', color: '#71717a', order: 0 },
  { name: 'Script Write', color: '#3b82f6', order: 1 },
  { name: 'Record', color: '#f97316', order: 2 },
  { name: 'Edit', color: '#a855f7', order: 3 },
  { name: 'Upload', color: '#22c55e', order: 4 },
];

export const DEFAULT_CHANNELS: Omit<Channel, 'id'>[] = [
  { name: 'Main Channel', color: '#00db9a', icon: 'Youtube' },
  { name: 'Vlogs', color: '#ec4899', icon: 'Camera' },
];

export const PRIORITY_COLORS = {
  Low: 'text-zinc-400',
  Medium: 'text-yellow-400',
  High: 'text-red-500',
};