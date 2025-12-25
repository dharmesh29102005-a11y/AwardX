import React, { useEffect, useMemo, useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { db } from '../../services/database';
import { auth, messages as messagesApi, realtime } from '../../services/supabase';
import { Modal } from '../Modal';
import { Button } from '../Button';

type ThreadRow = {
  id: string;
  subject: string | null;
  updated_at?: string;
  messages?: Array<{ content: string; sent_at: string; sender_name?: string | null }>;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_avatar: string | null;
  content: string;
  sent_at: string;
};

export const MessagesView: React.FC = () => {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ userId: string; name: string; email: string; avatar: string }>>([]);
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [newThreadQuery, setNewThreadQuery] = useState('');
  const [selectedRecipientUserId, setSelectedRecipientUserId] = useState<string | null>(null);
  const [creatingThread, setCreatingThread] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingThreads(true);
      setError(null);
      const { user } = await auth.getUser();
      setCurrentUserId(user?.id || null);

      try {
        const members = await db.getTeamMembers();
        setTeamMembers(
          (members || [])
            .filter(m => m.userId && m.userId !== user?.id)
            .map(m => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
              avatar: m.avatar,
            }))
        );

        const data = await db.getMessageThreads();
        setThreads(data as any);
        setActiveThreadId((data as any)?.[0]?.id ?? null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load threads');
      } finally {
        setLoadingThreads(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let channel: any = null;

    const loadMessages = async () => {
      if (!activeThreadId) return;
      setLoadingMessages(true);
      setError(null);
      try {
        const msgs = await db.getMessagesByThread(activeThreadId);
        setThreadMessages(msgs as any);
        await messagesApi.markAsRead(activeThreadId);

        channel = realtime.subscribeToMessages(activeThreadId, (payload: any) => {
          if (payload?.new) {
            setThreadMessages(prev => {
              const next = [...prev, payload.new as MessageRow];
              // ensure stable ordering even if payload arrives slightly out of order
              next.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
              return next;
            });
          }
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      if (channel) realtime.unsubscribe(channel);
    };
  }, [activeThreadId]);

  const activeThread = useMemo(
    () => threads.find(t => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const send = async () => {
    if (!activeThreadId) return;
    const content = draft.trim();
    if (!content) return;

    setDraft('');
    try {
      await db.sendMessage(activeThreadId, content);
      // Realtime will append; in case realtime isn't available, refresh
      const msgs = await db.getMessagesByThread(activeThreadId);
      setThreadMessages(msgs as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to send message');
    }
  };

  const refreshThreads = async () => {
    const data = await db.getMessageThreads();
    setThreads(data as any);
    return data as any[];
  };

  const createNewThread = async () => {
    if (!selectedRecipientUserId) return;
    setCreatingThread(true);
    setError(null);
    try {
      const recipient = teamMembers.find(m => m.userId === selectedRecipientUserId);
      const subject = recipient?.name ? `Conversation with ${recipient.name}` : 'Conversation';
      const { data, error } = await messagesApi.createThread(subject, [selectedRecipientUserId]);
      if (error) throw error;
      setIsNewThreadOpen(false);
      setSelectedRecipientUserId(null);
      setNewThreadQuery('');

      const updated = await refreshThreads();
      const createdId = (data as any)?.id;
      setActiveThreadId(createdId || updated?.[0]?.id || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to create thread');
    } finally {
      setCreatingThread(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const q = newThreadQuery.trim().toLowerCase();
    if (!q) return teamMembers;
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [teamMembers, newThreadQuery]);

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-lg">Inbox</h2>
            <Button size="sm" onClick={() => setIsNewThreadOpen(true)}>
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search threads..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={loadingThreads}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingThreads && (
            <div className="p-4 text-sm text-slate-500">Loading…</div>
          )}
          {!loadingThreads && threads.length === 0 && (
            <div className="p-4 space-y-3">
              <div className="text-sm text-slate-500">No threads yet.</div>
              <Button onClick={() => setIsNewThreadOpen(true)} className="w-full">
                Message a team member
              </Button>
            </div>
          )}

          {threads.map((t) => {
            const last = t.messages?.[t.messages.length - 1];
            const lastText = last?.content || '';
            const lastTime = last?.sent_at ? new Date(last.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const label = t.subject || 'Untitled thread';

            return (
              <div
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${activeThreadId === t.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900 truncate pr-3">{label}</span>
                  <span className="text-xs text-slate-400">{lastTime}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">{lastText}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">
                {activeThread?.subject || (activeThreadId ? 'Thread' : 'Select a thread')}
              </div>
              <div className="text-xs text-slate-500">
                {activeThreadId ? 'Messages are live via Supabase' : ' '}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-indigo-600" disabled={!activeThreadId}><Phone className="w-5 h-5" /></button>
            <button className="hover:text-indigo-600" disabled={!activeThreadId}><Video className="w-5 h-5" /></button>
            <button className="hover:text-indigo-600" disabled={!activeThreadId}><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loadingMessages && <div className="text-sm text-slate-500">Loading messages…</div>}
          {!loadingMessages && activeThreadId && threadMessages.length === 0 && (
            <div className="text-sm text-slate-500">No messages in this thread yet.</div>
          )}

          {threadMessages.map((m) => {
            const isOutgoing = !!currentUserId && m.sender_id === currentUserId;
            const time = m.sent_at ? new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const senderLabel = m.sender_name || 'User';

            if (isOutgoing) {
              return (
                <div key={m.id} className="flex gap-4 max-w-lg ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mt-1 shrink-0">
                    {(senderLabel || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block text-right">{time}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="flex gap-4 max-w-lg">
                <img
                  src={m.sender_avatar || `https://i.pravatar.cc/150?u=${m.sender_id || m.id}`}
                  alt=""
                  className="w-8 h-8 rounded-full mt-1 shrink-0"
                />
                <div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-700 text-sm whitespace-pre-wrap">
                    {m.content}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">{time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-lg" disabled={!activeThreadId}>
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder={activeThreadId ? 'Type a message…' : 'Select a thread to start'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={!activeThreadId}
            />
            <button
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:hover:bg-indigo-600"
              onClick={send}
              disabled={!activeThreadId || !draft.trim()}
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isNewThreadOpen}
        onClose={() => {
          setIsNewThreadOpen(false);
          setNewThreadQuery('');
          setSelectedRecipientUserId(null);
        }}
        title="New message"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">To</label>
            <input
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Search by name or email…"
              value={newThreadQuery}
              onChange={(e) => setNewThreadQuery(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">
                No team members found.
              </div>
            ) : (
              filteredMembers.map(m => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setSelectedRecipientUserId(m.userId)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 ${
                    selectedRecipientUserId === m.userId ? 'bg-indigo-50' : ''
                  }`}
                >
                  <img src={m.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{m.name}</div>
                    <div className="text-xs text-slate-500 truncate">{m.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsNewThreadOpen(false)}>Cancel</Button>
            <Button onClick={createNewThread} disabled={!selectedRecipientUserId || creatingThread}>
              {creatingThread ? 'Creating…' : 'Start chat'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
