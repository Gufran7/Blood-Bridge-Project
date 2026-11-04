import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bot,
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  getAiChatReply,
  isGeminiConfigured,
  type ChatMessage,
} from '@/lib/geminiChat';

const STORAGE_KEY = 'blood_bridge_chat_history_v1';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-0',
  role: 'assistant',
  text: 'Namaste! I am the Blood Bridge AI Assistant. Ask me about blood group compatibility, donation eligibility guidelines, verified Solapur blood banks, or your donor passport.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  'Can O- donate to A+?',
  'Am I eligible to donate today?',
  'Where is Damani Blood Bank in Solapur?',
  'How long to wait after a tattoo?',
  'How do I post a blood request?',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [WELCOME_MESSAGE];
  });

  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  // Persist messages in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (open) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsTyping(true);

    // Call AI response engine
    try {
      const reply = await getAiChatReply(trimmed, [...messages, userMessage]);
      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: reply.text,
        link: reply.link,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'I encountered a brief connection issue. You can browse our Solapur Blood Banks directory or check the FAQ for instant answers.',
          link: { label: 'Explore Blood Banks', href: '#blood-banks' },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(draft);
  };

  const handleClearChat = () => {
    if (confirm('Clear your conversation history?')) {
      setMessages([WELCOME_MESSAGE]);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {/* Floating Chat Modal */}
      {open && (
        <section
          id={panelId}
          aria-label="Blood Bridge AI Assistant"
          className={`flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-950/95 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-300 ${
            isExpanded
              ? 'h-[min(48rem,calc(100vh-6rem))] w-[calc(100vw-2.5rem)] sm:w-[32rem]'
              : 'h-[min(36rem,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] sm:w-[24rem]'
          }`}
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ruby-500/15 ring-1 ring-ruby-500/30">
                <Bot className="h-5 w-5 text-ruby-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink-100">Blood Bridge AI</p>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-ruby-300 bg-ruby-500/10 px-2 py-0.5 rounded-full border border-ruby-500/20">
                    <Sparkles className="h-2.5 w-2.5" />
                    {isGeminiConfigured() ? 'Gemini AI' : 'Clinical AI'}
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">Eligibility, Compatibility & Solapur Directory</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear chat"
                className="rounded-lg p-1.5 text-ink-400 transition hover:bg-white/10 hover:text-ink-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Expand'}
                className="rounded-lg p-1.5 text-ink-400 transition hover:bg-white/10 hover:text-ink-200 hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-ink-400 transition hover:bg-white/10 hover:text-ink-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Medical Boundary Banner */}
          <div className="bg-ruby-950/40 border-b border-ruby-500/20 px-4 py-1.5 text-[10px] text-ruby-200 flex items-center justify-between">
            <span>ℹ️ Educational & Platform Assistant only • Does not diagnose or prescribe</span>
            <span className="font-semibold text-ruby-400">Emergency: 112 / 108</span>
          </div>

          {/* Messages List */}
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-xs" aria-live="polite">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-ruby-600 text-white shadow-lg'
                      : 'rounded-bl-sm bg-white/[0.05] text-ink-200 border border-white/10 shadow-sm'
                  }`}
                >
                  {m.text}

                  {m.link && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={m.link.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1.5 font-bold text-ruby-300 hover:text-ruby-200 transition"
                      >
                        {m.link.label}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-ink-500 px-1">{m.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-ink-400 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-2.5 max-w-[12rem]">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ruby-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-ruby-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-ruby-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-medium">Assistant thinking...</span>
              </div>
            )}
          </div>

          {/* Suggested Quick Question Chips */}
          <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar bg-ink-950/50">
            {SUGGESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-ink-300 hover:border-ruby-500/40 hover:text-white transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 bg-white/[0.02]">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about blood groups, Solapur centres, eligibility..."
                className="input pr-11 py-2.5 text-xs text-ink-100 placeholder:text-ink-500"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!draft.trim() || isTyping}
                className="absolute right-1.5 rounded-xl bg-ruby-500 p-2 text-white transition hover:bg-ruby-600 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close assistant' : 'Open Blood Bridge assistant'}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-ruby-700 via-ruby-600 to-ruby-500 text-white shadow-xl shadow-ruby-950/60 transition duration-300 hover:scale-105 hover:shadow-ruby-900/80 active:scale-95"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ruby-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-ink-950"></span>
        </span>
        <MessageCircle className="h-6 w-6 transition group-hover:rotate-6" />
      </button>
    </div>
  );
}
