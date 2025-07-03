import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submitAnswer } from '@/lib/db'
import type { AnswerChoice } from '@/lib/types'

// =============================================================================
// POST /api/questions/[id]/answer - Submit answer to a question
// =============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id || !session?.user?.name) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: questionId } = await params
    const userId = session.user.id
    const userName = session.user.name

    // Validate question ID
    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { selectedAnswer } = body

    // Validate selected answer
    if (!selectedAnswer || !['a', 'b', 'c', 'd'].includes(selectedAnswer)) {
      return NextResponse.json(
        { error: 'Selected answer must be one of: a, b, c, d' },
        { status: 400 }
      )
    }

    // Submit the answer
    const result = await submitAnswer(
      questionId,
      userId,
      userName,
      selectedAnswer as AnswerChoice
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    // Return success response with feedback and stats
    return NextResponse.json({
      success: true,
      isCorrect: result.isCorrect,
      message: result.message,
      feedback: {
        selectedAnswer,
        isCorrect: result.isCorrect,
        encouragement: result.isCorrect 
          ? "Great job! You got it right! 🎉" 
          : "Nice try! Every attempt makes you smarter! 💪"
      },
      stats: result.stats ? {
        totalAnswers: result.stats.totalAnswers,
        correctAnswers: result.stats.correctAnswers,
        correctPercentage: result.stats.correctPercentage,
        recentAnswerers: result.stats.recentAnswerers.slice(0, 5) // Limit to 5 for UI
      } : null
    })

  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 