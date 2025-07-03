// Import Redis-compatible functions
import {
  createQuestion as createQuestionLocal,
  getRecentQuestions as getRecentQuestionsLocal,
  getQuestion as getQuestionLocal,
  submitAnswer as submitAnswerLocal,
  hasUserAnswered as hasUserAnsweredLocal,
  getQuestionStats as getQuestionStatsLocal,
  getUserAnswerForQuestion as getUserAnswerForQuestionLocal,
  getUserAnswersForQuestions as getUserAnswersForQuestionsLocal,
  seedLocalData
} from './db-local'

// Re-export all functions (they handle Redis vs local internally)
export const createQuestion = createQuestionLocal
export const getRecentQuestions = getRecentQuestionsLocal  
export const getQuestion = getQuestionLocal
export const submitAnswer = submitAnswerLocal
export const hasUserAnswered = hasUserAnsweredLocal
export const getQuestionStats = getQuestionStatsLocal
export const getUserAnswerForQuestion = getUserAnswerForQuestionLocal
export const getUserAnswersForQuestions = getUserAnswersForQuestionsLocal

// Initialize local data if in development without Redis
if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
  seedLocalData()
}

// This file now imports everything from db-local.ts
// which handles both local development and production Redis automatically 