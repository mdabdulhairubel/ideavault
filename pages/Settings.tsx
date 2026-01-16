
import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Youtube, 
  Workflow, 
  Trash2, 
  LogOut, 
  Shield, 
  Bell, 
  Palette, 
  HelpCircle,
  RotateCcw,
  PlusCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Channel, Status, Idea } from '../types';

interface SettingsProps {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  statuses: Status[];
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  ideas: Idea[];
  restoreIdea: (id: string) => void;
  permanentlyDeleteIdea: (id: string) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ 
  channels, setChannels, statuses, setStatuses, ideas, restoreIdea, permanentlyDeleteIdea 
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const trashIdeas = ideas.filter(i => i.isDeleted);

  if (activeSection === 'trash') {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button onClick={() => setActiveSection(null)} className="mb-6 text-zinc-500 flex items-center">
          <ChevronRight size={20} className="rotate-180 mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Trash2 className="text-red-500 mr-2" /> Recycle Bin
        </h1>
        <div className="space-y-3">
          {trashIdeas.map(idea => (
            <div key={idea.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-bold text-white truncate">{idea.title}</h4>
                <p className="text-zinc-500 text-xs">Deleted on {new Date(idea.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => restoreIdea(idea.id)} className="p-2 bg-zinc-800 rounded-lg text-blue-500 hover:bg-zinc-700">
                  <RotateCcw size={18} />
                </button>
                <button onClick={() => permanentlyDeleteIdea(idea.id)} className="p-2 bg-zinc-800 rounded-lg text-red-500 hover:bg-zinc-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {trashIdeas.length === 0 && (
            <p className="text-zinc-600 text-center py-20">Trash is empty</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="flex items-center space-x-4 mb-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-[2rem] border border-white/5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-zinc-950">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Content Creator</h2>
          <p className="text-zinc-500 text-sm">Pro Membership Active</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Sections Grid - bKash Style */}
        <section>
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Management</h3>
          <div className="grid grid-cols-4 gap-y-6">
            <IconButton icon={<Youtube className="text-red-500" />} label="Channels" onClick={() => {}} />
            <IconButton icon={<Workflow className="text-blue-500" />} label="Workflow" onClick={() => {}} />
            <IconButton icon={<Trash2 className="text-zinc-400" />} label="Trash" onClick={() => setActiveSection('trash')} />
            <IconButton icon={<PlusCircle className="text-green-500" />} label="Quick Add" onClick={() => {}} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Preferences</h3>
          <div className="grid grid-cols-4 gap-y-6">
            <IconButton icon={<Palette className="text-purple-500" />} label="Appearance" onClick={() => {}} />
            <IconButton icon={<Bell className="text-yellow-500" />} label="Alerts" onClick={() => {}} />
            <IconButton icon={<Shield className="text-teal-500" />} label="Security" onClick={() => {}} />
            <IconButton icon={<HelpCircle className="text-indigo-500" />} label="Support" onClick={() => {}} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Account</h3>
          <div className="grid grid-cols-4 gap-y-6">
            <IconButton icon={<SettingsIcon className="text-zinc-500" />} label="Profile" onClick={() => {}} />
            <IconButton icon={<XCircle className="text-red-900" />} label="Reset App" onClick={() => {
              if (confirm('Clear all app data?')) {
                localStorage.clear();
                window.location.reload();
              }
            }} />
            <IconButton icon={<LogOut className="text-zinc-700" />} label="Logout" onClick={() => {}} />
          </div>
        </section>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-zinc-700 text-[10px] font-mono">VERSION 1.0.42 (BETA)</p>
        <p className="text-zinc-800 text-[8px] mt-1 italic">Designed for Creators</p>
      </footer>
    </div>
  );
};

const IconButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-2 group active:scale-90 transition-transform"
  >
    <div className="w-14 h-14 bg-zinc-900/80 rounded-2xl flex items-center justify-center shadow-lg border border-zinc-800/50 group-hover:border-zinc-700 group-hover:bg-zinc-800">
      {icon}
    </div>
    <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300">{label}</span>
  </button>
);

export default SettingsPage;
