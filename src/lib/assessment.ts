import type { Question } from '@/data/questions';

export type AssessmentSession = {
  learnerName: string;
  order: number[];
  optionOrders: Record<string, number[]>;
  answers: Record<string, number>;
  currentIndex: number;
};

export type AssessmentResult = {
  correct: number;
  incorrect: number;
  percentage: number;
  passed: boolean;
};

export const PASSING_PERCENTAGE = 70;

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function createSession(learnerName: string, questionBank: Question[]): AssessmentSession {
  const order = shuffle(questionBank.map((question) => question.id));
  const optionOrders = Object.fromEntries(questionBank.map((question) => [question.id, shuffle(question.options.map((_, index) => index))]));

  return {
    learnerName,
    order,
    optionOrders,
    answers: {},
    currentIndex: 0,
  };
}

export function scoreAssessment(session: AssessmentSession, questionBank: Question[]): AssessmentResult {
  const correct = session.order.reduce((total, questionId) => {
    const question = questionBank.find((item) => item.id === questionId);
    return total + (question && session.answers[String(questionId)] === question.correctIndex ? 1 : 0);
  }, 0);
  const incorrect = questionBank.length - correct;
  const percentage = Math.round((correct / questionBank.length) * 100);

  return { correct, incorrect, percentage, passed: percentage >= PASSING_PERCENTAGE };
}

export function getAnsweredCount(session: AssessmentSession): number {
  return Object.keys(session.answers).length;
}
