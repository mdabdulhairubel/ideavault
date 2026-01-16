import React from 'react';
import { 
  ChevronLeft, Youtube, Layers, Calendar, 
  AlertCircle, Edit2, Trash2, Clock, 
  FileText, ArrowRight
} from 'lucide-react';
import { Idea, Channel, Status } from '../types';
import { format } from 'date-fns';

interface IdeaDetailsProps {
  idea: Idea;
  channel?: Channel;
  status?: Status;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const IdeaDetailsPage: React.FC<IdeaDetailsProps> = ({ 
  idea, channel, status, onBack, onEdit, onDelete 
}) => {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-32">
      {/* Header Navigation */}
      <button 
        type="button"
        onClick={onBack} 
        className="mb-6 flex items-center text-zinc-500 font-bold hover:text-white transition-colors"
      >
        <ChevronLeft size={24} className="mr-1" />
        Back to Pipeline
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#1C1F26] rounded-[40px] border border-white/5 p-8 mb-8">
        <div 
          className="absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-20" 
          style={{ backgroundColor: channel?.color || '#00db9a' }} 
        />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
              Ref: {idea.id.slice(0, 8)}
            </span>
            {idea.updatedAt && (
              <span className="flex items-center text-[10px] font-bold text-zinc-600">
                <Clock size={10} className="mr-1" />
                Updated {format(new Date(idea.updatedAt), 'MMM d')}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-4">{idea.title}</h1>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-6">
            {idea.description || 'No summary provided for this project.'}
          </p>
        </div>
      </div>

      {/* Production Specs Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <DetailCard 
          icon={<Youtube size={18} />} 
          label="Channel" 
          value={channel?.name || 'Unassigned'} 
          color={channel?.color}
        />
        <DetailCard 
          icon={<Layers size={18} />} 
          label="Stage" 
          value={status?.name || 'Initial'} 
          color={status?.color}
        />
        <DetailCard 
          icon={<Calendar size={18} />} 
          label="Deadline" 
          value={idea.scheduledDate ? format(new Date(idea.scheduledDate), 'MMM d, yyyy') : 'TBD'} 
          color="#00db9a"
        />
        <DetailCard 
          icon={<AlertCircle size={18} />} 
          label="Priority" 
          value={idea.priority} 
          color={idea.priority === 'High' ? '#EF4444' : idea.priority === 'Medium' ? '#F59E0B' : '#71717A'}
        />
      </div>

      {/* Production Notes */}
      <section className="mb-12">
        <div className="flex items-center space-x-2 mb-4 px-2">
          <FileText size={16} className="text-zinc-600" />
          <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest">Production Notes</h3>
        </div>
        <div className="bg-[#1C1F26]/50 rounded-[32px] border border-white/5 p-6 min-h-[200px]">
          {idea.notes ? (
            <div className="text-zinc-300 text-sm leading-7 whitespace-pre-wrap font-medium">
              {idea.notes}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-3 py-10">
              <p className="text-sm font-bold italic">No production notes yet.</p>
              <button 
                type="button"
                onClick={onEdit}
                className="text-xs font-black text-[#00db9a] uppercase flex items-center"
              >
                Add Notes <ArrowRight size={12} className="ml-1" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 z-[100] max-w-md mx-auto">
        <div className="flex space-x-4">
          <button 
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 bg-red-500/10 text-red-500 rounded-[24px] border border-red-500/20 flex items-center justify-center active:scale-90 transition-transform hover:bg-red-500/20"
            aria-label="Move to Bin"
          >
            <Trash2 size={24} />
          </button>
          <button 
            type="button"
            onClick={onEdit}
            className="flex-1 bg-[#00db9a] text-black rounded-[24px] flex items-center justify-center space-x-2 font-black shadow-xl shadow-[#00db9a]/30 active:scale-95 transition-all"
          >
            <Edit2 size={20} />
            <span>Edit Production</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color?: string }> = ({ icon, label, value, color }) => (
  <div className="bg-[#1C1F26] p-4 rounded-[28px] border border-white/5">
    <div className="flex items-center space-x-2 mb-2 text-zinc-600">
      <div className="opacity-60">{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="font-bold text-white text-sm truncate" style={{ color: color }}>{value}</div>
  </div>
);

export default IdeaDetailsPage;