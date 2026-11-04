import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Volume2, 
  Mic, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { speakFrench, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/audio';
import { chatWithTutorEngine } from '../utils/tutorEngine';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    } catch (e) {
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            👨‍🏫
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>Léo · Tutor de Francés</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Activo" />
            </h1>
            <p className="text-xs text-slate-500">
              {isSwedish
                ? 'Ställ frågor, öva rollspel eller be om förklaringar'
                : 'Pregunta dudas, practica rol o pide que te haga preguntas'}
            </p>
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
          className="text-xs text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 flex items-center gap-1 transition-colors"
          title="Reiniciar chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSwedish ? 'Börja om' : 'Reiniciar'}</span>
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-4 min-h-[420px] max-h-[520px] overflow-y-auto flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[11px] font-bold opacity-75">
                    {m.role === 'user' ? 'Tú' : 'Léo'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] opacity-60 tabular-nums">{m.timestamp}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => speakFrench(m.content)}
                        className="text-slate-400 hover:text-indigo-600 p-0.5"
                        title="Escuchar"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-medium whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-2">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
              <span>{isSwedish ? 'Léo skriver ett svar...' : 'Léo está escribiendo...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            {isSwedish ? 'Förslag på frågor:' : 'Ideas rápidas para preguntar:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-3 py-1 text-xs rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 transition-all text-left"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input controls */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isSwedish ? 'Skriv till Léo...' : 'Escribe a Léo en francés o pregunta en español...'}
          className="w-full pl-4 pr-24 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm"
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {micSupported && (
            <button
              type="button"
              onClick={handleStartMic}
              className={`p-2 rounded-xl transition-colors ${
                isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
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
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
