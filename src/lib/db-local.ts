// Database layer supporting both Redis Cloud and local development fallback
import { nanoid } from 'nanoid'
import type { Question, UserAnswer, QuestionStats, AnswerChoice } from './types'
import { getRedisClient } from './redis'

// In-memory storage for local development
const localQuestions: Map<string, Question> = new Map()
const localAnswers: Map<string, UserAnswer> = new Map()
const localUserAnswered: Set<string> = new Set()
const questionsByUser: Map<string, Set<string>> = new Map()
const answersByQuestion: Map<string, Set<string>> = new Map()

// Check if we're in development and Redis is not available
const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.REDIS_URL

// =============================================================================
// QUESTION OPERATIONS
// =============================================================================

export async function createQuestion(
  questionText: string,
  choices: { a: string; b: string; c: string; d: string },
  correctAnswer: AnswerChoice,
  createdBy: string
): Promise<Question> {
  const questionId = nanoid()
  const now = Date.now()
  
  const question: Question = {
    id: questionId,
    createdBy,
    createdAt: now,
    questionText: questionText.trim(),
    choices: {
      a: choices.a.trim(),
      b: choices.b.trim(),
      c: choices.c.trim(),
      d: choices.d.trim()
    },
    correctAnswer,
    totalAnswers: 0,
    correctAnswers: 0
  }

  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    // Local storage
    localQuestions.set(questionId, question)
    
    if (!questionsByUser.has(createdBy)) {
      questionsByUser.set(createdBy, new Set())
    }
    questionsByUser.get(createdBy)!.add(questionId)
    
    console.log(`📝 Created question locally: ${questionId}`)
  } else {
    // Use Redis
    await redis.setEx(`question:${questionId}`, 86400, JSON.stringify(question)) // 24 hour TTL
    await redis.sAdd('questions:recent', questionId)
    await redis.expire('questions:recent', 86400) // 24 hours
    await redis.sAdd(`questions:by-user:${createdBy}`, questionId)
    
    console.log(`📝 Created question in Redis: ${questionId}`)
  }
  
  return question
}

export async function getRecentQuestions(): Promise<Question[]> {
  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    // Get all questions from last 24 hours (local) - NO FILTERING BY ANSWERS
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    const recentQuestions: Question[] = []
    
    for (const [, question] of localQuestions) {
      if (question.createdAt > oneDayAgo) {
        recentQuestions.push(question)
      }
    }
    
    return recentQuestions.sort((a, b) => b.createdAt - a.createdAt)
  } else {
    // Use Redis - NO FILTERING BY ANSWERS
    const questionIds = await redis.sMembers('questions:recent')
    
    if (questionIds.length === 0) return []
    
    const questions: Question[] = []
    
    for (const questionId of questionIds) {
      const questionData = await redis.get(`question:${questionId}`)
      if (!questionData) continue
      
      const question: Question = JSON.parse(questionData)
      questions.push(question)
    }
    
    return questions.sort((a, b) => b.createdAt - a.createdAt)
  }
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    return localQuestions.get(questionId) || null
  } else {
    const questionData = await redis.get(`question:${questionId}`)
    return questionData ? JSON.parse(questionData) : null
  }
}

// =============================================================================
// ANSWER OPERATIONS  
// =============================================================================

export async function getUserAnswerForQuestion(
  userId: string,
  questionId: string
): Promise<UserAnswer | null> {
  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    // Local implementation
    const userAnswerKey = `${userId}:${questionId}`
    if (!localUserAnswered.has(userAnswerKey)) {
      return null
    }
    
    // Find the answer in local storage
    for (const [, answer] of localAnswers) {
      if (answer.userId === userId && answer.questionId === questionId) {
        return answer
      }
    }
    return null
  } else {
    // Redis implementation
    const hasAnswered = await redis.exists(`user-answered:${userId}:${questionId}`)
    if (!hasAnswered) {
      return null
    }
    
    // Get user's answers for this question
    const userAnswerIds = await redis.sMembers(`answers:by-user:${userId}`)
    
    for (const answerId of userAnswerIds) {
      const answerData = await redis.get(`answer:${answerId}`)
      if (answerData) {
        const answer: UserAnswer = JSON.parse(answerData)
        if (answer.questionId === questionId) {
          return answer
        }
      }
    }
    return null
  }
}

export async function getUserAnswersForQuestions(
  userId: string,
  questionIds: string[]
): Promise<Map<string, UserAnswer>> {
  const redis = await getRedisClient()
  const answers = new Map<string, UserAnswer>()
  
  if (!redis || isLocalDev) {
    // Local implementation
    for (const questionId of questionIds) {
      const answer = await getUserAnswerForQuestion(userId, questionId)
      if (answer) {
        answers.set(questionId, answer)
      }
    }
    return answers
  } else {
    // Redis implementation - more efficient batch operation
    const userAnswerIds = await redis.sMembers(`answers:by-user:${userId}`)
    
    for (const answerId of userAnswerIds) {
      const answerData = await redis.get(`answer:${answerId}`)
      if (answerData) {
        const answer: UserAnswer = JSON.parse(answerData)
        if (questionIds.includes(answer.questionId)) {
          answers.set(answer.questionId, answer)
        }
      }
    }
    return answers
  }
}

export async function submitAnswer(
  questionId: string,
  userId: string,
  userName: string,
  selectedAnswer: AnswerChoice
): Promise<{ success: boolean; isCorrect: boolean; message: string; stats?: QuestionStats | null }> {
  const userAnswerKey = `${userId}:${questionId}`
  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    // Local implementation
    if (localUserAnswered.has(userAnswerKey)) {
      return {
        success: false,
        isCorrect: false,
        message: "You've already answered this question!"
      }
    }
    
    const question = localQuestions.get(questionId)
    if (!question) {
      return {
        success: false,
        isCorrect: false,
        message: "Question not found"
      }
    }
    
    const isCorrect = selectedAnswer === question.correctAnswer
    const answerId = nanoid()
    const now = Date.now()
    
    const userAnswer: UserAnswer = {
      id: answerId,
      questionId,
      userId,
      selectedAnswer,
      isCorrect,
      answeredAt: now,
      userName
    }
    
    // Store answer locally
    localAnswers.set(answerId, userAnswer)
    localUserAnswered.add(userAnswerKey)
    
    if (!answersByQuestion.has(questionId)) {
      answersByQuestion.set(questionId, new Set())
    }
    answersByQuestion.get(questionId)!.add(answerId)
    
    // Update question counters
    question.totalAnswers++
    if (isCorrect) {
      question.correctAnswers++
    }
    
    const stats = await getQuestionStats(questionId)
    
    return {
      success: true,
      isCorrect,
      message: isCorrect ? "Correct! 🎉" : "Incorrect, but nice try! 💪",
      stats
    }
  } else {
    // Redis implementation
    const hasAnswered = await redis.exists(`user-answered:${userId}:${questionId}`)
    if (hasAnswered) {
      return {
        success: false,
        isCorrect: false,
        message: "You've already answered this question!"
      }
    }
    
    const question = await getQuestion(questionId)
    if (!question) {
      return {
        success: false,
        isCorrect: false,
        message: "Question not found"
      }
    }
    
    const isCorrect = selectedAnswer === question.correctAnswer
    const answerId = nanoid()
    const now = Date.now()
    
    const userAnswer: UserAnswer = {
      id: answerId,
      questionId,
      userId,
      selectedAnswer,
      isCorrect,
      answeredAt: now,
      userName
    }
    
    // Store in Redis with TTL
    await redis.setEx(`answer:${answerId}`, 86400, JSON.stringify(userAnswer))
    await redis.sAdd(`answers:by-question:${questionId}`, answerId)
    await redis.sAdd(`answers:by-user:${userId}`, answerId)
    await redis.setEx(`user-answered:${userId}:${questionId}`, 86400, 'true')
    
    // Update question counters
    question.totalAnswers++
    if (isCorrect) {
      question.correctAnswers++
    }
    await redis.setEx(`question:${questionId}`, 86400, JSON.stringify(question))
    
    const stats = await getQuestionStats(questionId)
    
    return {
      success: true,
      isCorrect,
      message: isCorrect ? "Correct! 🎉" : "Incorrect, but nice try! 💪",
      stats
    }
  }
}

export async function hasUserAnswered(userId: string, questionId: string): Promise<boolean> {
  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    return localUserAnswered.has(`${userId}:${questionId}`)
  } else {
    return Boolean(await redis.exists(`user-answered:${userId}:${questionId}`))
  }
}

// =============================================================================
// STATS OPERATIONS
// =============================================================================

export async function getQuestionStats(questionId: string): Promise<QuestionStats | null> {
  const question = await getQuestion(questionId)
  if (!question) return null
  
  const redis = await getRedisClient()
  
  if (!redis || isLocalDev) {
    // Local implementation
    const answerIds = answersByQuestion.get(questionId) || new Set()
    
    if (answerIds.size === 0) {
      return {
        questionId,
        totalAnswers: 0,
        correctAnswers: 0,
        correctPercentage: 0,
        recentAnswerers: []
      }
    }
    
    const answers = Array.from(answerIds)
      .map(id => localAnswers.get(id))
      .filter(Boolean) as UserAnswer[]
    
    const totalAnswers = answers.length
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const correctPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
    
    const recentAnswerers = answers
      .sort((a, b) => b.answeredAt - a.answeredAt)
      .slice(0, 10)
      .map(answer => ({
        userName: answer.userName,
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt
      }))
    
    return {
      questionId,
      totalAnswers,
      correctAnswers,
      correctPercentage,
      recentAnswerers
    }
  } else {
    // Redis implementation
    const answerIds = await redis.sMembers(`answers:by-question:${questionId}`)
    
    if (answerIds.length === 0) {
      return {
        questionId,
        totalAnswers: 0,
        correctAnswers: 0,
        correctPercentage: 0,
        recentAnswerers: []
      }
    }
    
    const answers: UserAnswer[] = []
    
    for (const answerId of answerIds) {
      const answerData = await redis.get(`answer:${answerId}`)
      if (answerData) {
        answers.push(JSON.parse(answerData))
      }
    }
    
    const totalAnswers = answers.length
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const correctPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
    
    const recentAnswerers = answers
      .sort((a, b) => b.answeredAt - a.answeredAt)
      .slice(0, 10)
      .map(answer => ({
        userName: answer.userName,
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt
      }))
    
    return {
      questionId,
      totalAnswers,
      correctAnswers,
      correctPercentage,
      recentAnswerers
    }
  }
}

// =============================================================================
// SEED DATA FOR LOCAL DEVELOPMENT ONLY
// =============================================================================

export async function seedLocalData() {
  // Only seed in development mode, not in production
  if (!isLocalDev || localQuestions.size > 0) return
  
  console.log('🌱 Seeding local development data...')
  
  // Create some sample questions
  const sampleQuestions = [
    {
      questionText: "What does HTML stand for?",
      choices: {
        a: "HyperText Markup Language",
        b: "High Technology Modern Language", 
        c: "Home Tool Markup Language",
        d: "Hyperlink and Text Markup Language"
      },
      correctAnswer: "a" as AnswerChoice,
      createdBy: "sample-user-1"
    },
    {
      questionText: "Which CSS property controls the text size?",
      choices: {
        a: "text-style",
        b: "font-size",
        c: "text-size", 
        d: "font-style"
      },
      correctAnswer: "b" as AnswerChoice,
      createdBy: "sample-user-2"
    },
    {
      questionText: "What is the latest version of JavaScript (as of 2024)?",
      choices: {
        a: "ES6",
        b: "ES2020",
        c: "ES2023",
        d: "ES2024"
      },
      correctAnswer: "d" as AnswerChoice,
      createdBy: "sample-user-1"
    }
  ]
  
  for (const q of sampleQuestions) {
    await createQuestion(q.questionText, q.choices, q.correctAnswer, q.createdBy)
  }
  
  console.log(`✅ Seeded ${sampleQuestions.length} sample questions`)
} 