import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Check, 
  LogOut, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  CalendarCheck,
  User,
  Loader2
} from 'lucide-react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  scheduleGoogleMeet, 
  fetchUpcomingEvents,
  MeetEventDetails 
} from '../lib/googleCalendar';
import { User as FirebaseUser } from 'firebase/auth';

export default function GoogleMeetScheduler() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [topic, setTopic] = useState<string>('Computational Materials Science & AI');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Confirmation Modal & Success states
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [scheduledEvent, setScheduledEvent] = useState<any | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [refreshingEvents, setRefreshingEvents] = useState<boolean>(false);

  // Topics available
  const topics = [
    'Computational Materials Science & AI',
    'Physical & Extractive Metallurgy',
    'Surfaces, Interfaces & Degradation',
    'Sustainable Materials & Circular Economy',
    'General Industrial AI Workflow Consultation'
  ];

  // Time slots (using local timezone)
  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
  ];

  useEffect(() => {
    // Listen for auth state change
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setLoading(false);
        loadUpcomingEvents(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    );

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTimeSlot('10:00');

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        loadUpcomingEvents(result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setUpcomingEvents([]);
      setScheduledEvent(null);
    } catch (err: any) {
      setError('Failed to sign out.');
    }
  };

  const loadUpcomingEvents = async (accessToken: string) => {
    setRefreshingEvents(true);
    try {
      const events = await fetchUpcomingEvents(accessToken);
      // Filter events that have Google Meet or scheduled through this applet
      const relevant = events.filter((e: any) => 
        e.summary?.includes('Consultation') || e.conferenceData?.entryPoints?.length > 0
      );
      setUpcomingEvents(relevant);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setRefreshingEvents(false);
    }
  };

  const triggerScheduleAttempt = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both a valid date and time slot.');
      return;
    }
    // Present the MANDATORY confirmation dialog
    setShowConfirm(true);
  };

  const confirmAndSchedule = async () => {
    setShowConfirm(false);
    if (!token || !user) {
      setError('Authentication expired. Please sign in again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Calculate start and end ISO times
      const startDateTimeStr = `${selectedDate}T${selectedTimeSlot}:00`;
      const startDate = new Date(startDateTimeStr);
      
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30-minute meeting

      const details: MeetEventDetails = {
        summary: `Consultation with Abdul Rahman: ${topic}`,
        description: `Topic: ${topic}\n\nClient Name: ${user.displayName || 'Client'}\nClient Email: ${user.email}\n\nNotes:\n${notes || 'No extra notes provided.'}\n\nScheduled securely via Abdul Rahman Portfolio.`,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        attendeeEmail: user.email || '',
      };

      const result = await scheduleGoogleMeet(token, details);
      setScheduledEvent(result);
      loadUpcomingEvents(token);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the calendar event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full text-white">
      {/* Sign-in Status Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-xs">
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-8 h-8 rounded-full border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div>
                <p className="font-semibold text-white">{user.displayName}</p>
                <p className="text-white/50">{user.email}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <User size={16} className="text-white/40" />
              </div>
              <div>
                <p className="font-medium text-white/70">Connect Google Calendar</p>
                <p className="text-white/40">Authenticate securely to book & see your meets</p>
              </div>
            </>
          )}
        </div>

        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/20 transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer"
          >
            <LogOut size={12} /> Sign Out
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-sm text-red-400">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/50 gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-xs uppercase tracking-widest font-semibold">Verifying Google Credentials...</p>
        </div>
      ) : !user ? (
        <div className="p-8 border border-white/5 bg-[#111] rounded-3xl text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <Video size={28} className="text-indigo-400" />
          </div>
          <h4 className="text-2xl font-black tracking-tight mb-3">Google Meet Consultation</h4>
          <p className="text-white/60 mb-8 max-w-md text-sm leading-relaxed font-light">
            Authenticate using your Google Account to schedule a 30-minute professional consultation directly onto your calendar, automatically equipped with a Google Meet meeting room.
          </p>

          <button
            onClick={handleLogin}
            className="gsi-material-button w-full sm:w-auto flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            style={{
              background: '#FFFFFF',
              color: '#1f1f1f',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 24px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(255,255,255,0.05)'
            }}
          >
            <div className="flex items-center gap-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '20px', height: '20px' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Connect with Google Calendar</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Booking Form Card */}
          <div className="lg:col-span-7 bg-[#111] border border-white/5 rounded-3xl p-6 md:p-8">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-indigo-400" /> Choose Consultation Details
            </h4>

            {scheduledEvent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-2xl text-center flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <Check size={24} className="text-green-400" />
                </div>
                <h5 className="text-lg font-bold mb-2">Meeting Scheduled Successfully!</h5>
                <p className="text-xs text-white/50 mb-6 max-w-sm">
                  We've successfully created the calendar invitation on your Google Calendar and generated a Google Meet video conference link.
                </p>

                <div className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-left mb-6 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase text-white/40 tracking-wider">Event Topic</span>
                    <p className="text-sm font-semibold">{scheduledEvent.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-[10px] uppercase text-white/40 tracking-wider">Date</span>
                      <p className="text-xs font-mono">{new Date(scheduledEvent.start.dateTime).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-white/40 tracking-wider">Time</span>
                      <p className="text-xs font-mono">
                        {new Date(scheduledEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {scheduledEvent.hangoutLink && (
                  <a 
                    href={scheduledEvent.hangoutLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Video size={16} /> Join Google Meet <ExternalLink size={12} />
                  </a>
                )}

                <button 
                  onClick={() => setScheduledEvent(null)}
                  className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Schedule Another Meeting
                </button>
              </motion.div>
            ) : (
              <form onSubmit={triggerScheduleAttempt} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Select Core Area</label>
                  <div className="grid grid-cols-1 gap-2">
                    {topics.map((t, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setTopic(t)}
                        className={`p-3.5 text-left text-xs rounded-xl border transition-all flex items-center justify-between ${
                          topic === t 
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-white font-semibold shadow-md shadow-indigo-500/5' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70'
                        }`}
                      >
                        <span>{t}</span>
                        {topic === t && <Check size={14} className="text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Date</label>
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
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Available Slot (Your Time)</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                      required
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-neutral-900 text-white">{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Notes / Research Objective</label>
                    <span className="text-[10px] text-white/30">Optional</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide brief details about your materials, process engineering, or modeling needs..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 text-white h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Scheduling...
                    </>
                  ) : (
                    <>
                      Schedule Discovery Call <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Upcoming Meetings */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                  <CalendarCheck size={16} className="text-indigo-400" /> Scheduled Meetings
                </h4>
                <button
                  onClick={() => loadUpcomingEvents(token!)}
                  disabled={refreshingEvents}
                  className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 tracking-wider disabled:opacity-40"
                >
                  {refreshingEvents ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {refreshingEvents && upcomingEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-white/40 gap-3">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Syncing Calendar...</span>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                  <Info size={28} className="text-white/20 mb-3" />
                  <p className="text-sm font-bold text-white/60 mb-1">No Active Consultations</p>
                  <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                    Once scheduled, your consultations will display here with direct Google Meet links.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {upcomingEvents.map((ev, i) => {
                    const startVal = ev.start?.dateTime || ev.start?.date;
                    const eventDate = startVal ? new Date(startVal) : null;
                    const hangoutLink = ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri;
                    
                    return (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-white leading-snug line-clamp-1">{ev.summary}</p>
                          {eventDate && (
                            <p className="text-[10px] font-mono text-indigo-400 mt-1 flex items-center gap-1.5">
                              <Clock size={10} /> 
                              {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        {hangoutLink && (
                          <a 
                            href={hangoutLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white transition-colors rounded-lg text-[10px] font-bold uppercase tracking-wider"
                          >
                            <Video size={12} /> Meet Room <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 text-left shadow-2xl shadow-black/50 z-10"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Video size={24} className="text-indigo-400" />
              </div>

              <h4 className="text-xl font-black mb-3">Confirm Appointment Creation</h4>
              <p className="text-sm text-white/60 mb-6 leading-relaxed font-light">
                This action will write an event to your Google Calendar and generate a secure Google Meet link for both parties.
              </p>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 mb-8">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Consultation</span>
                  <span className="text-xs font-semibold text-right max-w-[200px] line-clamp-1">{topic}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Date</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Time</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Host</span>
                  <span className="text-xs font-medium">Abdul Rahman</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Client Email</span>
                  <span className="text-xs font-mono max-w-[150px] truncate">{user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndSchedule}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-colors"
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
