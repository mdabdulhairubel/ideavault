
import React, { useState } from 'react';
import { 
  User, Youtube, Workflow, Trash2, 
  Shield, Bell, Palette, HelpCircle, 
  RotateCcw, LogOut, ChevronRight, XCircle,
  Plus, Edit2, Check, X, FolderClosed, Layers
} from 'lucide-react';
import { Idea, ViewType, Channel, Status } from '../types';

interface SettingsProps {
  ideas: Idea[];
  channels: Channel[];
  statuses: Status[];
  restoreIdea: (id: string) => void;
  permanentlyDeleteIdea: (id: string) => void;
  onNavigate: (view: ViewType) => void;
  onAddChannel: (channel: Omit<Channel, 'id'>) => void;
  onUpdateChannel: (id: string, channel: Partial<Channel>) => void;
  onDeleteChannel: (id: string) => void;
  onAddStatus: (status: Omit<Status, 'id'>) => void;
  onUpdateStatus: (id: string, status: Partial<Status>) => void;
  onDeleteStatus: (id: string) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ 
  ideas, channels, statuses, restoreIdea, permanentlyDeleteIdea, onNavigate,
  onAddChannel, onUpdateChannel, onDeleteChannel,
  onAddStatus, onUpdateStatus, onDeleteStatus
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'trash' | 'channels' | 'pipeline'>('main');
  
  // Channel State
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState({ name: '', color: '#526DF1' });

  // Status/Pipeline State
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#71717a', order: 0 });

  const resetChannelForm = () => {
    setChannelForm({ name: '', color: '#526DF1' });
    setEditingChannelId(null);
  };

  const resetStatusForm = () => {
    setStatusForm({ name: '', color: '#71717a', order: statuses.length });
    setEditingStatusId(null);
  };

  const handleSaveChannel = () => {
    if (!channelForm.name.trim()) return;
    if (editingChannelId) {
      onUpdateChannel(editingChannelId, { name: channelForm.name, color: channelForm.color });
    } else {
      onAddChannel({ name: channelForm.name, color: channelForm.color, icon: 'Youtube' });
    }
    resetChannelForm();
  };

  const handleSaveStatus = () => {
    if (!statusForm.name.trim()) return;
    if (editingStatusId) {
      onUpdateStatus(editingStatusId, { name: statusForm.name, color: statusForm.color, order: statusForm.order });
    } else {
      onAddStatus({ name: statusForm.name, color: statusForm.color, order: statuses.length });
    }
    resetStatusForm();
  };

  if (activeTab === 'trash') {
    const deleted = ideas.filter(i => i.isDeleted);
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <button onClick={() => setActiveTab('main')} className="mb-6 flex items-center text-zinc-500 font-bold">
          <ChevronRight className="rotate-180 mr-1" size={20} /> Settings
        </button>
        <h1 className="text-2xl font-bold mb-6">Recycle Bin</h1>
        <div className="space-y-3">
          {deleted.map(idea => (
            <div key={idea.id} className="bg-[#1C1F26] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <h5 className="font-bold text-white truncate">{idea.title}</h5>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Deleted Recently</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => restoreIdea(idea.id)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><RotateCcw size={18} /></button>
                <button onClick={() => permanentlyDeleteIdea(idea.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {deleted.length === 0 && <div className="py-20 text-center text-zinc-700">Recycle bin is empty</div>}
        </div>
      </div>
    );
  }

  if (activeTab === 'channels') {
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <button onClick={() => { setActiveTab('main'); resetChannelForm(); }} className="mb-6 flex items-center text-zinc-500 font-bold">
          <ChevronRight className="rotate-180 mr-1" size={20} /> Settings
        </button>
        <h1 className="text-2xl font-bold mb-8">Manage Channels</h1>

        <div className="bg-[#1C1F26] p-5 rounded-[28px] border border-white/10 mb-8 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{editingChannelId ? 'Edit Channel' : 'New Channel'}</h4>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Channel Name"
              value={channelForm.name}
              onChange={e => setChannelForm({ ...channelForm, name: e.target.value })}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-white font-bold outline-none"
            />
            <div className="flex items-center space-x-4 px-1">
              <label className="text-xs font-bold text-zinc-600">Theme:</label>
              <div className="flex space-x-2">
                {['#EF4444', '#526DF1', '#10B981', '#F59E0B', '#A855F7', '#EC4899'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setChannelForm({ ...channelForm, color: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${channelForm.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={handleSaveChannel} className="flex-1 bg-[#526DF1] text-white py-4 rounded-2xl font-black text-sm">
                {editingChannelId ? 'Save Changes' : 'Add Channel'}
              </button>
              {editingChannelId && <button onClick={resetChannelForm} className="px-6 bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black text-sm"><X size={18} /></button>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {channels.map(channel => (
            <div key={channel.id} className="bg-[#1C1F26] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: channel.color }}><Youtube size={20} /></div>
                <div className="min-w-0 flex-1 pr-2">
                  <h5 className="font-bold text-white truncate">{channel.name}</h5>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{ideas.filter(i => i.channelId === channel.id).length} Ideas</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => { setEditingChannelId(channel.id); setChannelForm({ name: channel.name, color: channel.color }); }} className="p-3 bg-zinc-800 text-zinc-500 rounded-xl"><Edit2 size={16} /></button>
                <button onClick={() => onDeleteChannel(channel.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'pipeline') {
    return (
      <div className="animate-in slide-in-from-right duration-300 pb-10">
        <button onClick={() => { setActiveTab('main'); resetStatusForm(); }} className="mb-6 flex items-center text-zinc-500 font-bold">
          <ChevronRight className="rotate-180 mr-1" size={20} /> Settings
        </button>
        <h1 className="text-2xl font-bold mb-8">Pipeline Stages</h1>

        {/* Stage Form */}
        <div className="bg-[#1C1F26] p-6 rounded-[32px] border border-white/10 mb-8 space-y-6">
          <div>
            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">
              {editingStatusId ? 'Edit Production Stage' : 'Add New Stage'}
            </h4>
            <input 
              type="text" 
              placeholder="e.g. Color Grading"
              value={statusForm.name}
              onChange={e => setStatusForm({ ...statusForm, name: e.target.value })}
              className="w-full bg-zinc-900/80 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-[#526DF1]/50 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 block">Visual Indicator</label>
            <div className="flex flex-wrap gap-3">
              {['#71717a', '#3b82f6', '#f97316', '#a855f7', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#06b6d4'].map(c => (
                <button 
                  key={c} 
                  onClick={() => setStatusForm({ ...statusForm, color: c })}
                  className={`w-9 h-9 rounded-full border-4 transition-all ${statusForm.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button 
              onClick={handleSaveStatus} 
              disabled={!statusForm.name.trim()}
              className="flex-1 bg-[#526DF1] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#526DF1]/20 disabled:opacity-30 active:scale-95 transition-all"
            >
              {editingStatusId ? 'Update Stage' : 'Create Stage'}
            </button>
            {editingStatusId && (
              <button onClick={resetStatusForm} className="px-6 bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Stages List */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-zinc-700 uppercase tracking-widest px-2 mb-2">Active Pipeline</h3>
          {statuses.sort((a,b) => a.order - b.order).map(st => (
            <div key={st.id} className="bg-[#1C1F26] p-4 rounded-[28px] border border-white/5 flex items-center justify-between group">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${st.color}15` }}>
                  <Layers size={22} style={{ color: st.color }} />
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <h5 className="font-bold text-white truncate text-base">{st.name}</h5>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">
                    {ideas.filter(i => i.statusId === st.id).length} Active Items
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => { setEditingStatusId(st.id); setStatusForm({ name: st.name, color: st.color, order: st.order }); }} 
                  className="p-3 bg-zinc-800/50 text-zinc-500 rounded-xl hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDeleteStatus(st.id)} 
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-10 bg-[#1C1F26] p-6 rounded-[32px] border border-white/5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#526DF1] to-purple-500 flex items-center justify-center text-white"><User size={32} /></div>
        <div><h2 className="text-xl font-bold">YouTuber Pro</h2><p className="text-zinc-500 text-xs font-semibold">Cloud Sync: Active</p></div>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-[11px] font-extrabold text-zinc-600 uppercase tracking-widest mb-6 px-2">Production Tools</h3>
          <div className="grid grid-cols-4 gap-y-8">
            <IconButton icon={<Youtube className="text-[#FF0000]" />} label="Channels" onClick={() => setActiveTab('channels')} />
            <IconButton icon={<Workflow className="text-[#526DF1]" />} label="Pipeline" onClick={() => setActiveTab('pipeline')} />
            <IconButton icon={<Trash2 className="text-orange-500" />} label="Bin" onClick={() => setActiveTab('trash')} />
            <IconButton icon={<Palette className="text-purple-500" />} label="Themes" onClick={() => {}} />
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-extrabold text-zinc-600 uppercase tracking-widest mb-6 px-2">Account & Support</h3>
          <div className="grid grid-cols-4 gap-y-8">
            <IconButton icon={<Shield className="text-teal-500" />} label="Security" onClick={() => {}} />
            <IconButton icon={<Bell className="text-yellow-500" />} label="Alerts" onClick={() => {}} />
            <IconButton icon={<HelpCircle className="text-zinc-400" />} label="Help" onClick={() => {}} />
            <IconButton icon={<XCircle className="text-zinc-600" />} label="Reset" onClick={() => { if (confirm('Clear cache?')) { localStorage.clear(); window.location.reload(); } }} />
          </div>
        </section>

        <div className="mt-8 pt-8 border-t border-white/5 px-2">
          <button className="flex items-center space-x-4 text-red-500 font-bold opacity-60 hover:opacity-100 transition-opacity"><LogOut size={20} /><span>Sign Out Session</span></button>
        </div>
      </div>
      <p className="text-center mt-20 text-[10px] font-bold text-zinc-800 tracking-tighter uppercase">CreatorFlow Build 1.2.0-Alpha</p>
    </div>
  );
};

const IconButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center group active:scale-90 transition-transform">
    <div className="w-16 h-16 bg-[#1C1F26] rounded-2xl flex items-center justify-center border border-white/5 mb-2 shadow-sm group-hover:border-[#526DF1]/30">{icon}</div>
    <span className="text-[10px] font-bold text-zinc-500">{label}</span>
  </button>
);

export default SettingsPage;
