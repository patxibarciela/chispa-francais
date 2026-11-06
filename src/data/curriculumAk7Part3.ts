import { Unit } from '../types';

export const CURRICULUM_AK7_PART3_UNITS: Unit[] = [
  {
    id: 'ak7-unit-6',
    number: 6,
    grade: 'ak7',
    title: 'Au Café et au Restaurant : Commander et Payer',
    frenchTitle: 'Au Café et au Restaurant',
    description: 'Los artículos partitivos (du, de la, de l\', des), fórmulas de cortesía avanzadas (Je voudrais..., Pourriez-vous...) y pedir la cuenta.',
    iconName: 'Coffee',
    color: 'from-amber-600 to-rose-600',
    grammarTip: {
      title: 'Los Artículos Partitivos (Du, De la, De l\', Des)',
      explanationEs: 'Para hablar de cantidades indeterminadas de comida o bebida usamos los partitivos: du pain (masc.), de la salade (fem.), de l\'eau (+vocal), des frites (plural). ¡Regla de oro!: En una frase negativa se transforman siempre en "de" o "d\'": « Je ne mange pas DE viande », « Je ne bois pas D\'eau ».',
      explanationSv: 'Partitiva artiklar uttrycker obestämd mängd av mat eller dryck: du pain, de la salade, de l\'eau, des frites. I nekande mening blir de alltid "de" eller "d\'": « Je ne mange pas DE viande » (Jag äter inte kött).',
      examples: [
        {
          fr: 'Je voudrais de l\'eau minérale et du pain, s\'il vous plaît.',
          es: 'Quisiera agua mineral y pan, por favor.',
          sv: 'Jag skulle vilja ha mineralvatten och bröd, tack.'
        },
        {
          fr: 'Tu manges de la salade avec ton steak ?',
          es: '¿Comes ensalada con tu filete?',
          sv: 'Äter du sallad till din biff?'
        },
        {
          fr: 'L\'addition, s\'il vous plaît !',
          es: '¡La cuenta, por favor!',
          sv: 'Notan, tack!'
        }
      ]
    },
    lessons: [
      {
        id: 'ak7-u6-l1',
        unitId: 'ak7-unit-6',
        title: 'Paso 1: Los Artículos Partitivos en la Mesa',
        frenchTitle: 'Les Articles Partitifs',
        description: 'Du pain, de la confiture, de l\'eau, des croissants.',
        xpReward: 15,
        culturalNote: {
          title: 'El pan y la baguette en Francia',
          textEs: 'En Francia, el pan (la baguette) acompaña casi todas las comidas y se coloca directamente sobre la mesa, no en un plato individual.',
          textSv: 'I Frankrike äts bröd (baguette) till nästan alla måltider och läggs ofta direkt på bordet.'
        },
        exercises: [
          {
            id: 'ak7-u6-l1-e1',
            type: 'choice',
            prompt: '¿Qué artículo partitivo corresponde a un sustantivo masculino singular como "pain" (pan)?',
            promptFr: 'Du pain',
            audioFr: 'Du pain',
            options: ['du', 'de la', 'de l\'', 'des'],
            answer: 'du',
            hintEs: 'De + le se contrae en "du".',
            hintSv: 'De + le blir "du".',
            explanationEs: '¡Correcto! « Du pain » (algo de pan).',
            explanationSv: 'Rätt! « Du pain ».'
          },
          {
            id: 'ak7-u6-l1-e2',
            type: 'choice',
            prompt: '¿Cuál es el partitivo para "eau" (agua, empieza por vocal)?',
            promptFr: 'De l\'eau',
            audioFr: 'De l\'eau',
            options: ['de l\'eau', 'du eau', 'de la eau', 'des eau'],
            answer: 'de l\'eau',
            hintEs: 'Ante vocal se usa "de l\'".',
            hintSv: 'Före vokal används "de l\'".',
            explanationEs: '¡Muy bien! « De l\'eau » con apóstrofe.',
            explanationSv: 'Mycket bra! « De l\'eau ».'
          },
          {
            id: 'ak7-u6-l1-e3',
            type: 'translate',
            prompt: 'Traduce al francés: "Tomo queso y ensalada."',
            promptFr: 'Je prends du fromage et de la salade.',
            audioFr: 'Je prends du fromage et de la salade.',
            answer: ['Je prends du fromage et de la salade', 'Je prends du fromage et de la salade.'],
            hintEs: 'Fromage es masculino (du); salade es femenina (de la).',
            hintSv: 'Je prends du fromage et de la salade.',
            explanationEs: '¡Excelente! "Je prends du fromage et de la salade."',
            explanationSv: 'Utmärkt! "Je prends du fromage et de la salade."'
          },
          {
            id: 'ak7-u6-l1-e4',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Au petit-déjeuner je bois du jus d\'orange',
            audioFr: 'Au petit-déjeuner je bois du jus d\'orange',
            options: ['d\'orange', 'bois', 'je', 'jus', 'petit-déjeuner', 'Au', 'du'],
            answer: ['Au', 'petit-déjeuner', 'je', 'bois', 'du', 'jus', 'd\'orange'],
            hintEs: 'Empieza con "Au petit-déjeuner...".',
            hintSv: 'Börja med "Au petit-déjeuner...".',
            explanationEs: '¡Bravo! « Au petit-déjeuner je bois du jus d\'orange » (En el desayuno bebo zumo de naranja).',
            explanationSv: 'Bravo! « Au petit-déjeuner je bois du jus d\'orange ».'
          },
          {
            id: 'ak7-u6-l1-e5',
            type: 'fill-blank',
            prompt: 'Completa: « Tu veux _____ confiture sur tes tartines ? »',
            promptFr: 'Tu veux de la confiture sur tes tartines ?',
            audioFr: 'Tu veux de la confiture sur tes tartines ?',
            options: ['de la', 'du', 'de l\'', 'des'],
            answer: 'de la',
            hintEs: 'Confiture es sustantivo femenino singular.',
            hintSv: 'Confiture är feminint singular.',
            explanationEs: '¡Correcto! « de la confiture » (mermelada).',
            explanationSv: 'Rätt! « de la confiture » = sylt.'
          },
          {
            id: 'ak7-u6-l1-e6',
            type: 'choice',
            prompt: '¿Cómo cambia el partitivo en negativo: « Je ne mange pas _____ viande » ?',
            promptFr: 'Je ne mange pas de viande.',
            audioFr: 'Je ne mange pas de viande.',
            options: ['de', 'de la', 'du', 'des'],
            answer: 'de',
            hintEs: 'Regla de oro: en frases negativas el partitivo se convierte siempre en "de".',
            hintSv: 'I nekande mening blir partitiv artikel alltid "de".',
            explanationEs: '¡Exacto! Regla clave: « pas de viande ».',
            explanationSv: 'Exakt! « pas de viande ».'
          },
          {
            id: 'ak7-u6-l1-e7',
            type: 'listen',
            prompt: 'Escucha qué pide el cliente para desayunar:',
            promptFr: 'Pour moi, un café au lait et des croissants s\'il vous plaît.',
            audioFr: 'Pour moi, un café au lait et des croissants s\'il vous plaît.',
            options: ['Un café con leche y cruasanes', 'Té con tostadas', 'Un zumo y una tarta', 'Agua mineral y fruta'],
            answer: 'Un café con leche y cruasanes',
            hintEs: 'Café au lait = café con leche; croissants = cruasanes.',
            hintSv: 'Kaffe med mjölk och croissanter.',
            explanationEs: '¡Genial! Café con leche y cruasanes.',
            explanationSv: 'Strålande! Café au lait och croissanter.'
          },
          {
            id: 'ak7-u6-l1-e8',
            type: 'scramble',
            prompt: 'Ordena la frase negativa:',
            promptFr: 'Mon ami ne boit pas de café',
            audioFr: 'Mon ami ne boit pas de café',
            options: ['pas', 'ne', 'boit', 'café', 'Mon', 'ami', 'de'],
            answer: ['Mon', 'ami', 'ne', 'boit', 'pas', 'de', 'café'],
            hintEs: 'Sujeto: "Mon ami".',
            hintSv: 'Subjekt: "Mon ami".',
            explanationEs: '¡Bravo! « Mon ami ne boit pas de café » (Mi amigo no bebe café).',
            explanationSv: 'Bravo! « Mon ami ne boit pas de café ».'
          },
          {
            id: 'ak7-u6-l1-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "Comemos patatas fritas."',
            promptFr: 'Nous mangeons des frites.',
            audioFr: 'Nous mangeons des frites.',
            answer: ['Nous mangeons des frites', 'Nous mangeons des frites.'],
            hintEs: 'Frites es plural -> des frites.',
            hintSv: 'Frites är plural -> des frites.',
            explanationEs: '¡Muy bien! "Nous mangeons des frites."',
            explanationSv: 'Mycket bra! "Nous mangeons des frites."'
          },
          {
            id: 'ak7-u6-l1-e10',
            type: 'choice',
            prompt: '¿Qué diferencia hay entre « J\'aime le chocolat » y « Je mange du chocolat » ?',
            promptFr: 'Le chocolat vs Du chocolat',
            audioFr: 'Le chocolat vs Du chocolat',
            options: ['"Le" expresa el gusto general; "Du" expresa una cantidad específica que consumes', '"Le" es femenino y "Du" es masculino', 'No hay ninguna diferencia', '"Du" solo se usa en el desayuno'],
            answer: '"Le" expresa el gusto general; "Du" expresa una cantidad específica que consumes',
            hintEs: 'Con verbos de gusto (aimer/adorer) se usa artículo definido (le/la/les).',
            hintSv: 'Med aimer används bestämd artikel (le), med manger partitiv artikel (du).',
            explanationEs: '¡Excelente! Gusto general = le chocolat; comida en cantidad indeterminada = du chocolat.',
            explanationSv: 'Utmärkt! Aimer + le, men manger + du.'
          },
          {
            id: 'ak7-u6-l1-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Elle ajoute _____ sucre dans son thé. »',
            promptFr: 'Elle ajoute du sucre dans son thé.',
            audioFr: 'Elle ajoute du sucre dans son thé.',
            options: ['du', 'de la', 'de l\'', 'des'],
            answer: 'du',
            hintEs: 'Sucre es masculino singular.',
            hintSv: 'Sucre är maskulint singular.',
            explanationEs: '¡Correcto! « du sucre » (azúcar).',
            explanationSv: 'Rätt! « du sucre » = socker.'
          },
          {
            id: 'ak7-u6-l1-e12',
            type: 'choice',
            prompt: '¿Cómo se dice "mantequilla" en francés?',
            promptFr: 'Le beurre',
            audioFr: 'Le beurre',
            options: ['Le beurre', 'Le lait', 'Le sel', 'Le miel'],
            answer: 'Le beurre',
            hintEs: 'Du beurre = algo de mantequilla.',
            hintSv: 'Smör på franska.',
            explanationEs: '¡Bravo! « Le beurre » es la mantequilla.',
            explanationSv: 'Bravo! « Le beurre » = smöret.'
          }
        ]
      },
      {
        id: 'ak7-u6-l2',
        unitId: 'ak7-unit-6',
        title: 'Paso 2: Pedir en un Café o Restaurante con Cortesía',
        frenchTitle: 'Commander Poliment',
        description: 'Je voudrais..., S\'il vous plaît, Pourriez-vous..., Comme plat du jour.',
        xpReward: 15,
        culturalNote: {
          title: 'El "Plat du jour" francés',
          textEs: 'En todos los bistrós franceses hay un "plat du jour" (plato del día) elaborado con ingredientes frescos del mercado a un precio más económico.',
          textSv: 'På franska bistroer finns alltid "le plat du jour" (dagens rätt), lagad på färska råvaror till förmånligt pris.'
        },
        exercises: [
          {
            id: 'ak7-u6-l2-e1',
            type: 'choice',
            prompt: '¿Cuál es la fórmula más educada para pedir en un restaurante en lugar de "Je veux"?',
            promptFr: 'Je voudrais...',
            audioFr: 'Je voudrais...',
            options: ['Je voudrais... (Quisiera / Me gustaría)', 'Je veux ! (¡Quiero!)', 'Donne-moi ça !', 'C\'est pour moi !'],
            answer: 'Je voudrais... (Quisiera / Me gustaría)',
            hintEs: 'El condicional de cortesía de vouloir.',
            hintSv: 'Det artiga sättet: Je voudrais (jag skulle vilja ha).',
            explanationEs: '¡Correcto! « Je voudrais » es la expresión cortés estándar.',
            explanationSv: 'Rätt! « Je voudrais » = Jag skulle vilja ha.'
          },
          {
            id: 'ak7-u6-l2-e2',
            type: 'translate',
            prompt: 'Traduce al francés: "Quisiera el menú del día, por favor."',
            promptFr: 'Je voudrais le menu du jour, s\'il vous plaît.',
            audioFr: 'Je voudrais le menu du jour, s\'il vous plaît.',
            answer: ['Je voudrais le menu du jour, s\'il vous plaît', 'Je voudrais le menu du jour s\'il vous plaît.', 'Je voudrais la formule du jour, s\'il vous plaît.'],
            hintEs: 'Menú del día = le menu du jour; por favor = s\'il vous plaît.',
            hintSv: 'Je voudrais le menu du jour, s\'il vous plaît.',
            explanationEs: '¡Muy bien! "Je voudrais le menu du jour, s\'il vous plaît."',
            explanationSv: 'Mycket bra! "Je voudrais le menu du jour, s\'il vous plaît."'
          },
          {
            id: 'ak7-u6-l2-e3',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Pour moi une crêpe au sucre s\'il vous plaît',
            audioFr: 'Pour moi une crêpe au sucre s\'il vous plaît',
            options: ['sucre', 's\'il', 'moi', 'Pour', 'crêpe', 'une', 'plaît', 'au', 'vous'],
            answer: ['Pour', 'moi', 'une', 'crêpe', 'au', 'sucre', 's\'il', 'vous', 'plaît'],
            hintEs: 'Empieza con "Pour moi...".',
            hintSv: 'Börja med "Pour moi...".',
            explanationEs: '¡Bravo! « Pour moi une crêpe au sucre s\'il vous plaît » (Para mí un crepe de azúcar, por favor).',
            explanationSv: 'Bravo! « Pour moi une crêpe au sucre s\'il vous plaît ».'
          },
          {
            id: 'ak7-u6-l2-e4',
            type: 'choice',
            prompt: '¿Cómo pregunta el camarero qué desea tomar el cliente?',
            promptFr: 'Vous avez choisi ? Qu\'est-ce que vous désirez ?',
            audioFr: 'Vous avez choisi ? Qu\'est-ce que vous désirez ?',
            options: ['Vous avez choisi ? Qu\'est-ce que vous désirez ?', 'Qui êtes-vous ?', 'Payez maintenant !', 'Partez vite !'],
            answer: 'Vous avez choisi ? Qu\'est-ce que vous désirez ?',
            hintEs: 'Preguntas habituales del camarero ("le serveur").',
            hintSv: 'Har ni valt? Vad önskas?',
            explanationEs: '¡Exacto! « Qu\'est-ce que vous désirez ? » es la fórmula profesional de hostelería.',
            explanationSv: 'Exakt! Servitörens artiga standardfras.'
          },
          {
            id: 'ak7-u6-l2-e5',
            type: 'fill-blank',
            prompt: 'Completa: « Comme boisson, je vais prendre une carafe d\'_____ . »',
            promptFr: 'Comme boisson, je vais prendre une carafe d\'eau.',
            audioFr: 'Comme boisson, je vais prendre une carafe d\'eau.',
            options: ['eau', 'pain', 'salade', 'viande'],
            answer: 'eau',
            hintEs: 'En Francia, "une carafe d\'eau" (jarra de agua del grifo) es gratuita en restaurantes.',
            hintSv: 'Une carafe d\'eau = en karaff vatten (kranvatten, gratis i Frankrike).',
            explanationEs: '¡Correcto! « une carafe d\'eau » es la jarra de agua.',
            explanationSv: 'Rätt! « une carafe d\'eau ».'
          },
          {
            id: 'ak7-u6-l2-e6',
            type: 'choice',
            prompt: '¿Cómo se dice "el postre" en francés?',
            promptFr: 'Le dessert',
            audioFr: 'Le dessert',
            options: ['Le dessert', 'L\'entrée', 'Le plat principal', 'L\'apéritif'],
            answer: 'Le dessert',
            hintEs: 'El plato dulce al final de la comida.',
            hintSv: 'Efterrätten på franska.',
            explanationEs: '¡Muy bien! « Le dessert » es el postre.',
            explanationSv: 'Mycket bra! « Le dessert » = efterrätten.'
          },
          {
            id: 'ak7-u6-l2-e7',
            type: 'listen',
            prompt: 'Escucha qué pide la clienta de primer plato:',
            promptFr: 'Comme entrée, je vais prendre une soupe à l\'oignon.',
            audioFr: 'Comme entrée, je vais prendre une soupe à l\'oignon.',
            options: ['Sopa de cebolla', 'Ensalada de tomate', 'Tarta de queso', 'Filete con patatas'],
            answer: 'Sopa de cebolla',
            hintEs: 'Soupe à l\'oignon = la famosa sopa de cebolla francesa.',
            hintSv: 'Fransk löksoppa.',
            explanationEs: '¡Exacto! La clásica sopa de cebolla gratinada.',
            explanationSv: 'Exakt! Fransk löksoppa.'
          },
          {
            id: 'ak7-u6-l2-e8',
            type: 'scramble',
            prompt: 'Ordena la pregunta:',
            promptFr: 'Quel est le plat du jour aujourd\'hui ?',
            audioFr: 'Quel est le plat du jour aujourd\'hui ?',
            options: ['jour', 'le', 'aujourd\'hui', 'plat', 'Quel', 'est', 'du', '?'],
            answer: ['Quel', 'est', 'le', 'plat', 'du', 'jour', 'aujourd\'hui', '?'],
            hintEs: 'Empieza con "Quel est...".',
            hintSv: 'Börja med "Quel est...".',
            explanationEs: '¡Bravo! « Quel est le plat du jour aujourd\'hui ? » (¿Cuál es el plato del día hoy?).',
            explanationSv: 'Bravo! « Quel est le plat du jour aujourd\'hui ? ».'
          },
          {
            id: 'ak7-u6-l2-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "Está muy rico / delicioso."',
            promptFr: 'C\'est très bon / C\'est délicieux.',
            audioFr: 'C\'est délicieux.',
            answer: ['C\'est délicieux', 'C\'est très bon', 'C\'est délicieux.', 'C\'est très bon.'],
            hintEs: 'Délicieux = delicioso; bon = bueno.',
            hintSv: 'Det är utsökt / mycket gott.',
            explanationEs: '¡Genial! "C\'est délicieux."',
            explanationSv: 'Strålande! "C\'est délicieux."'
          },
          {
            id: 'ak7-u6-l2-e10',
            type: 'choice',
            prompt: '¿Cómo se pide la cuenta al terminar de comer?',
            promptFr: 'L\'addition, s\'il vous plaît !',
            audioFr: 'L\'addition, s\'il vous plaît !',
            options: ['L\'addition, s\'il vous plaît !', 'Le prix, merci !', 'Combien d\'argent ?', 'Donnez-moi la note !'],
            answer: 'L\'addition, s\'il vous plaît !',
            hintEs: '« L\'addition » es la palabra exacta en francés para la cuenta de un restaurante.',
            hintSv: 'L\'addition = notan.',
            explanationEs: '¡Correcto! « L\'addition, s\'il vous plaît » es la fórmula universal.',
            explanationSv: 'Rätt! « L\'addition, s\'il vous plaît » = notan tack.'
          },
          {
            id: 'ak7-u6-l2-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Vous désirez un _____ après le repas ? » (postre)',
            promptFr: 'Vous désirez un dessert après le repas ?',
            audioFr: 'Vous désirez un dessert après le repas ?',
            options: ['dessert', 'pain', 'entrée', 'sel'],
            answer: 'dessert',
            hintEs: 'Postre = dessert.',
            hintSv: 'Efterrätt = dessert.',
            explanationEs: '¡Muy bien! « un dessert ».',
            explanationSv: 'Mycket bra! « un dessert ».'
          },
          {
            id: 'ak7-u6-l2-e12',
            type: 'choice',
            prompt: '¿Qué significa « Bon appétit ! » ?',
            promptFr: 'Bon appétit !',
            audioFr: 'Bon appétit !',
            options: ['¡Buen provecho! / ¡Que aproveche!', '¡Hasta luego!', '¡Muchas gracias!', '¡Bienvenido!'],
            answer: '¡Buen provecho! / ¡Que aproveche!',
            hintEs: 'Deseo antes de empezar a comer.',
            hintSv: 'Smaklig måltid!',
            explanationEs: '¡Bravo! « Bon appétit » se dice al servir los platos.',
            explanationSv: 'Bravo! « Bon appétit » = Smaklig måltid!'
          }
        ]
      },
      {
        id: 'ak7-u6-l3',
        unitId: 'ak7-unit-6',
        title: 'Paso 3: Precios, Pagar y Moneda',
        frenchTitle: 'Payer et Moyens de Paiement',
        description: 'Ça fait combien ?, Par carte ou en espèces, L\'addition, La monnaie.',
        xpReward: 20,
        exercises: [
          {
            id: 'ak7-u6-l3-e1',
            type: 'choice',
            prompt: '¿Cómo preguntas "¿Cuánto es en total?"?',
            promptFr: 'Ça fait combien en tout ?',
            audioFr: 'Ça fait combien en tout ?',
            options: ['Ça fait combien en tout ?', 'Qui paie ?', 'Où est l\'argent ?', 'C\'est cher ?'],
            answer: 'Ça fait combien en tout ?',
            hintEs: 'Ça fait combien = ¿cuánto suma / cuánto es?.',
            hintSv: 'Hur mycket blir det totalt?',
            explanationEs: '¡Correcto! « Ça fait combien ? » es la pregunta cotidiana para el total.',
            explanationSv: 'Rätt! « Ça fait combien ? » = Hur mycket blir det?'
          },
          {
            id: 'ak7-u6-l3-e2',
            type: 'translate',
            prompt: 'Traduce al francés: "¿Puedo pagar con tarjeta de crédito?"',
            promptFr: 'Est-ce que je peux payer par carte ?',
            audioFr: 'Est-ce que je peux payer par carte ?',
            answer: ['Est-ce que je peux payer par carte ?', 'Je peux payer par carte ?', 'Puis-je payer par carte ?'],
            hintEs: 'Pagar con tarjeta = payer par carte.',
            hintSv: 'Betala med kort = payer par carte.',
            explanationEs: '¡Muy bien! "Est-ce que je peux payer par carte ?".',
            explanationSv: 'Mycket bra! "Est-ce que je peux payer par carte ?".'
          },
          {
            id: 'ak7-u6-l3-e3',
            type: 'scramble',
            prompt: 'Ordena la respuesta del camarero:',
            promptFr: 'Ça fait dix-huit euros cinquante',
            audioFr: 'Ça fait dix-huit euros cinquante',
            options: ['euros', 'Ça', 'cinquante', 'dix-huit', 'fait'],
            answer: ['Ça', 'fait', 'dix-huit', 'euros', 'cinquante'],
            hintEs: 'Empieza con "Ça fait...".',
            hintSv: 'Börja med "Ça fait...".',
            explanationEs: '¡Bravo! « Ça fait dix-huit euros cinquante » (Son dieciocho euros con cincuenta).',
            explanationSv: 'Bravo! « Ça fait dix-huit euros cinquante ».'
          },
          {
            id: 'ak7-u6-l3-e4',
            type: 'choice',
            prompt: '¿Cómo se dice pagar "en efectivo / con dinero suelto"?',
            promptFr: 'En espèces (ou en liquide)',
            audioFr: 'En espèces',
            options: ['En espèces', 'Par carte', 'Par chèque', 'Gratuitement'],
            answer: 'En espèces',
            hintEs: 'Pagar con billetes y monedas se dice "en espèces" o "en liquide".',
            hintSv: 'Kontant på franska = en espèces.',
            explanationEs: '¡Exacto! « En espèces » significa en efectivo.',
            explanationSv: 'Exakt! « En espèces » = kontant.'
          },
          {
            id: 'ak7-u6-l3-e5',
            type: 'fill-blank',
            prompt: 'Completa: « Gardez la _____ , c\'est pour vous ! » (la vuelta/el cambio)',
            promptFr: 'Gardez la monnaie, c\'est pour vous !',
            audioFr: 'Gardez la monnaie, c\'est pour vous !',
            options: ['monnaie', 'carte', 'table', 'carte'],
            answer: 'monnaie',
            hintEs: 'La monnaie = las monedas de cambio / la vuelta.',
            hintSv: 'Växeln på franska.',
            explanationEs: '¡Correcto! « Gardez la monnaie » significa quédese con el cambio.',
            explanationSv: 'Rätt! « Gardez la monnaie » = behåll växeln (som dricks).'
          },
          {
            id: 'ak7-u6-l3-e6',
            type: 'choice',
            prompt: '¿Cómo se llama la propina en francés?',
            promptFr: 'Le pourboire',
            audioFr: 'Le pourboire',
            options: ['Le pourboire', 'L\'addition', 'Le reçu', 'Le ticket'],
            answer: 'Le pourboire',
            hintEs: 'Literalmente "para beber".',
            hintSv: 'Dricks på franska.',
            explanationEs: '¡Muy bien! « Le pourboire » es la propina.',
            explanationSv: 'Mycket bra! « Le pourboire » = dricksen.'
          },
          {
            id: 'ak7-u6-l3-e7',
            type: 'listen',
            prompt: 'Escucha cuánto cuesta la merienda en total:',
            promptFr: 'Un croissant et un chocolat chaud, ça fait cinq euros soixante-dix.',
            audioFr: 'Un croissant et un chocolat chaud, ça fait cinq euros soixante-dix.',
            options: ['5,70 €', '6,50 €', '4,80 €', '5,17 €'],
            answer: '5,70 €',
            hintEs: 'Cinq euros soixante-dix = 5,70 €.',
            hintSv: 'Fem euro och sjuttio cent.',
            explanationEs: '¡Exacto! 5 euros con 70 céntimos.',
            explanationSv: 'Exakt! 5,70 euro.'
          },
          {
            id: 'ak7-u6-l3-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Vous préférez payer ensemble ou séparément ?',
            audioFr: 'Vous préférez payer ensemble ou séparément ?',
            options: ['séparément', 'payer', 'ensemble', 'Vous', 'préférez', 'ou', '?'],
            answer: ['Vous', 'préférez', 'payer', 'ensemble', 'ou', 'séparément', '?'],
            hintEs: 'Empieza con "Vous préférez...".',
            hintSv: 'Börja med "Vous préférez...".',
            explanationEs: '¡Bravo! « Vous préférez payer ensemble ou séparément ? » (¿Preferís pagar juntos o por separado?).',
            explanationSv: 'Bravo! « Vous préférez payer ensemble ou séparément ? ».'
          },
          {
            id: 'ak7-u6-l3-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "Nosotros pagamos por separado."',
            promptFr: 'Nous payons séparément.',
            audioFr: 'Nous payons séparément.',
            answer: ['Nous payons séparément', 'Nous payons séparément.', 'On paie séparément.'],
            hintEs: 'Séparément = por separado.',
            hintSv: 'Var för sig = séparément.',
            explanationEs: '¡Genial! "Nous payons séparément."',
            explanationSv: 'Strålande! "Nous payons séparément."'
          },
          {
            id: 'ak7-u6-l3-e10',
            type: 'choice',
            prompt: '¿Qué significa que el servicio esté incluido en la cuenta (« service compris »)?',
            promptFr: 'Service compris',
            audioFr: 'Service compris',
            options: ['El 15% del servicio legal ya está incluido en los precios', 'Hay que dejar una propina obligatoria del 30%', 'La comida es gratis', 'Solo se paga el agua'],
            answer: 'El 15% del servicio legal ya está incluido en los precios',
            hintEs: 'En Francia por ley todos los precios de restaurantes ya incluyen el servicio.',
            hintSv: 'I Frankrike ingår alltid serviceavgiften i priset enligt lag.',
            explanationEs: '¡Correcto! En Francia la propina es voluntaria porque el servicio está incluido.',
            explanationSv: 'Rätt! Dricks är frivilligt då service redan ingår.'
          },
          {
            id: 'ak7-u6-l3-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Voici votre ticket de _____ . » (caja/recibo)',
            promptFr: 'Voici votre ticket de caisse.',
            audioFr: 'Voici votre ticket de caisse.',
            options: ['caisse', 'bus', 'train', 'métro'],
            answer: 'caisse',
            hintEs: 'Ticket de caisse = recibo o tíquet de compra.',
            hintSv: 'Kassakvitto = ticket de caisse.',
            explanationEs: '¡Muy bien! « le ticket de caisse » es el recibo.',
            explanationSv: 'Mycket bra! « le ticket de caisse » = kvittot.'
          },
          {
            id: 'ak7-u6-l3-e12',
            type: 'choice',
            prompt: '¿Cómo agradeces diciendo: "¡Muchas gracias, estaba todo perfecto!"?',
            promptFr: 'Merci beaucoup, tout était parfait !',
            audioFr: 'Merci beaucoup, tout était parfait !',
            options: ['Merci beaucoup, tout était parfait !', 'Ce n\'était pas bon.', 'Au revoir et dommage.', 'Trop cher.'],
            answer: 'Merci beaucoup, tout était parfait !',
            hintEs: 'Parfait = perfecto; tout était = todo estaba.',
            hintSv: 'Tack så mycket, allt var perfekt!',
            explanationEs: '¡Bravo! Despedida educada y satisfecha.',
            explanationSv: 'Bravo! « Merci beaucoup, tout était parfait ! ».'
          }
        ]
      },
      {
        id: 'ak7-u6-l4',
        unitId: 'ak7-unit-6',
        title: 'Paso 4: Cantidades y Envases',
        frenchTitle: 'Les Quantités et les Emballages',
        description: 'Un verre de, une bouteille de, un morceau de, un kilo de, beaucoup de, un peu de.',
        xpReward: 20,
        exercises: [
          {
            id: 'ak7-u6-l4-e1',
            type: 'choice',
            prompt: '¿Qué preposición sigue SIEMPRE a las expresiones de cantidad (un kilo..., une bouteille...)?',
            promptFr: 'La préposition DE',
            audioFr: 'La préposition de',
            options: ['DE (un kilo DE pommes, une bouteille D\'eau)', 'DU', 'DES', 'LE'],
            answer: 'DE (un kilo DE pommes, une bouteille D\'eau)',
            hintEs: 'Después de cantidades concretas se usa siempre "de" (o "d\'").',
            hintSv: 'Efter mängdord används alltid "de / d\'": un kilo de, une bouteille de.',
            explanationEs: '¡Exacto! Regla: Expresión de cantidad + DE + sustantivo.',
            explanationSv: 'Exakt! Mängdord följs alltid av "de / d\'".'
          },
          {
            id: 'ak7-u6-l4-e2',
            type: 'translate',
            prompt: 'Traduce al francés: "Un vaso de agua y un trozo de pan."',
            promptFr: 'Un verre d\'eau et un morceau de pain.',
            audioFr: 'Un verre d\'eau et un morceau de pain.',
            answer: ['Un verre d\'eau et un morceau de pain', 'Un verre d\'eau et un morceau de pain.'],
            hintEs: 'Vaso de agua = un verre d\'eau; trozo de pan = un morceau de pain.',
            hintSv: 'Ett glas vatten = un verre d\'eau; en brödbit = un morceau de pain.',
            explanationEs: '¡Muy bien! "Un verre d\'eau et un morceau de pain."',
            explanationSv: 'Mycket bra! "Un verre d\'eau et un morceau de pain."'
          },
          {
            id: 'ak7-u6-l4-e3',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Je voudrais une bouteille d\'eau minérale',
            audioFr: 'Je voudrais une bouteille d\'eau minérale',
            options: ['bouteille', 'voudrais', 'minérale', 'd\'eau', 'Je', 'une'],
            answer: ['Je', 'voudrais', 'une', 'bouteille', 'd\'eau', 'minérale'],
            hintEs: 'Empieza con "Je voudrais une bouteille...".',
            hintSv: 'Börja med "Je voudrais une bouteille...".',
            explanationEs: '¡Bravo! « Je voudrais une bouteille d\'eau minérale » (Quisiera una botella de agua mineral).',
            explanationSv: 'Bravo! « Je voudrais une bouteille d\'eau minérale ».'
          },
          {
            id: 'ak7-u6-l4-e4',
            type: 'choice',
            prompt: '¿Cómo se dice "un poco de azúcar"?',
            promptFr: 'Un peu de sucre',
            audioFr: 'Un peu de sucre',
            options: ['Un peu de sucre', 'Beaucoup de sucre', 'Trop de sucre', 'Pas de sucre'],
            answer: 'Un peu de sucre',
            hintEs: 'Un peu de = un poco de.',
            hintSv: 'Lite socker = un peu de sucre.',
            explanationEs: '¡Correcto! « Un peu de » expresa poca cantidad.',
            explanationSv: 'Rätt! « Un peu de » = lite.'
          },
          {
            id: 'ak7-u6-l4-e5',
            type: 'fill-blank',
            prompt: 'Completa: « J\'achète un kilo _____ fraises au marché. »',
            promptFr: 'J\'achète un kilo de fraises au marché.',
            audioFr: 'J\'achète un kilo de fraises au marché.',
            options: ['de', 'des', 'du', 'la'],
            answer: 'de',
            hintEs: 'Después de "un kilo" se usa siempre "de" (no des).',
            hintSv: 'Efter "un kilo" används alltid "de" (inte des).',
            explanationEs: '¡Exacto! « un kilo DE fraises ».',
            explanationSv: 'Exakt! « un kilo de fraises ».'
          },
          {
            id: 'ak7-u6-l4-e6',
            type: 'choice',
            prompt: '¿Cómo se dice "una taza de chocolate caliente"?',
            promptFr: 'Une tasse de chocolat chaud',
            audioFr: 'Une tasse de chocolat chaud',
            options: ['Une tasse de chocolat chaud', 'Un verre de jus', 'Une assiette de fromage', 'Un bol de soupe'],
            answer: 'Une tasse de chocolat chaud',
            hintEs: 'Une tasse = una taza.',
            hintSv: 'En kopp varm choklad.',
            explanationEs: '¡Muy bien! « Une tasse de chocolat chaud ».',
            explanationSv: 'Mycket bra! « Une tasse de chocolat chaud ».'
          },
          {
            id: 'ak7-u6-l4-e7',
            type: 'listen',
            prompt: 'Escucha y selecciona la cantidad pedida:',
            promptFr: 'Donnez-moi deux cents grammes de fromage, s\'il vous plaît.',
            audioFr: 'Donnez-moi deux cents grammes de fromage, s\'il vous plaît.',
            options: ['200 gramos de queso', '1 kilo de queso', '100 gramos de jamón', 'Un paquete de galletas'],
            answer: '200 gramos de queso',
            hintEs: 'Deux cents grammes = 200 gramos.',
            hintSv: 'Tvåhundra gram ost.',
            explanationEs: '¡Bravo! 200 gramos de queso.',
            explanationSv: 'Bravo! 200 gram ost.'
          },
          {
            id: 'ak7-u6-l4-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Il y a trop de sucre dans ce gâteau',
            audioFr: 'Il y a trop de sucre dans ce gâteau',
            options: ['sucre', 'ce', 'trop', 'gâteau', 'dans', 'y', 'de', 'Il', 'a'],
            answer: ['Il', 'y', 'a', 'trop', 'de', 'sucre', 'dans', 'ce', 'gâteau'],
            hintEs: 'Empieza con "Il y a trop de...".',
            hintSv: 'Börja med "Il y a trop de...".',
            explanationEs: '¡Genial! « Il y a trop de sucre dans ce gâteau » (Hay demasiado azúcar en este pastel).',
            explanationSv: 'Strålande! « Il y a trop de sucre dans ce gâteau ».'
          },
          {
            id: 'ak7-u6-l4-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "Bebo mucho té verde."',
            promptFr: 'Je bois beaucoup de thé vert.',
            audioFr: 'Je bois beaucoup de thé vert.',
            answer: ['Je bois beaucoup de thé vert', 'Je bois beaucoup de thé vert.'],
            hintEs: 'Beaucoup de + thé vert.',
            hintSv: 'Beaucoup de + thé vert.',
            explanationEs: '¡Excelente! "Je bois beaucoup de thé vert."',
            explanationSv: 'Utmärkt! "Je bois beaucoup de thé vert."'
          },
          {
            id: 'ak7-u6-l4-e10',
            type: 'choice',
            prompt: '¿Cómo se dice "una rebanada de pan / tostada"?',
            promptFr: 'Une tranche de pain (ou une tartine)',
            audioFr: 'Une tranche de pain',
            options: ['Une tranche de pain', 'Un paquet de chips', 'Une boîte de conserve', 'Un pot de yaourt'],
            answer: 'Une tranche de pain',
            hintEs: 'Une tranche = una rodaja / rebanada.',
            hintSv: 'En brödskiva = une tranche de pain.',
            explanationEs: '¡Correcto! « Une tranche de pain » es una rebanada.',
            explanationSv: 'Rätt! « Une tranche de pain » = en skiva bröd.'
          },
          {
            id: 'ak7-u6-l4-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Mets une cuillère _____ miel dans ton thé. »',
            promptFr: 'Mets une cuillère de miel dans ton thé.',
            audioFr: 'Mets une cuillère de miel dans ton thé.',
            options: ['de', 'du', 'des', 'la'],
            answer: 'de',
            hintEs: 'Cuillère de miel (cuchara de miel).',
            hintSv: 'En sked honung = une cuillère de miel.',
            explanationEs: '¡Muy bien! « une cuillère de miel ».',
            explanationSv: 'Mycket bra! « une cuillère de miel ».'
          },
          {
            id: 'ak7-u6-l4-e12',
            type: 'choice',
            prompt: '¿Qué significa « Assez de... » ?',
            promptFr: 'Assez de...',
            audioFr: 'Assez de...',
            options: ['Suficiente / bastante de algo', 'Demasiado', 'Nada de', 'Muy poco'],
            answer: 'Suficiente / bastante de algo',
            hintEs: 'J\'ai assez mangé = he comido suficiente.',
            hintSv: 'Tillräckligt med / nog.',
            explanationEs: '¡Bravo! « Assez de » significa suficiente.',
            explanationSv: 'Bravo! « Assez de » = tillräckligt med.'
          }
        ]
      },
      {
        id: 'ak7-u6-l5',
        unitId: 'ak7-unit-6',
        title: 'Paso 5: Diálogos Completos en el Restaurante',
        frenchTitle: 'Au Bistrot : Le Dialogue Intégral',
        description: 'Combinar saludar, elegir mesa, pedir platos, expresar satisfacción y despedirse.',
        xpReward: 25,
        exercises: [
          {
            id: 'ak7-u6-l5-e1',
            type: 'choice',
            prompt: '¿Cómo pides una mesa para dos personas al llegar?',
            promptFr: 'Une table pour deux personnes, s\'il vous plaît.',
            audioFr: 'Une table pour deux personnes, s\'il vous plaît.',
            options: ['Une table pour deux personnes, s\'il vous plaît.', 'Deux chaises ici !', 'Où nous mangeons ?', 'Donnez-moi la table.'],
            answer: 'Une table pour deux personnes, s\'il vous plaît.',
            hintEs: 'Fórmula clásica para solicitar mesa al maître.',
            hintSv: 'Ett bord för två personer, tack.',
            explanationEs: '¡Correcto! « Une table pour deux personnes » es la forma habitual.',
            explanationSv: 'Rätt! Ett bord för två, tack.'
          },
          {
            id: 'ak7-u6-l5-e2',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Est-ce que nous pouvons nous asseoir en terrasse ?',
            audioFr: 'Est-ce que nous pouvons nous asseoir en terrasse ?',
            options: ['terrasse', 'pouvons', 'asseoir', 'en', 'nous', 'Est-ce', 'que', '?'],
            answer: ['Est-ce', 'que', 'nous', 'pouvons', 'nous', 'asseoir', 'en', 'terrasse', '?'],
            hintEs: 'Empieza con "Est-ce que...".',
            hintSv: 'Börja med "Est-ce que...".',
            explanationEs: '¡Bravo! « Est-ce que nous pouvons nous asseoir en terrasse ? » (¿Podemos sentarnos en la terraza?).',
            explanationSv: 'Bravo! « Est-ce que nous pouvons nous asseoir en terrasse ? ».'
          },
          {
            id: 'ak7-u6-l5-e3',
            type: 'translate',
            prompt: 'Traduce al francés: "¿Qué nos recomienda hoy?"',
            promptFr: 'Qu\'est-ce que vous nous conseillez aujourd\'hui ?',
            audioFr: 'Qu\'est-ce que vous nous conseillez aujourd\'hui ?',
            answer: ['Qu\'est-ce que vous nous conseillez aujourd\'hui ?', 'Qu\'est-ce que vous nous conseillez aujourd\'hui', 'Que nous conseillez-vous aujourd\'hui ?'],
            hintEs: 'Conseiller = recomendar / aconsejar.',
            hintSv: 'Vad rekommenderar ni idag?',
            explanationEs: '¡Excelente! Pregunta muy habitual a los camareros franceses.',
            explanationSv: 'Utmärkt! « Qu\'est-ce que vous nous conseillez ? ».'
          },
          {
            id: 'ak7-u6-l5-e4',
            type: 'choice',
            prompt: '¿Cómo respondes cuando el camarero pregunta si todo ha ido bien (« Tout s\'est bien passé ? »)?',
            promptFr: 'Oui, c\'était délicieux, merci !',
            audioFr: 'Oui, c\'était délicieux, merci !',
            options: ['Oui, c\'était délicieux, merci !', 'Non, partez !', 'Je ne sais pas.', 'Où sont mes clés ?'],
            answer: 'Oui, c\'était délicieux, merci !',
            hintEs: 'C\'était délicieux = estaba delicioso.',
            hintSv: 'Ja, det var utsökt, tack!',
            explanationEs: '¡Muy bien! « Tout s\'est bien passé ? - Oui, c\'était délicieux ! ».',
            explanationSv: 'Mycket bra! « Oui, c\'était délicieux, merci ! ».'
          },
          {
            id: 'ak7-u6-l5-e5',
            type: 'fill-blank',
            prompt: 'Completa: « Pourriez-vous nous apporter l\'_____ s\'il vous plaît ? » (la cuenta)',
            promptFr: 'Pourriez-vous nous apporter l\'addition s\'il vous plaît ?',
            audioFr: 'Pourriez-vous nous apporter l\'addition s\'il vous plaît ?',
            options: ['addition', 'table', 'carte', 'salade'],
            answer: 'addition',
            hintEs: 'L\'addition = la cuenta.',
            hintSv: 'L\'addition = notan.',
            explanationEs: '¡Correcto! « apporter l\'addition » (traer la cuenta).',
            explanationSv: 'Rätt! « apporter l\'addition ».'
          },
          {
            id: 'ak7-u6-l5-e6',
            type: 'listen',
            prompt: 'Escucha el pedido completo y elige qué ha ordenado el cliente:',
            promptFr: 'Je vais prendre le poulet rôti avec des haricots verts et une bouteille d\'eau gazeuse.',
            audioFr: 'Je vais prendre le poulet rôti avec des haricots verts et une bouteille d\'eau gazeuse.',
            options: ['Pollo asado con judías verdes y agua con gas', 'Filete con patatas fritas y zumo', 'Ensalada mixta y sopa', 'Pescado blanco con arroz'],
            answer: 'Pollo asado con judías verdes y agua con gas',
            hintEs: 'Poulet rôti = pollo asado; haricots verts = judías verdes; eau gazeuse = agua con gas.',
            hintSv: 'Grillad kyckling med haricots verts och kolsyrat vatten.',
            explanationEs: '¡Bravo! Pollo asado con judías y agua con gas.',
            explanationSv: 'Bravo! Kyckling och gröna bönor.'
          },
          {
            id: 'ak7-u6-l5-e7',
            type: 'choice',
            prompt: '¿Cómo se dice "agua sin gas" en francés?',
            promptFr: 'De l\'eau plate',
            audioFr: 'De l\'eau plate',
            options: ['De l\'eau plate', 'De l\'eau gazeuse', 'De l\'eau chaude', 'De l\'eau sucrée'],
            answer: 'De l\'eau plate',
            hintEs: 'Eau plate = agua sin gas (Eau gazeuse = con gas).',
            hintSv: 'Stilla vatten = eau plate.',
            explanationEs: '¡Exacto! « Eau plate » es el agua sin burbujas.',
            explanationSv: 'Exakt! « Eau plate » = stilla vatten.'
          },
          {
            id: 'ak7-u6-l5-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Nous avons passé une excellente soirée',
            audioFr: 'Nous avons passé une excellente soirée',
            options: ['passé', 'soirée', 'avons', 'excellente', 'une', 'Nous'],
            answer: ['Nous', 'avons', 'passé', 'une', 'excellente', 'soirée'],
            hintEs: 'Empieza con "Nous avons passé...".',
            hintSv: 'Börja med "Nous avons passé...".',
            explanationEs: '¡Genial! « Nous avons passé une excellente soirée » (Hemos pasado una velada excelente).',
            explanationSv: 'Strålande! « Nous avons passé une excellente soirée ».'
          },
          {
            id: 'ak7-u6-l5-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "La comida está muy caliente."',
            promptFr: 'Le plat est très chaud.',
            audioFr: 'Le plat est très chaud.',
            answer: ['Le plat est très chaud', 'Le plat est très chaud.', 'Le repas est très chaud.'],
            hintEs: 'Plato = le plat; muy caliente = très chaud.',
            hintSv: 'Maten är mycket varm.',
            explanationEs: '¡Excelente! "Le plat est très chaud."',
            explanationSv: 'Utmärkt! "Le plat est très chaud."'
          },
          {
            id: 'ak7-u6-l5-e10',
            type: 'choice',
            prompt: '¿Cómo avisas amablemente de una intolerancia o alergia alimentaria?',
            promptFr: 'Je suis allergique au gluten / aux arachides.',
            audioFr: 'Je suis allergique au gluten.',
            options: ['Je suis allergique...', 'Je n\'aime rien.', 'La nourriture est mauvaise.', 'Pas de cuisine !'],
            answer: 'Je suis allergique...',
            hintEs: '« Je suis allergique à... » es la fórmula vital de seguridad.',
            hintSv: 'Jag är allergisk mot...',
            explanationEs: '¡Correcto! « Je suis allergique à... » previene incidentes al comer.',
            explanationSv: 'Rätt! « Je suis allergique à... ».'
          },
          {
            id: 'ak7-u6-l5-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Est-ce que le service est _____ dans le prix ? »',
            promptFr: 'Est-ce que le service est compris dans le prix ?',
            audioFr: 'Est-ce que le service est compris dans le prix ?',
            options: ['compris', 'cher', 'chaud', 'fermé'],
            answer: 'compris',
            hintEs: 'Compris = incluido.',
            hintSv: 'Ingår i priset = compris dans le prix.',
            explanationEs: '¡Muy bien! « service compris » (servicio incluido).',
            explanationSv: 'Mycket bra! « service compris ».'
          },
          {
            id: 'ak7-u6-l5-e12',
            type: 'choice',
            prompt: '¿Cómo concluyes al salir del bistró?',
            promptFr: 'Merci beaucoup et bonne journée, au revoir !',
            audioFr: 'Merci beaucoup et bonne journée, au revoir !',
            options: ['Merci beaucoup et bonne journée, au revoir !', 'Silence !', 'À table !', 'Donnez-moi le menu !'],
            answer: 'Merci beaucoup et bonne journée, au revoir !',
            hintEs: 'Fórmula cortés de agradecimiento y despedida.',
            hintSv: 'Artigt avsked från restaurangen.',
            explanationEs: '¡Bravo! Despedida educada al camarero.',
            explanationSv: 'Bravo! « Merci beaucoup et bonne journée ! ».'
          }
        ]
      }
    ],
    dailySessionTemplate: {
      id: 'ak7-session-u6',
      title: 'Gran Sesión Guiada: Almorzar en un Bistró Parisino',
      frenchTitle: 'Déjeuner dans un Bistrot : De la Commande à l\'Addition',
      situation: 'Entras con un amigo en un bistró tradicional en el barrio de Saint-Germain en París. Pides una mesa en la terraza, consultas el menú del día, pides tu comida usando los partitivos correctos y pagas la cuenta con tarjeta.',
      phase1Warmup: {
        introEs: 'Calentamiento (5 min): Practica 3 pedidos de cortesía usando "Je voudrais" y partitivos.',
        introSv: 'Uppvärmning (5 min): Öva på 3 artiga beställningar med "Je voudrais" och partitiva artiklar.',
        questions: [
          {
            id: 'ak7-w6-1',
            promptEs: '¿Cómo dices "Quisiera agua mineral y pan, por favor"?',
            promptSv: 'Hur säger du "Jag skulle vilja ha mineralvatten och bröd, tack"?',
            expectedFr: 'Je voudrais de l\'eau minérale et du pain, s\'il vous plaît.',
            hints: ['Je voudrais de l\'eau...', 'et du pain']
          },
          {
            id: 'ak7-w6-2',
            promptEs: '¿Cómo preguntas "¿Cuánto cuesta el plato del día?"?',
            promptSv: 'Hur frågar du "Vad kostar dagens rätt?"?',
            expectedFr: 'Combien coûte le plat du jour ?',
            hints: ['Combien coûte...', 'le plat du jour']
          },
          {
            id: 'ak7-w6-3',
            promptEs: '¿Cómo pides "La cuenta, por favor"?',
            promptSv: 'Hur ber du om "Notan, tack"?',
            expectedFr: 'L\'addition, s\'il vous plaît.',
            hints: ['L\'addition...', 's\'il vous plaît']
          }
        ]
      },
      phase2Input: {
        storyTitle: 'Déjeuner au Bistrot des Amis',
        storyFr: 'Serveur : Bonjour ! Une table pour deux ? En salle ou en terrasse ?\nPaul : En terrasse s\'il vous plaît, il fait un temps magnifique aujourd\'hui !\nServeur : Très bien, installez-vous ici. Voici la carte. Aujourd\'hui, le plat du jour est un délicieux saumon grillé avec du riz et des légumes de saison.\nPaul : Parfait ! Pour moi, je vais prendre le plat du jour avec une carafe d\'eau plate.\nClaire : Et pour moi, une quiche lorraine avec de la salade verte, et un jus de pomme.\nServeur : C\'est noté ! Je vous apporte du pain tout de suite. Bon appétit !',
        storyEs: 'Camarero: ¡Buenos días! ¿Una mesa para dos? ¿En el comedor o en la terraza?\nPaul: En la terraza por favor, ¡hace un tiempo magnífico hoy!\nCamarero: Muy bien, siéntense aquí. Aquí tienen la carta. Hoy, el plato del día es un delicioso salmón a la plancha con arroz y verduras de temporada.\nPaul: ¡Perfecto! Para mí, voy a tomar el plato del día con una jarra de agua del grifo.\nClaire: Y para mí, una quiche lorraine con ensalada verde, y un zumo de manzana.\nCamarero: ¡Tomado nota! Les traigo pan enseguida. ¡Buen provecho!',
        storySv: 'Servitör: God dag! Ett bord för två? Inne i matsalen eller på uteserveringen?\nPaul: På uteserveringen tack, det är ett fantastiskt väder idag!\nServitör: Mycket bra, slå er ner här. Här är menyn. Dagens rätt idag är grillad lax med ris och säsongens grönsaker.\nPaul: Perfekt! För min del tar jag dagens rätt med en karaff stilla vatten.\nClaire: Och för mig en quiche lorraine med grönsallad och äppeljuice.\nServitör: Då har jag noterat det! Jag kommer med bröd på en gång. Smaklig måltid!',
        keyExpressions: [
          {
            fr: 'Installez-vous ici',
            phonetic: 'en-stale-vu isi',
            es: 'Siéntense / Acomódense aquí',
            sv: 'Slå er ner här',
            clue: 'Fórmula de bienvenida del camarero para indicar la mesa.'
          },
          {
            fr: 'Une carafe d\'eau plate',
            phonetic: 'ün karaf do plat',
            es: 'Una jarra de agua del grifo (sin gas y gratuita)',
            sv: 'En karaff kranvatten (stilla vatten)',
            clue: 'Costumbre culinaria francesa esencial en cualquier restaurante.'
          },
          {
            fr: 'C\'est noté !',
            phonetic: 'se note',
            es: '¡Tomado nota! / ¡Anotado!',
            sv: 'Då har jag antecknat det!',
            clue: 'Confirmación alegre del camarero tras escuchar la comanda.'
          }
        ]
      },
      phase3Production: {
        contextEs: 'Juego de rol interactivo (12 min): El camarero del bistró se acerca a tu mesa. Pide un plato principal con su acompañamiento, una bebida y pregunta el precio o pide la cuenta.',
        contextSv: 'Interaktivt rollspel (12 min): Servitören kommer fram till ditt bord. Beställ en varmrätt, dryck och fråga om priset eller be om notan.',
        initialAIPrompt: 'Bonjour ! Vous désirez commander ? Que puis-je vous servir comme plat et comme boisson aujourd\'hui ?',
        initialAIPromptTranslation: '¡Buenos días! ¿Desean pedir? ¿Qué puedo servirles como plato y como bebida hoy?',
        mission: 'Pide educadamente usando "Je voudrais..." con un partitivo ("du saumon", "de la salade", "de l\'eau") y pide la cuenta al terminar.',
        constraintProgression: [
          'Usa "Je voudrais..." o "Pour moi..." para pedir tu plato.',
          'Incluye un artículo partitivo (du, de la, de l\', des).',
          'Pide la cuenta con "L\'addition, s\'il vous plaît !".'
        ]
      },
      phase4ExitTicket: {
        promptEs: 'Reto de salida (5 min): Escribe un breve pedido de restaurante de 2 frases usando "Je voudrais" con un partitivo y una fórmula de cortesía.',
        promptSv: 'Utgångsutmaning (5 min): Skriv en kort beställning på 2 meningar med "Je voudrais", en partitiv artikel och artighetsfras.',
        sampleFr: 'Je voudrais du poulet avec des légumes et de l\'eau, s\'il vous plaît. C\'est délicieux !'
      }
    }
  }
];
