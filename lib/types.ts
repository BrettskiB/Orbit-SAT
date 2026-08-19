export type StudentProfile = {
  id: string;
  displayName: string;
  email: string;
  targetScore: number;
  testDate?: string;
  dailyQuestionGoal: number;
};

export type QuestionAttempt = {
  id: string;
  userId: string;
  questionId: string;
  selectedAnswer: string;
  correct: boolean;
  timeSpentSeconds: number;
  hintUsed: boolean;
  coachUsed: boolean;
  attemptedAt: string;
};

export type ModuleProgress = {
  userId: string;
  moduleId: string;
  lessonsCompleted: number;
  mastery: number;
  status: "not_started" | "in_progress" | "mastered" | "tested_out";
  lastStudiedAt?: string;
};
