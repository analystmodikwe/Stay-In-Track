import React from 'react'
import { Header } from '../components/Header'

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" />
      <main className="px-screen py-4">
        <p className="text-body text-text-secondary">Dashboard</p>
      </main>
    </div>
  )
}

