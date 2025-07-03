// Local development fallback for Vercel KV
import { nanoid } from 'nanoid'
import type { Question, UserAnswer, QuestionStats, AnswerChoice } from './types'

// In-memory storage for local development
const localQuestions: Map<string, Question> = new Map()
const localAnswers: Map<string, UserAnswer> = new Map()
const localUserAnswered: Set<string> = new Set()
const questionsByUser: Map<string, Set<string>> = new Map()
const answersByQuestion: Map<string, Set<string>> = new Map()

// Check if we're in development and KV is not available
const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL

console.log(`🔧 Database Mode: ${isLocalDev ? 'LOCAL FALLBACK' : 'VERCEL KV'}`)

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

  if (isLocalDev) {
    // Local storage
    localQuestions.set(questionId, question)
    
    if (!questionsByUser.has(createdBy)) {
      questionsByUser.set(createdBy, new Set())
    }
    questionsByUser.get(createdBy)!.add(questionId)
    
    console.log(`📝 Created question locally: ${questionId}`)
  } else {
    // Use actual Vercel KV
    const { kv } = await import('@vercel/kv')
    await kv.set(`question:${questionId}`, question)
    await kv.sadd('questions:recent', questionId)
    await kv.expire('questions:recent', 24 * 60 * 60)
    await kv.sadd(`questions:by-user:${createdBy}`, questionId)
  }
  
  return question
}

export async function getRecentQuestions(excludeUserId?: string): Promise<Question[]> {
  if (isLocalDev) {
    // Get all questions from last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    const recentQuestions: Question[] = []
    
    for (const [id, question] of localQuestions) {
      if (question.createdAt > oneDayAgo) {
        // Skip if user already answered
        if (excludeUserId && localUserAnswered.has(`${excludeUserId}:${id}`)) {
          continue
        }
        recentQuestions.push(question)
      }
    }
    
    return recentQuestions.sort((a, b) => b.createdAt - a.createdAt)
  } else {
    // Use actual Vercel KV
    const { kv } = await import('@vercel/kv')
    const questionIds = await kv.smembers('questions:recent') as string[]
    
    if (questionIds.length === 0) return []
    
    const pipeline = kv.pipeline()
    questionIds.forEach(id => pipeline.get(`question:${id}`))
    const results = await pipeline.exec() as Question[]
    
    const questions: Question[] = []
    for (let i = 0; i < results.length; i++) {
      const question = results[i]
      if (!question) continue
      
      if (excludeUserId) {
        const hasAnswered = await kv.exists(`user-answered:${excludeUserId}:${question.id}`)
        if (hasAnswered) continue
      }
      
      questions.push(question)
    }
    
    return questions.sort((a, b) => b.createdAt - a.createdAt)
  }
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  if (isLocalDev) {
    return localQuestions.get(questionId) || null
  } else {
    const { kv } = await import('@vercel/kv')
    return await kv.get(`question:${questionId}`)
  }
}

// =============================================================================
// ANSWER OPERATIONS  
// =============================================================================

export async function submitAnswer(
  questionId: string,
  userId: string,
  userName: string,
  selectedAnswer: AnswerChoice
): Promise<{ success: boolean; isCorrect: boolean; message: string; stats?: QuestionStats | null }> {
  const userAnswerKey = `${userId}:${questionId}`
  
  if (isLocalDev) {
    // Check if user already answered
    if (localUserAnswered.has(userAnswerKey)) {
      return {
        success: false,
        isCorrect: false,
        message: "You've already answered this question!"
      }
    }
    
    // Get the question
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
    // Use actual Vercel KV implementation
    const { kv } = await import('@vercel/kv')
    
    const hasAnswered = await kv.exists(`user-answered:${userId}:${questionId}`)
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
    
    await Promise.all([
      kv.set(`answer:${answerId}`, userAnswer),
      kv.sadd(`answers:by-question:${questionId}`, answerId),
      kv.sadd(`answers:by-user:${userId}`, answerId),
      kv.set(`user-answered:${userId}:${questionId}`, true)
    ])
    
    await kv.hincrby(`question:${questionId}`, 'totalAnswers', 1)
    if (isCorrect) {
      await kv.hincrby(`question:${questionId}`, 'correctAnswers', 1)
    }
    
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
  if (isLocalDev) {
    return localUserAnswered.has(`${userId}:${questionId}`)
  } else {
    const { kv } = await import('@vercel/kv')
    return Boolean(await kv.exists(`user-answered:${userId}:${questionId}`))
  }
}

// =============================================================================
// STATS OPERATIONS
// =============================================================================

export async function getQuestionStats(questionId: string): Promise<QuestionStats | null> {
  const question = await getQuestion(questionId)
  if (!question) return null
  
  if (isLocalDev) {
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
    // Use actual Vercel KV
    const { kv } = await import('@vercel/kv')
    const answerIds = await kv.smembers(`answers:by-question:${questionId}`) as string[]
    
    if (answerIds.length === 0) {
      return {
        questionId,
        totalAnswers: 0,
        correctAnswers: 0,
        correctPercentage: 0,
        recentAnswerers: []
      }
    }
    
    const pipeline = kv.pipeline()
    answerIds.forEach(id => pipeline.get(`answer:${id}`))
    
    const answers = (await pipeline.exec()) as UserAnswer[]
    const validAnswers = answers.filter(Boolean)
    
    const totalAnswers = validAnswers.length
    const correctAnswers = validAnswers.filter(a => a.isCorrect).length
    const correctPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
    
    const recentAnswerers = validAnswers
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