import React, { useState } from 'react';
import { 
  Volume2, 
  RotateCw, 
  Brain, 
  Search, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  GraduationCap,
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Compass
} from 'lucide-react';
import { Flashcard, UserProfile, Unit, GradeLevel } from '../types';
import { speakFrench, soundEffects } from '../utils/audio';
import { updateCardReview, saveFlashcards } from '../utils/storage';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

interface SpacedRepetitionDeckProps {
  cards: Flashcard[];
  onUpdateCards: (cards: Flashcard[]) => void;
  profile: UserProfile;
  units?: Unit[];
  onRecordStudy?: () => void;
}

export const SpacedRepetitionDeck: React.FC<SpacedRepetitionDeckProps> = ({
  cards,
  onUpdateCards,
  profile,
  units,
  onRecordStudy,
}) => {
  const isSwedish = profile.supportLanguage === 'sv';

  // Mode: 'unlocked' (only words from units currently unlocked in learning roadmap) vs 'all' (free exploration of all 55 cards)
  const [studyScope, setStudyScope] = useState<'unlocked' | 'all'>('unlocked');
  const [selectedGrade, setSelectedGrade] = useState<'all' | 'ak6' | 'ak7'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<'all' | string>('all');
  const [currentBoxFilter, setCurrentBoxFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Check if Årskurs 6 is fully completed
  const ak6Units = (units || []).filter((u) => u.grade === 'ak6');
  const isAk6Completed =
    ak6Units.length > 0 &&
    ak6Units.every(
      (u) =>
        profile.completedSessionIds.includes(u.dailySessionTemplate.id) ||
        u.lessons.every((l) => profile.completedLessonIds.includes(l.id))
    );

  // Check if a specific curriculum unit is unlocked in student's roadmap
  const isUnitUnlockedInRoadmap = (unit: Unit): boolean => {
    if (unit.grade === 'ak7' && !isAk6Completed) {
      return false;
    }
    const gradeUnits = (units || []).filter((u) => u.grade === unit.grade);
    const unitIdx = gradeUnits.findIndex((u) => u.id === unit.id);
    if (unitIdx <= 0) return true; // First unit of an unlocked grade is open

    const prevUnit = gradeUnits[unitIdx - 1];
    if (!prevUnit) return true;
    return (
      profile.completedSessionIds.includes(prevUnit.dailySessionTemplate.id) ||
      prevUnit.lessons.every((l) => profile.completedLessonIds.includes(l.id)) ||
      unit.lessons.some((l) => profile.completedLessonIds.includes(l.id))
    );
  };

  // Normalize cards with INITIAL_VOCABULARY master metadata and roadmap unlock status
  const vocabMap = new Map(INITIAL_VOCABULARY.map((v) => [v.id, v]));
  const normalizedCards = cards.map((c) => {
    const master = vocabMap.get(c.id);
    const numId = parseInt(c.id.replace(/\D/g, ''), 10) || 1;
    const grade = (c.grade || master?.grade || (numId >= 28 ? 'ak7' : 'ak6')) as GradeLevel;
    const unitId = c.unitId || master?.unitId || (numId >= 28 ? 'ak7-unit-1' : 'unit-1');

    const cardUnit = (units || []).find((u) => 
      u.id === unitId || 
      u.id === unitId?.replace('ak7-u', 'ak7-unit-') ||
      (grade && u.grade === grade && `unit-${u.number}` === unitId)
    );

    const isUnlockedInRoadmap = cardUnit ? isUnitUnlockedInRoadmap(cardUnit) : (grade === 'ak6');

    return {
      ...c,
      grade,
      unitId,
      cardUnit,
      isUnlockedInRoadmap,
    };
  });

  // Calculate unlock metrics
  const totalCardsCount = normalizedCards.length;
  const unlockedCardsCount = normalizedCards.filter((c) => c.isUnlockedInRoadmap).length;
  const lockedCardsCount = totalCardsCount - unlockedCardsCount;

  // Available units for the selected grade
  const availableUnits = (units || []).filter(
    (u) => selectedGrade === 'all' || u.grade === selectedGrade
  );

  // Cards filtered by scope, grade, unit, box, and search query
  const filteredCards = normalizedCards.filter((c) => {
    // 1. Study Scope filter
    if (studyScope === 'unlocked' && !c.isUnlockedInRoadmap) return false;

    // 2. Grade filter
    if (selectedGrade !== 'all' && c.grade !== selectedGrade) return false;

    // 3. Unit filter
    if (selectedUnitId !== 'all') {
      const matchExact = c.unitId === selectedUnitId;
      const matchNormalized = c.unitId === selectedUnitId.replace('ak7-unit-', 'ak7-u');
      const matchUnitObj = c.cardUnit?.id === selectedUnitId;
      if (!matchExact && !matchNormalized && !matchUnitObj) return false;
    }

    // 4. Box filter
    if (currentBoxFilter !== 'all' && c.box !== currentBoxFilter) return false;

    // 5. Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.french.toLowerCase().includes(q) ||
        c.spanish.toLowerCase().includes(q) ||
        c.swedish.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentCard = filteredCards[activeCardIndex];

  // Box statistics based on the active scope
  const activeDeckScopeCards = normalizedCards.filter((c) => 
    studyScope === 'all' ? true : c.isUnlockedInRoadmap
  );
  const countBox1 = activeDeckScopeCards.filter((c) => c.box === 1).length;
  const countBox2 = activeDeckScopeCards.filter((c) => c.box === 2).length;
  const countBox3 = activeDeckScopeCards.filter((c) => c.box === 3).length;

  const countAk6 = normalizedCards.filter((c) => c.grade === 'ak6').length;
  const countAk7 = normalizedCards.filter((c) => c.grade === 'ak7').length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (profile.soundEnabled) soundEffects.playCardFlip();
  };

  const handleReviewOutcome = (outcome: 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    const updated = updateCardReview(currentCard, outcome);
    const newCards = cards.map((c) => (c.id === currentCard.id ? { ...currentCard, ...updated } : c));

    onUpdateCards(newCards);
    saveFlashcards(newCards);
    onRecordStudy?.();

    if (outcome === 'easy' || outcome === 'good') {
      if (profile.soundEnabled) soundEffects.playCorrect();
    } else {
      if (profile.soundEnabled) soundEffects.playIncorrect();
    }

    setIsFlipped(false);

    // Next card
    if (activeCardIndex + 1 < filteredCards.length) {
      setActiveCardIndex((prev) => prev + 1);
    } else {
      setActiveCardIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
      {/* Integrated Compact Leitner Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 mb-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  {isSwedish ? 'Ordförrådslådan' : 'Caja de Vocabulario'}
                </h2>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
                  Sistema Leitner
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight">
                {isSwedish
                  ? 'Intervallrepetition: Orden flyttas mellan lådorna för att minnas dem'
                  : 'Repetición espaciada: Las palabras avanzan de caja conforme las recuerdas'}
              </p>
            </div>
          </div>

          {/* Leitner Box Counters inline */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold" title="Caja 1: Repaso diario">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{countBox1}</span>
              <span className="text-[10px] font-normal text-rose-600 hidden md:inline">{isSwedish ? 'Daglig' : 'Caja 1'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold" title="Caja 2: En repaso cada 3 días">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{countBox2}</span>
              <span className="text-[10px] font-normal text-amber-600 hidden md:inline">{isSwedish ? '3 dgr' : 'Caja 2'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold" title="Caja 3: Dominadas">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>{countBox3}</span>
              <span className="text-[10px] font-normal text-purple-600 hidden md:inline">{isSwedish ? 'Klar' : 'Caja 3 💎'}</span>
            </span>
          </div>
        </div>

        {/* Integrated Mode Switcher Segmented Control */}
        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">
              {studyScope === 'unlocked'
                ? (isSwedish ? `${unlockedCardsCount} ord upplåsta i din väg` : `${unlockedCardsCount} palabras desbloqueadas en tu Ruta`)
                : (isSwedish ? `Utforskar alla ${totalCardsCount} ord i kursen` : `Explorando todas las ${totalCardsCount} palabras del curso`)}
            </span>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl self-stretch sm:self-auto border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setStudyScope('unlocked');
                setSelectedUnitId('all');
                setActiveCardIndex(0);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                studyScope === 'unlocked'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Solo palabras de unidades que has desbloqueado en tu Ruta"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isSwedish ? `Upplåsta (${unlockedCardsCount})` : `En Ruta (${unlockedCardsCount})`}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudyScope('all');
                setSelectedUnitId('all');
                setActiveCardIndex(0);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                studyScope === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Todas las tarjetas del currículo completo"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isSwedish ? `Alla (${totalCardsCount})` : `Modo Libre (${totalCardsCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grade and Unit Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              {isSwedish ? 'Kurs:' : 'Curso:'}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedGrade('all');
                setSelectedUnitId('all');
                setActiveCardIndex(0);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedGrade === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isSwedish ? 'Alla kurser' : 'Todos'} ({normalizedCards.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedGrade('ak6');
                setSelectedUnitId('all');
                setActiveCardIndex(0);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedGrade === 'ak6'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Årskurs 6 ({countAk6})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedGrade('ak7');
                setSelectedUnitId('all');
                setActiveCardIndex(0);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedGrade === 'ak7'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Årskurs 7 ({countAk7})
            </button>
          </div>

          {/* Unit selector dropdown with unlock indicators */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-600" />
              {isSwedish ? 'Enhet:' : 'Unidad:'}
            </span>
            <select
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(e.target.value);
                setActiveCardIndex(0);
              }}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-72"
            >
              <option value="all">
                {studyScope === 'unlocked'
                  ? (isSwedish ? '📚 Alla upplåsta enheter i din väg' : '📚 Todas las unidades desbloqueadas en tu ruta')
                  : (isSwedish ? '📚 Alla enheter (Hela ordförrådet)' : '📚 Todas las unidades del curso')}
              </option>
              {availableUnits.map((u) => {
                const isUnlocked = isUnitUnlockedInRoadmap(u);
                const unitCardsCount = normalizedCards.filter((c) => c.cardUnit?.id === u.id || c.unitId === u.id).length;
                const prefix = isUnlocked ? '✓ ' : '🔒 ';
                const statusTag = isUnlocked
                  ? (isSwedish ? 'upplåst' : 'activa')
                  : (isSwedish ? 'låst i väg' : 'bloqueada en ruta');

                return (
                  <option key={u.id} value={u.id}>
                    {prefix}{u.grade === 'ak6' ? 'Åk 6' : 'Åk 7'} · U{u.number}: {u.title} ({unitCardsCount} ord · {statusTag})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Leitner Box Counters */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => {
            setCurrentBoxFilter(1);
            setActiveCardIndex(0);
            setIsFlipped(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            currentBoxFilter === 1
              ? 'border-rose-400 bg-rose-50/50 shadow-xs ring-2 ring-rose-200'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {isSwedish ? 'Låda 1' : 'Caja 1'}
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block tabular-nums">
            {countBox1}
          </span>
          <span className="text-xs text-slate-500">
            {isSwedish ? 'Öva dagligen' : 'Nuevas / A reforzar'}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentBoxFilter(2);
            setActiveCardIndex(0);
            setIsFlipped(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            currentBoxFilter === 2
              ? 'border-amber-400 bg-amber-50/50 shadow-xs ring-2 ring-amber-200'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              {isSwedish ? 'Låda 2' : 'Caja 2'}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block tabular-nums">
            {countBox2}
          </span>
          <span className="text-xs text-slate-500">
            {isSwedish ? 'Var 3:e dag' : 'En progreso'}
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentBoxFilter(3);
            setActiveCardIndex(0);
            setIsFlipped(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            currentBoxFilter === 3
              ? 'border-emerald-400 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-200'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {isSwedish ? 'Låda 3' : 'Caja 3'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 block tabular-nums">
            {countBox3}
          </span>
          <span className="text-xs text-slate-500">
            {isSwedish ? 'Behärskade (Gemas 💎)' : 'Dominadas (Gemas 💎)'}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => {
              setCurrentBoxFilter('all');
              setActiveCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentBoxFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSwedish ? 'Alla' : 'Todas'} ({filteredCards.length})
          </button>
          <button
            onClick={() => {
              setCurrentBoxFilter(1);
              setActiveCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentBoxFilter === 1
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSwedish ? 'Låda 1' : 'Caja 1'}
          </button>
          <button
            onClick={() => {
              setCurrentBoxFilter(2);
              setActiveCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentBoxFilter === 2
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSwedish ? 'Låda 2' : 'Caja 2'}
          </button>
          <button
            onClick={() => {
              setCurrentBoxFilter(3);
              setActiveCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              currentBoxFilter === 3
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSwedish ? 'Låda 3' : 'Caja 3'}
          </button>
        </div>

        {/* Search input and Guide Toggle button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveCardIndex(0);
              }}
              placeholder={isSwedish ? 'Sök ord...' : 'Buscar palabra...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 transition-colors cursor-pointer shrink-0"
            title={isSwedish ? 'Hur fungerar systemet?' : '¿Cómo funciona el sistema?'}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">
              {isSwedish ? 'Hur fungerar det?' : '¿Cómo funciona?'}
            </span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Leitner Explanation Card */}
      {showGuide && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white border border-indigo-100 shadow-xs text-slate-700 transition-all">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {isSwedish ? 'Intervallrepetition & Progression' : 'Repetición Espaciada & Progresión'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {isSwedish ? 'Vetenskaplig inlärningsmetod' : 'Método científico de memorización'}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isSwedish ? 'Så här hänger ordförrådslådan ihop med din Inlärningsväg' : '¿Cómo se conecta esta sección con tu Ruta de Aprendizaje?'}
              </h4>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {isSwedish
              ? 'I din Inlärningsväg möter du lektioner, grammatik och dialoger. Här i Ordförrådslådan aktiveras orden automatiskt så fort du låser upp en enhet, så att du repeterar dem i optimala intervall och aldrig glömmer dem.'
              : 'En tu Ruta de Aprendizaje estudias las lecciones, gramática y diálogos por primera vez. Aquí en la Caja de Vocabulario, las palabras de las unidades que vas desbloqueando se activan automáticamente para que las consolides con intervalos óptimos y nunca se te olviden.'}
          </p>

          {/* 3 Boxes description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white border border-rose-100 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{isSwedish ? 'Låda 1 · Daglig' : 'Caja 1 · Diario'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                {isSwedish
                  ? 'Nya ord och ord du markerat som svåra. Här repeterar du varje dag tills de sitter.'
                  : 'Palabras nuevas o que te resultaron difíciles. Se repasan a diario hasta afianzarlas.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{isSwedish ? 'Låda 2 · Var 3:e dag' : 'Caja 2 · Cada 3 días'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                {isSwedish
                  ? 'Ord du känner till ganska bra. Repeteras med några dagars mellanrum.'
                  : 'Palabras que ya recuerdas bien. Su intervalo se espacia para reforzar la retención.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{isSwedish ? 'Låda 3 · Dominada 💎' : 'Caja 3 · Dominada 💎'}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                {isSwedish
                  ? 'Ord du behärskar helt! Varje ord i denna låda ger dig 1 Ädelsten 💎 i toppmenyn.'
                  : '¡Palabras memorizadas! Cada palabra en esta caja te otorga 1 Gema 💎 en la barra superior.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Card Presentation */}
      {currentCard ? (
        <div className="max-w-lg mx-auto">
          {/* Progress label & Curriculum linkage */}
          {(() => {
            const cardUnit = currentCard.cardUnit;
            const isUnlocked = currentCard.isUnlockedInRoadmap;

            return (
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 px-1 gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border border-indigo-200/80 shadow-2xs">
                    {cardUnit ? (cardUnit.grade === 'ak6' ? 'Årskurs 6' : 'Årskurs 7') : (currentCard.grade === 'ak6' ? 'Årskurs 6' : 'Årskurs 7')} · Unité {cardUnit?.number || 1}
                  </span>
                  <span className="text-slate-800 font-bold text-xs">
                    {cardUnit ? cardUnit.title : currentCard.category}
                  </span>
                  
                  {/* Unlock Status Pill */}
                  {isUnlocked ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isSwedish ? 'Upplåst i din väg' : 'Desbloqueada en tu ruta'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{isSwedish ? 'Låst i väg (Framtida enhet)' : 'Bloqueada en ruta (Unidad futura)'}</span>
                    </span>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {activeCardIndex + 1} / {filteredCards.length}
                </span>
              </div>
            );
          })()}

          {/* Flashcard container */}
          <div
            onClick={handleFlip}
            className={`min-h-[320px] rounded-3xl p-8 border cursor-pointer select-none transition-all duration-300 relative flex flex-col justify-between shadow-sm hover:shadow-md ${
              isFlipped
                ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Top card metadata */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isFlipped
                    ? 'bg-white/10 text-indigo-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isSwedish ? `Låda ${currentCard.box}` : `Caja ${currentCard.box}`}
              </span>

              {/* Audio buttons */}
              <div
                className="flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => speakFrench(currentCard.french, false)}
                  title="Pronunciación normal"
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isFlipped
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => speakFrench(currentCard.french, true)}
                  title="Pronunciación lenta (0.75x)"
                  className={`px-2 py-1 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${
                    isFlipped
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  0.75x
                </button>
              </div>
            </div>

            {/* Main Word / Meaning display */}
            <div className="my-auto text-center py-6">
              {!isFlipped ? (
                <>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                    {currentCard.french}
                  </h2>
                  <p className="text-sm font-mono text-slate-400">
                    [{currentCard.phonetic}]
                  </p>
                  <p className="text-xs text-indigo-500 font-semibold mt-4">
                    {isSwedish ? 'Klicka för att vända kortet' : 'Toca para voltear y ver la traducción'}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-1 text-emerald-300">
                    {isSwedish ? currentCard.swedish : currentCard.spanish}
                  </h3>
                  <p className="text-xs text-indigo-200 mb-4">
                    {isSwedish ? `Spanska: ${currentCard.spanish}` : `Sueco: ${currentCard.swedish}`}
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/10 text-left border border-white/10 text-xs leading-relaxed">
                    <p className="font-semibold text-white flex items-center justify-between">
                      <span>{currentCard.exampleFr}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakFrench(currentCard.exampleFr);
                        }}
                        className="text-indigo-200 hover:text-white p-0.5 cursor-pointer"
                        title={isSwedish ? 'Lyssna på exemplet' : 'Escuchar frase de ejemplo'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </p>
                    <p className="text-indigo-200 text-[11px] mt-1">
                      {isSwedish ? currentCard.exampleSv : currentCard.exampleEs}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="text-center">
              <span className="text-[11px] opacity-70 flex items-center justify-center gap-1">
                <RotateCw className="w-3 h-3" />
                <span>{isSwedish ? 'Vänd' : 'Girar tarjeta'}</span>
              </span>
            </div>
          </div>

          {/* Spaced Repetition Grading Controls */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => handleReviewOutcome('hard')}
              className="py-3 px-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span>{isSwedish ? 'Svårt' : 'Difícil'}</span>
              <span className="text-[10px] font-normal text-rose-500">
                {isSwedish ? '→ Låda 1' : '→ Caja 1'}
              </span>
            </button>

            <button
              onClick={() => handleReviewOutcome('good')}
              className="py-3 px-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span>{isSwedish ? 'Bra' : 'Bien'}</span>
              <span className="text-[10px] font-normal text-amber-500">
                {isSwedish ? '→ Låda 2' : '→ Caja 2'}
              </span>
            </button>

            <button
              onClick={() => handleReviewOutcome('easy')}
              className="py-3 px-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span>{isSwedish ? 'Lätt / Kan det' : 'Fácil / Dominada'}</span>
              <span className="text-[10px] font-normal text-emerald-500">
                {isSwedish ? '→ Låda 3 💎' : '→ Caja 3 💎'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">
            {isSwedish ? 'Inga kort i detta urval' : 'No hay tarjetas activas en esta vista'}
          </h4>
          <p className="text-slate-600 text-xs mb-4 leading-relaxed">
            {studyScope === 'unlocked'
              ? (isSwedish
                  ? 'Enheten du valt är ännu låst i din Inlärningsväg. Slutför föregående enhet för att låsa upp den, eller byt till Utforskarläge för att öva fritt.'
                  : 'La unidad seleccionada aún está bloqueada en tu Ruta de Aprendizaje. Completa las lecciones de la unidad previa para activarla aquí, o activa el Modo Libre para practicarla ya.')
              : (isSwedish
                  ? 'Inga kort matchar din filtrering eller sökning.'
                  : 'Ninguna tarjeta coincide con los filtros o la búsqueda.')}
          </p>
          <div className="flex items-center justify-center gap-2">
            {studyScope === 'unlocked' && (
              <button
                onClick={() => setStudyScope('all')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-indigo-700 transition-colors shadow-xs"
              >
                {isSwedish ? 'Växla till Utforskarläge' : 'Cambiar a Modo Libre'}
              </button>
            )}
            <button
              onClick={() => {
                setSelectedUnitId('all');
                setCurrentBoxFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {isSwedish ? 'Återställ filter' : 'Restablecer filtros'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
