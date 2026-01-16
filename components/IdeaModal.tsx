import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2, ChevronDown, AlignLeft } from 'lucide-react';
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
  const [notes, setNotes] = useState('');
  const [channelId, setChannelId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    if (initialIdea) {
      setTitle(initialIdea.title);
      setDescription(initialIdea.description);
      setNotes(initialIdea.notes || '');
      setChannelId(initialIdea.channelId);
      setStatusId(initialIdea.statusId);
      setPriority(initialIdea.priority);
      setScheduledDate(initialIdea.scheduledDate || '');
    } else {
      setTitle(''); 
      setDescription('');
      setNotes('');
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
      notes,
      channelId, 
      statusId, 
      priority, 
      scheduledDate: scheduledDate || undefined 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#16191F] rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8 sticky top-0" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">{initialIdea ? 'Edit Entry' : 'New Idea'}</h2>
          <button onClick={onClose} className="p-2 text-zinc-500"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest">Topic Title</label>
            <input
              autoFocus
              type="text"
              placeholder="What's the topic?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border-none rounded-2xl p-4 text-lg font-bold placeholder-zinc-700 outline-none focus:ring-2 focus:ring-[#00db9a]/50"
            />
          </section>

          <section>
            <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest">Short Summary</label>
            <textarea
              placeholder="Brief description for the pipeline card..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border-none rounded-2xl p-4 text-sm font-medium placeholder-zinc-700 outline-none focus:ring-2 focus:ring-[#00db9a]/50 min-h-[80px] resize-none"
            />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest">Channel</label>
              <div className="relative">
                <select
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full bg-zinc-900 border-none rounded-2xl p-3 px-4 text-sm font-bold appearance-none outline-none"
                >
                  {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest">Stage</label>
              <div className="relative">
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full bg-zinc-900 border-none rounded-2xl p-3 px-4 text-sm font-bold appearance-none outline-none"
                >
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest">Date</label>
              <div className="flex items-center bg-zinc-900 rounded-2xl p-3 px-4">
                <Calendar size={18} className="text-[#00db9a] mr-3" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold w-full outline-none invert dark:invert-0"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest">Priority</label>
              <div className="flex bg-zinc-900 rounded-2xl p-1">
                {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${priority === p ? 'bg-[#00db9a] text-black shadow-lg shadow-[#00db9a]/20' : 'text-zinc-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Production Notes / Script</label>
              <AlignLeft size={14} className="text-zinc-700" />
            </div>
            <textarea
              placeholder="Start drafting your script or list equipment needs here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border-none rounded-2xl p-4 text-sm font-medium placeholder-zinc-700 outline-none focus:ring-2 focus:ring-[#00db9a]/50 min-h-[160px] leading-relaxed"
            />
          </section>
        </div>

        <div className="flex items-center mt-10 space-x-4 sticky bottom-0 pt-4 bg-[#16191F]">
          {onDelete && (
            <button onClick={onDelete} className="p-4 bg-red-500/10 text-red-500 rounded-3xl active:scale-90 transition-transform">
              <Trash2 size={24} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 bg-[#00db9a] text-black font-black py-5 rounded-[28px] shadow-xl shadow-[#00db9a]/30 active:scale-95 transition-all disabled:opacity-30"
          >
            {initialIdea ? 'Update Production' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaModal;