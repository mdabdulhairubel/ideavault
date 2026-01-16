
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, LayoutGrid, Calendar as CalendarIcon, Settings as SettingsIcon, Plus, Loader2 } from 'lucide-react';
import { ViewType, Idea, Channel, Status } from './types';
import { supabase } from './services/supabase';
import { DEFAULT_STATUSES } from './constants.tsx';
import HomePage from './pages/Home';
import ChannelsPage from './pages/Channels';
import CalendarPage from './pages/Calendar';
import SettingsPage from './pages/Settings';
import IdeaDetailsPage from './pages/IdeaDetails';
import IdeaModal from './components/IdeaModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Home');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [statuses, setStatuses] = useState<Status[]>(DEFAULT_STATUSES);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [ideasRes, channelsRes, statusesRes] = await Promise.all([
        supabase.from('ideas').select('*').order('created_at', { ascending: false }),
        supabase.from('channels').select('*').order('name'),
        supabase.from('statuses').select('*').order('order')
      ]);

      if (ideasRes.data) {
        setIdeas(ideasRes.data.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          notes: i.notes,
          channelId: i.channel_id,
          statusId: i.status_id,
          scheduledDate: i.scheduled_date,
          priority: i.priority,
          tags: i.tags,
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          isDeleted: i.is_deleted || false
        })));
      }
      if (channelsRes.data) setChannels(channelsRes.data);
      if (statusesRes.data && statusesRes.data.length > 0) setStatuses(statusesRes.data);
    } catch (error) {
      console.error('Data sync error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const ideaSub = supabase.channel('db-ideas').on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => fetchData()).subscribe();
    const channelSub = supabase.channel('db-channels').on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => fetchData()).subscribe();
    const statusSub = supabase.channel('db-statuses').on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, () => fetchData()).subscribe();
    return () => {
      supabase.removeChannel(ideaSub);
      supabase.removeChannel(channelSub);
      supabase.removeChannel(statusSub);
    };
  }, [fetchData]);

  const activeIdeas = useMemo(() => ideas.filter(i => !i.isDeleted), [ideas]);
  const currentDetailIdea = useMemo(() => ideas.find(i => i.id === selectedIdeaId), [ideas, selectedIdeaId]);

  const addOrUpdateIdea = async (newIdea: Partial<Idea>) => {
    const payload = {
      title: newIdea.title,
      description: newIdea.description,
      notes: newIdea.notes,
      channel_id: newIdea.channelId,
      status_id: newIdea.statusId,
      priority: newIdea.priority,
      tags: newIdea.tags || [],
      scheduled_date: newIdea.scheduledDate || null,
      is_deleted: false,
    };

    try {
      if (editingIdea) {
        await supabase.from('ideas').update(payload).eq('id', editingIdea.id);
      } else {
        await supabase.from('ideas').insert([payload]);
      }
      setIsModalOpen(false);
      setEditingIdea(null);
      await fetchData();
    } catch (e) { alert('Save failed. Check connection.'); }
  };

  const deleteIdea = async (id: string) => {
    if (confirm('Move this idea to the Recycle Bin?')) {
      try {
        const { error } = await supabase.from('ideas').update({ is_deleted: true }).eq('id', id);
        if (error) throw error;
        setSelectedIdeaId(null); // Return to list view
        setIsModalOpen(false); // Close modal if open
        await fetchData(); // Refresh local state
      } catch (e) {
        alert('Failed to delete. Try again.');
      }
    }
  };

  const restoreIdea = async (id: string) => {
    try {
      const { error } = await supabase.from('ideas').update({ is_deleted: false }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (e) {
      alert('Restore failed.');
    }
  };

  const permanentlyDeleteIdea = async (id: string) => {
    if (confirm('This cannot be undone. Delete this idea permanently?')) {
      try {
        const { error } = await supabase.from('ideas').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (e) {
        alert('Permanent delete failed.');
      }
    }
  };

  const addChannel = async (channel: Omit<Channel, 'id'>) => {
    try {
      await supabase.from('channels').insert([channel]);
      await fetchData();
    } catch (e) { alert('Add channel failed'); }
  };

  const updateChannel = async (id: string, channel: Partial<Channel>) => {
    try {
      await supabase.from('channels').update(channel).eq('id', id);
      await fetchData();
    } catch (e) { alert('Update channel failed'); }
  };

  const deleteChannel = async (id: string) => {
    if (confirm('Delete this channel and all its ideas?')) {
      await supabase.from('channels').delete().eq('id', id);
      await fetchData();
    }
  };

  const addStatus = async (status: Omit<Status, 'id'>) => {
    try {
      await supabase.from('statuses').insert([status]);
      await fetchData();
    } catch (e) { alert('Add stage failed'); }
  };

  const updateStatus = async (id: string, status: Partial<Status>) => {
    try {
      await supabase.from('statuses').update(status).eq('id', id);
      await fetchData();
    } catch (e) { alert('Update stage failed'); }
  };

  const deleteStatus = async (id: string) => {
    const count = ideas.filter(i => i.statusId === id).length;
    if (count > 0) {
      if (!confirm(`This stage has ${count} ideas. Deleting it will leave those ideas without a stage. Continue?`)) return;
    } else {
      if (!confirm('Delete this stage?')) return;
    }
    await supabase.from('statuses').delete().eq('id', id);
    await fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1115]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const renderContent = () => {
    if (selectedIdeaId && currentDetailIdea) {
      return (
        <IdeaDetailsPage 
          idea={currentDetailIdea}
          channel={channels.find(c => c.id === currentDetailIdea.channelId)}
          status={statuses.find(s => s.id === currentDetailIdea.statusId)}
          onBack={() => setSelectedIdeaId(null)}
          onEdit={() => { setEditingIdea(currentDetailIdea); setIsModalOpen(true); }}
          onDelete={() => deleteIdea(currentDetailIdea.id)}
        />
      );
    }

    switch (currentView) {
      case 'Home': return <HomePage ideas={activeIdeas} statuses={statuses} onIdeaClick={(i) => setSelectedIdeaId(i.id)} channels={channels} />;
      case 'Channels': return <ChannelsPage ideas={activeIdeas} channels={channels} statuses={statuses} onIdeaClick={(i) => setSelectedIdeaId(i.id)} />;
      case 'Calendar': return <CalendarPage ideas={activeIdeas} channels={channels} onIdeaClick={(i) => setSelectedIdeaId(i.id)} />;
      case 'Settings': return (
        <SettingsPage 
          ideas={ideas} 
          channels={channels}
          statuses={statuses}
          restoreIdea={restoreIdea} 
          permanentlyDeleteIdea={permanentlyDeleteIdea} 
          onNavigate={setCurrentView}
          onAddChannel={addChannel}
          onUpdateChannel={updateChannel}
          onDeleteChannel={deleteChannel}
          onAddStatus={addStatus}
          onUpdateStatus={updateStatus}
          onDeleteStatus={deleteStatus}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-[#0F1115] shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-24 pt-12 px-5 no-scrollbar">
        {renderContent()}
      </main>

      {!selectedIdeaId && (
        <>
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={() => { setEditingIdea(null); setIsModalOpen(true); }}
              className="w-16 h-16 bg-[#526DF1] text-white rounded-[22px] flex items-center justify-center shadow-[0_10px_30px_rgba(82,109,241,0.4)] transition-transform active:scale-90 border-4 border-[#0F1115]"
            >
              <Plus size={36} strokeWidth={2.5} />
            </button>
          </div>

          <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#16191F]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-40 max-w-md mx-auto rounded-t-[32px]">
            <NavButton active={currentView === 'Home'} onClick={() => setCurrentView('Home')} icon={<Home size={22} />} label="Home" />
            <NavButton active={currentView === 'Channels'} onClick={() => setCurrentView('Channels')} icon={<LayoutGrid size={22} />} label="Channels" />
            <div className="w-16" />
            <NavButton active={currentView === 'Calendar'} onClick={() => setCurrentView('Calendar')} icon={<CalendarIcon size={22} />} label="Calendar" />
            <NavButton active={currentView === 'Settings'} onClick={() => setCurrentView('Settings')} icon={<SettingsIcon size={22} />} label="Settings" />
          </nav>
        </>
      )}

      <IdeaModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingIdea(null); }}
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
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 ${active ? 'text-[#526DF1]' : 'text-zinc-600'}`}>
    {icon}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default App;
