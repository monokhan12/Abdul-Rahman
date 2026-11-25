import { useMemo, useState, type FormEvent } from 'react';
import { CalendarCheck, Loader2, Mail } from 'lucide-react';
import { personalInfo } from '../data';
import content from '../site/content.json';

/**
 * Consultation request form.
 *
 * Every request is delivered for real, in two independent ways, so one failing never loses a lead:
 *  1. An email to the site owner through FormSubmit (https://formsubmit.co). The very first
 *     submission sends a one-time "activate this form" email to the inbox; click it once.
 *  2. A record in the Firestore `bookings` collection (see firestore.rules), visible in the
 *     Firebase console.
 * If both fail, the visitor is offered a pre-filled email instead of a fake confirmation.
 *
 * Optional: set `site.schedulingUrl` in content.json to a Cal.com or Calendly link and visitors
 * can also pick a slot on your live calendar.
 */

const topics = [
  'Metallurgical failure analysis',
  'SEM/EDS or XRD data interpretation',
  'Materials informatics and machine learning',
  'Corrosion and protective coatings',
  'Battery recycling and critical minerals',
  'AI agents, automation or industrial IoT (C2F)',
  'Research collaboration or PhD opportunity',
  'Something else',
];

const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const schedulingUrl: string = (content.site as { schedulingUrl?: string }).schedulingUrl || '';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function BookingForm() {
  const timeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your local time';
    } catch {
      return 'your local time';
    }
  }, []);
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return localDate(d);
  }, []);

  const [form, setForm] = useState({
    topic: topics[0],
    name: '',
    email: '',
    organization: '',
    date: minDate,
    time: '10:00',
    message: '',
    website: '', // honeypot: real people never see or fill this
  });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const startIso = () => {
    const d = new Date(`${form.date}T${form.time}:00`);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString();
  };

  const summary = () =>
    [
      `Topic: ${form.topic}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.organization && `Organization: ${form.organization}`,
      `Preferred time: ${form.date} ${form.time} (${timeZone})`,
      startIso() && `Preferred time (UTC): ${startIso()}`,
      '',
      form.message || '(no message)',
    ]
      .filter((l): l is string => typeof l === 'string')
      .join('\n');

  const mailtoHref = () =>
    `mailto:${personalInfo.email}?subject=${encodeURIComponent(`Consultation request: ${form.topic}`)}&body=${encodeURIComponent(summary())}`;

  async function sendEmail(): Promise<boolean> {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${personalInfo.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `New consultation request: ${form.topic}`,
          _replyto: form.email,
          _template: 'table',
          _captcha: 'false',
          topic: form.topic,
          name: form.name,
          email: form.email,
          organization: form.organization || '-',
          preferred_time: `${form.date} ${form.time} (${timeZone})`,
          preferred_time_utc: startIso() || '-',
          message: form.message || '-',
        }),
      });
      if (!res.ok) return false;
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      return data.success === true || data.success === 'true';
    } catch {
      return false;
    }
  }

  async function saveRecord(): Promise<boolean> {
    try {
      const [{ db }, { addDoc, collection, serverTimestamp }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore'),
      ]);
      await addDoc(collection(db, 'bookings'), {
        topic: form.topic,
        name: form.name.trim(),
        email: form.email.trim(),
        organization: form.organization.trim(),
        preferredDate: form.date,
        preferredTime: form.time,
        timeZone,
        preferredStartUtc: startIso(),
        message: form.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      });
      return true;
    } catch {
      return false;
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.website) {
      setStatus('sent'); // bot: pretend success, send nothing
      return;
    }
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please add your name and a valid email address so I can send the invite.');
      return;
    }
    setStatus('sending');
    // Firestore waits indefinitely when it can't reach the server, so cap both channels.
    const within = (task: Promise<boolean>, ms: number) =>
      Promise.race([task, new Promise<boolean>((resolve) => setTimeout(() => resolve(false), ms))]);
    const [emailed, saved] = await Promise.all([within(sendEmail(), 15000), within(saveRecord(), 8000)]);
    setStatus(emailed || saved ? 'sent' : 'failed');
  }

  if (status === 'sent') {
    return (
      <div className="ar-booking ar-booking--done" role="status">
        <CalendarCheck size={28} aria-hidden="true" />
        <h3 className="ar-h3">Request received</h3>
        <p>
          Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}. I'll reply to <strong>{form.email}</strong> within one
          business day with a confirmed time and a Google Meet invite.
        </p>
        {schedulingUrl && (
          <p>
            Want to lock in a slot now?{' '}
            <a href={schedulingUrl} target="_blank" rel="noopener" className="ar-textlink">Pick a time on my calendar</a>.
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="ar-booking" onSubmit={onSubmit} noValidate>
      {schedulingUrl && (
        <p className="ar-booking__alt">
          <a href={schedulingUrl} target="_blank" rel="noopener" className="ar-btn ar-btn--ghost">
            Pick a slot on my calendar
          </a>
          <span className="ar-small">or send a request below</span>
        </p>
      )}

      <div className="ar-field">
        <label htmlFor="bk-topic">What would you like to discuss?</label>
        <select id="bk-topic" value={form.topic} onChange={update('topic')}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="ar-field-row">
        <div className="ar-field">
          <label htmlFor="bk-name">Full name *</label>
          <input id="bk-name" autoComplete="name" required value={form.name} onChange={update('name')} />
        </div>
        <div className="ar-field">
          <label htmlFor="bk-email">Work email *</label>
          <input id="bk-email" type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
        </div>
      </div>

      <div className="ar-field">
        <label htmlFor="bk-org">Company or university</label>
        <input id="bk-org" autoComplete="organization" value={form.organization} onChange={update('organization')} />
      </div>

      <fieldset className="ar-field-row">
        <legend>Preferred time ({timeZone})</legend>
        <div className="ar-field">
          <label htmlFor="bk-date">Date</label>
          <input id="bk-date" type="date" min={minDate} value={form.date} onChange={update('date')} />
        </div>
        <div className="ar-field">
          <label htmlFor="bk-time">Start time</label>
          <select id="bk-time" value={form.time} onChange={update('time')}>
            {times.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="ar-field">
        <label htmlFor="bk-msg">What are you working on?</label>
        <textarea
          id="bk-msg"
          rows={4}
          value={form.message}
          onChange={update('message')}
          placeholder="For example: a cracked shaft from a pump, an XRD pattern you need interpreted, or a workflow you want to automate."
        />
      </div>

      <div className="ar-hp" aria-hidden="true">
        <label htmlFor="bk-website">Website</label>
        <input id="bk-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
      </div>

      {error && <p className="ar-booking__error" role="alert">{error}</p>}
      {status === 'failed' && (
        <p className="ar-booking__error" role="alert">
          Your request couldn't be sent from this page. Please{' '}
          <a href={mailtoHref()} className="ar-textlink">email it to me instead</a>. Your details are already filled in.
        </p>
      )}

      <div className="ar-booking__actions">
        <button type="submit" className="ar-btn ar-btn--primary" disabled={status === 'sending'}>
          {status === 'sending' ? <Loader2 size={16} className="ar-spin" aria-hidden="true" /> : null}
          {status === 'sending' ? 'Sending…' : 'Request a free 30-minute call'}
        </button>
        <a href={`mailto:${personalInfo.email}`} className="ar-textlink ar-booking__mail">
          <Mail size={15} aria-hidden="true" /> Or email me directly
        </a>
      </div>
      <p className="ar-small">I reply within one business day. Your details are used only to arrange the call.</p>
    </form>
  );
}
