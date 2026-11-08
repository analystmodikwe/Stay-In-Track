import React from 'react'
import { Header } from '../components/Header'
import { TabBar } from '../components/TabBar'
import { SideMenu } from '../components/SideMenu'

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 tablet:pl-[240px]">
      <SideMenu role="admin" />
      <Header title="Dashboard" />
      <main className="flex-1 px-screen py-4 max-w-content w-full mx-auto">
        <p className="text-body text-text-secondary">Admin Dashboard (coming in Phase 7)</p>
      </main>
      <TabBar role="admin" />
    </div>
  )
}
