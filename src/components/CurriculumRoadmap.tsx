import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  ArrowRight, 
  Star,
  Lock,
  GraduationCap,
  Info,
  AlertCircle
} from 'lucide-react';
import { Unit, Lesson, UserProfile, GradeLevel } from '../types';
import { CURRICULUM_UNITS, FUTURE_GRADES_PREVIEW } from '../data/curriculum';
import { speakFrench } from '../utils/audio';

interface CurriculumRoadmapProps {
  profile: UserProfile;
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  onSelectSession: (unit: Unit) => void;
}

export const CurriculumRoadmap: React.FC<CurriculumRoadmapProps> = ({
  profile,
  onSelectLesson,
  onSelectSession,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('ak6');
  const [activeGrammarModal, setActiveGrammarModal] = useState<Unit | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const isSwedish = profile.supportLanguage === 'sv';

  // Helper functions for sequential progression unlocking
  const isUnitUnlocked = (unitIndex: number): boolean => {
    if (unitIndex === 0) return true; // First unit is always open
    const prevUnit = CURRICULUM_UNITS[unitIndex - 1];
    return profile.completedSessionIds.includes(prevUnit.dailySessionTemplate.id);
  };

  const isLessonUnlocked = (unitIndex: number, lessonIndex: number): boolean => {
    if (!isUnitUnlocked(unitIndex)) return false;
    if (lessonIndex === 0) return true; // Step 1 is open if unit is open
    const unit = CURRICULUM_UNITS[unitIndex];
    const prevLesson = unit.lessons[lessonIndex - 1];
    return profile.completedLessonIds.includes(prevLesson.id);
  };

  const isSessionUnlocked = (unitIndex: number): boolean => {
    if (!isUnitUnlocked(unitIndex)) return false;
    const unit = CURRICULUM_UNITS[unitIndex];
    return unit.lessons.every((lesson) => profile.completedLessonIds.includes(lesson.id));
  };

  const showLockedAlert = (reason: string) => {
    setLockedNotice(reason);
    setTimeout(() => {
      setLockedNotice(null);
    }, 3500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Floating Locked Notice Toast */}
      {lockedNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-bounce border border-slate-700">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* Grade Selector Strip with visual locked states and tooltips */}
      <div className="flex flex-wrap items-center gap-2.5 pb-4 mb-8 border-b border-slate-200">
        <button
          onClick={() => setSelectedGrade('ak6')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            selectedGrade === 'ak6'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Årskurs 6 · Steg 1 (Activo)</span>
        </button>

        {FUTURE_GRADES_PREVIEW.map((g) => {
          let lockExplanation = '';
          if (g.grade === 'ak7') {
            lockExplanation = isSwedish
              ? 'Låst: Slutför alla 8 enheter i årskurs 6 för att låsa upp årskurs 7'
              : 'Bloqueado: Completa las 8 unidades de Årskurs 6 para desbloquear Årskurs 7';
          } else if (g.grade === 'ak8') {
            lockExplanation = isSwedish
              ? 'Låst: Slutför årskurs 7 för att låsa upp årskurs 8'
              : 'Bloqueado: Completa Årskurs 7 para desbloquear Årskurs 8';
          } else {
            lockExplanation = isSwedish
              ? 'Låst: Slutför årskurs 8 för att låsa upp årskurs 9'
              : 'Bloqueado: Completa Årskurs 8 para desbloquear Årskurs 9';
          }

          return (
            <div key={g.grade} className="relative group shrink-0">
              <button
                onClick={() => {
                  showLockedAlert(lockExplanation);
                  setSelectedGrade(g.grade as GradeLevel);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 bg-slate-100/90 border border-slate-200 text-slate-400 opacity-70 cursor-not-allowed`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{g.label.split('(')[0]}</span>
              </button>

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30">
                <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-xl text-center leading-tight">
                  🔒 {lockExplanation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content for Årskurs 6 Units */}
      {selectedGrade === 'ak6' ? (
        <div className="space-y-8">
          {CURRICULUM_UNITS.map((unit, unitIdx) => {
            const unitUnlocked = isUnitUnlocked(unitIdx);
            const isSessionDone = profile.completedSessionIds.includes(unit.dailySessionTemplate.id);
            const totalSteps = unit.lessons.length + 1;
            const completedSteps = unit.lessons.filter((l) => profile.completedLessonIds.includes(l.id)).length + (isSessionDone ? 1 : 0);
            const isUnitComplete = completedSteps === totalSteps;

            const unitLockMessage = isSwedish
              ? `Enhet låst: Slutför Enhet ${unitIdx} (${CURRICULUM_UNITS[unitIdx - 1]?.frenchTitle}) först!`
              : `Unidad bloqueada: Completa la Unité ${unitIdx} (${CURRICULUM_UNITS[unitIdx - 1]?.frenchTitle}) primero.`;

            return (
              <div
                key={unit.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  !unitUnlocked
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-70 grayscale-[20%]'
                    : isUnitComplete
                    ? 'border-emerald-200 bg-white'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Unit Header */}
                <div className={`p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !unitUnlocked ? 'bg-slate-100/60' : 'bg-slate-50/50'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 border ${
                      !unitUnlocked
                        ? 'bg-slate-200 text-slate-400 border-slate-300'
                        : isUnitComplete
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {!unitUnlocked ? <Lock className="w-5 h-5 text-slate-400" /> : unit.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          Unité {unit.number}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {completedSteps} / {totalSteps} {isSwedish ? 'steg klara' : 'pasos completados'}
                        </span>
                        {!unitUnlocked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-md">
                            <Lock className="w-3 h-3" />
                            <span>{isSwedish ? 'Låst enhet' : 'Bloqueada'}</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span>{unit.frenchTitle}</span>
                        {unitUnlocked && (
                          <button
                            onClick={() => speakFrench(unit.frenchTitle)}
                            title="Escuchar pronunciación"
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        {isSwedish ? unit.description : unit.title + ' — ' + unit.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this Unit */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => setActiveGrammarModal(unit)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isSwedish ? 'Grammatikregel' : 'Regla de gramática'}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Progressive Steps: 3 Preparatory Lessons + Capstone 30-min Session */}
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {unit.lessons.map((lesson, lessonIdx) => {
                    const isDone = profile.completedLessonIds.includes(lesson.id);
                    const isUnlocked = isLessonUnlocked(unitIdx, lessonIdx);

                    const prevLessonTitle = lessonIdx > 0 ? unit.lessons[lessonIdx - 1].title.split(':')[0] : '';
                    const lockReason = !unitUnlocked
                      ? unitLockMessage
                      : isSwedish
                      ? `Låst: Slutför ${prevLessonTitle} för att låsa upp!`
                      : `Bloqueado: Completa el ${prevLessonTitle} para desbloquear este paso.`;

                    return (
                      <div key={lesson.id} className="relative group flex flex-col">
                        <div
                          onClick={() => {
                            if (isUnlocked) {
                              onSelectLesson(lesson, unit);
                            } else {
                              showLockedAlert(lockReason);
                            }
                          }}
                          className={`p-4 rounded-xl border flex-1 flex flex-col justify-between transition-all select-none ${
                            !isUnlocked
                              ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60 grayscale-[30%] cursor-not-allowed hover:bg-slate-100/90'
                              : isDone
                              ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70 cursor-pointer hover:border-emerald-300 hover:shadow-xs'
                              : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                {isDone ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">
                                      {isSwedish ? 'Klar' : 'Completado'}
                                    </span>
                                  </>
                                ) : !isUnlocked ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-slate-400 font-medium">
                                      {isSwedish ? `Steg ${lessonIdx + 1} (Låst)` : `Paso ${lessonIdx + 1} (Bloqueado)`}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-4 h-4 text-indigo-500" />
                                    <span className="text-indigo-700 font-bold">
                                      {isSwedish ? `Steg ${lessonIdx + 1}` : `Paso ${lessonIdx + 1}`}
                                    </span>
                                  </>
                                )}
                              </span>
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className={`w-3.5 h-3.5 ${isDone ? 'fill-amber-400 text-amber-400' : isUnlocked ? 'text-amber-400' : 'text-slate-300'}`} />
                                <span className={`text-xs font-semibold ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                                  +{lesson.xpReward} XP
                                </span>
                              </div>
                            </div>

                            <h3 className={`font-bold text-sm sm:text-base mb-1 ${
                              !isUnlocked ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'
                            }`}>
                              {lesson.title}
                            </h3>
                            <p className="text-xs font-medium mb-1 flex items-center gap-1 text-indigo-600">
                              <span>{lesson.frenchTitle}</span>
                              {isUnlocked && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakFrench(lesson.frenchTitle);
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 p-0.5"
                                  title="Escuchar audio"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </p>
                            <p className={`text-xs line-clamp-2 ${!isUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                              {lesson.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                              !isUnlocked
                                ? 'text-slate-400'
                                : 'text-indigo-600 group-hover:translate-x-0.5 transition-transform'
                            }`}>
                              {!isUnlocked ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>{isSwedish ? 'Låst' : 'Bloqueado'}</span>
                                </>
                              ) : isDone ? (
                                <>
                                  <span>{isSwedish ? 'Repetera övningar' : 'Repasar'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span>{isSwedish ? 'Börja öva' : 'Empezar paso'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Floating Tooltip explaining why it is locked */}
                        {!isUnlocked && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                            <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-tight">
                              {lockReason}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Culminating Step 4: 30-Minute Structured Session Card with Locked State */}
                  {(() => {
                    const isSessionDone = profile.completedSessionIds.includes(unit.dailySessionTemplate.id);
                    const isSessionOpen = isSessionUnlocked(unitIdx);

                    const sessionLockReason = !unitUnlocked
                      ? unitLockMessage
                      : isSwedish
                      ? 'Låst: Slutför alla tre steg (Steg 1, 2 och 3) för att låsa upp 30-minuters passet!'
                      : 'Bloqueado: Completa los 3 pasos anteriores para desbloquear la Gran Sesión de 30 minutos.';

                    return (
                      <div className="relative group flex flex-col">
                        <div
                          onClick={() => {
                            if (isSessionOpen) {
                              onSelectSession(unit);
                            } else {
                              showLockedAlert(sessionLockReason);
                            }
                          }}
                          className={`p-4 rounded-xl border-2 flex-1 flex flex-col justify-between transition-all select-none relative overflow-hidden ${
                            !isSessionOpen
                              ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60 grayscale-[30%] cursor-not-allowed hover:bg-slate-100/90'
                              : isSessionDone
                              ? 'bg-gradient-to-br from-indigo-50/70 to-emerald-50/70 border-emerald-300 hover:border-emerald-400 cursor-pointer shadow-xs'
                              : 'bg-gradient-to-br from-indigo-50/90 to-purple-50/90 border-indigo-400 hover:border-indigo-600 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold flex items-center gap-1">
                                {isSessionDone ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">
                                      {isSwedish ? 'Pass klart !' : '¡Sesión completada!'}
                                    </span>
                                  </>
                                ) : !isSessionOpen ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-slate-400 font-medium">
                                      {isSwedish ? 'Paso 4 (Låst)' : 'Paso 4 (Bloqueado)'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                    <span className="text-indigo-700">
                                      {isSwedish ? 'Steg 4 (30 min)' : 'Paso 4 (Sesión 30 min)'}
                                    </span>
                                  </>
                                )}
                              </span>
                              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-white/80 px-2 py-0.5 rounded-md shadow-xs">
                                <Star className={`w-3.5 h-3.5 ${isSessionDone ? 'fill-amber-400 text-amber-400' : isSessionOpen ? 'text-amber-400' : 'text-slate-300'}`} />
                                <span className={isSessionOpen ? 'text-slate-700' : 'text-slate-400'}>+45 XP</span>
                              </div>
                            </div>

                            <h3 className={`font-extrabold text-sm sm:text-base mb-1 ${
                              !isSessionOpen ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-700 transition-colors'
                            }`}>
                              {unit.dailySessionTemplate.title}
                            </h3>
                            <p className="text-xs font-semibold mb-1 text-indigo-700">
                              <span>{unit.dailySessionTemplate.frenchTitle}</span>
                            </p>
                            <p className={`text-xs line-clamp-2 ${!isSessionOpen ? 'text-slate-400' : 'text-slate-600'}`}>
                              {isSwedish
                                ? 'Strukturerat 30-minuters pass i 4 faser: Uppvärmning, Input, Rollspel och Utgångsutmaning.'
                                : 'Sesión guiada de 4 fases: Calentamiento, Input, Juego de rol y Reto de salida.'}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-indigo-200/60 flex items-center justify-between relative z-10">
                            <span className={`text-[11px] font-bold flex items-center gap-1 ${
                              !isSessionOpen
                                ? 'text-slate-400'
                                : 'text-indigo-700 group-hover:translate-x-0.5 transition-transform'
                            }`}>
                              {!isSessionOpen ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>{isSwedish ? 'Låst tills steg 1-3 är klara' : 'Bloqueado (completa pasos 1-3)'}</span>
                                </>
                              ) : isSessionDone ? (
                                <>
                                  <span>{isSwedish ? 'Kör passet igen' : 'Repetir sesión'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span>{isSwedish ? 'Starta 30-min passet' : 'Iniciar sesión de 30 min'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Floating Tooltip for locked session */}
                        {!isSessionOpen && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                            <div className="bg-slate-900 text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center leading-tight">
                              🔒 {sessionLockReason}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Future Grades Preview */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {FUTURE_GRADES_PREVIEW.find((g) => g.grade === selectedGrade)?.label}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {FUTURE_GRADES_PREVIEW.find((g) => g.grade === selectedGrade)?.description}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 border border-slate-200/60 mb-6 text-left">
            <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isSwedish ? 'Kontinuerlig progression' : 'Progresión continua garantizada'}</span>
            </p>
            <p>
              {isSwedish
                ? 'När du är klar med alla enheter i årskurs 6 låser systemet automatiskt upp nästa årskurs så att du kan fortsätta genom hela högstadiet!'
                : 'A medida que avances y completes las unidades de Årskurs 6, el sistema adaptativo irá desbloqueando los siguientes cursos de la escuela sueca para que nunca te falte material.'}
            </p>
          </div>
          <button
            onClick={() => setSelectedGrade('ak6')}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {isSwedish ? 'Tillbaka till årskurs 6' : 'Volver a Årskurs 6'}
          </button>
        </div>
      )}

      {/* Grammar Modal */}
      {activeGrammarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  {activeGrammarModal.grammarTip.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveGrammarModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {isSwedish
                ? activeGrammarModal.grammarTip.explanationSv
                : activeGrammarModal.grammarTip.explanationEs}
            </p>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isSwedish ? 'Exempel' : 'Ejemplos en contexto'}
              </span>
              {activeGrammarModal.grammarTip.examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{ex.fr}</p>
                    <p className="text-xs text-slate-500">{isSwedish ? ex.sv : ex.es}</p>
                  </div>
                  <button
                    onClick={() => speakFrench(ex.fr)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-white transition-colors"
                    title="Escuchar audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveGrammarModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors"
            >
              {isSwedish ? 'Förstått !' : '¡Entendido! Volver a la ruta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
