import { Unit } from '../types';

export const CURRICULUM_AK7_PART2_UNITS: Unit[] = [
  {
    id: 'ak7-unit-5',
    number: 5,
    grade: 'ak7',
    title: 'La Météo, les Saisons et la Nature',
    frenchTitle: 'La Météo, les Saisons et la Nature',
    description: 'Expresiones del clima (il fait beau, il pleut, il neige, il y a du vent), las cuatro estaciones y la ropa según el tiempo.',
    iconName: 'CloudSun',
    color: 'from-sky-500 to-blue-600',
    grammarTip: {
      title: 'El Clima y las Preposiciones de las Estaciones',
      explanationEs: 'Para hablar del tiempo usamos "Il fait..." + adjetivo: il fait beau (hace buen tiempo), il fait chaud (hace calor), il fait froid (hace frío), il fait du vent (hace viento). También verbos meteorológicos: il pleut (llueve), il neige (nieva). Para las estaciones: en été (en verano), en automne (en otoño), en hiver (en invierno), pero ¡ojo!: AU printemps (en primavera).',
      explanationSv: 'För att tala om väder används "Il fait..." + adjektiv: il fait beau (det är fint väder), il fait froid (det är kallt), eller verben "il pleut" (det regnar) och "il neige" (det snöar). Årstiderna: en été, en automne, en hiver, men undantaget AU printemps!',
      examples: [
        {
          fr: 'En été, il fait très chaud dans le sud de la France.',
          es: 'En verano, hace mucho calor en el sur de Francia.',
          sv: 'På sommaren är det mycket varmt i södra Frankrike.'
        },
        {
          fr: 'Au printemps, les arbres fleurissent et il fait doux.',
          es: 'En primavera, los árboles florecen y hace un tiempo templado.',
          sv: 'På våren blommar träden och det är milt väder.'
        },
        {
          fr: 'Aujourd\'hui il pleut, prends ton parapluie !',
          es: 'Hoy llueve, ¡coge tu paraguas!',
          sv: 'Idag regnar det, ta ditt paraply!'
        }
      ]
    },
    lessons: [
      {
        id: 'ak7-u5-l1',
        unitId: 'ak7-unit-5',
        title: 'Paso 1: ¿Qué tiempo hace hoy? (Quel temps fait-il ?)',
        frenchTitle: 'Quel Temps Fait-il ?',
        description: 'Il fait beau, il fait froid, il pleut, il neige, il y a du soleil.',
        xpReward: 15,
        culturalNote: {
          title: 'El clima variado de Francia',
          textEs: 'Francia tiene climas muy distintos: oceánico lluvioso en Bretaña, mediterráneo soleado en la Costa Azul y alpino con mucha nieve en los Alpes y Pirineos.',
          textSv: 'Frankrike har mycket varierat klimat: milt och regnigt i Bretagne, soligt medelhavsklimat i söder och alpint med snö i bergen.'
        },
        exercises: [
          {
            id: 'ak7-u5-l1-e1',
            type: 'choice',
            prompt: '¿Cómo se pregunta "¿Qué tiempo hace hoy?" en francés?',
            promptFr: 'Quel temps fait-il aujourd\'hui ?',
            audioFr: 'Quel temps fait-il aujourd\'hui ?',
            options: ['Quel temps fait-il aujourd\'hui ?', 'Quelle heure est-il ?', 'Quel jour sommes-nous ?', 'Comment ça va ?'],
            answer: 'Quel temps fait-il aujourd\'hui ?',
            hintEs: 'Temps = tiempo meteorológico; fait-il = hace.',
            hintSv: 'Quel temps fait-il = Vad är det för väder?',
            explanationEs: '¡Correcto! « Quel temps fait-il ? » es la pregunta clásica del clima.',
            explanationSv: 'Rätt! « Quel temps fait-il ? » betyder vad är det för väder?'
          },
          {
            id: 'ak7-u5-l1-e2',
            type: 'choice',
            prompt: '¿Qué significa: « Il fait beau et il y a du soleil » ?',
            promptFr: 'Il fait beau et il y a du soleil.',
            audioFr: 'Il fait beau et il y a du soleil.',
            options: ['Hace buen tiempo y hace sol.', 'Está nublado y llueve.', 'Nieva mucho.', 'Hace frío polar.'],
            answer: 'Hace buen tiempo y hace sol.',
            hintEs: 'Beau = buen tiempo; soleil = sol.',
            hintSv: 'Beau = vackert väder; soleil = sol.',
            explanationEs: '¡Muy bien! « Il fait beau » indica buen tiempo.',
            explanationSv: 'Mycket bra! « Il fait beau » = det är fint väder.'
          },
          {
            id: 'ak7-u5-l1-e3',
            type: 'translate',
            prompt: 'Traduce al francés: "Hoy llueve y hace frío."',
            promptFr: 'Aujourd\'hui il pleut et il fait froid.',
            audioFr: 'Aujourd\'hui il pleut et il fait froid.',
            answer: ['Aujourd\'hui il pleut et il fait froid', 'Aujourd\'hui il pleut et il fait froid.', 'Aujourd\'hui, il pleut et il fait froid.'],
            hintEs: 'Llueve = il pleut; hace frío = il fait froid.',
            hintSv: 'Det regnar = il pleut; det är kallt = il fait froid.',
            explanationEs: '¡Excelente! "Aujourd\'hui il pleut et il fait froid."',
            explanationSv: 'Utmärkt! "Aujourd\'hui il pleut et il fait froid."'
          },
          {
            id: 'ak7-u5-l1-e4',
            type: 'scramble',
            prompt: 'Ordena la frase meteorológica:',
            promptFr: 'Il y a beaucoup de vent aujourd\'hui',
            audioFr: 'Il y a beaucoup de vent aujourd\'hui',
            options: ['vent', 'de', 'y', 'Il', 'beaucoup', 'a', 'aujourd\'hui'],
            answer: ['Il', 'y', 'a', 'beaucoup', 'de', 'vent', 'aujourd\'hui'],
            hintEs: 'Empieza con "Il y a beaucoup...".',
            hintSv: 'Börja med "Il y a beaucoup...".',
            explanationEs: '¡Bravo! « Il y a beaucoup de vent aujourd\'hui » (Hace mucho viento hoy).',
            explanationSv: 'Bravo! « Il y a beaucoup de vent aujourd\'hui » (Det blåser mycket idag).'
          },
          {
            id: 'ak7-u5-l1-e5',
            type: 'fill-blank',
            prompt: 'Completa: « En hiver en Suède, il _____ souvent. » (nieva)',
            promptFr: 'En hiver en Suède, il neige souvent.',
            audioFr: 'En hiver en Suède, il neige souvent.',
            options: ['neige', 'pleut', 'fait chaud', 'brille'],
            answer: 'neige',
            hintEs: 'Verbo neiger: il neige (nieva).',
            hintSv: 'Verbet neiger: il neige (det snöar).',
            explanationEs: '¡Correcto! « il neige » (nieva).',
            explanationSv: 'Rätt! « il neige » = det snöar.'
          },
          {
            id: 'ak7-u5-l1-e6',
            type: 'choice',
            prompt: '¿Cómo se dice "el cielo está nublado / gris"?',
            promptFr: 'Le ciel est nuageux',
            audioFr: 'Le ciel est nuageux',
            options: ['Le ciel est nuageux', 'Le ciel est bleu', 'Le ciel est chaud', 'Le ciel est vert'],
            answer: 'Le ciel est nuageux',
            hintEs: 'Nuage = nube; nuageux = nublado.',
            hintSv: 'Nuage = moln; nuageux = molnigt.',
            explanationEs: '¡Muy bien! « Le ciel est nuageux » (o « couvert »).',
            explanationSv: 'Mycket bra! « Le ciel est nuageux » = himlen är molnig.'
          },
          {
            id: 'ak7-u5-l1-e7',
            type: 'listen',
            prompt: 'Escucha el boletín meteorológico y selecciona qué tiempo hace:',
            promptFr: 'Attention, il y a un violent orage ce soir avec du tonnerre.',
            audioFr: 'Attention, il y a un violent orage ce soir avec du tonnerre.',
            options: ['Una tormenta fuerte con truenos', 'Un día soleado y despejado', 'Nieve suave', 'Niebla matutina'],
            answer: 'Una tormenta fuerte con truenos',
            hintEs: 'Orage = tormenta; tonnerre = truenos.',
            hintSv: 'Orage = åskväder / storm.',
            explanationEs: '¡Exacto! « un violent orage » es una tormenta.',
            explanationSv: 'Exakt! Ljudet varnar för åskoväder.'
          },
          {
            id: 'ak7-u5-l1-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'N\'oublie pas ton parapluie il pleut',
            audioFr: 'N\'oublie pas ton parapluie il pleut',
            options: ['pleut', 'ton', 'il', 'parapluie', 'N\'oublie', 'pas'],
            answer: ['N\'oublie', 'pas', 'ton', 'parapluie', 'il', 'pleut'],
            hintEs: 'Empieza con "N\'oublie pas...".',
            hintSv: 'Börja med "N\'oublie pas...".',
            explanationEs: '¡Bravo! « N\'oublie pas ton parapluie il pleut » (No olvides tu paraguas, llueve).',
            explanationSv: 'Bravo! « N\'oublie pas ton parapluie il pleut ».'
          },
          {
            id: 'ak7-u5-l1-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "Hace 25 grados."',
            promptFr: 'Il fait vingt-cinq degrés.',
            audioFr: 'Il fait vingt-cinq degrés.',
            answer: ['Il fait vingt-cinq degrés', 'Il fait vingt-cinq degrés.', 'Il fait 25 degrés.'],
            hintEs: 'Il fait + número + degrés.',
            hintSv: 'Il fait + tjugofem + degrés.',
            explanationEs: '¡Genial! "Il fait vingt-cinq degrés."',
            explanationSv: 'Strålande! "Il fait vingt-cinq degrés."'
          },
          {
            id: 'ak7-u5-l1-e10',
            type: 'choice',
            prompt: '¿Qué significa « Il y a du brouillard » ?',
            promptFr: 'Il y a du brouillard.',
            audioFr: 'Il y a du brouillard.',
            options: ['Hay niebla', 'Hay granizo', 'Hay un arcoíris', 'Hace mucho calor'],
            answer: 'Hay niebla',
            hintEs: 'Brouillard = niebla.',
            hintSv: 'Brouillard = dimma.',
            explanationEs: '¡Correcto! « Le brouillard » es la niebla.',
            explanationSv: 'Rätt! « Le brouillard » = dimman.'
          },
          {
            id: 'ak7-u5-l1-e11',
            type: 'fill-blank',
            prompt: 'Completa: « En été au bord de la mer, il _____ très chaud. »',
            promptFr: 'En été au bord de la mer, il fait très chaud.',
            audioFr: 'En été au bord de la mer, il fait très chaud.',
            options: ['fait', 'a', 'est', 'va'],
            answer: 'fait',
            hintEs: 'Con la temperatura se usa el verbo faire: il fait chaud.',
            hintSv: 'Med temperatur används verbet faire: il fait chaud.',
            explanationEs: '¡Perfecto! « il fait très chaud » (hace mucho calor).',
            explanationSv: 'Perfekt! « il fait très chaud ».'
          },
          {
            id: 'ak7-u5-l1-e12',
            type: 'choice',
            prompt: '¿Cómo se dice "el arcoíris" en francés?',
            promptFr: 'L\'arc-en-ciel',
            audioFr: 'L\'arc-en-ciel',
            options: ['L\'arc-en-ciel', 'L\'étoile filante', 'Le nuage blanc', 'La pluie d\'été'],
            answer: 'L\'arc-en-ciel',
            hintEs: 'Literalmente arco en el cielo.',
            hintSv: 'Regnbåge på franska.',
            explanationEs: '¡Bravo! « L\'arc-en-ciel » es el arcoíris.',
            explanationSv: 'Bravo! « L\'arc-en-ciel » = regnbågen.'
          }
        ]
      },
      {
        id: 'ak7-u5-l2',
        unitId: 'ak7-unit-5',
        title: 'Paso 2: Las Cuatro Estaciones y la Ropa',
        frenchTitle: 'Les Quatre Saisons et les Vêtements',
        description: 'Le printemps, l\'été, l\'automne, l\'hiver y prendas según el clima.',
        xpReward: 15,
        exercises: [
          {
            id: 'ak7-u5-l2-e1',
            type: 'choice',
            prompt: '¿Qué preposición se usa de forma irregular con la primavera?',
            promptFr: 'Au printemps',
            audioFr: 'Au printemps',
            options: ['Au (au printemps)', 'En (en printemps)', 'À la (à la printemps)', 'Dans (dans printemps)'],
            answer: 'Au (au printemps)',
            hintEs: 'Las demás estaciones usan "en" (en été, en automne, en hiver), pero primavera usa "au".',
            hintSv: 'Alla andra årstider tar "en", men våren tar "au printemps"!',
            explanationEs: '¡Exacto! Regla fundamental: « AU printemps » frente a « en été / automne / hiver ».',
            explanationSv: 'Exakt! « AU printemps », men « en été, en automne, en hiver ».'
          },
          {
            id: 'ak7-u5-l2-e2',
            type: 'translate',
            prompt: 'Traduce al francés: "En invierno llevo un abrigo caliente y guantes."',
            promptFr: 'En hiver je porte un manteau chaud et des gants.',
            audioFr: 'En hiver je porte un manteau chaud et des gants.',
            answer: ['En hiver je porte un manteau chaud et des gants', 'En hiver je porte un manteau chaud et des gants.', 'En hiver, je porte un manteau chaud et des gants.'],
            hintEs: 'Manteau chaud = abrigo caliente; gants = guantes.',
            hintSv: 'Manteau chaud = varm kappa/jacka; gants = vantar.',
            explanationEs: '¡Muy bien! "En hiver je porte un manteau chaud et des gants."',
            explanationSv: 'Mycket bra! "En hiver je porte un manteau chaud et des gants."'
          },
          {
            id: 'ak7-u5-l2-e3',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'En automne les feuilles des arbres tombent',
            audioFr: 'En automne les feuilles des arbres tombent',
            options: ['arbres', 'En', 'feuilles', 'tombent', 'les', 'des', 'automne'],
            answer: ['En', 'automne', 'les', 'feuilles', 'des', 'arbres', 'tombent'],
            hintEs: 'Empieza con "En automne...".',
            hintSv: 'Börja med "En automne...".',
            explanationEs: '¡Bravo! « En automne les feuilles des arbres tombent » (En otoño caen las hojas de los árboles).',
            explanationSv: 'Bravo! « En automne les feuilles des arbres tombent ».'
          },
          {
            id: 'ak7-u5-l2-e4',
            type: 'choice',
            prompt: '¿Cómo se dice "las gafas de sol" en francés?',
            promptFr: 'Les lunettes de soleil',
            audioFr: 'Les lunettes de soleil',
            options: ['Les lunettes de soleil', 'Le chapeau de paille', 'L\'écharpe en laine', 'Le maillot de bain'],
            answer: 'Les lunettes de soleil',
            hintEs: 'Lunettes = gafas; soleil = sol.',
            hintSv: 'Solglasögon på franska.',
            explanationEs: '¡Correcto! « Les lunettes de soleil ».',
            explanationSv: 'Rätt! « Les lunettes de soleil » = solglasögon.'
          },
          {
            id: 'ak7-u5-l2-e5',
            type: 'fill-blank',
            prompt: 'Completa: « _____ été, nous portons des t-shirts et des shorts. »',
            promptFr: 'En été, nous portons des t-shirts et des shorts.',
            audioFr: 'En été, nous portons des t-shirts et des shorts.',
            options: ['En', 'Au', 'À la', 'Dans'],
            answer: 'En',
            hintEs: 'Con été se usa "En".',
            hintSv: 'Med été används "En".',
            explanationEs: '¡Muy bien! « En été » (en verano).',
            explanationSv: 'Mycket bra! « En été » = på sommaren.'
          },
          {
            id: 'ak7-u5-l2-e6',
            type: 'choice',
            prompt: '¿Qué prenda de abrigo se pone alrededor del cuello?',
            promptFr: 'Une écharpe',
            audioFr: 'Une écharpe',
            options: ['Une écharpe', 'Une casquette', 'Des chaussettes', 'Une ceinture'],
            answer: 'Une écharpe',
            hintEs: 'Bufanda en francés.',
            hintSv: 'Halsduk på franska.',
            explanationEs: '¡Exacto! « Une écharpe » es una bufanda.',
            explanationSv: 'Exakt! « Une écharpe » = en halsduk.'
          },
          {
            id: 'ak7-u5-l2-e7',
            type: 'listen',
            prompt: 'Escucha y selecciona la estación favorita de la persona:',
            promptFr: 'Ma saison préférée est le printemps parce que la nature se réveille.',
            audioFr: 'Ma saison préférée est le printemps parce que la nature se réveille.',
            options: ['La primavera', 'El verano', 'El otoño', 'El invierno'],
            answer: 'La primavera',
            hintEs: 'Le printemps = la primavera.',
            hintSv: 'Le printemps = våren.',
            explanationEs: '¡Genial! La primavera es su estación preferida.',
            explanationSv: 'Strålande! Våren är favoriten.'
          },
          {
            id: 'ak7-u5-l2-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Quand il pleut je mets mes bottes',
            audioFr: 'Quand il pleut je mets mes bottes',
            options: ['je', 'bottes', 'pleut', 'il', 'mets', 'mes', 'Quand'],
            answer: ['Quand', 'il', 'pleut', 'je', 'mets', 'mes', 'bottes'],
            hintEs: 'Empieza con "Quand il pleut...".',
            hintSv: 'Börja med "Quand il pleut...".',
            explanationEs: '¡Bravo! « Quand il pleut je mets mes bottes » (Cuando llueve me pongo mis botas).',
            explanationSv: 'Bravo! « Quand il pleut je mets mes bottes ».'
          },
          {
            id: 'ak7-u5-l2-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "¿Qué llevas puesto cuando hace frío?"',
            promptFr: 'Qu\'est-ce que tu portes quand il fait froid ?',
            audioFr: 'Qu\'est-ce que tu portes quand il fait froid ?',
            answer: ['Qu\'est-ce que tu portes quand il fait froid ?', 'Qu\'est-ce que tu portes quand il fait froid'],
            hintEs: 'Portes = llevas puesto; quand il fait froid = cuando hace frío.',
            hintSv: 'Qu\'est-ce que tu portes quand il fait froid ?',
            explanationEs: '¡Excelente! "Qu\'est-ce que tu portes quand il fait froid ?".',
            explanationSv: 'Utmärkt! "Qu\'est-ce que tu portes quand il fait froid ?".'
          },
          {
            id: 'ak7-u5-l2-e10',
            type: 'choice',
            prompt: '¿Cómo se dice "el bañador / traje de baño"?',
            promptFr: 'Le maillot de bain',
            audioFr: 'Le maillot de bain',
            options: ['Le maillot de bain', 'Le pyjama', 'Le pantalon', 'Le pull en laine'],
            answer: 'Le maillot de bain',
            hintEs: 'Prenda para nadar.',
            hintSv: 'Baddräkt / badbyxor.',
            explanationEs: '¡Correcto! « Le maillot de bain » es el bañador.',
            explanationSv: 'Rätt! « Le maillot de bain » = badkläder.'
          },
          {
            id: 'ak7-u5-l2-e11',
            type: 'fill-blank',
            prompt: 'Completa: « _____ printemps, les parcs sont magnifiques. »',
            promptFr: 'Au printemps, les parcs sont magnifiques.',
            audioFr: 'Au printemps, les parcs sont magnifiques.',
            options: ['Au', 'En', 'Dans', 'À'],
            answer: 'Au',
            hintEs: '¡Recuerda que con printemps se usa "Au"!',
            hintSv: 'Kom ihåg att våren tar "Au"!',
            explanationEs: '¡Perfecto! « Au printemps » con "Au".',
            explanationSv: 'Perfekt! « Au printemps ».'
          },
          {
            id: 'ak7-u5-l2-e12',
            type: 'choice',
            prompt: '¿Qué prenda significa « un bonnet » en invierno?',
            promptFr: 'Un bonnet',
            audioFr: 'Un bonnet',
            options: ['Un gorro de lana para la cabeza', 'Una bota de nieve', 'Un cinturón', 'Un guante'],
            answer: 'Un gorro de lana para la cabeza',
            hintEs: 'Se lleva en la cabeza cuando hace frío.',
            hintSv: 'Mössa på franska.',
            explanationEs: '¡Bravo! « Un bonnet » es un gorro de invierno.',
            explanationSv: 'Bravo! « Un bonnet » = en mössa.'
          }
        ]
      },
      {
        id: 'ak7-u5-l3',
        unitId: 'ak7-unit-5',
        title: 'Paso 3: La Naturaleza y los Paisajes',
        frenchTitle: 'La Nature et les Paysages',
        description: 'La montagne, la mer, la forêt, la rivière, la plage, les animaux sauvages.',
        xpReward: 20,
        exercises: [
          {
            id: 'ak7-u5-l3-e1',
            type: 'choice',
            prompt: '¿Cómo se dice "la montaña" en francés?',
            promptFr: 'La montagne',
            audioFr: 'La montagne',
            options: ['La montagne', 'La plage', 'La forêt', 'La plaine'],
            answer: 'La montagne',
            hintEs: 'Palabra femenina para las cumbres.',
            hintSv: 'Berg på franska.',
            explanationEs: '¡Correcto! « La montagne » es la montaña.',
            explanationSv: 'Rätt! « La montagne » = berget.'
          },
          {
            id: 'ak7-u5-l3-e2',
            type: 'translate',
            prompt: 'Traduce al francés: "Nos gusta caminar por el bosque."',
            promptFr: 'Nous aimons marcher dans la forêt.',
            audioFr: 'Nous aimons marcher dans la forêt.',
            answer: ['Nous aimons marcher dans la forêt', 'Nous aimons marcher dans la forêt.'],
            hintEs: 'Caminar = marcher; en el bosque = dans la forêt.',
            hintSv: 'Att gå/vandra = marcher; i skogen = dans la forêt.',
            explanationEs: '¡Muy bien! "Nous aimons marcher dans la forêt."',
            explanationSv: 'Mycket bra! "Nous aimons marcher dans la forêt."'
          },
          {
            id: 'ak7-u5-l3-e3',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'La mer Méditerranée est très bleue',
            audioFr: 'La mer Méditerranée est très bleue',
            options: ['est', 'Méditerranée', 'bleue', 'mer', 'La', 'très'],
            answer: ['La', 'mer', 'Méditerranée', 'est', 'très', 'bleue'],
            hintEs: 'Sujeto: "La mer Méditerranée".',
            hintSv: 'Subjekt: "La mer Méditerranée" (Medelhavet).',
            explanationEs: '¡Bravo! « La mer Méditerranée est très bleue ».',
            explanationSv: 'Bravo! « La mer Méditerranée est très bleue ».'
          },
          {
            id: 'ak7-u5-l3-e4',
            type: 'choice',
            prompt: '¿Cómo se dice "un río" en francés?',
            promptFr: 'Une rivière (ou un fleuve)',
            audioFr: 'Une rivière',
            options: ['Une rivière', 'Un lac', 'Un océan', 'Une colline'],
            answer: 'Une rivière',
            hintEs: 'Une rivière (desemboca en otro río) o un fleuve (desemboca en el mar).',
            hintSv: 'En flod / å.',
            explanationEs: '¡Excelente! « Une rivière » es un río.',
            explanationSv: 'Utmärkt! « Une rivière » = en flod/å.'
          },
          {
            id: 'ak7-u5-l3-e5',
            type: 'fill-blank',
            prompt: 'Completa: « En vacances, nous nous baignons dans le _____ . » (lago)',
            promptFr: 'En vacances, nous nous baignons dans le lac.',
            audioFr: 'En vacances, nous nous baignons dans le lac.',
            options: ['lac', 'champ', 'pont', 'jardin'],
            answer: 'lac',
            hintEs: 'Lac = lago.',
            hintSv: 'Lac = sjö.',
            explanationEs: '¡Correcto! « dans le lac » (en el lago).',
            explanationSv: 'Rätt! « dans le lac » = i sjön.'
          },
          {
            id: 'ak7-u5-l3-e6',
            type: 'choice',
            prompt: '¿Qué significa « Faire une randonnée » ?',
            promptFr: 'Faire une randonnée',
            audioFr: 'Faire une randonnée',
            options: ['Hacer senderismo / una excursión a pie', 'Navegar en velero', 'Dormir en un hotel', 'Comprar recuerdos'],
            answer: 'Hacer senderismo / una excursión a pie',
            hintEs: 'Excursión por la naturaleza a pie.',
            hintSv: 'Att vandra i naturen.',
            explanationEs: '¡Muy bien! « La randonnée » es el senderismo.',
            explanationSv: 'Mycket bra! « La randonnée » betyder vandring.'
          },
          {
            id: 'ak7-u5-l3-e7',
            type: 'listen',
            prompt: 'Escucha y selecciona qué paisaje describe:',
            promptFr: 'Au sommet de la montagne, il y a de la neige éternelle.',
            audioFr: 'Au sommet de la montagne, il y a de la neige éternelle.',
            options: ['La cumbre de la montaña con nieve', 'Una playa de arena caliente', 'Un bosque tropical', 'Un campo de flores'],
            answer: 'La cumbre de la montaña con nieve',
            hintEs: 'Sommet = cima; montagne = montaña.',
            hintSv: 'Bergstoppen med snö.',
            explanationEs: '¡Exacto! Describe la cumbre de una montaña con nieve.',
            explanationSv: 'Exakt! Bergstoppen med snö.'
          },
          {
            id: 'ak7-u5-l3-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Les animaux de la forêt dorment',
            audioFr: 'Les animaux de la forêt dorment',
            options: ['dorment', 'forêt', 'de', 'Les', 'animaux', 'la'],
            answer: ['Les', 'animaux', 'de', 'la', 'forêt', 'dorment'],
            hintEs: 'Sujeto: "Les animaux de la forêt".',
            hintSv: 'Subjekt: "Les animaux de la forêt".',
            explanationEs: '¡Bravo! « Les animaux de la forêt dorment » (Los animales del bosque duermen).',
            explanationSv: 'Bravo! « Les animaux de la forêt dorment ».'
          },
          {
            id: 'ak7-u5-l3-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "La playa es de arena blanca."',
            promptFr: 'La plage est de sable blanc.',
            audioFr: 'La plage est de sable blanc.',
            answer: ['La plage est de sable blanc', 'La plage est de sable blanc.', 'La plage a du sable blanc.'],
            hintEs: 'Sable blanc = arena blanca.',
            hintSv: 'Sable blanc = vit sand.',
            explanationEs: '¡Estupendo! "La plage est de sable blanc."',
            explanationSv: 'Strålande! "La plage est de sable blanc."'
          },
          {
            id: 'ak7-u5-l3-e10',
            type: 'choice',
            prompt: '¿Cómo se dice "proteger la naturaleza y el medio ambiente"?',
            promptFr: 'Protéger l\'environnement',
            audioFr: 'Protéger l\'environnement',
            options: ['Protéger l\'environnement', 'Polluer la terre', 'Couper tous les arbres', 'Oublier les animaux'],
            answer: 'Protéger l\'environnement',
            hintEs: 'Protéger = proteger; environnement = medio ambiente.',
            hintSv: 'Skydda miljön.',
            explanationEs: '¡Correcto! « Protéger l\'environnement ».',
            explanationSv: 'Rätt! « Protéger l\'environnement ».'
          },
          {
            id: 'ak7-u5-l3-e11',
            type: 'fill-blank',
            prompt: 'Completa: « L\'air de la montagne est très _____ et frais. »',
            promptFr: 'L\'air de la montagne est très pur et frais.',
            audioFr: 'L\'air de la montagne est très pur et frais.',
            options: ['pur', 'noir', 'bruyant', 'chaud'],
            answer: 'pur',
            hintEs: 'Aire puro.',
            hintSv: 'Ren luft = air pur.',
            explanationEs: '¡Muy bien! « un air très pur » (aire puro).',
            explanationSv: 'Mycket bra! « un air pur ».'
          },
          {
            id: 'ak7-u5-l3-e12',
            type: 'choice',
            prompt: '¿Qué animal salvaje del bosque es « le cerf » en francés?',
            promptFr: 'Le cerf',
            audioFr: 'Le cerf',
            options: ['El ciervo', 'El oso', 'El lobo', 'El conejo'],
            answer: 'El ciervo',
            hintEs: 'Animal majestuoso con cornamenta del bosque.',
            hintSv: 'Hjort på franska.',
            explanationEs: '¡Bravo! « Le cerf » es el ciervo.',
            explanationSv: 'Bravo! « Le cerf » = hjorten.'
          }
        ]
      },
      {
        id: 'ak7-u5-l4',
        unitId: 'ak7-unit-5',
        title: 'Paso 4: Comparar Estaciones y Climas',
        frenchTitle: 'Comparer les Saisons et les Climats',
        description: 'Plus chaud que, moins froid que, aussi beau que.',
        xpReward: 20,
        exercises: [
          {
            id: 'ak7-u5-l4-e1',
            type: 'choice',
            prompt: '¿Cómo se forma el comparativo de superioridad en francés ("más ... que")?',
            promptFr: 'Plus chaud que...',
            audioFr: 'Plus chaud que...',
            options: ['Plus [adjectif] que', 'Moins [adjectif] que', 'Aussi [adjectif] que', 'Très [adjectif] que'],
            answer: 'Plus [adjectif] que',
            hintEs: 'Plus... que = más... que.',
            hintSv: 'Plus... que = mer/varmare... än.',
            explanationEs: '¡Correcto! « Plus + adjetivo + que » es el comparativo de superioridad.',
            explanationSv: 'Rätt! « Plus... que » = mer... än.'
          },
          {
            id: 'ak7-u5-l4-e2',
            type: 'translate',
            prompt: 'Traduce al francés: "El verano es más cálido que el otoño."',
            promptFr: 'L\'été est plus chaud que l\'automne.',
            audioFr: 'L\'été est plus chaud que l\'automne.',
            answer: ['L\'été est plus chaud que l\'automne', 'L\'été est plus chaud que l\'automne.'],
            hintEs: 'Plus chaud que = más cálido que.',
            hintSv: 'Varmare än = plus chaud que.',
            explanationEs: '¡Muy bien! "L\'été est plus chaud que l\'automne."',
            explanationSv: 'Mycket bra! "L\'été est plus chaud que l\'automne."'
          },
          {
            id: 'ak7-u5-l4-e3',
            type: 'scramble',
            prompt: 'Ordena la frase comparativa:',
            promptFr: 'La Suède est plus froide que la France',
            audioFr: 'La Suède est plus froide que la France',
            options: ['France', 'Suède', 'La', 'plus', 'la', 'est', 'que', 'froide'],
            answer: ['La', 'Suède', 'est', 'plus', 'froide', 'que', 'la', 'France'],
            hintEs: 'Sujeto: "La Suède est plus froide...".',
            hintSv: 'Subjekt: "La Suède est plus froide...".',
            explanationEs: '¡Bravo! « La Suède est plus froide que la France » (Suecia es más fría que Francia).',
            explanationSv: 'Bravo! « La Suède est plus froide que la France ».'
          },
          {
            id: 'ak7-u5-l4-e4',
            type: 'choice',
            prompt: '¿Cómo se dice "menos lluvioso que"?',
            promptFr: 'Moins pluvieux que',
            audioFr: 'Moins pluvieux que',
            options: ['Moins pluvieux que', 'Plus pluvieux que', 'Aussi pluvieux que', 'Très pluvieux'],
            answer: 'Moins pluvieux que',
            hintEs: 'Moins = menos.',
            hintSv: 'Moins = mindre.',
            explanationEs: '¡Exacto! « Moins... que » es el comparativo de inferioridad.',
            explanationSv: 'Exakt! « Moins... que » = mindre... än.'
          },
          {
            id: 'ak7-u5-l4-e5',
            type: 'fill-blank',
            prompt: 'Completa con igualdad ("tan ... como"): « En mai, Paris est _____ agréable que Nice. »',
            promptFr: 'En mai, Paris est aussi agréable que Nice.',
            audioFr: 'En mai, Paris est aussi agréable que Nice.',
            options: ['aussi', 'plus', 'moins', 'très'],
            answer: 'aussi',
            hintEs: 'Comparativo de igualdad: aussi + adjetivo + que (tan agradable como).',
            hintSv: 'Lika trevlig som = aussi agréable que.',
            explanationEs: '¡Correcto! « aussi... que » expresa igualdad.',
            explanationSv: 'Rätt! « aussi... que » betyder lika... som.'
          },
          {
            id: 'ak7-u5-l4-e6',
            type: 'choice',
            prompt: '¿Qué significa: « Les journées sont plus longues en juin » ?',
            promptFr: 'Les journées sont plus longues en juin.',
            audioFr: 'Les journées sont plus longues en juin.',
            options: ['Los días son más largos en junio.', 'Los días son más cortos en junio.', 'En junio llueve más.', 'Las noches son más frías.'],
            answer: 'Los días son más largos en junio.',
            hintEs: 'Plus longues = más largas.',
            hintSv: 'Längre = plus longues.',
            explanationEs: '¡Muy bien! En junio los días tienen más luz solar.',
            explanationSv: 'Mycket bra! Dagarna är längre i juni.'
          },
          {
            id: 'ak7-u5-l4-e7',
            type: 'listen',
            prompt: 'Escucha y selecciona la comparación que se hace:',
            promptFr: 'L\'hiver à Stockholm est beaucoup plus neigeux qu\'à Paris.',
            audioFr: 'L\'hiver à Stockholm est beaucoup plus neigeux qu\'à Paris.',
            options: ['El invierno en Estocolmo tiene mucha más nieve que en París.', 'En París nieva más que en Estocolmo.', 'Los inviernos son idénticos.', 'En Estocolmo hace más calor.'],
            answer: 'El invierno en Estocolmo tiene mucha más nieve que en París.',
            hintEs: 'Plus neigeux = con más nieve.',
            hintSv: 'Snöigare = plus neigeux.',
            explanationEs: '¡Exacto! Estocolmo tiene más nieve en invierno que París.',
            explanationSv: 'Exakt! Stockholm är snöigare än Paris.'
          },
          {
            id: 'ak7-u5-l4-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Le printemps est ma saison préférée',
            audioFr: 'Le printemps est ma saison préférée',
            options: ['préférée', 'Le', 'saison', 'printemps', 'est', 'ma'],
            answer: ['Le', 'printemps', 'est', 'ma', 'saison', 'préférée'],
            hintEs: 'Sujeto: "Le printemps...".',
            hintSv: 'Subjekt: "Le printemps...".',
            explanationEs: '¡Bravo! « Le printemps est ma saison préférée » (La primavera es mi estación preferida).',
            explanationSv: 'Bravo! « Le printemps est ma saison préférée ».'
          },
          {
            id: 'ak7-u5-l4-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "Las noches de invierno son muy frías."',
            promptFr: 'Les nuits d\'hiver sont très froides.',
            audioFr: 'Les nuits d\'hiver sont très froides.',
            answer: ['Les nuits d\'hiver sont très froides', 'Les nuits d\'hiver sont très froides.'],
            hintEs: 'Nuits es femenino plural: très froides con "-es".',
            hintSv: 'Nätter är feminint plural: froides.',
            explanationEs: '¡Genial! "Les nuits d\'hiver sont très froides."',
            explanationSv: 'Strålande! "Les nuits d\'hiver sont très froides."'
          },
          {
            id: 'ak7-u5-l4-e10',
            type: 'choice',
            prompt: '¿Cómo se dice "el mejor momento del año"?',
            promptFr: 'Le meilleur moment de l\'année',
            audioFr: 'Le meilleur moment de l\'année',
            options: ['Le meilleur moment de l\'année', 'Le pire moment de l\'année', 'Un autre moment', 'La fin de l\'année'],
            answer: 'Le meilleur moment de l\'année',
            hintEs: 'Meilleur = mejor (superlativo de bon).',
            hintSv: 'Den bästa stunden på året.',
            explanationEs: '¡Excelente! « Le meilleur » es el mejor.',
            explanationSv: 'Utmärkt! « Le meilleur » = den bästa.'
          },
          {
            id: 'ak7-u5-l4-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Cette région est _____ ensoleillée que le nord. » (más)',
            promptFr: 'Cette région est plus ensoleillée que le nord.',
            audioFr: 'Cette région est plus ensoleillée que le nord.',
            options: ['plus', 'très', 'beaucoup', 'aussi'],
            answer: 'plus',
            hintEs: 'Comparativo: plus... que.',
            hintSv: 'Plus... que (soligare än).',
            explanationEs: '¡Correcto! « plus ensoleillée que » (más soleada que).',
            explanationSv: 'Rätt! « plus ensoleillée que ».'
          },
          {
            id: 'ak7-u5-l4-e12',
            type: 'choice',
            prompt: '¿Qué adjetivo significa "soleado"?',
            promptFr: 'Ensoleillé',
            audioFr: 'Ensoleillé',
            options: ['Ensoleillé', 'Nuageux', 'Orageux', 'Glacial'],
            answer: 'Ensoleillé',
            hintEs: 'Derivado de "soleil" (sol).',
            hintSv: 'Soligt på franska.',
            explanationEs: '¡Bravo! « Ensoleillé » significa soleado.',
            explanationSv: 'Bravo! « Ensoleillé » = solig.'
          }
        ]
      },
      {
        id: 'ak7-u5-l5',
        unitId: 'ak7-unit-5',
        title: 'Paso 5: Predecir y Hablar del Tiempo de Mañana',
        frenchTitle: 'La Météo de Demain et Prévisions',
        description: 'Demain il va faire..., Les prévisions météo, préparer ses activités.',
        xpReward: 25,
        exercises: [
          {
            id: 'ak7-u5-l5-e1',
            type: 'choice',
            prompt: '¿Cómo dices "Mañana va a hacer sol" usando el futuro próximo?',
            promptFr: 'Demain il va faire du soleil.',
            audioFr: 'Demain il va faire du soleil.',
            options: ['Demain il va faire du soleil.', 'Demain il a fait du soleil.', 'Demain il fait soleil.', 'Demain le soleil est là.'],
            answer: 'Demain il va faire du soleil.',
            hintEs: 'Demain + il va + faire du soleil.',
            hintSv: 'Imorgon ska det bli soligt: Demain il va faire du soleil.',
            explanationEs: '¡Correcto! Combinación del futuro próximo con expresiones del clima.',
            explanationSv: 'Rätt! Futur proche med väderuttryck.'
          },
          {
            id: 'ak7-u5-l5-e2',
            type: 'scramble',
            prompt: 'Ordena el pronóstico del tiempo:',
            promptFr: 'Selon la météo il va pleuvoir demain',
            audioFr: 'Selon la météo il va pleuvoir demain',
            options: ['demain', 'météo', 'va', 'Selon', 'pleuvoir', 'la', 'il'],
            answer: ['Selon', 'la', 'météo', 'il', 'va', 'pleuvoir', 'demain'],
            hintEs: 'Empieza con "Selon la météo...".',
            hintSv: 'Börja med "Selon la météo...".',
            explanationEs: '¡Bravo! « Selon la météo il va pleuvoir demain » (Según el pronóstico va a llover mañana).',
            explanationSv: 'Bravo! « Selon la météo il va pleuvoir demain ».'
          },
          {
            id: 'ak7-u5-l5-e3',
            type: 'translate',
            prompt: 'Traduce al francés: "Este fin de semana no va a hacer frío."',
            promptFr: 'Ce week-end il ne va pas faire froid.',
            audioFr: 'Ce week-end il ne va pas faire froid.',
            answer: ['Ce week-end il ne va pas faire froid', 'Ce week-end il ne va pas faire froid.', 'Ce week-end, il ne va pas faire froid.'],
            hintEs: 'Negación del futuro: il ne va pas faire froid.',
            hintSv: 'Nekande futur proche: il ne va pas faire froid.',
            explanationEs: '¡Muy bien! "Ce week-end il ne va pas faire froid."',
            explanationSv: 'Mycket bra! "Ce week-end il ne va pas faire froid."'
          },
          {
            id: 'ak7-u5-l5-e4',
            type: 'choice',
            prompt: '¿Cómo se llama el parte meteorológico en la televisión francesa?',
            promptFr: 'Le bulletin météo',
            audioFr: 'Le bulletin météo',
            options: ['Le bulletin météo', 'Le journal scolaire', 'L\'émission sportive', 'Le film du soir'],
            answer: 'Le bulletin météo',
            hintEs: 'El boletín o parte del tiempo.',
            hintSv: 'Väderrapporten på tv.',
            explanationEs: '¡Exacto! « Le bulletin météo » es el espacio del tiempo en la tele.',
            explanationSv: 'Exakt! « Le bulletin météo » är väderrapporten.'
          },
          {
            id: 'ak7-u5-l5-e5',
            type: 'fill-blank',
            prompt: 'Completa: « S\'il fait beau samedi, nous _____ aller à la plage. »',
            promptFr: 'S\'il fait beau samedi, nous allons aller à la plage.',
            audioFr: 'S\'il fait beau samedi, nous allons aller à la plage.',
            options: ['allons', 'vais', 'allez', 'vont'],
            answer: 'allons',
            hintEs: 'Forma para "nous": allons.',
            hintSv: 'Form för "nous": allons.',
            explanationEs: '¡Correcto! « nous allons aller » (vamos a ir).',
            explanationSv: 'Rätt! « nous allons aller ».'
          },
          {
            id: 'ak7-u5-l5-e6',
            type: 'listen',
            prompt: 'Escucha el pronóstico para el domingo y elige el consejo que da:',
            promptFr: 'Dimanche après-midi, les températures vont chuter. Prenez un bon manteau !',
            audioFr: 'Dimanche après-midi, les températures vont chuter. Prenez un bon manteau !',
            options: ['Llevar un buen abrigo porque las temperaturas bajarán', 'Ponerse bañador para la piscina', 'Llevar gafas de sol', 'Quedarse en casa por tormenta'],
            answer: 'Llevar un buen abrigo porque las temperaturas bajarán',
            hintEs: 'Les températures vont chuter = van a desplomarse/bajar.',
            hintSv: 'Temperaturerna kommer att sjunka.',
            explanationEs: '¡Bravo! Aconseja llevar un buen abrigo por el frío.',
            explanationSv: 'Bravo! Rekommenderar varm jacka.'
          },
          {
            id: 'ak7-u5-l5-e7',
            type: 'choice',
            prompt: '¿Qué significa « S\'il pleut, on reste à la maison » ?',
            promptFr: 'S\'il pleut, on reste à la maison.',
            audioFr: 'S\'il pleut, on reste à la maison.',
            options: ['Si llueve, nos quedamos en casa.', 'Si hace sol, salimos al parque.', 'Aunque llueva, vamos a la playa.', 'La casa está inundada.'],
            answer: 'Si llueve, nos quedamos en casa.',
            hintEs: 'S\'il pleut = si llueve; on reste = nos quedamos.',
            hintSv: 'Om det regnar stannar vi hemma.',
            explanationEs: '¡Muy bien! « S\'il pleut... » expresa condición meteorológica.',
            explanationSv: 'Mycket bra! « S\'il pleut, on reste à la maison ».'
          },
          {
            id: 'ak7-u5-l5-e8',
            type: 'scramble',
            prompt: 'Ordena la frase:',
            promptFr: 'Il va faire très doux ce week-end',
            audioFr: 'Il va faire très doux ce week-end',
            options: ['ce', 'doux', 'très', 'faire', 'Il', 'week-end', 'va'],
            answer: ['Il', 'va', 'faire', 'très', 'doux', 'ce', 'week-end'],
            hintEs: 'Empieza con "Il va faire...".',
            hintSv: 'Börja med "Il va faire...".',
            explanationEs: '¡Genial! « Il va faire très doux ce week-end » (Va a hacer una temperatura muy suave este fin de semana).',
            explanationSv: 'Strålande! « Il va faire très doux ce week-end ».'
          },
          {
            id: 'ak7-u5-l5-e9',
            type: 'translate',
            prompt: 'Traduce al francés: "¿Qué tiempo va a hacer mañana en París?"',
            promptFr: 'Quel temps va-t-il faire demain à Paris ?',
            audioFr: 'Quel temps va-t-il faire demain à Paris ?',
            answer: ['Quel temps va-t-il faire demain à Paris ?', 'Quel temps va-t-il faire demain à Paris', 'Quel temps il va faire demain à Paris ?'],
            hintEs: 'Quel temps + va-t-il faire / il va faire + demain à Paris.',
            hintSv: 'Vad ska det bli för väder imorgon i Paris?',
            explanationEs: '¡Excelente! "Quel temps va-t-il faire demain à Paris ?".',
            explanationSv: 'Utmärkt! "Quel temps va-t-il faire demain à Paris ?".'
          },
          {
            id: 'ak7-u5-l5-e10',
            type: 'choice',
            prompt: '¿Cómo se dice "una ola de calor" en francés?',
            promptFr: 'Une canicule',
            audioFr: 'Une canicule',
            options: ['Une canicule', 'Une tempête de neige', 'Un arc-en-ciel', 'Une averse'],
            answer: 'Une canicule',
            hintEs: 'Periodo de calor extremo en verano.',
            hintSv: 'Värmebölja på franska.',
            explanationEs: '¡Correcto! « La canicule » es la ola de calor.',
            explanationSv: 'Rätt! « La canicule » = värmebölja.'
          },
          {
            id: 'ak7-u5-l5-e11',
            type: 'fill-blank',
            prompt: 'Completa: « Les températures _____ monter jusqu\'à trente degrés. »',
            promptFr: 'Les températures vont monter jusqu\'à trente degrés.',
            audioFr: 'Les températures vont monter jusqu\'à trente degrés.',
            options: ['vont', 'va', 'allons', 'allez'],
            answer: 'vont',
            hintEs: 'Les températures (plural = elles) -> "vont".',
            hintSv: 'Pluralform: vont.',
            explanationEs: '¡Muy bien! « Les températures vont monter » (las temperaturas van a subir).',
            explanationSv: 'Mycket bra! « Les températures vont monter ».'
          },
          {
            id: 'ak7-u5-l5-e12',
            type: 'choice',
            prompt: '¿Cómo concluyes diciendo: "¡Esperemos que haga buen tiempo!"?',
            promptFr: 'Espérons qu\'il fasse beau !',
            audioFr: 'Espérons qu\'il fasse beau !',
            options: ['Espérons qu\'il fasse beau !', 'Il va faire nuit.', 'Je déteste le soleil.', 'La pluie commence.'],
            answer: 'Espérons qu\'il fasse beau !',
            hintEs: 'Espérons = esperemos / ojalá.',
            hintSv: 'Hoppas det blir fint väder!',
            explanationEs: '¡Bravo! Expresión optimista antes del fin de semana.',
            explanationSv: 'Bravo! « Espérons qu\'il fasse beau ! ».'
          }
        ]
      }
    ],
    dailySessionTemplate: {
      id: 'ak7-session-u5',
      title: 'Gran Sesión Guiada: Planear el Fin de Semana según el Clima',
      frenchTitle: 'Météo et Sorties : Adapter ses Activités au Temps',
      situation: 'Consultas el pronóstico del tiempo para el sábado y el domingo con tu amigo francés Antoine. Debéis decidir si vais a la montaña, a patinar sobre hielo o si organizáis una tarde de cine y juegos de mesa en casa por lluvia.',
      phase1Warmup: {
        introEs: 'Calentamiento (5 min): Practica 3 respuestas sobre el clima actual y las estaciones.',
        introSv: 'Uppvärmning (5 min): Öva på 3 svar om vädret och årstiderna.',
        questions: [
          {
            id: 'ak7-w5-1',
            promptEs: '¿Cómo respondes "Hoy llueve y hace viento"?',
            promptSv: 'Hur svarar du "Idag regnar det och blåser"?',
            expectedFr: 'Aujourd\'hui il pleut et il y a du vent.',
            hints: ['Aujourd\'hui il pleut...', 'et il y a du vent']
          },
          {
            id: 'ak7-w5-2',
            promptEs: '¿Cómo dices "En primavera los días son más largos"?',
            promptSv: 'Hur säger du "På våren är dagarna längre"?',
            expectedFr: 'Au printemps les journées sont plus longues.',
            hints: ['Au printemps...', 'les journées sont plus longues']
          },
          {
            id: 'ak7-w5-3',
            promptEs: '¿Cómo dices "Mañana no va a nevar"?',
            promptSv: 'Hur säger du "Imorgon ska det inte snöa"?',
            expectedFr: 'Demain il ne va pas neiger.',
            hints: ['Demain il ne va...', 'pas neiger']
          }
        ]
      },
      phase2Input: {
        storyTitle: 'La Météo du Week-end d\'Antoine et Sarah',
        storyFr: 'Antoine : Regarde Sarah, j\'ai l\'application météo sur mon téléphone !\nSarah : Alors, quel temps il va faire samedi ? On peut aller faire du vélo dans la forêt ?\nAntoine : Samedi matin, il va faire très beau et ensoleillé. Mais attention, l\'après-midi le ciel va se couvrir et il va pleuvoir vers seize heures !\nSarah : D\'accord ! Alors faisons du vélo samedi matin de dix heures à midi. Et dimanche ?\nAntoine : Dimanche, il va faire froid mais sec. Idéal pour faire une promenade en ville et boire un chocolat chaud dans un café !\nSarah : Parfait ! Je prends mon blouson chaud et mes baskets !',
        storyEs: 'Antoine: ¡Mira Sarah, tengo la app del tiempo en mi teléfono!\nSarah: Y bien, ¿qué tiempo va a hacer el sábado? ¿Podemos ir a montar en bici al bosque?\nAntoine: El sábado por la mañana va a hacer muy buen tiempo y sol. Pero ojo, por la tarde el cielo se va a nublar y va a llover sobre las cuatro!\nSarah: ¡De acuerdo! Entonces montemos en bici el sábado por la mañana de diez a doce. ¿Y el domingo?\nAntoine: El domingo va a hacer frío pero seco. ¡Ideal para dar un paseo por la ciudad y tomar un chocolate caliente en un café!\nSarah: ¡Perfecto! ¡Cojo mi cazadora abrigada y mis zapatillas deportivas!',
        storySv: 'Antoine: Titta Sarah, jag har väderappen på min telefon!\nSarah: Nå, vad ska det bli för väder på lördag? Kan vi cykla i skogen?\nAntoine: På lördag förmiddag ska det bli jättefint och soligt väder. Men se upp, på eftermiddagen mulnar det och det ska regna runt klockan fyra!\nSarah: Okej! Då cyklar vi på lördag förmiddag mellan tio och tolv. Och på söndag?\nAntoine: På söndag ska det bli kallt men uppehåll. Perfekt för en promenad på stan och varm choklad på ett café!\nSarah: Perfekt! Jag tar min varma jacka och gympaskorna!',
        keyExpressions: [
          {
            fr: 'Le ciel va se couvrir',
            phonetic: 'lö siel va sö kuvrir',
            es: 'El cielo se va a nublar / cubrir de nubes',
            sv: 'Himlen kommer att mulna',
            clue: 'Expresión para indicar que el sol va a desaparecer tras las nubes.'
          },
          {
            fr: 'Il va faire froid mais sec',
            phonetic: 'il va fer frwa me sek',
            es: 'Va a hacer frío pero seco (sin lluvia)',
            sv: 'Det blir kallt men uppehåll/torrt',
            clue: 'Ideal para salir bien abrigado sin necesidad de paraguas.'
          },
          {
            fr: 'Boire un chocolat chaud',
            phonetic: 'bwar un shokola sho',
            es: 'Tomar un chocolate caliente',
            sv: 'Dricka varm choklad',
            clue: 'Plan clásico y reconfortante de fin de semana frío.'
          }
        ]
      },
      phase3Production: {
        contextEs: 'Juego de rol interactivo (12 min): Tu amigo Antoine te pregunta qué tiempo hace en tu ciudad y te pide consejo sobre qué ropa llevar para vuestra salida del sábado.',
        contextSv: 'Interaktivt rollspel (12 min): Din kompis Antoine frågar vad det är för väder hos dig och vill ha klädråd inför er helgutflykt.',
        initialAIPrompt: 'Salut ! Quel temps fait-il chez toi aujourd\'hui ? Et qu\'est-ce que tu vas porter pour notre sortie ce week-end ?',
        initialAIPromptTranslation: '¡Hola! ¿Qué tiempo hace en tu ciudad hoy? ¿Y qué vas a ponerte para nuestra salida este fin de semana?',
        mission: 'Describe el tiempo ("Aujourd\'hui il fait...", "Il pleut / Il y a du soleil"), qué ropa vas a llevar ("Je vais porter...") y propone un plan adaptado al clima.',
        constraintProgression: [
          'Usa una frase de clima: "Il fait beau/froid" o "Il pleut".',
          'Menciona tu ropa con el futuro próximo: "Je vais porter un manteau/des gants".',
          'Propón una actividad según el tiempo ("Alors, on va aller au cinéma/parc").'
        ]
      },
      phase4ExitTicket: {
        promptEs: 'Reto de salida (5 min): Escribe 2 frases comparando tu estación favorita con otra estación usando "plus... que" o "moins... que".',
        promptSv: 'Utgångsutmaning (5 min): Skriv 2 meningar som jämför din favoritårstid med en annan årstid med "plus... que" eller "moins... que".',
        sampleFr: 'L\'été est plus chaud et plus ensoleillé que l\'automne, c\'est pourquoi je préfère l\'été !'
      }
    }
  }
];
