export type LanguagePreference = 'es' | 'sv';

export type GradeLevel = 'ak6' | 'ak7' | 'ak8' | 'ak9';

export interface Exercise {
  id: string;
  type: 'choice' | 'translate' | 'scramble' | 'listen' | 'fill-blank';
  prompt: string;
  promptFr?: string;
  audioFr?: string;
  options?: string[];
  answer: string | string[]; // Can be single string or array of accepted alternatives or words
  hintEs: string;
  hintSv: string;
  explanationEs: string;
  explanationSv: string;
}

export interface DialogueLine {
  speaker: string;
  avatar: string;
  textFr: string;
  textEs: string;
  textSv: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  frenchTitle: string;
  description: string;
  xpReward: number;
  exercises: Exercise[];
  dialogue?: DialogueLine[];
  culturalNote?: {
    title: string;
    textEs: string;
    textSv: string;
  };
}

export interface Unit {
  id: string;
  number: number;
  grade: GradeLevel;
  title: string;
  frenchTitle: string;
  description: string;
  iconName: string;
  color: string;
  grammarTip: {
    title: string;
    explanationEs: string;
    explanationSv: string;
    examples: { fr: string; es: string; sv: string }[];
  };
  lessons: Lesson[];
  dailySessionTemplate: DailySessionTemplate;
}

export interface Flashcard {
  id: string;
  french: string;
  phonetic: string;
  spanish: string;
  swedish: string;
  exampleFr: string;
  exampleEs: string;
  exampleSv: string;
  category: string;
  box: 1 | 2 | 3; // Leitner box: 1 = Learn, 2 = Review, 3 = Mastered
  nextReviewDate: string; // ISO date string
  timesReviewed: number;
  correctStreak: number;
  unitId?: string;
  grade?: GradeLevel;
}

export interface DailySessionTemplate {
  id: string;
  title: string;
  frenchTitle: string;
  situation: string;
  phase1Warmup: {
    introEs: string;
    introSv: string;
    questions: {
      id: string;
      promptEs: string;
      promptSv: string;
      expectedFr: string;
      hints: string[];
    }[];
  };
  phase2Input: {
    storyTitle: string;
    storyFr: string;
    storyEs: string;
    storySv: string;
    keyExpressions: {
      fr: string;
      phonetic: string;
      es: string;
      sv: string;
      clue: string;
    }[];
  };
  phase3Production: {
    contextEs: string;
    contextSv: string;
    initialAIPrompt: string;
    initialAIPromptTranslation: string;
    mission: string;
    constraintProgression: string[];
  };
  phase4ExitTicket: {
    promptEs: string;
    promptSv: string;
    sampleFr: string;
  };
}

export interface StudentMemoryFacts {
  name?: string;
  age?: string | number;
  pets?: string[];
  favoriteFoods?: string[];
  hobbies?: string[];
  cityOrCountry?: string;
  otherFacts?: string[];
}

export interface UserProfile {
  id?: string;
  name: string;
  bio?: string;
  email?: string;
  photoURL?: string;
  accountType?: 'google' | 'local';
  streakDays: number;
  lastStudyDate: string;
  totalXp: number;
  completedLessonIds: string[];
  completedSessionIds: string[];
  currentGrade: GradeLevel;
  soundEnabled: boolean;
  voiceSpeed: number; // 0.8 or 1.0
  supportLanguage: LanguagePreference;
  dailyGoalMinutes: number;
  minutesToday: number;
  chatMemory?: StudentMemoryFacts;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}
