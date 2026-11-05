import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Volume2, 
  Mic, 
  Sparkles, 
  RotateCcw, 
  MessageSquare,
  Sparkle
} from 'lucide-react';
import { UserProfile } from '../types';
import { speakFrench, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/audio';
import { chatWithTutorEngine } from '../utils/tutorEngine';
import { SectionBanner } from './SectionBanner';

interface AITutorChatProps {
  profile: UserProfile;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ profile }) => {
  const isSwedish = profile.supportLanguage === 'sv';
  const micSupported = isSpeechRecognitionSupported();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: isSwedish
        ? 'Bonjour ! Je m\'appelle Léo, din fransklärare. Vad vill du öva på idag ? Comment tu t\'appelles ?'
        : '¡Bonjour ! Je m\'appelle Léo, tu tutor de francés. ¿Qué te gustaría practicar hoy? Comment tu t\'appelles ? 😊',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll only internally within the messages container when new messages arrive (NEVER scroll the window)
  useEffect(() => {
    if (messages.length > 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiReply = await chatWithTutorEngine(allMessages, profile.supportLanguage);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakFrench(aiReply);
    } catch {
      const fallbackReply = isSwedish
        ? 'Très bien ! Du gör stora framsteg. Vill du öva på siffror eller mat ?'
        : '¡Muy bien! Estás haciendo un gran esfuerzo. ¿Quieres practicar números, animales o la comida?';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakFrench(fallbackReply);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMic = () => {
    if (!micSupported) return;
    const recognizer = createSpeechRecognizer(
      (text) => {
        setIsListening(false);
        setInputValue(text);
      },
      () => setIsListening(false)
    );
    if (recognizer) {
      setIsListening(true);
      recognizer.start();
    }
  };

  const quickPrompts = isSwedish
    ? [
        "Comment on dit 'katt' en français ?",
        "Je m'appelle Maria et j'ai 13 ans.",
        "Pose-moi une question facile !",
        "Je voudrais un croissant s'il vous plaît !",
      ]
    : [
        "¿Cómo se dice 'gato' en francés?",
        "Je m'appelle Maria et j'ai 13 ans.",
        "¡Hazme una pregunta fácil en francés!",
        "Je voudrais un croissant s'il vous plaît !",
      ];

  return (
    <div>
      {/* Unified Section Header matching Chispa style */}
      <SectionBanner
        categoryBadge={isSwedish ? 'TUTOR I FRANSKA · LÉO' : 'TUTOR EN VIVO · LÉO'}
        categoryIcon={MessageSquare}
        title={isSwedish ? 'Tala franska med Léo' : 'Habla en Francés con Léo'}
        description={
          isSwedish
            ? 'Ställ frågor om grammatik, öva på vardagliga dialoger eller be Léo att utmana dig.'
            : 'Conversación guiada, resolución de dudas al instante y correcciones amables en francés.'
        }
        metrics={[
          { value: 'A1', label: isSwedish ? 'Nivå' : 'Nivel', colorClass: 'text-purple-600' },
          { value: '100%', label: isSwedish ? 'Ljud (TTS)' : 'Audio Activo', colorClass: 'text-emerald-600' },
          { value: 'Åk 6', label: isSwedish ? 'Stadie' : 'Etapa', colorClass: 'text-indigo-600' },
        ]}
      />

      {/* Main Chat Container - Compact height to avoid window scrolling */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col">
          {/* Top Bar of Chat */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                👨‍🏫
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 leading-none">
                  <span>Léo</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                </h3>
                <span className="text-[11px] text-slate-400 leading-tight">
                  {isSwedish ? 'Fransklärare redo att hjälpa dig' : 'Tutor pedagógico preparado'}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'restart',
                    role: 'assistant',
                    content: isSwedish ? 'Bonjour ! Que veux-tu pratiquer ?' : '¡Bonjour ! ¿Qué te apetece practicar?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="text-xs text-slate-400 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reiniciar chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSwedish ? 'Börja om' : 'Reiniciar'}</span>
            </button>
          </div>

          {/* Internal Scrollable Chat Messages (Compact height ~260px) */}
          <div 
            ref={chatContainerRef}
            className="h-[260px] sm:h-[280px] overflow-y-auto pr-1 space-y-3 mb-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-2xs'
                      : 'bg-purple-50/50 text-slate-900 rounded-tl-none border border-purple-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-[11px] font-bold opacity-75">
                      {m.role === 'user' ? (isSwedish ? 'Du' : 'Tú') : 'Léo'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] opacity-60 tabular-nums">{m.timestamp}</span>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => speakFrench(m.content)}
                          className="text-purple-600 hover:text-purple-800 p-0.5 cursor-pointer"
                          title="Escuchar audio"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="font-medium whitespace-pre-wrap leading-snug">{m.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-purple-600 text-xs italic pl-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>{isSwedish ? 'Léo skriver ett svar...' : 'Léo está respondiendo...'}</span>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="pt-2.5 pb-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">
              {isSwedish ? 'Förslag:' : 'Sugerencias:'}
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 hover:border-purple-200 transition-all text-left shrink-0 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isSwedish ? 'Skriv till Léo...' : 'Escribe a Léo en francés o en español...'}
              className="w-full pl-4 pr-24 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 text-sm font-medium text-slate-900"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              {micSupported && (
                <button
                  type="button"
                  onClick={handleStartMic}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-purple-600 hover:bg-slate-100'
                  }`}
                  title="Hablar por micrófono"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
