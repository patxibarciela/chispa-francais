import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Trophy,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, Unit, UserProfile, Exercise } from '../types';
import { speakFrench, soundEffects } from '../utils/audio';

interface LessonModalProps {
  lesson: Lesson;
  unit: Unit;
  profile: UserProfile;
  onComplete: (earnedXp: number) => void;
  onClose: () => void;
}

interface ScrambleTile {
  id: string;
  word: string;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  unit,
  profile,
  onComplete,
  onClose,
}) => {
  const isSwedish = profile.supportLanguage === 'sv';
  const exercises = lesson.exercises;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [scrambleTiles, setScrambleTiles] = useState<ScrambleTile[]>([]);
  const [pickedTileIds, setPickedTileIds] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [playingText, setPlayingText] = useState<string | null>(null);

  const currentExercise: Exercise = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex) / exercises.length) * 100);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset exercise state upon step change and randomize options/scramble order
  useEffect(() => {
    setSelectedOption(null);
    setTextAnswer('');
    setIsAnswerChecked(false);
    setShowHint(false);
    setPlayingText(null);
    setPickedTileIds([]);

    if (!currentExercise) return;

    if (currentExercise.type === 'scramble') {
      // Collect raw words
      let rawWords: string[] = [];
      if (Array.isArray(currentExercise.options) && currentExercise.options.length > 0) {
        rawWords = [...currentExercise.options];
      } else if (Array.isArray(currentExercise.answer)) {
        rawWords = [...currentExercise.answer];
      } else if (typeof currentExercise.answer === 'string') {
        rawWords = currentExercise.answer.split(/\s+/).filter(Boolean);
      }

      const targetStr = (Array.isArray(currentExercise.answer)
        ? currentExercise.answer.join(' ')
        : String(currentExercise.answer || '')
      ).trim();

      // Scramble words so they NEVER start in the correct target solution order
      let shuffled = shuffleArray(rawWords);
      let attempts = 0;
      while (shuffled.join(' ').trim() === targetStr && shuffled.length > 1 && attempts < 20) {
        shuffled = shuffleArray(rawWords);
        attempts++;
      }
      if (shuffled.join(' ').trim() === targetStr && shuffled.length > 1) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
      }

      const tiles: ScrambleTile[] = shuffled.map((word, idx) => ({
        id: `tile-${idx}-${word}-${Math.random().toString(36).slice(2, 7)}`,
        word,
      }));

      setScrambleTiles(tiles);
      setShuffledOptions([]);
    } else {
      // Choice / translate / listen / fill-blank: randomize options so correct answer is not always first
      if (Array.isArray(currentExercise.options) && currentExercise.options.length > 0) {
        const shuffled = shuffleArray(currentExercise.options);
        setShuffledOptions(shuffled);
      } else {
        setShuffledOptions([]);
      }
      setScrambleTiles([]);
    }
  }, [currentIndex, currentExercise]);

  const triggerAudio = (text: string) => {
    setPlayingText(text);
    speakFrench(text);
    setTimeout(() => {
      setPlayingText((prev) => (prev === text ? null : prev));
    }, 1400);
  };

  // Determine whether promptFr should be visible (never show if it gives away the answer)
  const shouldShowPromptFr = (ex: Exercise): boolean => {
    if (ex.type === 'scramble') return false;
    if (ex.type === 'fill-blank' && ex.promptFr?.includes('_')) return true;
    if (
      ex.type === 'translate' && 
      (ex.prompt.toLowerCase().includes('español') || 
       ex.prompt.toLowerCase().includes('svenska') || 
       ex.prompt.toLowerCase().includes('significa'))
    ) {
      return true;
    }
    return false;
  };

  // Check if prompt quotes a French word to let user listen to it
  const promptQuotedMatch = currentExercise.prompt.match(/«([^»]+)»|"([^"]+)"|'([^']+)'/);
  const promptQuotedWord = promptQuotedMatch ? (promptQuotedMatch[1] || promptQuotedMatch[2] || promptQuotedMatch[3]) : null;

  const handlePickScrambleTile = (tile: ScrambleTile) => {
    if (isAnswerChecked || pickedTileIds.includes(tile.id)) return;
    setPickedTileIds((prev) => [...prev, tile.id]);
    triggerAudio(tile.word);
  };

  const handleRemoveScrambleTile = (index: number) => {
    if (isAnswerChecked) return;
    setPickedTileIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    if (isAnswerChecked) return;

    let correct = false;
    let targetAnswer = '';

    if (currentExercise.type === 'scramble') {
      const targetArr = Array.isArray(currentExercise.answer) ? currentExercise.answer : [currentExercise.answer];
      const pickedWords = pickedTileIds.map((id) => scrambleTiles.find((t) => t.id === id)?.word || '');
      const userStr = pickedWords.join(' ').trim();
      targetAnswer = targetArr.join(' ').trim();
      correct = userStr === targetAnswer;
    } else {
      const answers = Array.isArray(currentExercise.answer) ? currentExercise.answer : [currentExercise.answer];
      targetAnswer = answers[0];
      const normalize = (s: string) => s.toLowerCase().trim().replace(/[.!?¡¿,;:"]/g, '').replace(/\s+/g, ' ');
      const userSelected = (selectedOption || textAnswer || '').trim();
      const userNorm = normalize(userSelected);
      correct = answers.some((ans) => normalize(ans) === userNorm) || (selectedOption === targetAnswer);
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      if (profile.soundEnabled) soundEffects.playCorrect();
      // Reinforce auditory learning by pronouncing the complete French answer!
      if (targetAnswer) {
        triggerAudio(targetAnswer);
      }
    } else {
      if (profile.soundEnabled) soundEffects.playIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed lesson!
      setIsFinished(true);
      if (profile.soundEnabled) soundEffects.playVictory();
      confetti({ particleCount: 90, spread: 55, origin: { y: 0.6 } });
      onComplete(lesson.xpReward);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Lesson Dialog Card */}
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Progress */}
        <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar lección"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 mx-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0">
            {currentIndex + 1} / {exercises.length}
          </span>
        </div>

        {!isFinished ? (
          <div className="flex flex-col flex-1 justify-between min-h-0">
            {/* Top Prompt Area */}
            <div className="shrink-0 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 block mb-0.5">
                {unit.frenchTitle} · {lesson.title}
              </span>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {currentExercise.prompt}
                </h2>
                {promptQuotedWord && currentExercise.type !== 'scramble' && !shouldShowPromptFr(currentExercise) && (
                  <button
                    type="button"
                    onClick={() => triggerAudio(promptQuotedWord)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      playingText === promptQuotedWord
                        ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                        : 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200'
                    }`}
                    title={`Escuchar "${promptQuotedWord}"`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Only shown when it contains a fill-in blank or French sentence to translate */}
              {shouldShowPromptFr(currentExercise) && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-2 notranslate" translate="no">
                  <span className="font-bold text-slate-900 text-base notranslate" translate="no">
                    {currentExercise.promptFr}
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerAudio(currentExercise.promptFr!.replace(/_+/g, ''))}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                      playingText === currentExercise.promptFr!.replace(/_+/g, '')
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'text-purple-600 hover:bg-purple-100'
                    }`}
                    title="Escuchar frase en francés"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Exercise Interaction Body */}
            <div className="flex-1 min-h-0 py-1 overflow-y-auto notranslate" translate="no">
              {/* Scramble Exercise Type */}
              {currentExercise.type === 'scramble' && (
                <div className="space-y-3 notranslate" translate="no">
                  {/* Construction Drop Zone */}
                  <div className="min-h-[52px] p-2.5 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/20 flex flex-wrap gap-1.5 items-center notranslate" translate="no">
                    {pickedTileIds.length === 0 ? (
                      <span className="text-xs text-slate-400 italic px-2">
                        {isSwedish ? 'Tryck på orden nedan i rätt ordning' : 'Pulsa sobre las palabras para ordenar la frase'}
                      </span>
                    ) : (
                      pickedTileIds.map((tileId, idx) => {
                        const tile = scrambleTiles.find((t) => t.id === tileId);
                        if (!tile) return null;
                        return (
                          <button
                            key={tile.id}
                            type="button"
                            onClick={() => handleRemoveScrambleTile(idx)}
                            disabled={isAnswerChecked}
                            className="px-3 py-1 rounded-xl bg-purple-600 text-white font-semibold text-xs sm:text-sm shadow-xs hover:bg-purple-700 transition-all cursor-pointer active:scale-95 notranslate"
                            translate="no"
                          >
                            {tile.word}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Available word tiles (guaranteed scrambled) */}
                  <div className="flex flex-wrap gap-1.5 notranslate" translate="no">
                    {scrambleTiles.map((tile) => {
                      const isPicked = pickedTileIds.includes(tile.id);
                      return (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() => handlePickScrambleTile(tile)}
                          disabled={isPicked || isAnswerChecked}
                          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer notranslate ${
                            isPicked
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'bg-white border-slate-300 text-slate-800 hover:border-purple-400 hover:bg-purple-50 shadow-2xs active:scale-95'
                          }`}
                          translate="no"
                        >
                          {tile.word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multiple Choice / Translation Options (randomized order) */}
              {currentExercise.type !== 'scramble' && (shuffledOptions.length > 0 || (currentExercise.options && currentExercise.options.length > 0)) && (
                <div className="space-y-2 notranslate" translate="no">
                  {(shuffledOptions.length > 0 ? shuffledOptions : (currentExercise.options || [])).map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isAudioPlayingThis = playingText === opt;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isAnswerChecked) {
                            setSelectedOption(opt);
                          }
                          triggerAudio(opt);
                        }}
                        className={`w-full py-2.5 px-3.5 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer select-none notranslate ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/80 text-purple-950 shadow-xs ring-1 ring-purple-500/20'
                            : 'border-slate-200 bg-white text-slate-800 hover:bg-purple-50/30 hover:border-purple-200'
                        }`}
                        translate="no"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 notranslate" translate="no">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="truncate notranslate" translate="no">{opt}</span>
                        </div>

                        {/* Speaker Button: ALWAYS ACTIVE, NEVER DISABLED */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAudio(opt);
                          }}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 ml-2 ${
                            isAudioPlayingThis
                              ? 'bg-purple-600 text-white shadow-xs animate-pulse ring-2 ring-purple-300'
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-100/70'
                          }`}
                          title="Escuchar pronunciación en francés"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Text Input Fallback if exercise has no options */}
              {currentExercise.type !== 'scramble' && shuffledOptions.length === 0 && (!currentExercise.options || currentExercise.options.length === 0) && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={textAnswer}
                      onChange={(e) => {
                        if (!isAnswerChecked) {
                          setTextAnswer(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && textAnswer.trim() && !isAnswerChecked) {
                          handleCheckAnswer();
                        }
                      }}
                      disabled={isAnswerChecked}
                      placeholder={isSwedish ? 'Skriv ditt svar på franska...' : 'Escribe tu respuesta en francés...'}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Accents toolbar */}
                  {!isAnswerChecked && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-slate-400 mr-1 font-semibold">Acentos:</span>
                      {['é', 'è', 'ê', 'à', 'ç', 'ù', 'ô', 'î', 'œ'].map((char) => (
                        <button
                          key={char}
                          type="button"
                          onClick={() => setTextAnswer((prev) => prev + char)}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback & Bottom Controls */}
            <div className="shrink-0 pt-2">
              {/* Answer Feedback Banner */}
              {isAnswerChecked && (
                <div
                  className={`p-3 rounded-2xl mb-3 border flex items-center justify-between gap-2.5 animate-in fade-in duration-150 ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm leading-tight">
                        {isCorrect
                          ? (isSwedish ? 'Bravo ! Rätt svar.' : '¡Bravo! Respuesta correcta.')
                          : (isSwedish ? 'Inte riktigt rätt' : 'Casi casi...')}
                      </p>
                      <p className="text-[11px] opacity-80 truncate leading-tight mt-0.5">
                        {isSwedish ? currentExercise.explanationSv : currentExercise.explanationEs}
                      </p>
                    </div>
                  </div>

                  {/* Speaker to replay correct answer (works for both single strings and scramble arrays) */}
                  <button
                    type="button"
                    onClick={() => {
                      const target = Array.isArray(currentExercise.answer) 
                        ? currentExercise.answer.join(' ') 
                        : currentExercise.answer;
                      triggerAudio(target);
                    }}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                      playingText === (Array.isArray(currentExercise.answer) ? currentExercise.answer.join(' ') : currentExercise.answer)
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'text-slate-500 hover:text-purple-700 hover:bg-white/70'
                    }`}
                    title="Escuchar de nuevo la respuesta correcta"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  {!isAnswerChecked && (
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{isSwedish ? 'Ledtråd' : 'Pista'}</span>
                    </button>
                  )}
                  {showHint && (
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                      {isSwedish ? currentExercise.hintSv : currentExercise.hintEs}
                    </p>
                  )}
                </div>

                {!isAnswerChecked ? (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    disabled={
                      currentExercise.type === 'scramble'
                        ? pickedTileIds.length === 0
                        : (!selectedOption && !textAnswer.trim())
                    }
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {isSwedish ? 'Kontrollera' : 'Comprobar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{isSwedish ? 'Nästa' : 'Continuar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">
              {isSwedish ? 'Lektion slutförd!' : '¡Paso completado con éxito!'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-5">
              {isSwedish
                ? `Du har slutfört: "${lesson.frenchTitle}".`
                : `Has dominado: "${lesson.frenchTitle}".`}
            </p>

            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>+{lesson.xpReward} XP ganados para tu racha</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              {isSwedish ? 'Tillbaka till kursöversikten' : 'Volver a la ruta'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
