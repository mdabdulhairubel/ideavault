import React, { useState, useRef } from 'react';
import { 
  User, Youtube, Workflow, Trash2, 
  Shield, Bell, Palette, HelpCircle, 
  RotateCcw, LogOut, ChevronRight, XCircle,
  Plus, Edit2, Check, X, FolderClosed, Layers, Sparkles, Camera, Loader2, Lock, ShieldCheck
} from 'lucide-react';
import { Idea, ViewType, Channel, Status, UserProfile } from '../types';
import { supabase } from '../services/supabase';

interface SettingsProps {
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  handleSignOut: () => Promise<void>;
  ideas: Idea[];
  channels: Channel[];
  statuses: Status[];
  restoreIdea: (id: string) => void;
  permanentlyDeleteIdea: (id: string) => void;
  emptyBin: () => void;
  onNavigate: (view: ViewType) => void;
  onAddChannel: (channel: Omit<Channel, 'id'>) => void;
  onUpdateChannel: (id: string, channel: Partial<Channel>) => void;
  onDeleteChannel: (id: string) => void;
  onAddStatus: (status: Omit<Status, 'id'>) => void;
  onUpdateStatus: (id: string, status: Partial<Status>) => void;
  onDeleteStatus: (id: string) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ 
  userProfile, updateProfile, handleSignOut, ideas, channels, statuses, restoreIdea, permanentlyDeleteIdea, emptyBin, onNavigate,
  onAddChannel, onUpdateChannel, onDeleteChannel,
  onAddStatus, onUpdateStatus, onDeleteStatus
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'trash' | 'channels' | 'pipeline' | 'profile'>('main');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile State
  const [profileForm, setProfileForm] = useState({ 
    displayName: userProfile.displayName, 
    avatarUrl: userProfile.avatarUrl || '' 
  });

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Channel State
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState({ name: '', color: '#00db9a' });

  // Status/Pipeline State
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#71717a', order: 0 });

  const resetChannelForm = () => {
    setChannelForm({ name: '', color: '#00db9a' });
    setEditingChannelId(null);
  };

  const resetStatusForm = () => {
    setStatusForm({ name: '', color: '#71717a', order: statuses.length });
    setEditingStatusId(null);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.displayName.trim()) return;
    setIsSaving(true);
    await updateProfile(profileForm);
    setIsSaving(false);
    setActiveTab('main');
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) return;
    
    setIsUpdatingPassword(true);
    setPasswordStatus({ type: null, message: '' });

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProfileForm(prev => ({ ...prev, avatarUrl: dataUrl }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChannel = () => {
    if (!channelForm.name.trim()) return;
    if (editingChannelId) onUpdateChannel(editingChannelId, { name: channelForm.name, color: channelForm.color });
    else onAddChannel({ name: channelForm.name, color: channelForm.color, icon: 'Youtube' });
    resetChannelForm();
  };

  const handleSaveStatus = () => {
    if (!statusForm.name.trim()) return;
    if (editingStatusId) onUpdateStatus(editingStatusId, { name: statusForm.name, color: statusForm.color, order: statusForm.order });
    else onAddStatus({ name: statusForm.name, color: statusForm.color, order: statuses.length });
    resetStatusForm();
  };

  if (activeTab === 'profile') {
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <button onClick={() => setActiveTab('main')} className="mb-6 flex items-center text-zinc-500 font-bold">
          <ChevronRight className="rotate-180 mr-1" size={20} /> Settings
        </button>
        <h1 className="text-3xl font-black mb-10">Creator Identity</h1>

        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-[#1C1F26] border-4 border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
              {profileForm.avatarUrl ? (
                <img src={profileForm.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-zinc-700" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#00db9a] text-black rounded-2xl flex items-center justify-center shadow-xl shadow-[#00db9a]/30 active:scale-90 transition-transform"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <p className="mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Update Creator Hub</p>
        </div>

        <div className="space-y-10">
          {/* Identity Section */}
          <section className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-2">Display Name</label>
              <input 
                type="text" 
                value={profileForm.displayName}
                onChange={e => setProfileForm(p => ({ ...p, displayName: e.target.value }))}
                placeholder="e.g. My Channel Studio"
                className="w-full bg-[#1C1F26] border border-white/5 rounded-2xl p-5 text-lg font-bold text-white outline-none focus:ring-2 focus:ring-[#00db9a]/50"
              />
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-[#00db9a] text-black py-5 rounded-[28px] font-black text-lg shadow-xl shadow-[#00db9a]/30 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
              <span>{isSaving ? 'Saving Changes...' : 'Save Identity'}</span>
            </button>
          </section>

          {/* Password Section */}
          <section className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex items-center space-x-2 px-2">
              <ShieldCheck size={16} className="text-zinc-600" />
              <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em]">Security Upgrade</h3>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00db9a] transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full bg-[#1C1F26] border border-white/5 rounded-2xl p-5 pl-14 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#00db9a]/50 transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00db9a] transition-colors">
                  <ShieldCheck size={16} />
                </div>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full bg-[#1C1F26] border border-white/5 rounded-2xl p-5 pl-14 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#00db9a]/50 transition-all placeholder:text-zinc-700"
                />
              </div>

              {passwordStatus.type && (
                <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${passwordStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {passwordStatus.type === 'success' ? <Check size={14} /> : <XCircle size={14} />}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <button 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-30"
              >
                {isUpdatingPassword ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                <span>Update Password</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (activeTab === 'trash') {
    const deleted = ideas.filter(i => i.isDeleted);
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setActiveTab('main')} className="flex items-center text-zinc-500 font-bold active:scale-95 transition-transform">
            <ChevronRight className="rotate-180 mr-1" size={20} /> Settings
          </button>
          {deleted.length > 0 && <button onClick={emptyBin} className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-4 py-2 rounded-xl active:scale-90 transition-all">Empty Bin</button>}
        </div>
        <h1 className="text-3xl font-black mb-2">Recycle Bin</h1>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-8">Items will stay here until purged</p>
        <div className="space-y-4">
          {deleted.map(idea => (
            <div key={idea.id} className="bg-[#1C1F26] p-4 rounded-[28px] border border-white/5 flex items-center justify-between shadow-xl">
              <div className="min-w-0 flex-1 pr-4">
                <h5 className="font-bold text-white truncate text-base mb-1">{idea.title}</h5>
                <div className="flex items-center text-[9px] font-black text-zinc-600 uppercase tracking-tighter"><Trash2 size={10} className="mr-1" /> Deleted recently</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => restoreIdea(idea.id)} className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><RotateCcw size={18} /></button>
                <button onClick={() => permanentlyDeleteIdea(idea.id)} className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {deleted.length === 0 && <div className="py-24 text-center"><div className="w-20 h-20 rounded-[32px] bg-zinc-900 flex items-center justify-center mx-auto mb-6 text-zinc-700"><Sparkles size={32} /></div><p className="text-zinc-700 font-bold uppercase tracking-widest text-[10px]">Your bin is empty</p></div>}
        </div>
      </div>
    );
  }

  if (activeTab === 'channels') {
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <button onClick={() => { setActiveTab('main'); resetChannelForm(); }} className="mb-6 flex items-center text-zinc-500 font-bold"><ChevronRight className="rotate-180 mr-1" size={20} /> Settings</button>
        <h1 className="text-2xl font-bold mb-8">Manage Channels</h1>
        <div className="bg-[#1C1F26] p-5 rounded-[28px] border border-white/10 mb-8 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{editingChannelId ? 'Edit Channel' : 'New Channel'}</h4>
          <input type="text" placeholder="Channel Name" value={channelForm.name} onChange={e => setChannelForm({ ...channelForm, name: e.target.value })} className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-white font-bold outline-none focus:ring-1 focus:ring-[#00db9a]" />
          <div className="flex items-center space-x-4 px-1"><label className="text-xs font-bold text-zinc-600">Theme:</label><div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">{['#EF4444', '#00db9a', '#10B981', '#F59E0B', '#A855F7', '#EC4899'].map(c => <button key={c} onClick={() => setChannelForm({ ...channelForm, color: c })} className={`w-8 h-8 flex-shrink-0 rounded-full border-2 transition-transform ${channelForm.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div></div>
          <div className="flex space-x-3 pt-2"><button onClick={handleSaveChannel} className="flex-1 bg-[#00db9a] text-black py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform">{editingChannelId ? 'Save Changes' : 'Add Channel'}</button>{editingChannelId && <button onClick={resetChannelForm} className="px-6 bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform"><X size={18} /></button>}</div>
        </div>
        <div className="space-y-3">{channels.map(channel => (<div key={channel.id} className="bg-[#1C1F26] p-4 rounded-2xl border border-white/5 flex items-center justify-between"><div className="flex items-center space-x-4 min-w-0 flex-1"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: channel.color }}><Youtube size={20} /></div><div className="min-w-0 flex-1 pr-2"><h5 className="font-bold text-white truncate">{channel.name}</h5><p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{ideas.filter(i => i.channelId === channel.id).length} Ideas</p></div></div><div className="flex space-x-2"><button onClick={() => { setEditingChannelId(channel.id); setChannelForm({ name: channel.name, color: channel.color }); }} className="p-3 bg-zinc-800 text-zinc-500 rounded-xl active:scale-95 transition-transform"><Edit2 size={16} /></button><button onClick={() => onDeleteChannel(channel.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl active:scale-95 transition-transform"><Trash2 size={16} /></button></div></div>))}</div>
      </div>
    );
  }

  if (activeTab === 'pipeline') {
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <button onClick={() => { setActiveTab('main'); resetStatusForm(); }} className="mb-6 flex items-center text-zinc-500 font-bold"><ChevronRight className="rotate-180 mr-1" size={20} /> Settings</button>
        <h1 className="text-2xl font-bold mb-8">Pipeline Stages</h1>
        <div className="bg-[#1C1F26] p-6 rounded-[32px] border border-white/10 mb-8 space-y-6">
          <input type="text" placeholder="e.g. Color Grading" value={statusForm.name} onChange={e => setStatusForm({ ...statusForm, name: e.target.value })} className="w-full bg-zinc-900/80 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:ring-1 focus:ring-[#00db9a]" />
          <div className="flex flex-wrap gap-3">{['#71717a', '#3b82f6', '#f97316', '#a855f7', '#22c55e', '#ef4444', '#eab308', '#ec4899'].map(c => <button key={c} onClick={() => setStatusForm({ ...statusForm, color: c })} className={`w-9 h-9 rounded-full border-4 transition-all ${statusForm.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c }} />)}</div>
          <div className="flex space-x-3 pt-2"><button onClick={handleSaveStatus} disabled={!statusForm.name.trim()} className="flex-1 bg-[#00db9a] text-black py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#00db9a]/20 disabled:opacity-30 active:scale-95 transition-all">{editingStatusId ? 'Update Stage' : 'Create Stage'}</button>{editingStatusId && <button onClick={resetStatusForm} className="px-6 bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"><X size={18} /></button>}</div>
        </div>
        <div className="space-y-4">{statuses.sort((a,b) => a.order - b.order).map(st => (<div key={st.id} className="bg-[#1C1F26] p-4 rounded-[28px] border border-white/5 flex items-center justify-between group"><div className="flex items-center space-x-4 min-w-0 flex-1"><div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${st.color}15` }}><Layers size={22} style={{ color: st.color }} /></div><div className="min-w-0 flex-1 pr-2"><h5 className="font-bold text-white truncate text-base">{st.name}</h5><p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{ideas.filter(i => i.statusId === st.id).length} Active Items</p></div></div><div className="flex space-x-2"><button onClick={() => { setEditingStatusId(st.id); setStatusForm({ name: st.name, color: st.color, order: st.order }); }} className="p-3 bg-zinc-800/50 text-zinc-500 rounded-xl hover:text-white transition-colors active:scale-95"><Edit2 size={16} /></button><button onClick={() => onDeleteStatus(st.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"><Trash2 size={16} /></button></div></div>))}</div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-10 bg-[#1C1F26] p-6 rounded-[32px] border border-white/5">
        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#00db9a] to-green-300 overflow-hidden flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-[#00db9a]/20">
          {userProfile.avatarUrl ? (
            <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            'CF'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black truncate">{userProfile.displayName}</h2>
          <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Creator Edition</p>
        </div>
        <button 
          onClick={() => {
            setProfileForm({ displayName: userProfile.displayName, avatarUrl: userProfile.avatarUrl || '' });
            setActiveTab('profile');
          }}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00db9a] active:scale-90 transition-transform"
        >
          <Edit2 size={18} />
        </button>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-[11px] font-extrabold text-zinc-600 uppercase tracking-widest mb-6 px-2">Studio Setup</h3>
          <div className="grid grid-cols-4 gap-y-8">
            <IconButton icon={<User className="text-[#00db9a]" />} label="Profile" onClick={() => { setProfileForm({ displayName: userProfile.displayName, avatarUrl: userProfile.avatarUrl || '' }); setActiveTab('profile'); }} />
            <IconButton icon={<Youtube className="text-[#FF0000]" />} label="Channels" onClick={() => setActiveTab('channels')} />
            <IconButton icon={<Workflow className="text-emerald-500" />} label="Pipeline" onClick={() => setActiveTab('pipeline')} />
            <IconButton icon={<Trash2 className="text-orange-500" />} label="Bin" onClick={() => setActiveTab('trash')} />
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-extrabold text-zinc-600 uppercase tracking-widest mb-6 px-2">Preferences</h3>
          <div className="grid grid-cols-4 gap-y-8">
            <IconButton icon={<Bell className="text-yellow-500" />} label="Alerts" onClick={() => {}} />
            <IconButton icon={<Palette className="text-purple-500" />} label="Themes" onClick={() => {}} />
            <IconButton icon={<Shield className="text-teal-500" />} label="Security" onClick={() => { setProfileForm({ displayName: userProfile.displayName, avatarUrl: userProfile.avatarUrl || '' }); setActiveTab('profile'); }} />
            <IconButton icon={<XCircle className="text-zinc-600" />} label="Reset" onClick={() => { if (confirm('Clear local cache and reload?')) { localStorage.clear(); window.location.reload(); } }} />
          </div>
        </section>

        <div className="mt-8 pt-8 border-t border-white/5 px-2">
          <button onClick={handleSignOut} className="flex items-center space-x-4 text-red-500 font-bold opacity-60 hover:opacity-100 transition-opacity active:scale-95"><LogOut size={20} /><span>Sign Out Hub</span></button>
        </div>
      </div>
      <p className="text-center mt-20 text-[10px] font-bold text-zinc-800 tracking-tighter uppercase font-black">CreatorFlow Build 1.2.5</p>
    </div>
  );
};

const IconButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center group active:scale-90 transition-transform">
    <div className="w-16 h-16 bg-[#1C1F26] rounded-[24px] flex items-center justify-center border border-white/5 mb-2 shadow-sm group-hover:border-[#00db9a]/30 transition-all">{icon}</div>
    <span className="text-[10px] font-black text-zinc-500 tracking-tighter">{label}</span>
  </button>
);

export default SettingsPage;