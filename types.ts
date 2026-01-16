
export type Priority = 'Low' | 'Medium' | 'High';

export interface Status {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Channel {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  channelId: string;
  statusId: string;
  scheduledDate?: string; // ISO string
  priority: Priority;
  tags: string[];
  createdAt: string;
  isDeleted: boolean;
}

export type ViewType = 'Home' | 'Channels' | 'Calendar' | 'Settings';
