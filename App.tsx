
import React, { useState, useEffect, useMemo } from 'react';
import { Home, LayoutGrid, Calendar as CalendarIcon, Settings as SettingsIcon, Plus } from 'lucide-react';
import { ViewType, Idea, Channel, Status } from './types';
import { storage } from './services/storage';
import { DEFAULT_STATUSES, DEFAULT_CHANNELS } from './constants.tsx';
import HomePage from './pages/Home';
import ChannelsPage from './pages/Channels';
import CalendarPage from './pages/Calendar';
import SettingsPage from './pages/Settings';
import IdeaModal from './components/IdeaModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Home');
  const [ideas, setIdeas] = useState<Idea[]>(() => storage.get(storage.keys.IDEAS, []));
  const [channels, setChannels] = useState<Channel[]>(() => storage.get(storage.keys.CHANNELS, DEFAULT_CHANNELS));
  const [statuses, setStatuses] = useState<Status[]>(() => storage.get(storage.keys.STATUSES, DEFAULT_STATUSES));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  useEffect(() => {
    storage.set(storage.keys.IDEAS, ideas);
  }, [ideas]);

  useEffect(() => {
    storage.set(storage.keys.CHANNELS, channels);
  }, [channels]);

  useEffect(() => {
    storage.set(storage.keys.STATUSES, statuses);
  }, [statuses]);

  const activeIdeas = useMemo(() => ideas.filter(i => !i.isDeleted), [ideas]);

  const addOrUpdateIdea = (newIdea: Partial<Idea>) => {
    if (editingIdea) {
      setIdeas(prev => prev.map(i => i.id === editingIdea.id ? { ...i, ...newIdea } as Idea : i));
    } else {
      const idea: Idea = {
        id: crypto.randomUUID(),
        title: newIdea.title || 'Untitled Idea',
        description: newIdea.description || '',
        channelId: newIdea.channelId || channels[0]?.id || '',
        statusId: newIdea.statusId || statuses[0]?.id || '',
        priority: newIdea.priority || 'Medium',
        tags: newIdea.tags || [],
        createdAt: new Date().toISOString(),
        scheduledDate: newIdea.scheduledDate,
        isDeleted: false,
      };
      setIdeas(prev => [idea, ...prev]);
    }
    setIsModalOpen(false);
    setEditingIdea(null);
  };

  const deleteIdea = (id: string) => {
    if (confirm('Move this idea to trash?')) {
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, isDeleted: true } : i));
    }
  };

  const restoreIdea = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, isDeleted: false } : i));
  };

  const permanentlyDeleteIdea = (id: string) => {
    if (confirm('Permanently delete this idea? This cannot be undone.')) {
      setIdeas(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleEditClick = (idea: Idea) => {
    setEditingIdea(idea);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-zinc-950">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 pt-8 px-4 scroll-smooth">
        {currentView === 'Home' && (
          <HomePage 
            ideas={activeIdeas} 
            statuses={statuses} 
            channels={channels}
            onIdeaClick={handleEditClick}
          />
        )}
        {currentView === 'Channels' && (
          <ChannelsPage 
            ideas={activeIdeas} 
            channels={channels} 
            statuses={statuses}
            onIdeaClick={handleEditClick}
          />
        )}
        {currentView === 'Calendar' && (
          <CalendarPage 
            ideas={activeIdeas} 
            channels={channels}
            onIdeaClick={handleEditClick}
          />
        )}
        {currentView === 'Settings' && (
          <SettingsPage 
            channels={channels} 
            setChannels={setChannels}
            statuses={statuses}
            setStatuses={setStatuses}
            ideas={ideas}
            restoreIdea={restoreIdea}
            permanentlyDeleteIdea={permanentlyDeleteIdea}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => {
            setEditingIdea(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-900/40 border-4 border-zinc-950 transition-transform active:scale-90"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 flex items-center justify-around px-2 z-40 max-w-md mx-auto">
        <NavButton 
          active={currentView === 'Home'} 
          onClick={() => setCurrentView('Home')} 
          icon={<Home size={22} />} 
          label="Home" 
        />
        <NavButton 
          active={currentView === 'Channels'} 
          onClick={() => setCurrentView('Channels')} 
          icon={<LayoutGrid size={22} />} 
          label="Channels" 
        />
        
        {/* Placeholder for FAB Space */}
        <div className="w-16" />

        <NavButton 
          active={currentView === 'Calendar'} 
          onClick={() => setCurrentView('Calendar')} 
          icon={<CalendarIcon size={22} />} 
          label="Schedule" 
        />
        <NavButton 
          active={currentView === 'Settings'} 
          onClick={() => setCurrentView('Settings')} 
          icon={<SettingsIcon size={22} />} 
          label="Settings" 
        />
      </nav>

      <IdeaModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingIdea(null);
        }}
        onSave={addOrUpdateIdea}
        onDelete={editingIdea ? () => deleteIdea(editingIdea.id) : undefined}
        channels={channels}
        statuses={statuses}
        initialIdea={editingIdea}
      />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 transition-colors ${active ? 'text-blue-500' : 'text-zinc-500'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;
