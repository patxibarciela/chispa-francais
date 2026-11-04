import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Trophy
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
  const [scramblePicks, setScramblePicks] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentExercise: Exercise = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex) / exercises.length) * 100);

  // Play audio when exercise loads if audioFr exists
  React.useEffect(() => {
    if (currentExercise.audioFr) {
      speakFrench(currentExercise.audioFr);
    }
    setSelectedOption(null);
    setScramblePicks([]);
    setIsAnswerChecked(false);
    setShowHint(false);
  }, [currentIndex]);

  const handlePickScrambleWord = (word: string, index: number) => {
    if (isAnswerChecked) return;
    setScramblePicks((prev) => [...prev, word]);
  };

  const handleRemoveScrambleWord = (index: number) => {
    if (isAnswerChecked) return;
    setScramblePicks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    if (isAnswerChecked) return;

    let correct = false;

    if (currentExercise.type === 'scramble') {
      const targetArr = Array.isArray(currentExercise.answer) ? currentExercise.answer : [currentExercise.answer];
      const userStr = scramblePicks.join(' ').trim();
      const targetStr = targetArr.join(' ').trim();
      correct = userStr === targetStr;
    } else {
      const targetAnswer = Array.isArray(currentExercise.answer) ? currentExercise.answer[0] : currentExercise.answer;
      correct = selectedOption === targetAnswer;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      if (profile.soundEnabled) soundEffects.playCorrect();
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
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      onComplete(lesson.xpReward);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 mx-2">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {currentIndex + 1} / {exercises.length}
          </span>
        </div>

        {!isFinished ? (
          <div>
            {/* Exercise Prompt */}
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                {unit.frenchTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {currentExercise.prompt}
              </h2>

              {currentExercise.promptFr && (
                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => speakFrench(currentExercise.audioFr || currentExercise.promptFr!)}
                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="Escuchar audio"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <span className="font-semibold text-slate-900 text-lg">
                    {currentExercise.promptFr}
                  </span>
                </div>
              )}
            </div>

            {/* Scramble Exercise Type */}
            {currentExercise.type === 'scramble' && (
              <div className="space-y-6 mb-8">
                {/* Sentence Construction Zone */}
                <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center">
                  {scramblePicks.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      {isSwedish ? 'Tryck på orden nedan i rätt ordning' : 'Pulsa sobre las palabras para ordenar la frase'}
                    </span>
                  ) : (
                    scramblePicks.map((word, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleRemoveScrambleWord(idx)}
                        disabled={isAnswerChecked}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-xs hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Available word tiles */}
                <div className="flex flex-wrap gap-2">
                  {currentExercise.options?.map((word, idx) => {
                    const countInPicks = scramblePicks.filter((w) => w === word).length;
                    const countInOptions = currentExercise.options?.filter((w) => w === word).length || 1;
                    const isAllPicked = countInPicks >= countInOptions;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePickScrambleWord(word, idx)}
                        disabled={isAllPicked || isAnswerChecked}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          isAllPicked
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 shadow-xs active:scale-95'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multiple Choice / Translate / Fill blank */}
            {currentExercise.type !== 'scramble' && currentExercise.options && (
              <div className="space-y-3 mb-8">
                {currentExercise.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !isAnswerChecked && setSelectedOption(opt)}
                      disabled={isAnswerChecked}
                      className={`w-full p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakFrench(opt);
                        }}
                        className="text-slate-400 hover:text-indigo-600 p-1"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Banner */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-2xl mb-6 border flex items-start gap-3 ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isCorrect
                      ? (isSwedish ? 'Lysande! Helt rätt.' : '¡Genial! Respuesta correcta.')
                      : (isSwedish ? 'Inte riktigt rätt' : 'Casi casi...')}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed">
                    {isSwedish ? currentExercise.explanationSv : currentExercise.explanationEs}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                {!isAnswerChecked && (
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{isSwedish ? 'Ledtråd' : 'Pista'}</span>
                  </button>
                )}
                {showHint && (
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
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
                      ? scramblePicks.length === 0
                      : !selectedOption
                  }
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
                >
                  {isSwedish ? 'Kontrollera svar' : 'Comprobar'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
                >
                  <span>{isSwedish ? 'Nästa' : 'Continuar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished State */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isSwedish ? 'Lektion slutförd!' : '¡Lección completada!'}
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              {isSwedish
                ? `Du har bemästrat: "${lesson.frenchTitle}". Bra jobbat!`
                : `Has completado "${lesson.frenchTitle}". ¡Sigue así!`}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-sm mb-8">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>+{lesson.xpReward} XP ganados</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              {isSwedish ? 'Tillbaka till kursöversikten' : 'Volver a la ruta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
