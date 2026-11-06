import React, { useState } from 'react';
import { 
  Volume2, 
  RotateCw, 
  Check, 
  X, 
  Sparkles, 
  Brain, 
  Search, 
  Layers, 
  VolumeX,
  Play,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Gem,
  CheckCircle2,
  Calendar,
  ArrowRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { Flashcard, UserProfile, Unit, GradeLevel } from '../types';
import { speakFrench, soundEffects } from '../utils/audio';
import { updateCardReview, saveFlashcards } from '../utils/storage';
import { SectionBanner } from './SectionBanner';

interface SpacedRepetitionDeckProps {
  cards: Flashcard[];
  onUpdateCards: (cards: Flashcard[]) => void;
  profile: UserProfile;
  units?: Unit[];
}

export const SpacedRepetitionDeck: React.FC<SpacedRepetitionDeckProps> = ({
  cards,
  onUpdateCards,
  profile,
  units,
}) => {
  const isSwedish = profile.supportLanguage === 'sv';

  const [selectedGrade, setSelectedGrade] = useState<'all' | 'ak6' | 'ak7'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<'all' | string>('all');
  const [currentBoxFilter, setCurrentBoxFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Available units for the selected grade
  const availableUnits = (units || []).filter(
    (u) => selectedGrade === 'all' || u.grade === selectedGrade
  );

  // Filter cards by grade, unit, box, and search query
  const filteredCards = cards.filter((c) => {
    if (selectedGrade !== 'all' && c.grade && c.grade !== selectedGrade) return false;
    if (selectedUnitId !== 'all' && c.unitId && c.unitId !== selectedUnitId) return false;
    if (currentBoxFilter !== 'all' && c.box !== currentBoxFilter) return false;
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

  const currentCard: Flashcard | undefined = filteredCards[activeCardIndex];

  // Box statistics
  const countBox1 = cards.filter((c) => c.box === 1).length;
  const countBox2 = cards.filter((c) => c.box === 2).length;
  const countBox3 = cards.filter((c) => c.box === 3).length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (profile.soundEnabled) soundEffects.playCardFlip();
  };

  const handleReviewOutcome = (outcome: 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    const updated = updateCardReview(currentCard, outcome);
    const newCards = cards.map((c) => (c.id === currentCard.id ? updated : c));

    onUpdateCards(newCards);
    saveFlashcards(newCards);

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
    <div>
      {/* Unified Section Header matching Chispa style */}
      <SectionBanner
        categoryBadge={isSwedish ? 'LEITNER-SYSTEMET · REPETITION' : 'SISTEMA LEITNER · INTERVALOS ÓPTIMOS'}
        categoryIcon={Brain}
        title={isSwedish ? 'Ordförrådslådan' : 'La Caja de Vocabulario Activo'}
        description={
          isSwedish
            ? 'Orden flyttas mellan lådorna baserat på intervallrepetition. Låda 3 = ord du behärskar helt!'
            : 'Las palabras avanzan de caja conforme las recuerdas. ¡El algoritmo calcula los intervalos ideales para consolidar tu memoria!'
        }
        metrics={[
          { value: countBox1, label: isSwedish ? 'Låda 1 (Daglig)' : 'Caja 1 (A reforzar)', colorClass: 'text-rose-600' },
          { value: countBox2, label: isSwedish ? 'Låda 2 (3 dagar)' : 'Caja 2 (En repaso)', colorClass: 'text-amber-600' },
          { value: countBox3, label: isSwedish ? 'Låda 3 (Mästare)' : 'Caja 3 (Dominadas)', colorClass: 'text-purple-600' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 py-4">

      {/* Grade and Unit Roadmap Linker */}
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
              {isSwedish ? 'Alla kurser' : 'Todos'} ({cards.length})
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
              Årskurs 6 ({cards.filter((c) => c.grade === 'ak6').length})
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
              Årskurs 7 ({cards.filter((c) => c.grade === 'ak7').length})
            </button>
          </div>

          {/* Unit selector dropdown */}
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
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-64"
            >
              <option value="all">
                {isSwedish ? '📚 Alla enheter (Hela ordförrådet)' : '📚 Todas las unidades del curso'}
              </option>
              {availableUnits.map((u) => {
                const unitCardsCount = cards.filter((c) => c.unitId === u.id).length;
                return (
                  <option key={u.id} value={u.id}>
                    {u.grade === 'ak6' ? 'Åk 6' : 'Åk 7'} · U{u.number}: {u.title} ({unitCardsCount} {isSwedish ? 'ord' : 'palabras'})
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
            {isSwedish ? 'Behärskade (Var 7:e dag)' : 'Dominadas'}
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
            {isSwedish ? 'Alla kort' : 'Todas'} ({cards.length})
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
                  {isSwedish ? 'Intervallrepetition' : 'Repetición Espaciada'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {isSwedish ? 'Vetenskaplig inlärningsmetod' : 'Método científico de memorización'}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isSwedish ? 'Så här fungerar Leitner-systemet i Chispa' : '¿Cómo funciona el Sistema Leitner en Chispa?'}
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
              ? 'Leitner-systemet hjälper dig att flytta ord från korttidsminnet till långtidsminnet genom att repetera dem precis innan hjärnan hinner glömma dem.'
              : 'El Sistema Leitner traslada las palabras de la memoria a corto plazo a la memoria a largo plazo revisándolas con intervalos crecientes, justo antes de que tu cerebro las olvide.'}
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

          {/* 3 Step usage instructions */}
          <div className="bg-white/80 rounded-xl p-3 border border-indigo-50 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
              <span>
                <strong>{isSwedish ? 'Lyssna:' : 'Escucha:'}</strong> {isSwedish ? 'Klicka på högtalaren (eller 0.75x för långsamt) och försök minnas betydelsen innan du kollar.' : 'Pulsa el altavoz (o 0.75x para velocidad lenta) e intenta recordar qué significa antes de voltear.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
              <span>
                <strong>{isSwedish ? 'Vänd:' : 'Gira:'}</strong> {isSwedish ? 'Klicka på kortet för att se översättningen och ett exempel med uttal.' : 'Haz clic en la tarjeta para ver la solución y una frase real de ejemplo con audio.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
              <span>
                <strong>{isSwedish ? 'Värdera:' : 'Evalúa:'}</strong> {isSwedish ? 'Välj "Svårt" (tillbaka till Låda 1), "Bra" (till Låda 2) eller "Lätt / Kan det" (flyttas till Låda 3 och ger gemas).' : 'Elige "Difícil" (vuelve a Caja 1), "Bien" (pasa a Caja 2) o "Fácil / Dominada" (sube a Caja 3 y suma gemas).'}
              </span>
            </div>
          </div>

          {/* Integration with Learning Roadmap explanation */}
          <div className="mt-3.5 pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isSwedish ? 'Koppling till Inlärningsvägen:' : 'Conexión con la Ruta de Aprendizaje:'}</span>
            </div>
            <p className="leading-tight text-slate-600">
              {isSwedish
                ? 'Korten är direkt kopplade till kursens 16 enheter i Årskurs 6 och 7. Använd enhetsväljaren för att öva på just den lektion du studerar nu!'
                : 'Las palabras provienen directamente de las 16 unidades del currículo (Åk 6 y 7). Usa el selector superior para repasar la unidad que estés estudiando en tu ruta.'}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Card Presentation */}
      {currentCard ? (
        <div className="max-w-lg mx-auto">
          {/* Progress label & Curriculum linkage */}
          {(() => {
            const cardUnit = units?.find((u) => u.id === currentCard.unitId);
            return (
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-indigo-600">
                    {cardUnit ? (
                      <>
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] font-bold mr-1 border border-indigo-100">
                          {cardUnit.grade === 'ak6' ? 'Åk 6' : 'Åk 7'} · U{cardUnit.number}
                        </span>
                        <span>{cardUnit.title}</span>
                      </>
                    ) : (
                      `Categoría: ${currentCard.category}`
                    )}
                  </span>
                  {cardUnit && profile.completedLessonIds.some((lid) => cardUnit.lessons.some((l) => l.id === lid)) && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                      {isSwedish ? '✓ Pågående i din väg' : '✓ En progreso en tu Ruta'}
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
                {isSwedish ? '→ Låda 3' : '→ Caja 3'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto">
          <p className="text-slate-600 font-medium text-sm mb-4">
            {isSwedish ? 'Inga kort matchar din sökning.' : 'No hay tarjetas que coincidan con la búsqueda.'}
          </p>
          <button
            onClick={() => {
              setCurrentBoxFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            {isSwedish ? 'Visa alla kort' : 'Ver todas las tarjetas'}
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
