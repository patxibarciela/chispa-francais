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
  Play
} from 'lucide-react';
import { Flashcard, UserProfile } from '../types';
import { speakFrench, soundEffects } from '../utils/audio';
import { updateCardReview, saveFlashcards } from '../utils/storage';

interface SpacedRepetitionDeckProps {
  cards: Flashcard[];
  onUpdateCards: (cards: Flashcard[]) => void;
  profile: UserProfile;
}

export const SpacedRepetitionDeck: React.FC<SpacedRepetitionDeckProps> = ({
  cards,
  onUpdateCards,
  profile,
}) => {
  const isSwedish = profile.supportLanguage === 'sv';

  const [currentBoxFilter, setCurrentBoxFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Filter cards
  const filteredCards = cards.filter((c) => {
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Introduction */}
      <div className="mb-8 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
          <Brain className="w-3.5 h-3.5" />
          <span>{isSwedish ? 'Spaced Repetition · Leitner-lådor' : 'Repetición Espaciada · Sistema Leitner'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {isSwedish ? 'Ordförrådslådan' : 'La Caja de Vocabulario'}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          {isSwedish
            ? 'Orden flyttas mellan lådorna beroende på hur säkert du kan dem. Låda 3 = behärskade ord!'
            : 'Las palabras avanzan de caja según las recuerdes. ¡El algoritmo calcula los intervalos óptimos para que nunca las olvides!'}
        </p>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => {
              setCurrentBoxFilter('all');
              setActiveCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentBoxFilter === 3
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSwedish ? 'Låda 3' : 'Caja 3'}
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
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
      </div>

      {/* Interactive Card Presentation */}
      {currentCard ? (
        <div className="max-w-lg mx-auto">
          {/* Progress label */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="font-semibold text-indigo-600">
              Categoría: {currentCard.category}
            </span>
            <span>
              {activeCardIndex + 1} / {filteredCards.length}
            </span>
          </div>

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
                  className={`p-2 rounded-xl transition-colors ${
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
                  className={`px-2 py-1 text-[11px] font-bold rounded-xl transition-colors ${
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
                        className="text-indigo-200 hover:text-white p-0.5"
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
              className="py-3 px-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-xs"
            >
              <span>{isSwedish ? 'Svårt' : 'Difícil'}</span>
              <span className="text-[10px] font-normal text-rose-500">
                {isSwedish ? '→ Låda 1' : '→ Caja 1'}
              </span>
            </button>

            <button
              onClick={() => handleReviewOutcome('good')}
              className="py-3 px-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-xs"
            >
              <span>{isSwedish ? 'Bra' : 'Bien'}</span>
              <span className="text-[10px] font-normal text-amber-500">
                {isSwedish ? '→ Låda 2' : '→ Caja 2'}
              </span>
            </button>

            <button
              onClick={() => handleReviewOutcome('easy')}
              className="py-3 px-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex flex-col items-center gap-0.5 transition-all active:scale-95 shadow-xs"
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            {isSwedish ? 'Visa alla kort' : 'Ver todas las tarjetas'}
          </button>
        </div>
      )}
    </div>
  );
};
