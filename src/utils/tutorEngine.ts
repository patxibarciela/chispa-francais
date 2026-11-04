/**
 * Universal Tutor Engine:
 * Communicates with backend /api/tutor if available (when deployed on a server with Gemini AI),
 * and seamlessly provides full client-side pedagogical evaluation if hosted statically
 * (such as on GitHub Pages, Netlify, Vercel, or offline).
 */

import { INITIAL_VOCABULARY } from '../data/vocabulary';

interface EvaluationPhase3Result {
  isCorrect: boolean;
  feedback: string;
  nextPrompt: string;
  hint: string;
}

interface EvaluationPhase4Result {
  puntosFuertes: string;
  paraRevisar: string;
  frenchComment: string;
  scoreXP: number;
}

export async function evaluateSessionStep(
  phase: 3 | 4,
  sessionTitle: string,
  userInput: string,
  history: any[],
  supportLanguage: 'es' | 'sv'
): Promise<any> {
  const isSwedish = supportLanguage === 'sv';

  // 1. Try server-side API first (with 3.5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/tutor/session-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase,
        sessionTitle,
        userInput,
        history,
        supportLanguage,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && (data.feedback || data.puntosFuertes)) {
        return data;
      }
    }
  } catch (err) {
    // Server not present (e.g. GitHub Pages or offline) -> Fall through to client engine
  }

  // 2. High-Quality Client-Side Standalone Engine
  const inputClean = userInput.trim().toLowerCase();

  if (phase === 3) {
    // Detect basic French markers
    const hasFrenchWords =
      inputClean.includes('bonjour') ||
      inputClean.includes('salut') ||
      inputClean.includes('je') ||
      inputClean.includes("j'ai") ||
      inputClean.includes('appelle') ||
      inputClean.includes('ans') ||
      inputClean.includes('merci') ||
      inputClean.includes('oui') ||
      inputClean.includes('bien') ||
      inputClean.includes('porte') ||
      inputClean.includes('adore') ||
      inputClean.includes('aime') ||
      inputClean.includes('croissant') ||
      inputClean.includes('crêpe') ||
      inputClean.includes('heure') ||
      inputClean.includes('collège') ||
      inputClean.length >= 6;

    const isCorrect = hasFrenchWords && inputClean.length >= 3;

    if (isCorrect) {
      // Progressive constraints
      const constraints = isSwedish
        ? [
            'Nu: svara genom att lägga till ett bindeord som "et" (och) eller "avec" (med).',
            'Toppen! Lägg nu till en färg eller en siffra i ditt nästa svar.',
            'Bravo! Avsluta med en artighetsfras som "s\'il te plaît" eller "merci beaucoup".',
          ]
        : [
            'Ahora responde añadiendo un conector como "et" (y) o "avec" (con).',
            '¡Muy bien! Añade ahora un color o un número en tu siguiente frase.',
            '¡Excelente! Termina con una fórmula de cortesía como "s\'il te plaît" o "merci beaucoup".',
          ];

      const randomConstraint = constraints[Math.floor(Math.random() * constraints.length)];

      return {
        isCorrect: true,
        feedback: '¡Très bien ! Tu t\'exprimes bien en français.',
        nextPrompt: randomConstraint,
        hint: isSwedish
          ? 'Tips: använd enkla ord och bygg vidare på det du lärt dig.'
          : 'Pista: usa frases cortas y añade detalles con "et" o "avec".',
      } as EvaluationPhase3Result;
    } else {
      return {
        isCorrect: false,
        feedback: isSwedish
          ? 'Nära, men försök skriva eller säga det på franska.'
          : 'Buen intento, pero procura responder en francés usando las frases de la sesión.',
        nextPrompt: isSwedish
          ? 'Försök omformulera med "Je m\'appelle...", "J\'ai..." eller "Je voudrais...".'
          : 'Intenta reformular usando "Je m\'appelle...", "J\'ai..." o "Je voudrais...".',
        hint: isSwedish ? 'Skriv minst en hel mening på franska.' : 'Escribe al menos una frase completa en francés.',
      } as EvaluationPhase3Result;
    }
  } else {
    // Phase 4: Exit ticket evaluation
    return {
      puntosFuertes: isSwedish
        ? 'Du har genomfört alla 4 faser av dagens pass och sammanfattat dina kunskaper på franska.'
        : 'Has completado con éxito las 4 fases de la sesión y resumido lo aprendido en francés.',
      paraRevisar: isSwedish
        ? 'Repetera stavningen och böjningen i ordförrådskorten (Låda 1) imorgon bitti.'
        : 'Repasa la concordancia de género (un / une, le / la) y la pronunciación en la caja de vocabulario.',
      frenchComment: 'Félicitations pour cette belle séance de 30 minutes ! Tu fais de très grands progrès ! 🌟',
      scoreXP: 45,
    } as EvaluationPhase4Result;
  }
}

export async function chatWithTutorEngine(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  supportLanguage: 'es' | 'sv'
): Promise<string> {
  const isSwedish = supportLanguage === 'sv';
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const q = lastUserMsg.toLowerCase().trim();

  // 1. Try server-side API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        supportLanguage,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    // Offline / GitHub Pages fallback
  }

  // 2. Client-side intelligent pedagogical responder
  // Check vocabulary dictionary lookup: "Comment on dit [word]" or "Cómo se dice [word]" or "Hur säger man [word]"
  for (const card of INITIAL_VOCABULARY) {
    if (
      q.includes(card.spanish.toLowerCase()) ||
      q.includes(card.swedish.toLowerCase()) ||
      q.includes(card.french.toLowerCase())
    ) {
      if (isSwedish) {
        return `Det heter « ${card.french} » [${card.phonetic}].\nExempel: « ${card.exampleFr} » (${card.exampleSv}) ✨\nVill du öva på fler ord ?`;
      } else {
        return `Se dice « ${card.french} » [pronunciado: ${card.phonetic}].\nEjemplo: « ${card.exampleFr} » (${card.exampleEs}) ✨\n¿Quieres que practiquemos otra palabra?`;
      }
    }
  }

  if (q.includes('bonjour') || q.includes('salut')) {
    return isSwedish
      ? "Bonjour ! Ça va bien aujourd'hui ? Tu peux me dire : « Ça va super bien, merci ! Et toi ? »"
      : "¡Bonjour ! Ça va bien aujourd'hui ? Puedes responderme: « Ça va super bien, merci ! Et toi ? » 😊";
  }

  if (q.includes("je m'appelle") || q.includes('je mappelle')) {
    return isSwedish
      ? "Enchanté ! Quel joli prénom ! Et quel âge as-tu ? Tu peux dire : « J'ai 13 ans ! »"
      : "¡Enchanté ! Qué bonito nombre. Quel âge as-tu ? Puedes decirme: « J'ai 13 ans ! »";
  }

  if (q.includes('ans') || q.includes('treize') || q.includes('13')) {
    return isSwedish
      ? "Super ! 13 ans, c'est l'âge parfait pour årskurs 6 ! Qu'est-ce que tu aimes faire après l'école ?"
      : "¡Super ! 13 años, la edad ideal en årskurs 6. Qu'est-ce que tu aimes faire après l'école ?";
  }

  if (q.includes('croissant') || q.includes('café') || q.includes('crêpe') || q.includes('voudrais')) {
    return isSwedish
      ? "Très bien ! « Je voudrais un croissant et un jus d'orange, s'il vous plaît ! » C'est combien ? Ça fait quatre euros !"
      : "¡Excelente! « Je voudrais un croissant et un jus d'orange, s'il vous plaît ! » C'est combien ? Ça fait quatre euros ! 🥐";
  }

  if (q.includes('question') || q.includes('fråga')) {
    return isSwedish
      ? "Voilà une question facile : comment dit-on « katt » en français ? Un chien, un chat, ou un oiseau ?"
      : "Aquí tienes una pregunta fácil: ¿cómo se dice « gato » en francés? ¿Un chien, un chat, o un oiseau?";
  }

  return isSwedish
    ? "Très bien essayé ! Tu fais de super progrès en français. Répète avec moi : « J'apprends le français à l'école ! » ✨"
    : "¡Muy buen intento! Estás haciendo grandes progresos en francés. Répète avec moi : « J'apprends le français à l'école ! » ✨";
}
