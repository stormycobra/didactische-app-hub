export type Category = 1 | 2 | 3;
export type Difficulty = 'beginner' | 'gevorderd' | 'expert';
export type Mode = 'categorie-specifiek' | 'mix' | 'diagnose' | 'escalatie';
export type DidacticJudgment = 'basis' | 'redelijk sterk' | 'sterk' | 'zeer sterk';

export interface Case {
  subject: string;
  level: string;
  context: string;
  category: Category;
  caseText: string;
  goal: string;
  assignment: string;
}

export interface Feedback {
  category: string;
  explanation: string;
  whatWorks: string;
  whatLimits: string;
  dimensions: {
    content: boolean;
    strategy: boolean;
    modus: boolean;
    quality: boolean;
    explanation: string;
  };
  subjectAnalysis: string;
  reformulation: string;
  followUpQuestion: string;
  judgment: DidacticJudgment;
}

export interface AppState {
  view: 'setup' | 'practice' | 'feedback' | 'loading';
  subject: string;
  level: string;
  mode: Mode;
  difficulty: Difficulty;
  currentCase: Case | null;
  teacherResponse: string;
  feedback: Feedback | null;
}
