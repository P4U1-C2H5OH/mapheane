import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Check, Star, Archive, Reply, X, Send, Users, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type InquiryType = 'Purchase' | 'Commission' | 'Workshop' | 'Press' | 'General' | 'Workshop-Booking';
type MsgStatus   = 'unread' | 'read' | 'replied' | 'archived';

interface Message {
  id: string;
  name: string;
  email: string;
  type: InquiryType;
  subject?: string;
  message: string;
  receivedAt: string; // formatted display string
  createdAt: string;  // ISO from DB
  status: MsgStatus;
  starred: boolean;
  crmLinked?: string;
}

function mapRow(row: Record<string, unknown>): Message {
  const created = new Date(row.created_at as string);
  const now = Date.now();
  const diff = now - created.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const receivedAt = mins < 60
    ? `${mins} min${mins !== 1 ? 's' : ''} ago`
    : hours < 24
    ? `${hours} hour${hours !== 1 ? 's' : ''} ago`
    : `${days} day${days !== 1 ? 's' : ''} ago`;

  return {
    id:         row.id as string,
    name:       (row.name as string)    ?? '—',
    email:      (row.email as string)   ?? '',
    type:       ((row.type ?? 'General') as InquiryType),
    subject:    (row.subject as string | undefined) ?? undefined,
    message:    (row.message as string) ?? '',
    receivedAt,
    createdAt:  row.created_at as string,
    status:     ((row.status ?? 'unread') as MsgStatus),
    starred:    !!(row.starred as boolean | undefined),
    crmLinked:  (row.crm_linked as string | undefined) ?? undefined,
  };
}

const TYPE_COLORS: Record<InquiryType | string, string> = {
  Purchase:          'bg-terracotta/12 text-terracotta',
  Commission:        'bg-clay/12 text-clay',
  Workshop:          'bg-sage/12 text-sageDark',
  'Workshop-Booking':'bg-sage/12 text-sageDark',
  Press:             'bg-charcoal/8 text-charcoal',
  General:           'bg-muted/10 text-muted',
};

const TEMPLATES: Record<string, string> = {
  Purchase:   'Thank you for your interest in [ARTWORK TITLE]. It is [available/sold] at R[PRICE] ZAR. I would love to tell you more about this piece — please let me know if you have questions about dimensions, framing, or shipping.',
  Commission: 'Thank you for reaching out about a commission. I am currently [accepting/not accepting] new commissions, with slots available from [DATE]. A commission in [MEDIUM] would start from R[PRICE]. Could you tell me more about the space the work is intended for, and any reference images you have in mind?',
  Workshop:   'Thank you for your interest in my workshops. The upcoming [WORKSHOP NAME] on [DATE] has [SPOTS] remaining at [PRICE] (local) / [PRICE USD] (international). Bookings are confirmed on receipt of payment. Would you like the payment details?',
  'Workshop-Booking': 'Thank you for your interest in my workshops. The upcoming [WORKSHOP NAME] on [DATE] has [SPOTS] remaining at [PRICE] (local) / [PRICE USD] (international). Bookings are confirmed on receipt of payment. Would you like the payment details?',
  Press:      'Thank you for your message. I would be delighted to speak with you. Please find my press kit attached. I am available for interviews [by email / by call] and can be reached at this address or by phone at +266 22 000 000.',
  General:    'Thank you for reaching out. I appreciate you taking the time to write. I will get back to you within 48 hours.',
};

const STATUS_ICON: Record<MsgStatus, React.ReactNode> = {
  unread:   <div className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0" />,
  read:     <Check className="w-3 h-3 text-muted/50 flex-shrink-0" />,
  replied:  <Reply className="w-3 h-3 text-sage flex-shrink-0" />,
  archived: <Archive className="w-3 h-3 text-muted/30 flex-shrink-0" />,
};

export function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch]     = useState('');
  const [typeFilter, setType]   = useState<InquiryType | 'all'>('all');
  const [reply, setReply]       = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [sendError, setSendError] = useState('');
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setLoadError('Failed to load messages.');
        } else {
          setMessages((data ?? []).map(mapRow));
        }
        setLoading(false);
      });
  }, []);

  const unread = messages.filter(m => m.status === 'unread').length;
  const filtered = messages.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.message.toLowerCase().includes(search.toLowerCase())) return false;
    return m.status !== 'archived';
  });

  const updateStatus = async (id: string, status: MsgStatus) => {
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev);
    }
  };

  const selectMsg = (msg: Message) => {
    setSelected(msg);
    if (msg.status === 'unread') updateStatus(msg.id, 'read');
    setReply(TEMPLATES[msg.type] ?? TEMPLATES.General);
    setSent(false);
  };

  const handleSend = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:      selected.email,
          toName:  selected.name,
          subject: `Re: ${selected.subject ?? selected.type + ' inquiry'} — Mapheane Studio`,
          body:    reply,
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      await updateStatus(selected.id, 'replied');
      setSent(true);
      setReply('');
    } catch {
      setSendError('Failed to send. Try again or reply from your email client.');
    } finally {
      setSending(false);
    }
  };

  const toggleStar = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    const starred = !msg.starred;
    const { error } = await supabase.from('messages').update({ starred }).eq('id', id);
    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, starred } : m));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, starred } : prev);
    }
  };

  const archiveMsg = async (id: string) => {
    await updateStatus(id, 'archived');
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Messages</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Communications
            {unread > 0 && <span className="ml-3 text-sm font-sans text-terracotta">{unread} unread</span>}
          </h2>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full bg-background border border-charcoal/12 pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-terracotta/40 transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'Commission', 'Purchase', 'Workshop', 'Press', 'General'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-2 text-xs font-sans uppercase tracking-widest transition-all ${
                typeFilter === t ? 'bg-charcoal text-background' : 'border border-charcoal/15 text-muted hover:border-charcoal/25'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-muted font-serif italic">Loading messages…</div>
      )}
      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* List + detail */}
      {!loading && !loadError && (
        <div className={`grid gap-0 border border-charcoal/8 ${selected ? 'lg:grid-cols-5' : 'grid-cols-1'}`}>

          {/* Message list */}
          <div className={`${selected ? 'lg:col-span-2 border-r border-charcoal/8' : 'col-span-full'} divide-y divide-charcoal/6`}>
            {filtered.map(msg => {
              const isSelected = selected?.id === msg.id;
              return (
                <div key={msg.id} onClick={() => selectMsg(msg)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-terracotta/4' : 'hover:bg-charcoal/3'
                  } ${msg.status === 'unread' ? 'bg-parchment/30' : ''}`}>
                  {/* Avatar */}
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-xs font-sans bg-charcoal/8 text-charcoal">
                    {msg.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm truncate ${msg.status === 'unread' ? 'font-500 text-charcoal' : 'text-charcoal/75'}`}>
                        {msg.name}
                      </p>
                      <span className={`flex-shrink-0 text-[10px] font-sans px-1.5 py-0.5 uppercase tracking-widest ${TYPE_COLORS[msg.type] ?? TYPE_COLORS.General}`}>
                        {msg.type}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className={`text-xs truncate mb-0.5 ${msg.status === 'unread' ? 'text-charcoal/80' : 'text-muted'}`}>
                        {msg.subject}
                      </p>
                    )}
                    <p className="text-xs text-muted/70 truncate">{msg.message.slice(0, 65)}…</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-[10px] text-muted whitespace-nowrap">{msg.receivedAt}</p>
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICON[msg.status]}
                      {msg.starred && <Star className="w-3 h-3 text-gold fill-gold" />}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted font-serif italic">No messages found.</div>
            )}
          </div>

          {/* Detail + reply */}
          <AnimatePresence>
            {selected && (
              <motion.div key={selected.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:col-span-3 flex flex-col"
                style={{ maxHeight: 'calc(100vh - 14rem)', minHeight: 400 }}
              >
                {/* Message header */}
                <div className="border-b border-charcoal/8 px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-sans font-500 text-charcoal">{selected.name}</p>
                      <span className={`text-[10px] font-sans px-2 py-0.5 uppercase tracking-widest ${TYPE_COLORS[selected.type] ?? TYPE_COLORS.General}`}>
                        {selected.type}
                      </span>
                      {selected.crmLinked && (
                        <span className="text-label text-muted flex items-center gap-1">
                          <Users className="w-3 h-3" /> {selected.crmLinked}
                        </span>
                      )}
                    </div>
                    <a href={`mailto:${selected.email}`} className="text-xs text-muted hover:text-terracotta transition-colors">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleStar(selected.id)}>
                      <Star className={`w-4 h-4 transition-colors ${selected.starred ? 'text-gold fill-gold' : 'text-muted hover:text-gold'}`} />
                    </button>
                    <button onClick={() => archiveMsg(selected.id)} title="Archive"
                      className="text-muted hover:text-charcoal transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelected(null)} className="text-muted hover:text-charcoal transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message body */}
                <div className="flex-1 overflow-y-auto p-5">
                  {selected.subject && (
                    <p className="font-serif italic text-lg text-charcoal mb-3">{selected.subject}</p>
                  )}
                  <p className="text-sm text-charcoal/75 leading-relaxed mb-2">{selected.message}</p>
                  <p className="text-xs text-muted">{selected.receivedAt}</p>
                </div>

                {/* Reply area */}
                <div className="border-t border-charcoal/8 p-5">
                  {sent ? (
                    <div className="flex items-center gap-3 py-3 text-sage">
                      <Check className="w-4 h-4" />
                      <p className="text-sm">Reply sent to {selected.email}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-label text-muted uppercase tracking-widest">Reply</p>
                        <p className="text-xs text-muted">Template: {selected.type}</p>
                      </div>
                      <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        rows={5}
                        className="w-full bg-parchment/30 border border-charcoal/10 p-3 text-sm text-charcoal/80 leading-relaxed resize-none focus:outline-none focus:border-terracotta/40 transition-colors mb-3 font-sans"
                        placeholder="Type your reply…"
                      />
                      {sendError && <p className="text-xs text-red-400 mb-2">{sendError}</p>}
                      <button onClick={handleSend} disabled={sending || !reply.trim()}
                        className="flex items-center gap-2 bg-terracotta text-background px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors disabled:opacity-50 shadow-button">
                        {sending
                          ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                          : <Send className="w-3.5 h-3.5" />}
                        Send Reply
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
