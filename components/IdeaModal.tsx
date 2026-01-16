import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, AlignLeft, Check, Loader2 } from 'lucide-react';
import { Idea, Channel, Status, Priority } from '../types.ts';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Partial<Idea>) => Promise<void>;
  onDelete?: () => void;
  channels: Channel[];
  statuses: Status[];
  initialIdea: Idea | null;
}

const IdeaModal: React.FC<IdeaModalProps> = ({ 
  isOpen, onClose, onSave, channels, statuses, initialIdea 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [channelId, setChannelId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Advanced keyboard detection within the modal
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        // Threshold check: if viewport height drops significantly, keyboard is likely open
        const isLikelyKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardVisible(isLikelyKeyboard);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
    };
  }, []);

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

  const handleSave = async () => {
    if (!title.trim() || !channelId || !statusId || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSave({ 
        title, 
        description, 
        notes,
        channelId, 
        statusId, 
        priority, 
        scheduledDate: scheduledDate || undefined 
      });
      onClose();
    } catch (error) {
      console.error("Failed to save idea:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[150] flex justify-center px-4 pb-4 transition-all duration-300 ${isKeyboardVisible ? 'items-start pt-10' : 'items-end'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-md bg-[#16191F] rounded-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/10 flex flex-col overflow-hidden transition-all ${isKeyboardVisible ? 'h-[95vh]' : 'max-h-[90vh]'}`}>
        
        {/* Handle Bar */}
        <div className="flex-none pt-4 pb-2">
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">
              {initialIdea ? 'Update Content' : 'New Production'}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <section>
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Headline</label>
              <input
                type="text"
                placeholder="Enter video topic..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-lg font-bold placeholder-zinc-700 outline-none focus:ring-2 focus:ring-[#00db9a]/50 transition-all"
              />
            </section>

            <section>
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Brief Description</label>
              <textarea
                placeholder="What is this video about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm font-medium placeholder-zinc-700 outline-none focus:ring-2 focus:ring-[#00db9a]/50 min-h-[80px] resize-none"
              />
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Channel</label>
                <div className="relative">
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-3 px-4 text-sm font-bold appearance-none outline-none focus:ring-1 focus:ring-white/10"
                  >
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
              </div>
              <div className="relative">
                <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Pipeline Stage</label>
                <div className="relative">
                  <select
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-3 px-4 text-sm font-bold appearance-none outline-none focus:ring-1 focus:ring-white/10"
                  >
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Launch Date</label>
                <div className="flex items-center bg-zinc-900 border border-white/5 rounded-2xl p-3 px-4">
                  <Calendar size={18} className="text-[#00db9a] mr-3" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold w-full outline-none text-white focus:ring-0"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Priority</label>
                <div className="flex bg-zinc-900 border border-white/5 rounded-2xl p-1">
                  {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${priority === p ? 'bg-[#00db9a] text-black shadow-lg shadow-[#00db9a]/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section className="pb-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Script / Notes</label>
                <AlignLeft size={14} className="text-zinc-700" />
              </div>
              <textarea
                placeholder="Outline your video structure here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm font-medium placeholder-zinc-700 outline-none focus:ring-2 focus:ring-[#00db9a]/50 min-h-[160px] leading-relaxed"
              />
            </section>
          </div>
        </div>

        {/* Fixed Action Bar at bottom - Hidden when keyboard is visible to prevent overlap */}
        {!isKeyboardVisible && (
          <div className="flex-none p-6 pt-4 bg-[#16191F] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom duration-300">
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSubmitting}
              className="w-full h-14 bg-[#00db9a] text-black font-black rounded-[22px] shadow-lg shadow-[#00db9a]/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center space-x-3 group"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Check size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm uppercase tracking-widest font-black">
                    {initialIdea ? 'Save Changes' : 'Launch Idea'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaModal;