import type { ModuleProgress, QuestionAttempt } from "./types";

export interface ProgressRepository {
  recordAttempt(attempt: QuestionAttempt): Promise<void>;
  getModuleProgress(userId: string): Promise<ModuleProgress[]>;
  getMissedQuestions(userId: string): Promise<QuestionAttempt[]>;
}
