import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getQuestionStats, getQuestion } from '@/lib/db'

// =============================================================================
// GET /api/questions/[id]/stats - Get question statistics
// =============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: questionId } = await params

    // Validate question ID
    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    // Check if question exists
    const question = await getQuestion(questionId)
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Get question statistics
    const stats = await getQuestionStats(questionId)
    if (!stats) {
      return NextResponse.json(
        { error: 'Unable to fetch question statistics' },
        { status: 500 }
      )
    }

    // Return formatted stats
    return NextResponse.json({
      success: true,
      questionId,
      questionText: question.questionText,
      stats: {
        totalAnswers: stats.totalAnswers,
        correctAnswers: stats.correctAnswers,
        incorrectAnswers: stats.totalAnswers - stats.correctAnswers,
        correctPercentage: stats.correctPercentage,
        accuracyRating: stats.correctPercentage >= 80 ? 'Easy' : 
                       stats.correctPercentage >= 50 ? 'Medium' : 'Hard',
        recentAnswerers: stats.recentAnswerers.map(answerer => ({
          userName: answerer.userName,
          isCorrect: answerer.isCorrect,
          timeAgo: formatTimeAgo(answerer.answeredAt)
        }))
      },
      meta: {
        createdBy: question.createdBy,
        createdAt: question.createdAt,
        timeAgo: formatTimeAgo(question.createdAt)
      }
    })

  } catch (error) {
    console.error('Error fetching question stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diffInSeconds = Math.floor((now - timestamp) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
} 