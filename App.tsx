import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, LayoutGrid, Calendar as CalendarIcon, Settings as SettingsIcon, Plus, Loader2 } from 'lucide-react';
import { ViewType, Idea, Channel, Status, UserProfile } from './types.ts';
import { supabase } from './services/supabase.ts';
import { DEFAULT_STATUSES, DEFAULT_CHANNELS } from './constants.tsx';
import HomePage from './pages/Home.tsx';
import ChannelsPage from './pages/Channels.tsx';
import CalendarPage from './pages/Calendar.tsx';
import SettingsPage from './pages/Settings.tsx';
import IdeaDetailsPage from './pages/IdeaDetails.tsx';
import AuthPage from './pages/Auth.tsx';
import IdeaModal from './components/IdeaModal.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewType>('Home');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    ideaId: string | null;
    type: 'soft' | 'permanent' | 'empty-bin';
  }>({ isOpen: false, ideaId: null, type: 'soft' });

  const finalStatusId = useMemo(() => {
    if (statuses.length === 0) return '';
    return [...statuses].sort((a, b) => b.order - a.order)[0].id;
  }, [statuses]);

  const fetchData = useCallback(async (userId: string) => {
    try {
      let [ideasRes, channelsRes, statusesRes, profileRes] = await Promise.all([
        supabase.from('ideas').select('*').order('created_at', { ascending: false }),
        supabase.from('channels').select('*').order('name'),
        supabase.from('statuses').select('*').order('order'),
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      ]);

      if (statusesRes.data && statusesRes.data.length === 0) {
        const { data: newStatuses } = await supabase.from('statuses').insert(
          DEFAULT_STATUSES.map(s => ({ ...s, user_id: userId }))
        ).select();
        if (newStatuses) statusesRes.data = newStatuses;
      }

      if (channelsRes.data && channelsRes.data.length === 0) {
        const { data: newChannels } = await supabase.from('channels').insert(
          DEFAULT_CHANNELS.map(c => ({ ...c, user_id: userId }))
        ).select();
        if (newChannels) channelsRes.data = newChannels;
      }

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
          tags: i.tags || [],
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          completedAt: i.completed_at,
          isDeleted: Boolean(i.is_deleted)
        })));
      }
      if (channelsRes.data) setChannels(channelsRes.data);
      if (statusesRes.data) setStatuses(statusesRes.data);
      if (profileRes.data) {
        setUserProfile({
          id: profileRes.data.id,
          displayName: profileRes.data.display_name || 'Production Hub',
          avatarUrl: profileRes.data.avatar_url
        });
      }
    } catch (error) {
      console.error('Data sync error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoading(true);
        fetchData(session.user.id);
      } else {
        setIdeas([]);
        setChannels([]);
        setStatuses([]);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session) return;
    try {
      const payload: any = {};
      if (updates.displayName) payload.display_name = updates.displayName;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      payload.updated_at = new Date().toISOString();

      await supabase.from('profiles').update(payload).eq('id', session.user.id);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (e) { console.error(e); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session && !isLoading) {
    return <AuthPage />;
  }

  if (isLoading || (session && statuses.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1115]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#00db9a] mx-auto mb-4" size={48} strokeWidth={3} />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Syncing Studio...</p>
        </div>
      </div>
    );
  }

  const activeIdeas = ideas.filter(i => !i.isDeleted);
  const currentDetailIdea = ideas.find(i => i.id === selectedIdeaId);

  const addOrUpdateIdea = async (newIdea: Partial<Idea>) => {
    if (!session) return;
    const isNowUploaded = newIdea.statusId === finalStatusId;
    const payload: any = {
      title: newIdea.title,
      description: newIdea.description,
      notes: newIdea.notes,
      channel_id: newIdea.channelId,
      status_id: newIdea.statusId,
      priority: newIdea.priority,
      tags: newIdea.tags || [],
      scheduled_date: newIdea.scheduledDate || null,
      is_deleted: false,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };

    if (editingIdea) {
      const wasAlreadyUploaded = editingIdea.statusId === finalStatusId;
      if (isNowUploaded && !wasAlreadyUploaded) payload.completed_at = new Date().toISOString();
      else if (!isNowUploaded && wasAlreadyUploaded) payload.completed_at = null;
    } else if (isNowUploaded) {
      payload.completed_at = new Date().toISOString();
    }

    try {
      if (editingIdea) await supabase.from('ideas').update(payload).eq('id', editingIdea.id);
      else await supabase.from('ideas').insert([payload]);
      setIsModalOpen(false);
      setEditingIdea(null);
      await fetchData(session.user.id);
    } catch (e) { console.error(e); }
  };

  const handleConfirmAction = async () => {
    if (!session) return;
    const { ideaId, type } = confirmModal;
    if (type === 'soft' && ideaId) await supabase.from('ideas').update({ is_deleted: true }).eq('id', ideaId);
    else if (type === 'permanent' && ideaId) await supabase.from('ideas').delete().eq('id', ideaId);
    else if (type === 'empty-bin') await supabase.from('ideas').delete().eq('is_deleted', true);
    setConfirmModal({ isOpen: false, ideaId: null, type: 'soft' });
    setIsModalOpen(false);
    setSelectedIdeaId(null);
    await fetchData(session.user.id);
  };

  const renderContent = () => {
    if (selectedIdeaId && currentDetailIdea) {
      return (
        <IdeaDetailsPage 
          idea={currentDetailIdea}
          channel={channels.find(c => c.id === currentDetailIdea.channelId)}
          status={statuses.find(s => s.id === currentDetailIdea.statusId)}
          onBack={() => setSelectedIdeaId(null)}
          onEdit={() => { setEditingIdea(currentDetailIdea); setIsModalOpen(true); }}
          onDelete={() => setConfirmModal({ isOpen: true, ideaId: currentDetailIdea.id, type: 'soft' })}
        />
      );
    }

    switch (currentView) {
      case 'Home': return <HomePage userProfile={userProfile || { id: '', displayName: 'User' }} ideas={activeIdeas} statuses={statuses} onIdeaClick={(i) => setSelectedIdeaId(i.id)} channels={channels} />;
      case 'Channels': return <ChannelsPage ideas={activeIdeas} channels={channels} statuses={statuses} onIdeaClick={(i) => setSelectedIdeaId(i.id)} />;
      case 'Calendar': return <CalendarPage ideas={activeIdeas} channels={channels} onIdeaClick={(i) => setSelectedIdeaId(i.id)} />;
      case 'Settings': return (
        <SettingsPage 
          userProfile={userProfile || { id: '', displayName: 'User' }}
          updateProfile={updateProfile}
          handleSignOut={handleSignOut}
          ideas={ideas} 
          channels={channels}
          statuses={statuses}
          restoreIdea={(id) => supabase.from('ideas').update({ is_deleted: false }).eq('id', id).then(() => fetchData(session.user.id))} 
          permanentlyDeleteIdea={(id) => setConfirmModal({ isOpen: true, ideaId: id, type: 'permanent' })} 
          emptyBin={() => setConfirmModal({ isOpen: true, ideaId: null, type: 'empty-bin' })}
          onNavigate={setCurrentView}
          onAddChannel={(c) => supabase.from('channels').insert([{...c, user_id: session.user.id}]).then(() => fetchData(session.user.id))}
          onUpdateChannel={(id, c) => supabase.from('channels').update(c).eq('id', id).then(() => fetchData(session.user.id))}
          onDeleteChannel={(id) => supabase.from('channels').delete().eq('id', id).then(() => fetchData(session.user.id))}
          onAddStatus={(s) => supabase.from('statuses').insert([{...s, user_id: session.user.id}]).then(() => fetchData(session.user.id))}
          onUpdateStatus={(id, s) => supabase.from('statuses').update(s).eq('id', id).then(() => fetchData(session.user.id))}
          onDeleteStatus={(id) => supabase.from('statuses').delete().eq('id', id).then(() => fetchData(session.user.id))}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-[#0F1115] shadow-2xl overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24 pt-12 px-5 no-scrollbar">
        {renderContent()}
      </main>
      {!selectedIdeaId && (
        <>
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
            <button onClick={() => { setEditingIdea(null); setIsModalOpen(true); }} className="w-16 h-16 neon-btn text-black rounded-[28px] flex items-center justify-center border-4 border-[#0F1115] active:scale-90 transition-transform">
              <Plus size={36} strokeWidth={2.5} />
            </button>
          </div>
          <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#16191F]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-40 max-w-md mx-auto rounded-t-[40px]">
            <NavButton active={currentView === 'Home'} onClick={() => setCurrentView('Home')} icon={<Home size={22} />} label="Home" />
            <NavButton active={currentView === 'Channels'} onClick={() => setCurrentView('Channels')} icon={<LayoutGrid size={22} />} label="Channels" />
            <div className="w-16" />
            <NavButton active={currentView === 'Calendar'} onClick={() => setCurrentView('Calendar')} icon={<CalendarIcon size={22} />} label="Calendar" />
            <NavButton active={currentView === 'Settings'} onClick={() => setCurrentView('Settings')} icon={<SettingsIcon size={22} />} label="Settings" />
          </nav>
        </>
      )}
      <IdeaModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingIdea(null); }} onSave={addOrUpdateIdea} onDelete={editingIdea ? () => setConfirmModal({ isOpen: true, ideaId: editingIdea.id, type: 'soft' }) : undefined} channels={channels} statuses={statuses} initialIdea={editingIdea} />
      <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.type === 'soft' ? 'Move to Bin?' : confirmModal.type === 'empty-bin' ? 'Empty Bin?' : 'Delete Permanently?'} message={confirmModal.type === 'soft' ? 'This idea will be hidden from the pipeline. You can restore it later.' : confirmModal.type === 'empty-bin' ? 'All items in the recycle bin will be deleted forever.' : 'This action cannot be undone. The idea will be lost forever.'} confirmLabel={confirmModal.type === 'soft' ? 'Move to Bin' : confirmModal.type === 'empty-bin' ? 'Empty Bin' : 'Delete Forever'} onConfirm={handleConfirmAction} onCancel={() => setConfirmModal({ isOpen: false, ideaId: null, type: 'soft' })} />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 transition-all active:scale-90 ${active ? 'text-[#00db9a]' : 'text-zinc-600 hover:text-zinc-400'}`}>
    <div className={active ? 'drop-shadow-[0_0_8px_rgba(0,219,154,0.5)]' : ''}>
      {icon}
    </div>
    <span className="text-[10px] font-bold tracking-tight uppercase tracking-widest">{label}</span>
  </button>
);

export default App;