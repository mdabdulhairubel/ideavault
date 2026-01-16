
import React, { useState } from 'react';
import { ChevronRight, Folder, LayoutList } from 'lucide-react';
import { Idea, Status, Channel } from '../types';

interface HomeProps {
  ideas: Idea[];
  statuses: Status[];
  channels: Channel[];
  onIdeaClick: (idea: Idea) => void;
}

const HomePage: React.FC<HomeProps> = ({ ideas, statuses, onIdeaClick, channels }) => {
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  if (selectedStatus) {
    const statusIdeas = ideas.filter(i => i.statusId === selectedStatus.id);
    return (
      <div className="animate-in fade-in slide-in-from-right duration-300">
        <button 
          onClick={() => setSelectedStatus(null)}
          className="mb-6 flex items-center text-zinc-400 hover:text-white"
        >
          <ChevronRight size={20} className="rotate-180 mr-1" />
          <span>Back to Folders</span>
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${selectedStatus.color}20` }}>
            <Folder size={24} style={{ color: selectedStatus.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{selectedStatus.name}</h1>
            <p className="text-zinc-500 text-sm">{statusIdeas.length} ideas in production</p>
          </div>
        </div>

        <div className="space-y-3">
          {statusIdeas.map(idea => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              onClick={() => onIdeaClick(idea)} 
              channelName={channels.find(c => c.id === idea.channelId)?.name || 'Unknown Channel'}
              channelColor={channels.find(c => c.id === idea.channelId)?.color || '#52525b'}
            />
          ))}
          {statusIdeas.length === 0 && (
            <div className="py-20 text-center text-zinc-600 italic">
              Folder is empty. Capture something new!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Workflow</h1>
        <p className="text-zinc-500">Manage your production pipeline</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {statuses.map(status => {
          const count = ideas.filter(i => i.statusId === status.id).length;
          return (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status)}
              className="group flex items-center p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-3xl transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-inner" style={{ backgroundColor: `${status.color}15` }}>
                <Folder size={28} style={{ color: status.color }} fill={`${status.color}40`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-zinc-100">{status.name}</h3>
                <p className="text-zinc-500 text-sm font-medium">{count} items</p>
              </div>
              <ChevronRight className="text-zinc-700 group-hover:text-zinc-400" size={20} />
            </button>
          );
        })}
      </div>

      <div className="mt-12 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center">
          <LayoutList size={18} className="mr-2 text-blue-500" />
          Recent Activity
        </h2>
      </div>
      <div className="space-y-3">
        {ideas.slice(0, 3).map(idea => (
          <IdeaCard 
            key={idea.id} 
            idea={idea} 
            onClick={() => onIdeaClick(idea)}
            channelName={channels.find(c => c.id === idea.channelId)?.name || 'Unknown'}
            channelColor={channels.find(c => c.id === idea.channelId)?.color || '#52525b'}
          />
        ))}
      </div>
    </div>
  );
};

export const IdeaCard: React.FC<{ idea: Idea; onClick: () => void; channelName: string; channelColor: string }> = ({ idea, onClick, channelName, channelColor }) => (
  <button
    onClick={onClick}
    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-700 active:bg-zinc-800/50 transition-all"
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-400" style={{ color: channelColor, border: `1px solid ${channelColor}40` }}>
        {channelName}
      </span>
      {idea.priority === 'High' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />}
    </div>
    <h4 className="font-semibold text-zinc-100 line-clamp-1">{idea.title}</h4>
    {idea.description && <p className="text-zinc-500 text-xs line-clamp-1 mt-1">{idea.description}</p>}
  </button>
);

export default HomePage;
