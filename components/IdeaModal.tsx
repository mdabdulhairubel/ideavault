
import React, { useState, useEffect } from 'react';
import { X, Calendar, Hash, Trash2 } from 'lucide-react';
import { Idea, Channel, Status, Priority } from '../types';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Partial<Idea>) => void;
  onDelete?: () => void;
  channels: Channel[];
  statuses: Status[];
  initialIdea: Idea | null;
}

const IdeaModal: React.FC<IdeaModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, channels, statuses, initialIdea 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channelId, setChannelId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    if (initialIdea) {
      setTitle(initialIdea.title);
      setDescription(initialIdea.description);
      setChannelId(initialIdea.channelId);
      setStatusId(initialIdea.statusId);
      setPriority(initialIdea.priority);
      setScheduledDate(initialIdea.scheduledDate || '');
    } else {
      setTitle('');
      setDescription('');
      setChannelId(channels[0]?.id || '');
      setStatusId(statuses[0]?.id || '');
      setPriority('Medium');
      setScheduledDate('');
    }
  }, [initialIdea, isOpen, channels, statuses]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !channelId || !statusId) return;
    onSave({
      title,
      description,
      channelId,
      statusId,
      priority,
      scheduledDate: scheduledDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 rounded-t-3xl p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{initialIdea ? 'Edit Idea' : 'Capture Idea'}</h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Idea Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-600 outline-none"
          />

          <textarea
            placeholder="Notes (Description, links, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-600 outline-none h-24 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Channel</label>
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl p-3 text-zinc-100 outline-none appearance-none"
              >
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Status</label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl p-3 text-zinc-100 outline-none appearance-none"
              >
                {statuses.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Scheduled Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-zinc-800 border-none rounded-xl p-3 pl-10 text-zinc-100 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Priority</label>
              <div className="flex bg-zinc-800 rounded-xl p-1">
                {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-2 text-xs rounded-lg transition-colors ${priority === p ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-8 space-x-3">
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-shrink-0 bg-red-900/20 text-red-500 p-4 rounded-xl active:bg-red-900/40"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
          >
            {initialIdea ? 'Save Changes' : 'Quick Save'}
          </button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

export default IdeaModal;
