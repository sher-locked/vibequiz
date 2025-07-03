'use client'

import { useState } from 'react'
import type { AnswerChoice } from '@/lib/types'

interface CreateQuestionFormProps {
  onQuestionCreated?: () => void
  isModal?: boolean
}

export default function CreateQuestionForm({ onQuestionCreated, isModal = false }: CreateQuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    questionText: '',
    choices: {
      a: '',
      b: '',
      c: '',
      d: ''
    },
    correctAnswer: '' as AnswerChoice | ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create question')
      }

      // Success! 
      setShowSuccess(true)
      setFormData({
        questionText: '',
        choices: { a: '', b: '', c: '', d: '' },
        correctAnswer: ''
      })

      // Call parent callback
      onQuestionCreated?.()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateChoice = (choice: 'a' | 'b' | 'c' | 'd', value: string) => {
    setFormData(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [choice]: value
      }
    }))
  }

  const isFormValid = formData.questionText.trim().length >= 10 &&
    formData.choices.a.trim() &&
    formData.choices.b.trim() &&
    formData.choices.c.trim() &&
    formData.choices.d.trim() &&
    formData.correctAnswer

  return (
    <div className={isModal ? "" : "bg-slate-800 border border-slate-700 rounded-2xl p-6"}>
      {!isModal && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Create New Question</h2>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-emerald-300 font-medium">Question created successfully! 🎉</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label htmlFor="questionText" className="block text-sm font-medium text-slate-300 mb-2">
            Question Text <span className="text-red-400">*</span>
          </label>
          <textarea
            id="questionText"
            value={formData.questionText}
            onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))}
            placeholder="What's your question? (minimum 10 characters)"
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.questionText.length}/500 characters
          </p>
        </div>

        {/* Answer Choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['a', 'b', 'c', 'd'] as const).map((choice) => (
            <div key={choice}>
              <label htmlFor={`choice-${choice}`} className="block text-sm font-medium text-slate-300 mb-2">
                Choice {choice.toUpperCase()} <span className="text-red-400">*</span>
              </label>
              <input
                id={`choice-${choice}`}
                type="text"
                value={formData.choices[choice]}
                onChange={(e) => updateChoice(choice, e.target.value)}
                placeholder={`Enter choice ${choice.toUpperCase()}`}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={200}
              />
            </div>
          ))}
        </div>

        {/* Correct Answer Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Correct Answer <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['a', 'b', 'c', 'd'] as const).map((choice) => (
              <label
                key={choice}
                className={`relative flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.correctAnswer === choice
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="correctAnswer"
                  value={choice}
                  checked={formData.correctAnswer === choice}
                  onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value as AnswerChoice }))}
                  className="sr-only"
                />
                <span className="font-medium">Choice {choice.toUpperCase()}</span>
                {formData.correctAnswer === choice && (
                  <svg className="w-4 h-4 ml-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isFormValid && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
              : 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Question
            </>
          )}
        </button>
      </form>
    </div>
  )
} 