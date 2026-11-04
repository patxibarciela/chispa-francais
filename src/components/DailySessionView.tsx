import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Volume2, 
  Send, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  RotateCcw,
  Trophy,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Unit, DailySessionTemplate, UserProfile } from '../types';
import { CURRICULUM_UNITS } from '../data/curriculum';
import { speakFrench, soundEffects, createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/audio';
import { evaluateSessionStep } from '../utils/tutorEngine';

interface DailySessionViewProps {
  unit: Unit;
  profile: UserProfile;
  onCompleteSession: (earnedXp: number) => void;
  onClose: () => void;
  onSelectUnit?: (unit: Unit) => void;
}

export const DailySessionView: React.FC<DailySessionViewProps> = ({
  unit,
  profile,
  onCompleteSession,
  onClose,
  onSelectUnit,
}) => {
  const session: DailySessionTemplate = unit.dailySessionTemplate;
  const isSwedish = profile.supportLanguage === 'sv';

  // Timer states (30 minutes total = 1800 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Phases: 1 = Warmup, 2 = Input, 3 = Production, 4 = Exit Ticket, 5 = Finished
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Phase 1 States
  const [warmupIndex, setWarmupIndex] = useState<number>(0);
  const [warmupInput, setWarmupInput] = useState<string>('');
  const [warmupFeedback, setWarmupFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [warmupShowHint, setWarmupShowHint] = useState<boolean>(false);

  // Phase 2 States (Deduction cards revealed)
  const [revealedExpressions, setRevealedExpressions] = useState<Record<string, boolean>>({});

  // Phase 3 States (Active roleplay chat)
  const [roleplayHistory, setRoleplayHistory] = useState<Array<{ role: 'ai' | 'user'; text: string; hint?: string; constraint?: string }>>([
    {
      role: 'ai',
      text: session.phase3Production.initialAIPrompt,
      hint: session.phase3Production.initialAIPromptTranslation,
      constraint: session.phase3Production.mission,
    },
  ]);
  const [productionInput, setProductionInput] = useState<string>('');
  const [productionLoading, setProductionLoading] = useState<boolean>(false);
  const [productionTurnCount, setProductionTurnCount] = useState<number>(0);

  // Phase 4 States
  const [exitTicketInput, setExitTicketInput] = useState<string>('');
  const [evaluatingExitTicket, setEvaluatingExitTicket] = useState<boolean>(false);
  const [exitTicketEvaluation, setExitTicketEvaluation] = useState<{
    puntosFuertes: string;
    paraRevisar: string;
    frenchComment: string;
    scoreXP: number;
  } | null>(null);

  // Microphone state
  const [isListening, setIsListening] = useState<boolean>(false);
  const micSupported = isSpeechRecognitionSupported();

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0 && currentPhase < 5) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining, currentPhase]);

  // Read initial prompt when entering phase 3
  useEffect(() => {
    if (currentPhase === 3 && roleplayHistory.length === 1) {
      speakFrench(roleplayHistory[0].text);
    }
  }, [currentPhase]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Phase 1: Handle Warmup Answer
  const handleCheckWarmup = () => {
    const currentQ = session.phase1Warmup.questions[warmupIndex];
    const userClean = warmupInput.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const expectedClean = currentQ.expectedFr.toLowerCase().replace(/[.,!?;:]/g, '');

    // Check fuzzy inclusion or exact match
    const isCorrect = userClean === expectedClean || userClean.includes(expectedClean) || expectedClean.includes(userClean);

    if (isCorrect) {
      if (profile.soundEnabled) soundEffects.playCorrect();
      setWarmupFeedback({
        isCorrect: true,
        message: isSwedish ? 'Jättebra! Helt rätt på franska.' : '¡Excelente! Respuesta correcta en francés.',
      });
    } else {
      if (profile.soundEnabled) soundEffects.playIncorrect();
      setWarmupFeedback({
        isCorrect: false,
        message: isSwedish 
          ? `Nära! Rätt svar är: "${currentQ.expectedFr}". Försök komma ihåg det!`
          : `Casi. La respuesta correcta es: "${currentQ.expectedFr}". ¡Fíjate bien para recordarlo!`,
      });
    }
  };

  const handleNextWarmup = () => {
    setWarmupFeedback(null);
    setWarmupInput('');
    setWarmupShowHint(false);
    if (warmupIndex + 1 < session.phase1Warmup.questions.length) {
      setWarmupIndex((prev) => prev + 1);
    } else {
      // Transition to Phase 2
      setCurrentPhase(2);
      if (profile.soundEnabled) soundEffects.playCardFlip();
    }
  };

  // Phase 2: Expression Deduction Toggle
  const toggleExpression = (fr: string) => {
    setRevealedExpressions((prev) => ({
      ...prev,
      [fr]: !prev[fr],
    }));
    speakFrench(fr);
  };

  // Phase 3: Active Production Submit
  const handleSendProduction = async () => {
    if (!productionInput.trim() || productionLoading) return;

    const userMessage = productionInput.trim();
    setProductionInput('');
    setProductionLoading(true);

    const updatedHistory = [...roleplayHistory, { role: 'user' as const, text: userMessage }];
    setRoleplayHistory(updatedHistory);

    try {
      const data = await evaluateSessionStep(
        3,
        session.title,
        userMessage,
        updatedHistory.slice(-4),
        profile.supportLanguage
      );

      const nextTurn = productionTurnCount + 1;
      setProductionTurnCount(nextTurn);

      if (data.isCorrect) {
        if (profile.soundEnabled) soundEffects.playCorrect();
      } else {
        if (profile.soundEnabled) soundEffects.playIncorrect();
      }

      const nextAIText = `${data.feedback} ${data.nextPrompt}`;
      setRoleplayHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: nextAIText,
          hint: data.hint,
        },
      ]);
      speakFrench(nextAIText);
    } catch (e) {
      // Safe fallback
      const fallbackAI = `¡Très bien ! Tu parles bien français. Maintenant, dis-moi : qu'est-ce que tu aimes d'autre ?`;
      setRoleplayHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: fallbackAI,
          hint: isSwedish ? 'Fortsätt svara på franska' : 'Continúa respondiendo en francés',
        },
      ]);
      speakFrench(fallbackAI);
    } finally {
      setProductionLoading(false);
    }
  };

  // Phase 4: Submit Exit Ticket
  const handleSubmitExitTicket = async () => {
    if (!exitTicketInput.trim() || evaluatingExitTicket) return;

    setEvaluatingExitTicket(true);

    try {
      const data = await evaluateSessionStep(
        4,
        session.title,
        exitTicketInput.trim(),
        [],
        profile.supportLanguage
      );
      setExitTicketEvaluation(data);
      setCurrentPhase(5); // Finished!
      if (profile.soundEnabled) soundEffects.playVictory();
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      onCompleteSession(data.scoreXP || 45);
    } catch (e) {
      const fallbackData = {
        puntosFuertes: isSwedish
          ? 'Du har genomfört det aktiva passet och skrivit på franska!'
          : '¡Has completado la sesión con éxito y escrito tus frases en francés!',
        paraRevisar: isSwedish
          ? 'Repetera stavningen och böjningen i ordförrådskorten.'
          : 'Revisa las expresiones en la sección de repetición espaciada.',
        frenchComment: 'Félicitations pour tes efforts aujourd\'hui ! 🌟',
        scoreXP: 45,
      };
      setExitTicketEvaluation(fallbackData);
      setCurrentPhase(5);
      if (profile.soundEnabled) soundEffects.playVictory();
      confetti({ particleCount: 100, spread: 60 });
      onCompleteSession(45);
    } finally {
      setEvaluatingExitTicket(false);
    }
  };

  // Speech recognition handler
  const startListening = (target: 'warmup' | 'production' | 'exit') => {
    if (!micSupported) return;
    const recognizer = createSpeechRecognizer(
      (text) => {
        setIsListening(false);
        if (target === 'warmup') setWarmupInput(text);
        if (target === 'production') setProductionInput(text);
        if (target === 'exit') setExitTicketInput(text);
      },
      () => setIsListening(false)
    );
    if (recognizer) {
      setIsListening(true);
      recognizer.start();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Session Progress Bar & Phase Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {currentPhase <= 4 ? `F${currentPhase}` : '✓'}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                  Unité {unit.number} · Årskurs 6
                </span>
                {onSelectUnit && (
                  <select
                    value={unit.id}
                    onChange={(e) => {
                      const found = CURRICULUM_UNITS.find((u) => u.id === e.target.value);
                      if (found) {
                        onSelectUnit(found);
                        setCurrentPhase(1);
                        setWarmupIndex(0);
                        setWarmupFeedback(null);
                        setWarmupInput('');
                        setSecondsRemaining(1800);
                      }
                    }}
                    className="text-xs text-slate-500 bg-transparent hover:text-indigo-600 font-medium cursor-pointer border-b border-dashed border-slate-300 focus:outline-none"
                  >
                    {CURRICULUM_UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {isSwedish ? `Byt till Enhet ${u.number}: ${u.frenchTitle}` : `Cambiar a Unidad ${u.number}: ${u.frenchTitle}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <h1 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>{session.title}</span>
                <span className="text-slate-400 font-normal text-xs sm:text-sm">({session.frenchTitle})</span>
              </h1>
              <p className="text-xs text-slate-500">{session.situation}</p>
            </div>
          </div>

          {/* Timer Clock */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
              secondsRemaining < 300 
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              {isSwedish ? 'Avsluta' : 'Salir'}
            </button>
          </div>
        </div>

        {/* 4-Phase Stepper */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
            currentPhase === 1 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : currentPhase > 1 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-slate-50 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">Fase 1 (5m)</span>
            <span className="truncate block">{isSwedish ? 'Uppvärmning' : 'Calentamiento'}</span>
          </div>
          <div className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
            currentPhase === 2 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : currentPhase > 2 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-slate-50 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">Fase 2 (8m)</span>
            <span className="truncate block">{isSwedish ? 'Nytt innehåll' : 'Comprensión'}</span>
          </div>
          <div className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
            currentPhase === 3 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : currentPhase > 3 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-slate-50 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">Fase 3 (12m)</span>
            <span className="truncate block">{isSwedish ? 'Rollspel' : 'Producción'}</span>
          </div>
          <div className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
            currentPhase >= 4 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'bg-slate-50 text-slate-400'
          }`}>
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">Fase 4 (5m)</span>
            <span className="truncate block">{isSwedish ? 'Utgångsutmaning' : 'Cierre'}</span>
          </div>
        </div>
      </div>

      {/* PHASE 1: CALENTAMIENTO Y REPASO (5 MIN) */}
      {currentPhase === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {isSwedish ? 'Fråga' : 'Pregunta'} {warmupIndex + 1} / {session.phase1Warmup.questions.length}
              </span>
              <button
                onClick={() => setCurrentPhase(2)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                {isSwedish ? 'Hoppa direkt till Fas 2' : 'Saltar a Fase 2 (Primera sesión)'}
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {isSwedish
                ? session.phase1Warmup.questions[warmupIndex].promptSv
                : session.phase1Warmup.questions[warmupIndex].promptEs}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isSwedish 
                ? 'Skriv eller tala på franska för att aktivera minnet:' 
                : 'Escribe o pronuncia en francés para activar la memoria:'}
            </p>

            {/* Input area */}
            <div className="relative mb-4">
              <input
                type="text"
                value={warmupInput}
                onChange={(e) => setWarmupInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !warmupFeedback && handleCheckWarmup()}
                placeholder={isSwedish ? 'Skriv svaret här...' : 'Escribe tu respuesta aquí en francés...'}
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium text-base"
                autoFocus
              />
              {micSupported && (
                <button
                  type="button"
                  onClick={() => startListening('warmup')}
                  className={`absolute right-3 top-3 p-1.5 rounded-lg transition-colors ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                  title="Hablar por micrófono"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>

            {/* Feedback box */}
            {warmupFeedback && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
                  warmupFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {warmupFeedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-sm">{warmupFeedback.message}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3">
              <div>
                {!warmupFeedback && (
                  <button
                    onClick={() => setWarmupShowHint(!warmupShowHint)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{isSwedish ? 'Ledtråd' : 'Pista'}</span>
                  </button>
                )}
                {warmupShowHint && (
                  <span className="text-xs text-slate-500 mt-1 block">
                    {session.phase1Warmup.questions[warmupIndex].hints[0]}
                  </span>
                )}
              </div>

              {!warmupFeedback ? (
                <button
                  onClick={handleCheckWarmup}
                  disabled={!warmupInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {isSwedish ? 'Kontrollera svar' : 'Comprobar'}
                </button>
              ) : (
                <button
                  onClick={handleNextWarmup}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span>{isSwedish ? 'Nästa fråga' : 'Continuar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: INPUT COMPRENSIBLE & HISTORIA CORTA (8 MIN) */}
      {currentPhase === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {isSwedish ? 'Fas 2 · Ny situation & Begripligt input' : 'Fase 2 · Situación e Input Comprensible'}
              </span>
              <button
                onClick={() => speakFrench(session.phase2Input.storyFr)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSwedish ? 'Lyssna på hela dialogen' : 'Escuchar diálogo completo'}</span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {session.phase2Input.storyTitle}
            </h2>

            {/* French Dialogue Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6 space-y-3 font-serif">
              {session.phase2Input.storyFr.split('\n').map((line, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-slate-800 text-base leading-relaxed">
                  <p>{line}</p>
                  <button
                    onClick={() => speakFrench(line.split(':')[1] || line)}
                    title="Escuchar esta frase"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-white transition-colors shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Deduction Task instructions */}
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                {isSwedish ? 'Nyckeluttryck: Klicka för att avslöja och lyssna' : 'Expresiones clave: Haz clic para descubrir su significado'}
              </h3>
              <p className="text-xs text-slate-500">
                {isSwedish 
                  ? 'Försök först lista ut vad de betyder från sammanhanget i dialogen:' 
                  : 'Intenta deducirlas por el contexto antes de pulsar:'}
              </p>
            </div>

            {/* Interactive deduction cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {session.phase2Input.keyExpressions.map((expr, idx) => {
                const isRevealed = revealedExpressions[expr.fr];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleExpression(expr.fr)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-700 text-sm">{expr.fr}</span>
                      <button className="text-slate-400 hover:text-indigo-600">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-2">
                      [{expr.phonetic}]
                    </span>
                    {isRevealed ? (
                      <div className="pt-2 border-t border-slate-100 text-xs">
                        <p className="font-semibold text-emerald-700">
                          {isSwedish ? expr.sv : expr.es}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{expr.clue}</p>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-indigo-600 font-medium">
                        {isSwedish ? '👉 Klicka för att visa översättning' : '👉 Clic para descubrir traducción'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentPhase(3)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-all"
              >
                <span>{isSwedish ? 'Gå vidare till Fas 3: Rollspel' : 'Pasar a Fase 3: Producción Activa'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: PRODUCCIÓN ACTIVA Y GUIADA (12 MIN) */}
      {currentPhase === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {isSwedish ? 'Fas 3 · Aktiv produktion & Rollspel' : 'Fase 3 · Producción Activa y Guiada'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isSwedish ? 'Mål: Bygg meningar på franska' : 'Objetivo: Construir frases en francés'}
              </span>
            </div>

            {/* Mission banner */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs leading-relaxed mb-6">
              <p className="font-bold mb-0.5">
                {isSwedish ? 'Ditt uppdrag i simuleringen:' : 'Tu misión en la simulación:'}
              </p>
              <p>{session.phase3Production.mission}</p>
            </div>

            {/* Dialogue Conversation Stream */}
            <div className="space-y-4 mb-6 max-h-[380px] overflow-y-auto pr-1">
              {roleplayHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      item.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-bold text-xs opacity-80">
                        {item.role === 'user' ? 'Tú (Élève)' : 'Léo (Tutor)'}
                      </span>
                      {item.role === 'ai' && (
                        <button
                          onClick={() => speakFrench(item.text)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="font-medium text-base">{item.text}</p>

                    {item.hint && (
                      <p className="text-xs mt-2 pt-2 border-t border-slate-200/50 opacity-90 text-slate-600">
                        💡 {item.hint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {productionLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>{isSwedish ? 'Léo tänker...' : 'Léo está preparando el siguiente reto...'}</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="relative mb-4">
              <input
                type="text"
                value={productionInput}
                onChange={(e) => setProductionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendProduction()}
                placeholder={isSwedish ? 'Svara på franska...' : 'Responde en francés...'}
                className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium text-sm"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                {micSupported && (
                  <button
                    type="button"
                    onClick={() => startListening('production')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
                    }`}
                    title="Hablar en francés"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSendProduction}
                  disabled={!productionInput.trim() || productionLoading}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Finish Phase 3 Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {roleplayHistory.filter((h) => h.role === 'user').length} {isSwedish ? 'franska svar skickade' : 'respuestas enviadas'}
              </span>
              <button
                onClick={() => setCurrentPhase(4)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>{isSwedish ? 'Gå till Fas 4: Avslutning' : 'Pasar a Fase 4: Reto de Salida'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: CIERRE Y RETO DE SALIDA (5 MIN) */}
      {currentPhase === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl mx-auto">
            <div className="mb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                {isSwedish ? 'Fas 4 · Utgångsutmaning (5 min)' : 'Fase 4 · Cierre y Reto de Salida (5 min)'}
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {isSwedish ? session.phase4ExitTicket.promptSv : session.phase4ExitTicket.promptEs}
              </h2>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
              {isSwedish
                ? 'Sammanfatta vad du lärt dig idag. Skriv minst 2 enkla meningar på franska:'
                : 'Escribe un resumen práctico de 2 frases en francés usando lo aprendido en la sesión de hoy:'}
            </p>

            <div className="relative mb-4">
              <textarea
                rows={3}
                value={exitTicketInput}
                onChange={(e) => setExitTicketInput(e.target.value)}
                placeholder={isSwedish ? 'T.ex. Bonjour ! Je m\'appelle... et...' : 'Ejemplo: Bonjour ! Je m\'appelle... et j\'ai 13 ans.'}
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium text-sm leading-relaxed"
              />
              {micSupported && (
                <button
                  type="button"
                  onClick={() => startListening('exit')}
                  className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-colors ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                  title="Dictar en francés"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                💡 {isSwedish ? 'Tips: ' : 'Pista: '} {session.phase4ExitTicket.sampleFr}
              </div>
              <button
                onClick={handleSubmitExitTicket}
                disabled={!exitTicketInput.trim() || evaluatingExitTicket}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-all"
              >
                {evaluatingExitTicket ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{isSwedish ? 'Utvärderar...' : 'Evaluando...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isSwedish ? 'Lämna in & Slutför passet' : 'Enviar Reto de Salida'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: EVALUACIÓN Y CELEBRACIÓN DE LA SESIÓN */}
      {currentPhase === 5 && exitTicketEvaluation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
            {isSwedish ? '30-minuters pass slutfört!' : '¡Sesión de 30 minutos completada!'}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isSwedish ? 'Grymt jobbat!' : '¡Bravo! Gran trabajo'}
          </h2>

          <p className="text-indigo-700 font-semibold text-sm mb-6 italic">
            « {exitTicketEvaluation.frenchComment} »
          </p>

          {/* 2-Point Feedback Card */}
          <div className="text-left space-y-3 mb-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isSwedish ? '1. Vad du gjorde jättebra idag:' : '1. Lo que hiciste genial hoy (Puntos fuertes):'}
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  {exitTicketEvaluation.puntosFuertes}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-3 border-t border-slate-200/60">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isSwedish ? '2. Att repetera imorgon:' : '2. Aspecto a revisar mañana:'}
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  {exitTicketEvaluation.paraRevisar}
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>+{exitTicketEvaluation.scoreXP} XP ganados</span>
          </div>

          <div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all"
            >
              {isSwedish ? 'Tillbaka till kursöversikten' : 'Volver a la ruta de lecciones'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
