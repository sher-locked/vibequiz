import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createQuestion, getRecentQuestions, getUserAnswersForQuestions, getQuestionStats } from '@/lib/db'
import type { AnswerChoice } from '@/lib/types'

// =============================================================================
// POST /api/questions - Create new question
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { questionText, choices, correctAnswer } = body

    // Validate required fields
    if (!questionText || !choices || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: questionText, choices, correctAnswer' },
        { status: 400 }
      )
    }

    // Validate question text
    if (typeof questionText !== 'string' || questionText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Question text must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // Validate choices structure
    if (!choices.a || !choices.b || !choices.c || !choices.d) {
      return NextResponse.json(
        { error: 'All four choices (a, b, c, d) are required' },
        { status: 400 }
      )
    }

    // Validate each choice length
    const choiceValues = [choices.a, choices.b, choices.c, choices.d]
    for (const choice of choiceValues) {
      if (typeof choice !== 'string' || choice.trim().length < 1) {
        return NextResponse.json(
          { error: 'All choices must be non-empty strings' },
          { status: 400 }
        )
      }
    }

    // Validate correct answer
    if (!['a', 'b', 'c', 'd'].includes(correctAnswer)) {
      return NextResponse.json(
        { error: 'Correct answer must be one of: a, b, c, d' },
        { status: 400 }
      )
    }

    // Additional validation: prevent duplicate choices
    const uniqueChoices = new Set(choiceValues.map(c => c.trim().toLowerCase()))
    if (uniqueChoices.size < 4) {
      return NextResponse.json(
        { error: 'All choices must be unique' },
        { status: 400 }
      )
    }

    // Create the question
    const question = await createQuestion(
      questionText,
      {
        a: choices.a,
        b: choices.b,
        c: choices.c,
        d: choices.d
      },
      correctAnswer as AnswerChoice,
      session.user.id
    )

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Question created successfully! 🎉',
      question: {
        id: question.id,
        questionText: question.questionText,
        choices: question.choices,
        createdAt: question.createdAt,
        totalAnswers: question.totalAnswers,
        correctAnswers: question.correctAnswers
        // Note: We don't return correctAnswer to the client for security
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =============================================================================
// GET /api/questions - Get recent questions (last 24 hours)
// =============================================================================
export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get recent questions (now includes all questions, not filtered by answers)
    const questions = await getRecentQuestions()

    // Get user's answers for all these questions efficiently
    const questionIds = questions.map(q => q.id)
    const userAnswers = await getUserAnswersForQuestions(userId, questionIds)

    // Format questions for client with answer status
    const formattedQuestions = await Promise.all(
      questions.map(async question => {
        const userAnswer = userAnswers.get(question.id)
        const isAnswered = !!userAnswer
        
        // Get fresh stats for each question
        const stats = await getQuestionStats(question.id)
        
        return {
          id: question.id,
          questionText: question.questionText,
          choices: question.choices,
          createdAt: question.createdAt,
          totalAnswers: question.totalAnswers,
          correctAnswers: question.correctAnswers,
          createdBy: question.createdBy,
          // Determine if this user created the question
          isMyQuestion: question.createdBy === userId,
          // Include answer status and data
          isAnswered,
          userAnswer: userAnswer ? {
            selectedAnswer: userAnswer.selectedAnswer,
            isCorrect: userAnswer.isCorrect,
            answeredAt: userAnswer.answeredAt
          } : null,
          // Include correct answer only if user has answered
          correctAnswer: isAnswered ? question.correctAnswer : undefined,
          // Include stats for answered questions
          stats: isAnswered ? stats : null
        }
      })
    )

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      count: formattedQuestions.length
    })

  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 