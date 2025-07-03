'use client'

import { useState, useEffect } from 'react'
import CreateQuestionForm from '@/components/create-question-form'

interface QuestionCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onQuestionCreated: () => void
}

export default function QuestionCreationModal({ 
  isOpen, 
  onClose, 
  onQuestionCreated 
}: QuestionCreationModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Allow body scroll when modal is closed
      document.body.style.overflow = 'unset'
      // Delay hiding to allow for exit animation
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleQuestionCreated = () => {
    onQuestionCreated()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
        isOpen 
          ? 'bg-black/60 backdrop-blur-sm' 
          : 'bg-black/0 backdrop-blur-none pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-2xl max-h-[100vh] sm:max-h-[90vh] bg-slate-900 border-0 sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 overflow-y-auto ${
          isOpen
            ? 'transform translate-y-0 opacity-100 scale-100'
            : 'transform translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Create New Question</h2>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Share your knowledge with the community</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6">
          <CreateQuestionForm 
            onQuestionCreated={handleQuestionCreated}
            isModal={true}
          />
        </div>
      </div>
    </div>
  )
} 