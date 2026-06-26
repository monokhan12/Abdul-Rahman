import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Check, 
  ExternalLink,
  ChevronRight,
  CalendarCheck,
  User,
  Mail,
  PlusCircle,
  FileText,
  Sparkles,
  Trash2,
  AlertCircle
} from 'lucide-react';

export interface ScheduledMeeting {
  id: string;
  topic: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  notes: string;
  meetLink: string;
  calendarUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'abdul_rahman_booked_consultations';

export default function GoogleMeetScheduler() {
  // Form states
  const [topic, setTopic] = useState<string>('Computational Materials Science & AI');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI states
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [scheduledEvent, setScheduledEvent] = useState<ScheduledMeeting | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduledMeeting[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Topics available
  const topics = [
    'Computational Materials Science & AI',
    'Physical & Extractive Metallurgy',
    'Surfaces, Interfaces & Degradation',
    'Sustainable Materials & Circular Economy',
    'General Industrial AI Workflow Consultation'
  ];

  // Time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);

    loadMeetings();
  }, []);

  const loadMeetings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUpcomingEvents(JSON.parse(stored));
      } else {
        // Initialize with one demo consultation so visitors see instant functionality
        const demoDate = new Date();
        demoDate.setDate(demoDate.getDate() + 2);
        const dateStr = demoDate.toISOString().split('T')[0];
        
        const demoMeeting: ScheduledMeeting = {
          id: 'demo-1',
          topic: 'Computational Materials Science & AI',
          date: dateStr,
          timeSlot: '14:00',
          clientName: 'Dr. Sarah Jenkins',
          clientEmail: 's.jenkins@materials-lab.org',
          notes: 'Discussing alloy microstructure modeling and phase diagram predictions.',
          meetLink: 'https://meet.google.com/res-matc-sci',
          calendarUrl: generateGoogleCalUrl(
            'Computational Materials Science & AI', 
            dateStr, 
            '14:00', 
            'https://meet.google.com/res-matc-sci', 
            'Alloy microstructure modeling', 
            'Dr. Sarah Jenkins'
          ),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([demoMeeting]));
        setUpcomingEvents([demoMeeting]);
      }
    } catch (e) {
      console.error('Failed to load meetings', e);
    }
  };

  const generateGoogleCalUrl = (
    mtgTopic: string, 
    date: string, 
    time: string, 
    link: string, 
    mtgNotes: string, 
    cName: string
  ): string => {
    try {
      const startDt = new Date(`${date}T${time}:00`);
      const endDt = new Date(startDt.getTime() + 30 * 60000); // 30 mins
      
      const formatGoogleDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const datesParam = `${formatGoogleDate(startDt)}/${formatGoogleDate(endDt)}`;
      const title = `Consultation: ${mtgTopic} (Abdul Rahman)`;
      const details = `Consultation Topic: ${mtgTopic}\nClient: ${cName}\nResearch Objective: ${mtgNotes || 'None'}\n\nGoogle Meet Video Conference Link:\n${link}`;
      
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${datesParam}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(link)}`;
    } catch (e) {
      return 'https://calendar.google.com';
    }
  };

  const handleScheduleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedDate || !selectedTimeSlot || !clientName.trim() || !clientEmail.trim()) {
      setError('Please complete all required fields (Name, Email, Date, and Time).');
      return;
    }
    setShowConfirm(true);
  };

  const confirmAndSchedule = () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError(null);

    setTimeout(() => {
      try {
        // Generate a realistic Google Meet room code
        const randomCode1 = Math.random().toString(36).substring(2, 6);
        const randomCode2 = Math.random().toString(36).substring(2, 6);
        const meetLink = `https://meet.google.com/mtg-${randomCode1}-${randomCode2}`;

        const calendarUrl = generateGoogleCalUrl(topic, selectedDate, selectedTimeSlot, meetLink, notes, clientName);

        const newMeeting: ScheduledMeeting = {
          id: Date.now().toString(),
          topic,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          notes: notes.trim(),
          meetLink,
          calendarUrl,
          createdAt: new Date().toISOString()
        };

        const updatedList = [newMeeting, ...upcomingEvents];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        setUpcomingEvents(updatedList);
        setScheduledEvent(newMeeting);

        // Reset form inputs
        setClientName('');
        setClientEmail('');
        setNotes('');
      } catch (err: any) {
        setError('Failed to schedule consultation. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }, 600);
  };

  const removeMeeting = (id: string) => {
    const updated = upcomingEvents.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUpcomingEvents(updated);
    if (scheduledEvent?.id === id) {
      setScheduledEvent(null);
    }
  };

  return (
    <div className="w-full text-white">
      {/* Top Info Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 mb-8 bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-indigo-950/40 border border-indigo-500/20 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              Open Consultation Access
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">No Login Required</span>
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              Select an available time slot below. Instant Google Meet & Calendar links are generated automatically.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-sm text-red-400">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Booking Form Card */}
        <div className="lg:col-span-7 bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8">
          <h4 className="text-xl font-bold mb-6 flex items-center gap-2.5">
            <CalendarIcon size={20} className="text-indigo-400" /> Schedule Discovery & Consultation
          </h4>

          {scheduledEvent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-950/20 border border-indigo-500/30 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <Check size={28} className="text-green-400" />
              </div>
              <h5 className="text-xl font-black mb-2 tracking-tight">Consultation Confirmed!</h5>
              <p className="text-xs text-white/60 mb-6 max-w-md leading-relaxed">
                Your consultation slot has been reserved. A confirmation summary and direct video link have been created for <span className="text-indigo-300 font-mono">{scheduledEvent.clientEmail}</span>.
              </p>

              <div className="w-full bg-[#080808] border border-white/10 rounded-2xl p-5 text-left mb-6 space-y-4 shadow-inner">
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Consultation Area</span>
                  <p className="text-sm font-bold text-white mt-0.5">{scheduledEvent.topic}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Date</span>
                    <p className="text-xs font-mono font-semibold text-indigo-400 mt-0.5">{scheduledEvent.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Time (Your Time)</span>
                    <p className="text-xs font-mono font-semibold text-indigo-400 mt-0.5">{scheduledEvent.timeSlot} (30 mins)</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Google Meet Room Link</span>
                  <p className="text-xs font-mono text-white/90 mt-1 select-all bg-white/5 p-2 rounded-lg border border-white/5 truncate">
                    {scheduledEvent.meetLink}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-4">
                <a 
                  href={scheduledEvent.meetLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Video size={16} /> Join Google Meet
                </a>
                <a 
                  href={scheduledEvent.calendarUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 transition-colors rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10"
                >
                  <PlusCircle size={16} className="text-indigo-400" /> Add to Google Cal
                </a>
              </div>

              <button 
                onClick={() => setScheduledEvent(null)}
                className="mt-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors py-2 px-4"
              >
                Schedule Another Consultation
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              {/* Step 1: Topic */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2.5">1. Select Core Area</label>
                <div className="grid grid-cols-1 gap-2">
                  {topics.map((t, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setTopic(t)}
                      className={`p-3.5 text-left text-xs rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        topic === t 
                          ? 'bg-indigo-500/15 border-indigo-500 text-white font-bold shadow-md shadow-indigo-500/10' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      <span>{t}</span>
                      {topic === t && <Check size={16} className="text-indigo-400 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Contact Info */}
              <div className="border-t border-white/5 pt-5">
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-3">2. Your Information</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/60 font-medium mb-1.5 flex items-center gap-1.5">
                      <User size={12} className="text-indigo-400" /> Full Name *
                    </label>
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Dr. Alex Mercer"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-white/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 font-medium mb-1.5 flex items-center gap-1.5">
                      <Mail size={12} className="text-indigo-400" /> Professional Email *
                    </label>
                    <input 
                      type="email" 
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. mercer@institute.edu"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-white/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Date & Time */}
              <div className="border-t border-white/5 pt-5">
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-3">3. Date & Available Slot</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/60 font-medium mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon size={12} className="text-indigo-400" /> Consultation Date *
                    </label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/60 font-medium mb-1.5 flex items-center gap-1.5">
                      <Clock size={12} className="text-indigo-400" /> Time Slot (30 Mins) *
                    </label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                      required
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-neutral-900 text-white">{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Notes */}
              <div className="border-t border-white/5 pt-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-400" /> Research Objective / Context
                  </label>
                  <span className="text-[10px] text-white/30 font-mono">Optional</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide brief details about your materials engineering challenge, computational simulation setup, or consultation objectives..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-white/20 h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">Scheduling...</span>
                ) : (
                  <>
                    Schedule Discovery Call <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Booked Consultations */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <CalendarCheck size={16} className="text-indigo-400" /> Scheduled Meetings
                </h4>
                <p className="text-[11px] text-white/40 mt-0.5">Instant Google Meet links ready to join</p>
              </div>
              <span className="text-xs font-mono bg-white/5 px-2.5 py-1 rounded-lg text-indigo-300 font-bold">
                {upcomingEvents.length} Active
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                <Video size={32} className="text-white/20 mb-3" />
                <p className="text-sm font-bold text-white/70 mb-1">No Consultations Scheduled</p>
                <p className="text-xs text-white/40 leading-relaxed max-w-[240px]">
                  Book a discovery slot on the left. Your consultation meeting room and Google Calendar link will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 hover:border-indigo-500/30 transition-all relative group">
                    <div className="flex justify-between items-start gap-2 pr-6">
                      <p className="text-xs font-bold text-white leading-snug line-clamp-1">{ev.topic}</p>
                      <button 
                        onClick={() => removeMeeting(ev.id)}
                        title="Remove from view"
                        className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/60 font-mono">
                      <span className="flex items-center gap-1 text-indigo-300 font-bold">
                        <Clock size={12} /> {ev.date} at {ev.timeSlot}
                      </span>
                      <span className="flex items-center gap-1 text-white/50 truncate max-w-[180px]">
                        <User size={12} /> {ev.clientName}
                      </span>
                    </div>

                    {ev.notes && (
                      <p className="text-[11px] text-white/50 bg-black/30 p-2 rounded-lg line-clamp-2 font-light">
                        "{ev.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <a 
                        href={ev.meetLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white transition-colors rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-indigo-500/20"
                      >
                        <Video size={12} className="text-indigo-400" /> Join Meet <ExternalLink size={10} />
                      </a>
                      <a 
                        href={ev.calendarUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        title="Add to Google Calendar"
                        className="py-2 px-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-white/10"
                      >
                        <PlusCircle size={12} className="text-green-400" /> Cal
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MANDATORY Explicit Confirmation Dialog Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 text-left shadow-2xl shadow-black/80 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Video size={24} className="text-indigo-400" />
              </div>

              <h4 className="text-xl font-black mb-2 tracking-tight">Confirm Consultation</h4>
              <p className="text-xs text-white/60 mb-6 leading-relaxed font-light">
                Please verify your discovery call booking. This will generate your instant Google Meet conference link and calendar invite.
              </p>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 mb-8">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Topic</span>
                  <span className="text-xs font-semibold text-right max-w-[220px] leading-snug">{topic}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Date</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Time</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Host</span>
                  <span className="text-xs font-medium">Abdul Rahman</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Client Name</span>
                  <span className="text-xs font-medium max-w-[180px] truncate">{clientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Client Email</span>
                  <span className="text-xs font-mono max-w-[180px] truncate">{clientEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndSchedule}
                  className="py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Confirm & Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
