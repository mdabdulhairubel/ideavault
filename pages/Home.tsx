
import React, { useState } from 'react';
import { ChevronRight, FolderClosed, MoreVertical, LayoutGrid } from 'lucide-react';
import { Idea, Status, Channel } from '../types';

interface HomeProps {
  ideas: Idea[];
  statuses: Status[];
  channels: Channel[];
  onIdeaClick: (idea: Idea) => void;
}

const HomePage: React.FC<HomeProps> = ({ ideas, statuses, onIdeaClick, channels }) => {
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);

  if (viewingStatus) {
    const filtered = ideas.filter(i => i.statusId === viewingStatus.id);
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <header className="flex items-center space-x-3 mb-8">
          <button onClick={() => setViewingStatus(null)} className="p-2 -ml-2 text-zinc-400"><ChevronRight className="rotate-180" /></button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${viewingStatus.color}20` }}>
            <FolderClosed size={20} style={{ color: viewingStatus.color }} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{viewingStatus.name}</h2>
            <p className="text-xs text-zinc-500 font-medium">{filtered.length} Production Items</p>
          </div>
        </header>
        <div className="space-y-3">
          {filtered.map(idea => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              onClick={() => onIdeaClick(idea)} 
              channel={channels.find(c => c.id === idea.channelId)} 
            />
          ))}
          {filtered.length === 0 && <div className="py-20 text-center text-zinc-600 text-sm italic">This stage is clear</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">CreatorFlow</h1>
          <p className="text-zinc-500 font-medium">Production Pipeline</p>
        </div>
        <div className="w-12 h-12 rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center">
          <LayoutGrid size={20} className="text-[#526DF1]" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {statuses.map(st => {
          const count = ideas.filter(i => i.statusId === st.id).length;
          return (
            <button
              key={st.id}
              onClick={() => setViewingStatus(st)}
              className="flex items-center p-5 bg-[#1C1F26] rounded-[28px] border border-white/5 shadow-lg group active:scale-[0.98] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4" style={{ backgroundColor: `${st.color}10` }}>
                <FolderClosed size={28} style={{ color: st.color }} fill={`${st.color}30`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-lg text-white">{st.name}</h4>
                <p className="text-xs text-zinc-500 font-semibold">{count} Items in Folder</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-zinc-600 group-hover:text-white">
                <ChevronRight size={18} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-12 mb-4">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-1">Recent Ideas</h3>
      </div>
      <div className="space-y-3">
        {ideas.slice(0, 3).map(i => (
          <IdeaCard 
            key={i.id} 
            idea={i} 
            onClick={() => onIdeaClick(i)} 
            channel={channels.find(c => c.id === i.channelId)} 
          />
        ))}
      </div>
    </div>
  );
};

export const IdeaCard: React.FC<{ idea: Idea; onClick: () => void; channel?: Channel }> = ({ idea, onClick, channel }) => (
  <button 
    onClick={onClick}
    className="w-full bg-[#1C1F26] p-4 rounded-2xl border border-white/5 text-left active:bg-[#252A34] transition-colors flex items-center justify-between"
  >
    <div className="min-w-0 flex-1">
      <div className="flex items-center space-x-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: channel?.color || '#555' }} />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide truncate">{channel?.name || 'Channel'}</span>
      </div>
      <h5 className="font-bold text-white truncate text-base">{idea.title}</h5>
    </div>
    <MoreVertical size={16} className="text-zinc-700" />
  </button>
);

export default HomePage;
