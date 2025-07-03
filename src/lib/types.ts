// Data types for VibeQuiz game mechanics

export interface Question {
  id: string
  createdBy: string       // User ID who created the question
  createdAt: number       // Unix timestamp
  questionText: string    // The actual question
  choices: {
    a: string
    b: string  
    c: string
    d: string
  }
  correctAnswer: 'a' | 'b' | 'c' | 'd'  // Which choice is correct
  totalAnswers: number    // Counter for total responses
  correctAnswers: number  // Counter for correct responses
}

export interface QuestionWithAnswerStatus extends Omit<Question, 'correctAnswer'> {
  isMyQuestion: boolean
  isAnswered: boolean
  userAnswer: {
    selectedAnswer: 'a' | 'b' | 'c' | 'd'
    isCorrect: boolean
    answeredAt: number
  } | null
  correctAnswer?: 'a' | 'b' | 'c' | 'd'  // Only included if user has answered
  stats: QuestionStats | null  // Only included if user has answered
}

export interface UserAnswer {
  id: string              // Unique answer ID
  questionId: string      // Reference to question
  userId: string          // User who answered
  selectedAnswer: 'a' | 'b' | 'c' | 'd'
  isCorrect: boolean      // Whether they got it right
  answeredAt: number      // Unix timestamp
  userName: string        // Cache user name for display
}

export interface QuestionStats {
  questionId: string
  totalAnswers: number
  correctAnswers: number
  correctPercentage: number
  recentAnswerers: Array<{
    userName: string
    isCorrect: boolean
    answeredAt: number
  }>
}

export type AnswerChoice = 'a' | 'b' | 'c' | 'd' 