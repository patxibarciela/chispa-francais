/**
 * Universal Intelligent Pedagogical Tutor Engine for Chispa Français
 * 
 * Works seamlessly in both:
 * 1. Full-Stack Node / Gemini AI environment (via /api/tutor/chat and /api/tutor/session-evaluate)
 * 2. Standalone client environment (GitHub Pages, offline, or sandbox without API keys)
 * 
 * Provides an empathetic, dynamic French tutor ("Léo") adapted for Årskurs 6 Moderna språk students.
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
  } catch {
    // Fall through to client engine
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
      const constraints = isSwedish
        ? [
            'Nu: svara genom att lägga till ett bindeord som "et" (och) eller "avec" (med).',
            'Toppen! Lägg nu till en färg eller en siffra i ditt nästa svar.',
            'Bravo! Avsluta med en artighetsfras som "s\'il te plaît" eller "merci beaucoup".',
            'Mycket bra! Kan du lägga till vad du tycker om med "J\'adore..." eller "Je préfère..."?',
          ]
        : [
            'Ahora responde añadiendo un conector como "et" (y) o "avec" (con).',
            '¡Muy bien! Añade ahora un color o un número en tu siguiente frase.',
            '¡Excelente! Termina con una fórmula de cortesía como "s\'il te plaît" o "merci beaucoup".',
            '¡Fenomenal! Añade ahora una opinión con « J\'adore... » o « Je préfère... ».',
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

/**
 * Rich conversational grammar & vocabulary knowledge base for instant answers
 */
const GRAMMAR_QA: Record<string, { es: string; sv: string }> = {
  'un_une': {
    es: '« Un » se usa para palabras masculinas (ej: un stylo = un bolígrafo, un chat = un gato).\n« Une » se usa para palabras femeninas (ej: une gomme = una goma, une pomme = una manzana). En plural, ambos se convierten en « des » (des stylos, des gommes).',
    sv: '« Un » används för maskulina ord (t.ex. un stylo = en penna, un chat = en katt).\n« Une » används för feminina ord (t.ex. une gomme = ett suddgummi, une pomme = ett äpple). I plural blir båda « des » (des stylos, des gommes).'
  },
  'le_la': {
    es: '« Le » es el artículo determinado masculino singular (el):\n• Le livre (el libro)\n« La » es el femenino singular (la):\n• La table (la mesa)\nSi la palabra empieza por vocal o h muda, usamos « L\' »: l\'école (la escuela), l\'ami (el amigo).\nEn plural se usa « Les »: les livres, les tables.',
    sv: '« Le » är den bestämda artikeln i maskulinum (t.ex. le livre = boken).\n« La » är femininum (t.ex. la table = bordet).\nFöre vokal eller stumt h blir det « L\' »: l\'école (skolan).\nI plural används « Les » för båda: les livres, les écoles.'
  },
  'etre': {
    es: 'El verbo « ÊTRE » (ser o estar):\n• Je suis (yo soy / estoy)\n• Tu es (tú eres / estás)\n• Il / Elle est (él/ella es o está)\n• Nous sommes (nosotros somos)\n• Vous êtes (vosotros sois / usted es)\n• Ils / Elles sont (ellos/ellas son)\nEjemplo: « Je suis élève à l\'école. »',
    sv: 'Verbet « ÊTRE » (att vara):\n• Je suis (jag är)\n• Tu es (du är)\n• Il / Elle est (han/hon är)\n• Nous sommes (vi är)\n• Vous êtes (ni är)\n• Ils / Elles sont (de är)\nExempel: « Je suis élève au collège. »'
  },
  'avoir': {
    es: 'El verbo « AVOIR » (tener o haber):\n• J\'ai (yo tengo)\n• Tu as (tú tienes)\n• Il / Elle a (él/ella tiene)\n• Nous avons (nosotros tenemos)\n• Vous avez (vosotros tenéis)\n• Ils / Elles ont (ellos/ellas tienen)\n¡Recuerda que para la edad usamos avoir!: « J\'ai 13 ans » (Tengo 13 años).',
    sv: 'Verbet « AVOIR » (att ha):\n• J\'ai (jag har)\n• Tu as (du har)\n• Il / Elle a (han/hon har)\n• Nous avons (vi har)\n• Vous avez (ni har)\n• Ils / Elles ont (de har)\nKom ihåg att ålder uttrycks med avoir: « J\'ai 13 ans » (Jag är 13 år)!'
  },
  'negacion': {
    es: 'Para hacer una frase negativa en francés, envolvemos el verbo entre « NE » y « PAS »:\n• Je mange → Je NE mange PAS (Yo no como)\n• J\'aime → Je N\'aime PAS (No me gusta, con n\' ante vocal)\n• Je suis fatigué → Je NE suis PAS fatigué.',
    sv: 'För att bilda en nekande mening sätter vi « NE » före verbet och « PAS » efter verbet:\n• Je mange → Je NE mange PAS (Jag äter inte)\n• J\'aime → Je N\'aime PAS (Jag gillar inte, n\' före vokal)\n• Je suis fatigué → Je NE suis PAS fatigué.'
  }
};

/**
 * Contextual Turn Counter to ensure variety
 */
let conversationTurn = 0;

export async function chatWithTutorEngine(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  supportLanguage: 'es' | 'sv'
): Promise<string> {
  const isSwedish = supportLanguage === 'sv';
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const q = lastUserMsg.toLowerCase().trim();
  conversationTurn++;

  // 1. Try server-side API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
      if (data && data.reply && !data.reply.includes("J'apprends le français à l'école")) {
        return data.reply;
      }
    }
  } catch {
    // Offline / GitHub Pages fallback continues below
  }

  // 2. Client-Side High-Intelligence Pedagogical Responder
  const previousAssistantMsg = messages.length >= 2 
    ? messages[messages.length - 2]?.content.toLowerCase() 
    : '';

  // A) Check direct dictionary lookup: "cómo se dice...", "comment on dit...", "hur säger man...", "qué significa...", "vad betyder..."
  for (const card of INITIAL_VOCABULARY) {
    const esWord = card.spanish.toLowerCase();
    const svWord = card.swedish.toLowerCase();
    const frWord = card.french.toLowerCase();

    if (
      q.includes(esWord) ||
      q.includes(svWord) ||
      (q.includes(frWord) && (q.includes('significa') || q.includes('betyder') || q.includes('qué') || q.includes('vad')))
    ) {
      if (isSwedish) {
        return `Det heter « ${card.french} » [uttalas: ${card.phonetic}].\nExempel: « ${card.exampleFr} » (${card.exampleSv}) ✨\nVill du att vi övar på ett ord till ?`;
      } else {
        return `Se dice « ${card.french} » [pronunciado: ${card.phonetic}].\nEjemplo: « ${card.exampleFr} » (${card.exampleEs}) ✨\n¿Quieres que practiquemos otra palabra o frase?`;
      }
    }
  }

  // B) Grammar inquiries
  if (q.includes('un y une') || q.includes('un o une') || q.includes('un vs une') || q.includes('artículo') || q.includes('artiklar') || q.includes('enhet')) {
    return isSwedish
      ? `${GRAMMAR_QA.un_une.sv}\n\nFråga mig gärna om du vill testa ett ord!`
      : `${GRAMMAR_QA.un_une.es}\n\n¡Dime un objeto y te digo si es masculino o femenino!`;
  }

  if (q.includes('le y la') || q.includes('le o la') || q.includes('le vs la') || q.includes("l'") || q.includes('les')) {
    return isSwedish ? GRAMMAR_QA.le_la.sv : GRAMMAR_QA.le_la.es;
  }

  if (q.includes('être') || q.includes('verbo ser') || q.includes('je suis') || q.includes('att vara')) {
    return isSwedish ? GRAMMAR_QA.etre.sv : GRAMMAR_QA.etre.es;
  }

  if (q.includes('avoir') || q.includes('verbo tener') || q.includes("j'ai") || q.includes('att ha')) {
    return isSwedish ? GRAMMAR_QA.avoir.sv : GRAMMAR_QA.avoir.es;
  }

  if (q.includes('negación') || q.includes('negar') || q.includes('ne pas') || q.includes('neka') || q.includes('inte')) {
    return isSwedish ? GRAMMAR_QA.negacion.sv : GRAMMAR_QA.negacion.es;
  }

  // C) Contextual follow-up to Léo's previous question
  if (previousAssistantMsg.includes("comment tu t'appelles") || previousAssistantMsg.includes("vad heter du")) {
    const extractedName = lastUserMsg.replace(/je m'appelle|me llamo|soy|jag heter|mi nombre es/gi, '').trim();
    const name = extractedName || 'ami';
    return isSwedish
      ? `Enchanté ${name} ! Quel beau prénom ! Et quel âge as-tu ? Tu as 12 ans ou 13 ans ?`
      : `¡Enchanté ${name} ! Qué bonito nombre. Quel âge as-tu ? ¿Tienes 12 o 13 años? 😊`;
  }

  if (previousAssistantMsg.includes("quel âge as-tu") || previousAssistantMsg.includes("hur gammal")) {
    return isSwedish
      ? `Super ! C'est l'âge idéal pour commencer le français en årskurs 6 ! Qu'est-ce que tu aimes faire après l'école ? Le foot, les jeux vidéo ou la musique ?`
      : `¡Super ! Es la edad perfecta en årskurs 6. Qu'est-ce que tu aimes faire après l'école ? ¿Te gusta el fútbol, los videojuegos o la música?`;
  }

  if (previousAssistantMsg.includes("ça va") || previousAssistantMsg.includes("hur är läget") || previousAssistantMsg.includes("comment vas-tu")) {
    if (q.includes('bien') || q.includes('super') || q.includes('bra') || q.includes('muy bien')) {
      return isSwedish
        ? `Magnifique ! Je suis ravi que ça aille bien ! Qu'est-ce qu'on apprend aujourd'hui : les animaux, la nourriture ou les chiffres ?`
        : `¡Magnifique ! Me alegra mucho saberlo. ¿Qué te gustaría aprender hoy: los animales, la comida o los números? 🌟`;
    } else if (q.includes('mal') || q.includes('dåligt') || q.includes('comme ci')) {
      return isSwedish
        ? `Oh, courage ! On va faire du français relax et amusant pour te redonner le sourire. Tu aimes les chats ou les chiens ?`
        : `¡Ánimo! Vamos a hacer un ratito de francés relajado y divertido para alegrarte el día. ¿Te gustan más los perros o los gatos? 🐾`;
    }
  }

  if (previousAssistantMsg.includes("katt") || previousAssistantMsg.includes("gato")) {
    if (q.includes('chat')) {
      return isSwedish
        ? `Bravo ! « Un chat » = en katt ! 🐱 Et comment dit-on « hund » ? Est-ce que tu as des animaux chez toi ?`
        : `¡Exacto! « Un chat » = un gato. 🐱 ¡Muy bien! ¿Y cómo se dice perro? ¿Tienes alguna mascota en casa?`;
    }
  }

  // D) Topic & Intent Matching

  // Greetings & "How are you"
  if (q.includes('ça va') || q.includes('comment vas') || q.includes('hur mår du') || q.includes('qué tal') || q.includes('cómo estás')) {
    return isSwedish
      ? "Ça va très bien, merci beaucoup ! Et toi, comment ça va aujourd'hui ? Tu peux dire : « Ça va super bien ! » ou « Comme ci, comme ça ! »"
      : "¡Ça va super bien, merci beaucoup ! Et toi, comment ça va aujourd'hui ? Puedes responderme: « Ça va super bien ! » o « Comme ci, comme ça ! » 😊";
  }

  if (q.includes('bonjour') || q.includes('salut') || q.includes('coucou') || q.includes('hola') || q.includes('hej')) {
    const greetingReplies = isSwedish
      ? [
          "Bonjour ! Comment tu t'appelles ? Tu peux me dire : « Je m'appelle... » !",
          "Salut ! C'est un plaisir de te retrouver. Prêt pour un peu de français ?",
          "Bonjour ! Comment vas-tu aujourd'hui ? Ça va bien ?",
        ]
      : [
          "¡Bonjour ! ¿Cómo te llamas? Puedes decirme: « Je m'appelle... » con tu nombre.",
          "¡Salut ! Qué alegría verte. ¿Listo para practicar un poco de francés?",
          "¡Bonjour ! Comment vas-tu aujourd'hui ? ¿Qué tal tu día hoy?",
        ];
    return greetingReplies[conversationTurn % greetingReplies.length];
  }

  // Self-introduction & Age
  if (q.includes("je m'appelle") || q.includes('je mappelle') || q.includes('me llamo') || q.includes('jag heter')) {
    const namePart = lastUserMsg.replace(/je m'appelle|je mappelle|me llamo|jag heter/gi, '').trim();
    return isSwedish
      ? `Enchanté ${namePart} ! Quel âge as-tu ? Tu peux me dire : « J'ai 12 ans » ou « J'ai 13 ans » !`
      : `¡Enchanté ${namePart} ! Quel âge as-tu ? Puedes decirme tu edad con el verbo avoir: « J'ai 13 ans ! »`;
  }

  if (q.includes('ans') || q.includes('treize') || q.includes('douze') || q.includes('quatorze') || q.includes('13') || q.includes('12')) {
    return isSwedish
      ? "C'est un super âge ! En France, à 13 ans on est en classe de 5ème au collège ! Tu as des matières préférées à l'école ?"
      : "¡Es una edad magnífica! En Francia con 13 años van al 'collège'. ¿Cuáles son tus asignaturas favoritas en la escuela?";
  }

  // Polite expressions
  if (q.includes('merci') || q.includes('gracias') || q.includes('tack')) {
    return isSwedish
      ? "De rien ! Je suis là pour t'aider. Tu veux qu'on fasse un petit quiz de vocabulaire ?"
      : "¡De rien ! No hay de qué. ¿Te apetece que hagamos un mini-quiz de vocabulario francés?";
  }

  if (q.includes('au revoir') || q.includes('adiós') || q.includes('hejdå') || q.includes('à bientôt') || q.includes('bonne nuit')) {
    return isSwedish
      ? "Au revoir et à bientôt ! Bravo pour tes efforts aujourd'hui ! Bonne journée ! ✨"
      : "¡Au revoir et à bientôt ! Has practicado de maravilla hoy. ¡Pasa un gran día! ✨";
  }

  // Questions to Léo
  if (q.includes('qui es-tu') || q.includes('quién eres') || q.includes('vem är du') || q.includes('tu te llamas')) {
    return isSwedish
      ? "Je m'appelle Léo ! Je suis ton tuteur de français pour årskurs 6. J'habite à Lyon et j'adore voyager et écouter de la musique !"
      : "¡Je m'appelle Léo ! Soy tu tutor pedagógico de francés para årskurs 6. Vivo en Lyon (Francia) y me encanta el fútbol, la música y ayudarte a dominar el idioma. 😊";
  }

  if (q.includes('d\'où viens-tu') || q.includes('dónde eres') || q.includes('dónde vives') || q.includes('var bor du')) {
    return isSwedish
      ? "J'habite en France, dans la ville de Lyon ! C'est la capitale de la gastronomie française. Et toi, tu habites où ?"
      : "Vivo en Francia, en la hermosa ciudad de Lyon. ¡Es famosa por su comida y sus luces! ¿Y tú, dónde vives?";
  }

  // Sports & Hobbies
  if (q.includes('foot') || q.includes('sport') || q.includes('basket') || q.includes('tennis') || q.includes('natation')) {
    return isSwedish
      ? "Le sport, c'est génial ! En français, on dit : « Je joue au football ! » ou « Je fais du sport ! ». Tu as une équipe préférée ?"
      : "¡El deporte es fantástico! En francés decimos: « Je joue au football ! » o « Je fais du sport ! ». ¿Cuál es tu equipo o deporte preferido?";
  }

  if (q.includes('musique') || q.includes('música') || q.includes('musik') || q.includes('guitare') || q.includes('piano')) {
    return isSwedish
      ? "Super ! En français on dit : « J'écoute de la musique » ou « Je joue de la guitare » ! Quel est ton artiste préféré ?"
      : "¡Qué bien! En francés se dice: « J'écoute de la musique » o « Je joue du piano ». ¿Qué tipo de música te gusta más?";
  }

  if (q.includes('jeux') || q.includes('videojuegos') || q.includes('spel') || q.includes('gaming')) {
    return isSwedish
      ? "Moi aussi j'aime bien les jeux ! Répète avec moi : « J'aime les jeux vidéo ! » ! Tu joues souvent ?"
      : "¡A mí también me encantan! Puedes decir en francés: « J'adore les jeux vidéo ! ». ¿A qué juegas habitualmente?";
  }

  // Animals & Pets
  if (q.includes('chien') || q.includes('chat') || q.includes('perro') || q.includes('gato') || q.includes('hund') || q.includes('katt') || q.includes('animal')) {
    return isSwedish
      ? "Les animaux ! « Un chien » (hund), « un chat » (katt), « un lapin » (kanin), « un oiseau » (fågel). Tu as un animal de compagnie chez toi ?"
      : "¡Los animales son adorables! Recuerda: « un chien » (perro), « un chat » (gato), « un lapin » (conejo), « un poisson » (pez). ¿Tienes alguna mascota en casa?";
  }

  // Food, Café & Boulangerie
  if (q.includes('croissant') || q.includes('crêpe') || q.includes('pizza') || q.includes('pain') || q.includes('chocolat') || q.includes('comida') || q.includes('mat')) {
    return isSwedish
      ? "Miam ! En France, dans une boulangerie on commande en disant : « Bonjour, un croissant s'il vous plaît ! » ! Tu aimes plutôt le sucré ou le salé ?"
      : "¡Miam, qué rico! Cuando vas a una panadería en Francia dices: « Bonjour, je voudrais un croissant s'il vous plaît ! ». ¿Te gusta más el dulce o el salado? 🥐";
  }

  // Numbers & Counting
  if (q.includes('número') || q.includes('nombre') || q.includes('chiffre') || q.includes('räkna') || q.includes('contar')) {
    return isSwedish
      ? "Comptons ensemble de 1 à 10 : un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix ! Quel est ton chiffre porte-bonheur ?"
      : "¡Vamos a contar juntos del 1 al 10 en francés!: un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix ! ¿Cuál es tu número de la suerte?";
  }

  // Colors
  if (q.includes('couleur') || q.includes('color') || q.includes('färg') || q.includes('bleu') || q.includes('rouge')) {
    return isSwedish
      ? "Les couleurs en français : bleu (blå), rouge (röd), vert (grön), jaune (gul), noir (svart), blanc (vit) ! Quelle est ta couleur préférée ?"
      : "Los colores en francés: bleu (azul), rouge (rojo), vert (verde), jaune (amarillo), noir (negro), blanc (blanco). Quelle est ta couleur préférée?";
  }

  // School & Class
  if (q.includes('école') || q.includes('collège') || q.includes('skola') || q.includes('escuela') || q.includes('colegio') || q.includes('prof')) {
    return isSwedish
      ? "À l'école en France, les élèves étudient les maths, le français, l'histoire et les langues comme l'anglais et l'espagnol ! Quelle est ta matière préférée ?"
      : "En el colegio en Francia, los alumnos estudian matemáticas (les maths), francés, historia e idiomas. ¿Cuál es la clase que más te gusta?";
  }

  // Riddles, Games & Quizzes
  if (q.includes('quiz') || q.includes('jeu') || q.includes('juego') || q.includes('spel') || q.includes('pregunta') || q.includes('fråga') || q.includes('adivinanza')) {
    const quizzes = isSwedish
      ? [
          "Voilà une énigme : Je suis un animal, je dis « miaou » et j'aime le lait. Qui suis-je en français ?",
          "Quiz rapide : comment dit-on « röd » en français ? 1. Vert  2. Rouge  3. Bleu ?",
          "Question facile : Quel mot utilise-t-on pour dire merci ? S'il vous plaît, Pardon ou Merci ?",
        ]
      : [
          "Aquí tienes una adivinanza: Soy un animal, digo « miaou » y me encanta la leche. Qui suis-je en français?",
          "Mini-quiz rápido: ¿Cómo se dice « verde » en francés? 1. Vert  2. Rouge  3. Bleu?",
          "Pregunta fácil: ¿Qué palabra usamos para decir de nada en francés? ¿Merci, De rien, o Pardon?",
        ];
    return quizzes[conversationTurn % quizzes.length];
  }

  // Affirmations & Negations
  if (q === 'oui' || q === 'sí' || q === 'si' || q === 'ja') {
    return isSwedish
      ? "Super ! Continuons ! Raconte-moi : qu'est-ce que tu veux apprendre de nouveau aujourd'hui ?"
      : "¡Génial ! Cuéntame: ¿qué tema o expresión nueva te gustaría que veamos ahora? 😊";
  }

  if (q === 'non' || q === 'no' || q === 'nej') {
    return isSwedish
      ? "D'accord, pas de problème ! On peut changer de sujet. Pose-moi une question sur la France ou sur la langue française !"
      : "¡Entendido, sin problema! Podemos cambiar de tema. Hazme tú una pregunta sobre Francia o sobre el idioma. 🗼";
  }

  // Dynamic, pedagogical rotating responses (never a single repetitive loop!)
  const dynamicFallbacks = isSwedish
    ? [
        "C'est une très bonne tentative ! En français, on pourrait aussi dire : « C'est super intéressant ! ». Tu veux qu'on s'entraîne sur ce sujet ?",
        "Bravo pour ton enthousiasme ! Raconte-moi un peu plus : tu préfères parler de tes loisirs ou de ton école ?",
        "Très bien ! Tu t'exprimes avec de plus en plus de confiance. Essaie de me poser une question en français !",
        "C'est noté ! On progresse pas à pas. Comment dit-on « tack » en français ? Tu t'en souviens ?",
        "Super travail ! Dis-moi : quelle est ta nourriture préférée en français ? La pizza, les crêpes ou les croissants ?",
      ]
    : [
        "¡Muy buena frase! En francés también podríamos decir: « C'est super intéressant ! ». ¿Quieres que practiquemos más sobre este tema?",
        "¡Bravo por tu entusiasmo! Cuéntame un poco más: ¿prefieres hablar sobre tus aficiones, tu mascota o la comida?",
        "¡Excelente! Te vas expresando cada vez con más soltura. ¡Intenta hacerme una pregunta en francés!",
        "¡Muy bien! Vamos avanzando paso a paso con el programa de årskurs 6. ¿Te acuerdas de cómo se dice « por favor » en francés?",
        "¡Fantástico trabajo! Dime: ¿cuál es tu comida favorita? ¿La pizza, les crêpes o les croissants? 🥐",
      ];

  return dynamicFallbacks[conversationTurn % dynamicFallbacks.length];
}
