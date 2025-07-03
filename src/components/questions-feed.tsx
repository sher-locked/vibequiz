'use client'

import { useState, useEffect } from 'react'
import type { QuestionWithAnswerStatus, QuestionStats } from '@/lib/types'

interface QuestionsFeedProps {
  refreshTrigger?: number
}

export default function QuestionsFeed({ refreshTrigger }: QuestionsFeedProps) {
  const [questions, setQuestions] = useState<QuestionWithAnswerStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/questions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions')
      }

      setQuestions(data.questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [refreshTrigger])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchQuestions} />
  }

  if (questions.length === 0) {
    return <EmptyState />
  }

  // Separate answered and unanswered questions
  const unansweredQuestions = questions.filter(q => !q.isAnswered)
  const answeredQuestions = questions.filter(q => q.isAnswered)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Recent Questions</h2>
        </div>
        <div className="text-sm text-slate-400">
          {questions.length} question{questions.length !== 1 ? 's' : ''} • {unansweredQuestions.length} to answer
        </div>
      </div>

      {/* Unanswered Questions First */}
      {unansweredQuestions.length > 0 && (
        <div className="space-y-6">
          {unansweredQuestions.map((question) => (
            <QuestionCard 
              key={question.id} 
              question={question}
              onAnswered={fetchQuestions}
            />
          ))}
        </div>
      )}

      {/* Answered Questions Section */}
      {answeredQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pt-6">
            <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-100">Your Answers</h3>
            <div className="text-sm text-slate-400">
              ({answeredQuestions.length} answered)
            </div>
          </div>
          <div className="space-y-4">
            {answeredQuestions.map((question) => (
              <AnsweredQuestionCard 
                key={question.id} 
                question={question}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface QuestionCardProps {
  question: QuestionWithAnswerStatus
  onAnswered: () => void
}

function QuestionCard({ question, onAnswered }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState<{
    isCorrect: boolean
    message: string
    stats: QuestionStats | null
  } | null>(null)

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/questions/${question.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedAnswer }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer')
      }

      setAnswered(true)
      setResult({
        isCorrect: data.isCorrect,
        message: data.message,
        stats: data.stats
      })

      // Refresh the feed to update states
      onAnswered()

    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diffInSeconds = Math.floor((now - timestamp) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-100 mb-2">
            {question.questionText}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{formatTimeAgo(question.createdAt)}</span>
            {question.isMyQuestion && (
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                Your Question
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {question.totalAnswers} answer{question.totalAnswers !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Answer Choices */}
      {!answered && (
        <div className="space-y-3 mb-6">
          {(['a', 'b', 'c', 'd'] as const).map((choice) => (
            <label
              key={choice}
              className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                selectedAnswer === choice
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={choice}
                checked={selectedAnswer === choice}
                onChange={(e) => setSelectedAnswer(e.target.value as 'a' | 'b' | 'c' | 'd')}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                selectedAnswer === choice
                  ? 'border-blue-400 bg-blue-400'
                  : 'border-slate-500'
              }`}>
                {selectedAnswer === choice && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium mr-3 text-slate-400">
                {choice.toUpperCase()}.
              </span>
              <span>{question.choices[choice]}</span>
            </label>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {!answered && (
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer || isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedAnswer && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500'
              : 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Answer
            </>
          )}
        </button>
      )}

      {/* Answer Result (for just-answered questions) */}
      {answered && result && (
        <div className={`border rounded-lg p-4 ${
          result.isCorrect 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              result.isCorrect 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {result.isCorrect ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <div className={`font-medium ${
                result.isCorrect ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {result.isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
              <div className="text-sm text-slate-400">{result.message}</div>
            </div>
          </div>
          
          {/* Show stats if available */}
          {result.stats && (
            <div className="text-sm text-slate-400">
              <div className="flex items-center gap-4">
                <span>{result.stats.correctPercentage}% got this right</span>
                <span>•</span>
                <span>{result.stats.totalAnswers} total answers</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// New component for answered questions
interface AnsweredQuestionCardProps {
  question: QuestionWithAnswerStatus
}

function AnsweredQuestionCard({ question }: AnsweredQuestionCardProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diffInSeconds = Math.floor((now - timestamp) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const { userAnswer, correctAnswer, stats } = question

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-slate-200 mb-2">
            {question.questionText}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Answered {userAnswer ? formatTimeAgo(userAnswer.answeredAt) : ''}</span>
            {question.isMyQuestion && (
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                Your Question
              </span>
            )}
          </div>
        </div>
        
        {/* Result Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          userAnswer?.isCorrect 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {userAnswer?.isCorrect ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {userAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
        </div>
      </div>

      {/* Answer Choices with Results */}
      <div className="space-y-2 mb-4">
        {(['a', 'b', 'c', 'd'] as const).map((choice) => {
          const isUserChoice = userAnswer?.selectedAnswer === choice
          const isCorrectChoice = correctAnswer === choice
          
          let bgClass = 'bg-slate-900/50 border-slate-600/50'
          let textClass = 'text-slate-400'
          
          if (isCorrectChoice) {
            bgClass = 'bg-emerald-500/10 border-emerald-500/30'
            textClass = 'text-emerald-300'
          } else if (isUserChoice && !isCorrectChoice) {
            bgClass = 'bg-red-500/10 border-red-500/30'
            textClass = 'text-red-300'
          }
          
          return (
            <div
              key={choice}
              className={`flex items-center p-3 rounded-lg border ${bgClass}`}
            >
              <div className="flex items-center gap-2 mr-3">
                <span className="text-xs font-medium text-slate-500">
                  {choice.toUpperCase()}.
                </span>
                {isUserChoice && (
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  </div>
                )}
                {isCorrectChoice && (
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${textClass}`}>{question.choices[choice]}</span>
            </div>
          )
        })}
      </div>

      {/* Social Stats */}
      {stats && (
        <div className="border-t border-slate-700/50 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {stats.correctPercentage}% correct
              </span>
              <span>•</span>
              <span>{stats.totalAnswers} total answers</span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              stats.correctPercentage >= 80 
                ? 'bg-red-500/20 text-red-300' 
                : stats.correctPercentage >= 50 
                ? 'bg-yellow-500/20 text-yellow-300' 
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {stats.correctPercentage >= 80 ? 'Hard' : stats.correctPercentage >= 50 ? 'Medium' : 'Easy'}
            </div>
          </div>
          
          {/* Recent Answerers */}
          {stats.recentAnswerers.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-slate-500 mb-2">Recent answers:</div>
              <div className="flex items-center gap-2">
                {stats.recentAnswerers.slice(0, 5).map((answerer, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      answerer.isCorrect 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    <span>{answerer.userName.split(' ')[0]}</span>
                    {answerer.isCorrect ? '✓' : '✗'}
                  </div>
                ))}
                {stats.recentAnswerers.length > 5 && (
                  <span className="text-xs text-slate-500">+{stats.recentAnswerers.length - 5} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-slate-200 mb-2">Loading questions...</h3>
        <p className="text-slate-400">Finding the latest questions for you</p>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-900/20 border border-red-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-medium text-red-300 mb-3">Oops! Something went wrong</h3>
        <p className="text-red-400 text-base mb-8 leading-relaxed">{error}</p>
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-medium text-slate-200 mb-3">No Questions Yet</h3>
        <p className="text-slate-400 text-base mb-8 leading-relaxed">
          Be the first to create a question! Tap the ✚ button to get started and see how others perform.
        </p>
        <div className="flex justify-center items-center gap-2 text-sm text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Questions from the last 24 hours will appear here</span>
        </div>
      </div>
    </div>
  )
} 