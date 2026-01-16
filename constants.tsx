
import { Status, Channel } from './types';

export const DEFAULT_STATUSES: Status[] = [
  { id: 'initial', name: 'Initial', color: '#71717a', order: 0 }, // Gray
  { id: 'script', name: 'Script Write', color: '#3b82f6', order: 1 }, // Blue
  { id: 'record', name: 'Record', color: '#f97316', order: 2 }, // Orange
  { id: 'edit', name: 'Edit', color: '#a855f7', order: 3 }, // Purple
  { id: 'upload', name: 'Upload', color: '#22c55e', order: 4 }, // Green
];

export const DEFAULT_CHANNELS: Channel[] = [
  { id: 'ch-1', name: 'Tech Reviews', color: '#ef4444', icon: 'Cpu' },
  { id: 'ch-2', name: 'Vlog Daily', color: '#ec4899', icon: 'Camera' },
];

export const PRIORITY_COLORS = {
  Low: 'text-zinc-400',
  Medium: 'text-yellow-400',
  High: 'text-red-500',
};
