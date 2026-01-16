
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Search, Filter } from 'lucide-react';
import { Idea, Channel } from '../types';
import { IdeaCard } from './Home';

interface CalendarProps {
  ideas: Idea[];
  channels: Channel[];
  onIdeaClick: (idea: Idea) => void;
}

const CalendarPage: React.FC<CalendarProps> = ({ ideas, channels, onIdeaClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const scheduledIdeas = useMemo(() => ideas.filter(i => i.scheduledDate), [ideas]);
  const selectedDayIdeas = useMemo(() => 
    scheduledIdeas.filter(i => isSameDay(new Date(i.scheduledDate!), selectedDay)), 
    [scheduledIdeas, selectedDay]
  );

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex space-x-2">
          <button className="w-10 h-10 rounded-xl bg-[#1C1F26] flex items-center justify-center text-zinc-400"><Search size={18} /></button>
          <button className="w-10 h-10 rounded-xl bg-[#1C1F26] flex items-center justify-center text-zinc-400"><Filter size={18} /></button>
        </div>
      </header>

      <div className="bg-[#1C1F26] rounded-[32px] p-6 border border-white/5 mb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 px-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-[#526DF1] p-1"><ChevronLeft size={24} /></button>
          <h2 className="text-xl font-extrabold text-[#526DF1] tracking-tight">{format(currentMonth, 'MMMM')}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-[#526DF1] p-1"><ChevronRight size={24} /></button>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="text-center text-[11px] font-bold text-zinc-600 uppercase tracking-tighter">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDay);
            const isCurrMonth = day.getMonth() === currentMonth.getMonth();
            const hasIdeas = scheduledIdeas.some(i => isSameDay(new Date(i.scheduledDate!), day));
            const today = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                className="relative flex items-center justify-center py-2"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isSelected ? 'bg-[#526DF1] text-white scale-110 shadow-[0_5px_15px_rgba(82,109,241,0.4)]' : 
                    today ? 'text-[#526DF1] border border-[#526DF1]/30' : 
                    isCurrMonth ? 'text-zinc-400' : 'text-zinc-800'}`}
                >
                  {format(day, 'd')}
                </div>
                {hasIdeas && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#526DF1]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold">Planned Uploads</h3>
          <button className="text-[#526DF1] p-1"><Plus size={20} /></button>
        </div>

        <div className="space-y-3">
          {selectedDayIdeas.map(idea => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              onClick={() => onIdeaClick(idea)} 
              channel={channels.find(c => c.id === idea.channelId)} 
            />
          ))}
          {selectedDayIdeas.length === 0 && (
            <div className="bg-[#1C1F26]/30 border border-dashed border-white/5 rounded-[24px] py-12 text-center">
              <p className="text-zinc-600 text-sm">No uploads planned for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
