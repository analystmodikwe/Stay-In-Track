import React from 'react'
import { Header } from '../components/Header'
import { useNavigate } from 'react-router-dom'

export function MemberDetails() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background">
      <Header title="Member Details" onBack={() => navigate(-1)} />
      <main className="px-screen py-4">
        <p className="text-body text-text-secondary">Member Details</p>
      </main>
    </div>
  )
}

