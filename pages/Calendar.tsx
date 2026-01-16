
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Idea, Channel } from '../types';

interface CalendarProps {
  ideas: Idea[];
  channels: Channel[];
  onIdeaClick: (idea: Idea) => void;
}

const CalendarPage: React.FC<CalendarProps> = ({ ideas, channels, onIdeaClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const scheduledIdeas = useMemo(() => 
    ideas.filter(i => i.scheduledDate), [ideas]
  );

  const selectedDayIdeas = useMemo(() => {
    if (!selectedDay) return [];
    return scheduledIdeas.filter(i => isSameDay(new Date(i.scheduledDate!), selectedDay));
  }, [scheduledIdeas, selectedDay]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Schedule</h1>
        <p className="text-zinc-500">Plan your upload calendar</p>
      </header>

      {/* Monthly View */}
      <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl mb-6">
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center py-2 bg-zinc-800/30">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <span key={d} className="text-[10px] font-bold text-zinc-500 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 border-t border-zinc-800/50">
          {days.map((day, i) => {
            const hasIdeas = scheduledIdeas.some(idea => isSameDay(new Date(idea.scheduledDate!), day));
            const active = selectedDay && isSameDay(day, selectedDay);
            const today = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                className={`h-14 relative flex flex-col items-center justify-center border-r border-b border-zinc-800/50 transition-all ${active ? 'bg-blue-600/20' : 'hover:bg-zinc-800/30'}`}
                style={{ gridColumnStart: i === 0 ? day.getDay() + 1 : 'auto' }}
              >
                <span className={`text-sm font-medium ${active ? 'text-blue-500' : today ? 'text-white underline decoration-blue-500 underline-offset-4' : 'text-zinc-400'}`}>
                  {format(day, 'd')}
                </span>
                {hasIdeas && (
                  <div className="mt-1 flex space-x-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-500 flex items-center uppercase tracking-widest px-1">
          <Clock size={14} className="mr-2" />
          {selectedDay ? format(selectedDay, 'EEEE, MMM do') : 'Select a date'}
        </h3>
        
        {selectedDayIdeas.length > 0 ? (
          selectedDayIdeas.map(idea => {
            const channel = channels.find(c => c.id === idea.channelId);
            return (
              <button
                key={idea.id}
                onClick={() => onIdeaClick(idea)}
                className="w-full flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-left hover:border-zinc-700 active:scale-[0.98] transition-all"
              >
                <div className="w-2 h-10 rounded-full mr-4" style={{ backgroundColor: channel?.color || '#52525b' }} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{idea.title}</h4>
                  <p className="text-zinc-500 text-xs truncate">{channel?.name || 'Unknown Channel'}</p>
                </div>
                <ChevronRight size={18} className="text-zinc-700" />
              </button>
            );
          })
        ) : (
          <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl py-12 text-center">
            <CalendarIcon size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-600 text-sm">Nothing scheduled for this day</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
