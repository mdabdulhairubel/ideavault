import React, { useState } from 'react';
import { Youtube, ChevronRight, Hash, Filter } from 'lucide-react';
import { Idea, Channel, Status } from '../types';
import { IdeaCard } from './Home';

interface ChannelsProps {
  ideas: Idea[];
  channels: Channel[];
  statuses: Status[];
  onIdeaClick: (idea: Idea) => void;
}

const ChannelsPage: React.FC<ChannelsProps> = ({ ideas, channels, statuses, onIdeaClick }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [filterStatusId, setFilterStatusId] = useState<string>('all');

  if (selectedChannel) {
    const channelIdeas = ideas.filter(i => 
      i.channelId === selectedChannel.id && 
      (filterStatusId === 'all' || i.statusId === filterStatusId)
    );

    return (
      <div className="animate-in fade-in slide-in-from-right duration-300">
        <button 
          onClick={() => setSelectedChannel(null)}
          className="mb-6 flex items-center text-zinc-400 hover:text-white"
        >
          <ChevronRight size={20} className="rotate-180 mr-1" />
          <span>All Channels</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedChannel.color }}>
              <Youtube size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selectedChannel.name}</h1>
              <p className="text-zinc-500 text-sm">{channelIdeas.length} Active Ideas</p>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-4 mb-4 -mx-1 px-1 no-scrollbar">
          <button
            onClick={() => setFilterStatusId('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatusId === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}
          >
            All
          </button>
          {statuses.map(st => (
            <button
              key={st.id}
              onClick={() => setFilterStatusId(st.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${filterStatusId === st.id ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-500'}`}
            >
              {st.name}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {channelIdeas.map(idea => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              onClick={() => onIdeaClick(idea)}
              channel={selectedChannel}
            />
          ))}
          {channelIdeas.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-zinc-700" size={24} />
              </div>
              <p className="text-zinc-600">No ideas found for this filter</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Channels</h1>
        <p className="text-zinc-500">Organize by brand</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {channels.map(channel => {
          const count = ideas.filter(i => i.channelId === channel.id).length;
          return (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className="relative overflow-hidden group flex flex-col p-6 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 hover:border-zinc-700 transition-all text-left"
            >
              {/* Background gradient hint */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 transition-opacity group-hover:opacity-40" 
                style={{ backgroundColor: channel.color }} 
              />
              
              <div className="flex items-center justify-between mb-4 z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: channel.color }}>
                  <Youtube size={24} />
                </div>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(3, count))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900" />
                  ))}
                </div>
              </div>

              <div className="z-10">
                <h3 className="text-xl font-bold text-white mb-1">{channel.name}</h3>
                <div className="flex items-center text-zinc-500 text-sm font-medium">
                  <Hash size={14} className="mr-1" />
                  <span>{count} Production Ideas</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelsPage;