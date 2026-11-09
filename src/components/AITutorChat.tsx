import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Volume2, 
  Mic, 
  Sparkles, 
  RotateCcw, 
  AlertCircle,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { UserProfile, StudentMemoryFacts, ImmersionLevel } from '../types';
import { speakFrench, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/audio';
import { 
  loadChatHistory, 
  saveChatHistory, 
  loadStudentFacts, 
  saveStudentFacts, 
  extractFactsFromUserMessage, 
  saveUserProfile 
} from '../utils/storage';

interface AITutorChatProps {
  profile: UserProfile;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface ChatMessageItem extends GeminiMessage {
  id: string;
  timestamp: string;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ profile }) => {
  const isSwedish = profile.supportLanguage === 'sv';
  const micSupported = isSpeechRecognitionSupported();

  // French immersion level preference (default 'high' = más francés sencillo y menos español)
  const [immersionLevel, setImmersionLevel] = useState<ImmersionLevel>(() => {
    return profile.frenchImmersionLevel || 'high';
  });

  const handleSetImmersion = (level: ImmersionLevel) => {
    setImmersionLevel(level);
    profile.frenchImmersionLevel = level;
    saveUserProfile({ ...profile, frenchImmersionLevel: level });
  };

  // Persistent student facts (name, age, pets, favorite foods, hobbies)
  const [studentFacts, setStudentFacts] = useState<StudentMemoryFacts>(() => {
    return loadStudentFacts(profile.id, profile.name);
  });

  const knownName = studentFacts.name || (profile.name && profile.name !== 'Élève' ? profile.name : undefined);

  // Camille starts directly with friendly, accessible French
  const initialGreeting = isSwedish
    ? (knownName 
        ? `Bonjour ${knownName} ! Comment ça va aujourd'hui ? (Hur mår du idag?). Vad vill du att vi pratar om: la musique, les animaux eller l'école ?` 
        : "Bonjour ! Je m'appelle Camille. (Jag heter Camille). Et toi, comment tu t'appelles ? (Vad heter du?)")
    : (knownName
        ? `Bonjour ${knownName} ! Comment ça va aujourd'hui ? (¿Cómo estás hoy?). ¿De qué te gustaría hablar: la musique, les animaux o l'école ?`
        : "Bonjour ! Je m'appelle Camille. (Me llamo Camille). Et toi, comment tu t'appelles ? (¿Y tú, cómo te llamas?)");

  // chatHistory maintained in Gemini's exact schema and persisted in storage
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    const saved = loadChatHistory(profile.id);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'init-1',
        role: 'model',
        parts: [{ text: initialGreeting }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Automatically save chat history on any message update
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages, profile.id);
    }
  }, [messages, profile.id]);

  // Internal scroll within messages container
  useEffect(() => {
    if (messages.length > 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, errorMessage]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);

    // 1. Client-side intelligent fact extractor
    const { facts: updatedFacts, updated } = extractFactsFromUserMessage(text, studentFacts);
    let activeFacts = studentFacts;
    if (updated) {
      activeFacts = updatedFacts;
      setStudentFacts(updatedFacts);
      saveStudentFacts(updatedFacts, profile.id);
      // If student told us their name, update profile name as well
      if (updatedFacts.name && updatedFacts.name !== profile.name) {
        profile.name = updatedFacts.name;
        saveUserProfile({ ...profile, name: updatedFacts.name });
      }
    }

    // 2. Dynamic language immersion detection based on user request
    let activeImmersion = immersionLevel;
    const lower = text.toLowerCase();
    if (
      lower.includes('más francés') || 
      lower.includes('mas frances') || 
      lower.includes('parle en français') || 
      lower.includes('en français') || 
      lower.includes('plus de français') ||
      lower.includes('mer franska')
    ) {
      activeImmersion = 'high';
      handleSetImmersion('high');
    } else if (
      lower.includes('solo francés') || 
      lower.includes('todo en francés') || 
      lower.includes('tout en français') || 
      lower.includes('bara franska')
    ) {
      activeImmersion = 'french-only';
      handleSetImmersion('french-only');
    } else if (
      lower.includes('en español') || 
      lower.includes('no entiendo') || 
      lower.includes('explícamelo en español') || 
      lower.includes('på svenska') || 
      lower.includes('förklara på svenska') ||
      lower.includes('equilibrado') ||
      lower.includes('mitad y mitad')
    ) {
      activeImmersion = 'balanced';
      handleSetImmersion('balanced');
    }

    const userMsg: ChatMessageItem = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Build complete updated Gemini chatHistory
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    // Prepare strictly Gemini-formatted chatHistory
    const chatHistory: GeminiMessage[] = updatedMessages.map((m) => ({
      role: m.role,
      parts: m.parts,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({ 
          messages: chatHistory,
          studentName: activeFacts.name || (profile.name !== 'Élève' ? profile.name : undefined),
          studentFacts: activeFacts,
          supportLanguage: profile.supportLanguage,
          immersionLevel: activeImmersion
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detailedErr = errorData.details
          ? `${errorData.error} (${typeof errorData.details === 'object' ? JSON.stringify(errorData.details) : errorData.details})`
          : (errorData.error || `Error en el servidor al consultar a la IA (código ${response.status})`);
        throw new Error(detailedErr);
      }

      const data = await response.json();
      const replyText = data.reply;
      if (!replyText) {
        throw new Error('La IA no devolvió contenido en la respuesta.');
      }

      if (data.usedModel || data.modelUsed) {
        setLastModelUsed(data.usedModel || data.modelUsed);
      }

      const assistantMsg: ChatMessageItem = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: replyText }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakFrench(replyText);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error al comunicarse con /api/chat:', err);
      const isTimeout = err?.name === 'AbortError';
      setErrorMessage(
        isTimeout
          ? (isSwedish ? 'Tiden gick ut. Försök igen.' : 'La respuesta tardó demasiado. Pulsa Reintentar.')
          : (err.message || (isSwedish ? 'Kunde inte ansluta till Camille.' : 'No se pudo conectar con Camille.'))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex !== -1) {
      const lastUser = [...messages].reverse()[lastUserIndex];
      handleSendMessage(lastUser.parts[0]?.text || '');
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
        knownName ? `Je m'appelle ${knownName} !` : "Bonjour ! Je m'appelle Patxi.",
        "🇫🇷 Prata mer franska!",
        "Comment ça va aujourd'hui ?",
        "J'aime beaucoup la musique et les animaux.",
        "🇸🇪 Förklara på svenska",
        "Kommer du ihåg vad jag heter?",
      ]
    : [
        knownName ? `Je m'appelle ${knownName} !` : "Bonjour ! Je m'appelle Patxi.",
        "🇫🇷 ¡Háblame más en francés!",
        "Comment ça va aujourd'hui ?",
        "J'aime beaucoup la musique et les animaux.",
        "🇪🇸 Explícamelo en español",
        "¿Te acuerdas de cómo me llamo?",
      ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col">
        {/* Integrated Top Bar of Chat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              👩‍🎨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-none">
                  Camille
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
                  {immersionLevel === 'french-only' 
                    ? (isSwedish ? '100% Franska' : '100% Francés') 
                    : (immersionLevel === 'high' 
                        ? (isSwedish ? 'Mer franska' : 'Más Francés') 
                        : (isSwedish ? 'Balanserad' : 'Equilibrado'))}
                </span>
                {studentFacts.name && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1" title="Nombre recordado en memoria">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span>{studentFacts.name}</span>
                  </span>
                )}
                {lastModelUsed && (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded hidden sm:inline">
                    {lastModelUsed}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 leading-tight mt-0.5 block">
                {isSwedish 
                  ? 'Samtalspartner i franska (anpassar sig till dina önskemål och minne för dina svar)' 
                  : 'Compañera en francés sencillo (adaptable a tus peticiones y con memoria activa)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Immersion Selector Toggle (orden creciente de francés) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => handleSetImmersion('balanced')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  immersionLevel === 'balanced'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Equilibrado entre francés y español"
              >
                ⚖️ {isSwedish ? 'Balanserad' : 'Equilibrado'}
              </button>
              <button
                type="button"
                onClick={() => handleSetImmersion('high')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  immersionLevel === 'high'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Francés sencillo como idioma principal con apoyo breve"
              >
                🇫🇷 {isSwedish ? 'Mer franska' : 'Más Francés'}
              </button>
              <button
                type="button"
                onClick={() => handleSetImmersion('french-only')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  immersionLevel === 'french-only'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="100% en francés fácil adaptado A1/A2"
              >
                🥖 {isSwedish ? 'Bara franska' : 'Solo Francés'}
              </button>
            </div>

            <button
              onClick={() => {
                const currentName = studentFacts.name || (profile.name !== 'Élève' ? profile.name : null);
                const restartGreeting = isSwedish 
                  ? `Bonjour${currentName ? ` ${currentName}` : ''} ! Comment ça va ? (Hur mår du?). De quoi tu veux qu'on parle : la musique, les animaux ou l'école ?` 
                  : `Bonjour${currentName ? ` ${currentName}` : ''} ! Comment ça va ? (¿Cómo estás?). ¿De qué te gustaría hablar: la musique, les animaux o l'école ?`;
                const resetList: ChatMessageItem[] = [
                  {
                    id: 'restart-' + Date.now(),
                    role: 'model',
                    parts: [{ text: restartGreeting }],
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ];
                setMessages(resetList);
                saveChatHistory(resetList, profile.id);
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70"
              title="Reiniciar chat (mantiene tus datos recordados)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isSwedish ? 'Börja om' : 'Reiniciar'}</span>
            </button>
          </div>
        </div>

        {/* Internal Scrollable Chat Messages with optimal height */}
        <div 
          ref={chatContainerRef}
          className="h-[360px] sm:h-[400px] overflow-y-auto pr-1 space-y-3 mb-3"
        >
            {messages.map((m) => {
              const textContent = m.parts.map((p) => p.text).join('');
              const isUser = m.role === 'user';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-none shadow-2xs'
                        : 'bg-purple-50/50 text-slate-900 rounded-tl-none border border-purple-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-[11px] font-bold opacity-75">
                        {isUser ? (isSwedish ? 'Du' : 'Tú') : 'Camille'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] opacity-60 tabular-nums">{m.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => speakFrench(textContent)}
                            className="text-purple-600 hover:text-purple-800 p-0.5 cursor-pointer"
                            title="Escuchar audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-medium whitespace-pre-wrap leading-snug">{textContent}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-purple-600 text-xs italic pl-2 py-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>{isSwedish ? 'Camille skriver ett svar...' : 'Camille está respondiendo...'}</span>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-3 text-xs flex items-start justify-between gap-2 shadow-2xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {isSwedish ? 'Fel i kommunikationen:' : 'No se pudo obtener respuesta:'}
                    </span>
                    <span className="text-slate-600">{errorMessage}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetryLastMessage}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isSwedish ? 'Försök igen' : 'Reintentar'}</span>
                </button>
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
              placeholder={isSwedish ? 'Skriv till Camille...' : 'Escribe a Camille en español o francés...'}
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
  );
};
