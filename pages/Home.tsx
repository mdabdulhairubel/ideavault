import React, { useState, useMemo } from 'react';
import { ChevronRight, FolderClosed, MoreVertical, LayoutGrid, TrendingUp, BarChart2, Filter } from 'lucide-react';
import { Idea, Status, Channel, UserProfile } from '../types';
import { format, subDays, isSameDay, startOfMonth, startOfYear, eachDayOfInterval, eachMonthOfInterval, isSameMonth } from 'date-fns';

interface HomeProps {
  userProfile: UserProfile;
  ideas: Idea[];
  statuses: Status[];
  channels: Channel[];
  onIdeaClick: (idea: Idea) => void;
}

const HomePage: React.FC<HomeProps> = ({ userProfile, ideas, statuses, onIdeaClick, channels }) => {
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '1Y'>('1M');
  const [metric, setMetric] = useState<'Capture' | 'Upload'>('Capture');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const filteredIdeasByChannel = useMemo(() => {
    return ideas.filter(i => channelFilter === 'all' || i.channelId === channelFilter);
  }, [ideas, channelFilter]);

  const metricKey = metric === 'Capture' ? 'createdAt' : 'completedAt';
  const metricTotalCount = useMemo(() => {
    return filteredIdeasByChannel.filter(i => i[metricKey]).length;
  }, [filteredIdeasByChannel, metricKey]);

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
            <IdeaCard key={idea.id} idea={idea} onClick={() => onIdeaClick(idea)} channel={channels.find(c => c.id === idea.channelId)} />
          ))}
          {filtered.length === 0 && <div className="py-20 text-center text-zinc-600 text-sm italic">This stage is clear</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <header className="mb-8 flex justify-between items-center px-1">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#1C1F26] border border-white/10 flex items-center justify-center shadow-lg">
            {userProfile.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#00db9a] font-black text-xl">CF</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{userProfile.displayName}</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Active Pipeline</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#1C1F26] border border-white/5 flex items-center justify-center">
          <TrendingUp size={18} className="text-[#00db9a]" />
        </div>
      </header>

      <section className="mb-12">
        <div className="bg-[#1C1F26] rounded-[40px] p-6 border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#00db9a]/10 blur-[80px] -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Production Trend</p>
              <h2 className="text-2xl font-black text-white flex items-center">
                {metricTotalCount}
                <span className="text-xs font-bold text-zinc-600 ml-2 uppercase tracking-tighter">Total {metric}s</span>
              </h2>
            </div>
            <div className="flex bg-black/40 p-1 rounded-2xl">
              {(['Capture', 'Upload'] as const).map(m => (
                <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${metric === m ? 'bg-[#00db9a] text-black active-tab-glow' : 'text-zinc-600 hover:text-white'}`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
             <div className="flex space-x-2 bg-black/40 p-1 rounded-2xl">
              {(['1W', '1M', '1Y'] as const).map(t => (
                <button key={t} onClick={() => setTimeframe(t)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${timeframe === t ? 'bg-[#00db9a] text-black shadow-lg shadow-[#00db9a]/20' : 'text-zinc-600 hover:text-zinc-400'}`}>{t}</button>
              ))}
            </div>
            <div className="relative">
              <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="bg-black/40 text-[10px] font-black text-[#00db9a] py-2 px-4 pr-8 rounded-xl appearance-none border-none outline-none ring-0 uppercase tracking-widest">
                <option value="all">Global</option>
                {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Filter size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00db9a] pointer-events-none" />
            </div>
          </div>
          <div className="h-44 w-full relative mb-8 z-10">
            <ActivityGraph key={`${metric}-${timeframe}-${channelFilter}`} ideas={filteredIdeasByChannel} timeframe={timeframe} metric={metricKey} />
          </div>
          <div className="grid grid-cols-3 gap-3 relative z-10">
             <StatCard label="Today" value={filteredIdeasByChannel.filter(i => i.createdAt && isSameDay(new Date(i.createdAt), new Date())).length} unit="Capt" />
             <StatCard label="Today" value={filteredIdeasByChannel.filter(i => i.completedAt && isSameDay(new Date(i.completedAt), new Date())).length} unit="Upld" />
             <StatCard label="Pipeline" value={filteredIdeasByChannel.filter(i => !i.completedAt).length} unit="Active" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Workflow Folders</h3>
          <BarChart2 size={16} className="text-zinc-700" />
        </div>
        {statuses.map(st => {
          const count = ideas.filter(i => i.statusId === st.id).length;
          return (
            <button key={st.id} onClick={() => setViewingStatus(st)} className="flex items-center p-5 bg-[#1C1F26] rounded-[32px] border border-white/5 shadow-lg group active:scale-[0.98] transition-all">
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

      <div className="mt-12 mb-4 flex justify-between items-center px-1">
        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Recent Activity</h3>
        <button className="text-[10px] font-black text-[#00db9a] uppercase tracking-widest">View All</button>
      </div>
      <div className="space-y-3">
        {ideas.slice(0, 4).map(i => (
          <IdeaCard key={i.id} idea={i} onClick={() => onIdeaClick(i)} channel={channels.find(c => c.id === i.channelId)} />
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-black/20 p-4 rounded-[24px] border border-white/5">
    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline">
      <span className="text-lg font-black text-white">{value}</span>
      <span className="text-[9px] font-bold text-zinc-500 ml-1 uppercase">{unit}</span>
    </div>
  </div>
);

const ActivityGraph: React.FC<{ ideas: Idea[]; timeframe: '1W' | '1M' | '1Y'; metric: 'createdAt' | 'completedAt' }> = ({ ideas, timeframe, metric }) => {
  const dataPoints = useMemo(() => {
    const now = new Date();
    let interval: Date[] = [];
    if (timeframe === '1W') interval = eachDayOfInterval({ start: subDays(now, 6), end: now });
    else if (timeframe === '1M') interval = eachDayOfInterval({ start: subDays(now, 29), end: now });
    else interval = eachMonthOfInterval({ start: startOfYear(now), end: now });

    return interval.map(date => {
      return ideas.filter(idea => {
        const val = idea[metric];
        if (!val) return false;
        const ideaDate = new Date(val);
        if (timeframe === '1Y') return isSameMonth(ideaDate, date);
        return isSameDay(ideaDate, date);
      }).length;
    });
  }, [ideas, timeframe, metric]);

  const max = Math.max(...dataPoints, 5);
  const width = 400;
  const height = 150;
  const padding = 20;
  const points = dataPoints.map((val, i) => {
    const x = (i / (dataPoints.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val / max) * (height - padding * 2) + padding);
    return { x, y };
  });

  const d = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaD = `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00db9a" /><stop offset="100%" stopColor="#10B981" /></linearGradient>
        <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00db9a" stopOpacity="0.4" /><stop offset="100%" stopColor="#00db9a" stopOpacity="0" /></linearGradient>
      </defs>
      <path d={areaD} fill="url(#gradientArea)" className="animate-in fade-in duration-1000" />
      <path d={d} fill="none" stroke="url(#gradientLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-in fade-in slide-in-from-bottom-2 duration-700" />
      {points.map((p, i) => {
        const showDot = timeframe === '1W' || (i % Math.ceil(dataPoints.length / 6) === 0) || i === dataPoints.length - 1;
        if (!showDot) return null;
        return (
          <g key={i}>
             <circle cx={p.x} cy={p.y} r="6" fill="#1C1F26" stroke="#00db9a" strokeWidth="2" />
             {i === dataPoints.length - 1 && (
               <g>
                 <rect x={p.x - 15} y={p.y - 35} width="30" height="20" rx="6" fill="#00db9a" />
                 <text x={p.x} y={p.y - 21} textAnchor="middle" fill="black" className="text-[10px] font-black">{dataPoints[i]}</text>
               </g>
             )}
          </g>
        );
      })}
    </svg>
  );
};

export const IdeaCard: React.FC<{ idea: Idea; onClick: () => void; channel?: Channel }> = ({ idea, onClick, channel }) => (
  <button onClick={onClick} className="w-full bg-[#1C1F26] p-5 rounded-[28px] border border-white/5 text-left active:bg-[#252A34] transition-all flex items-center justify-between shadow-sm">
    <div className="min-w-0 flex-1">
      <div className="flex items-center space-x-2 mb-2">
        <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: channel?.color || '#555', color: channel?.color }} />
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate">{channel?.name || 'Channel'}</span>
      </div>
      <h5 className="font-bold text-white truncate text-base">{idea.title}</h5>
    </div>
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-700 hover:text-white transition-colors">
      <MoreVertical size={18} />
    </div>
  </button>
);

export default HomePage;