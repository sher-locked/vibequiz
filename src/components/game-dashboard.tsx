'use client'

import { useState } from 'react'
import QuestionsFeed from '@/components/questions-feed'
import FloatingActionButton from '@/components/floating-action-button'
import QuestionCreationModal from '@/components/question-creation-modal'

interface GameDashboardProps {
  firstName: string
}

export default function GameDashboard({ firstName }: GameDashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleQuestionCreated = () => {
    // Trigger a refresh of the questions feed
    setRefreshTrigger(prev => prev + 1)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Welcome back, {firstName}!
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Create engaging questions, answer others&apos; questions, and see how you stack up against the community!
        </p>
      </div>

      {/* Main Game Interface - Feed First */}
      <div className="w-full">
        <QuestionsFeed refreshTrigger={refreshTrigger} />
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-blue-300">
            How It Works
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h4 className="font-medium text-slate-200">Create Questions</h4>
            <p className="text-sm text-slate-400">Write questions with 4 multiple choice answers</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-medium text-slate-200">Answer & Learn</h4>
            <p className="text-sm text-slate-400">Respond to questions from the last 24 hours</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-medium text-slate-200">See Results</h4>
            <p className="text-sm text-slate-400">Get instant feedback and community stats</p>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={openModal} />

      {/* Question Creation Modal */}
      <QuestionCreationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onQuestionCreated={handleQuestionCreated}
      />
    </div>
  )
} 