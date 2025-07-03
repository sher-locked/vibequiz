// Import local fallback functions
import {
  createQuestion as createQuestionLocal,
  getRecentQuestions as getRecentQuestionsLocal,
  getQuestion as getQuestionLocal,
  submitAnswer as submitAnswerLocal,
  hasUserAnswered as hasUserAnsweredLocal,
  getQuestionStats as getQuestionStatsLocal,
  seedLocalData
} from './db-local'

// Re-export all functions (they handle KV vs local internally)
export const createQuestion = createQuestionLocal
export const getRecentQuestions = getRecentQuestionsLocal  
export const getQuestion = getQuestionLocal
export const submitAnswer = submitAnswerLocal
export const hasUserAnswered = hasUserAnsweredLocal
export const getQuestionStats = getQuestionStatsLocal

// Initialize local data if in development
if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL) {
  seedLocalData()
}

// This file now imports everything from db-local.ts
// which handles both local development and production KV automatically 