import { useState } from 'react'
import { FinanceSidebar } from '../components/layout/FinanceSidebar'
import { PageTransition } from '../components/ui/PageTransition'
import { DashboardPage } from './DashboardPage'

export const DashboardAppPage = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950">
        <FinanceSidebar
          activeItem={activeItem}
          onSelect={setActiveItem}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="px-4 py-4 md:px-6 md:py-6 lg:ml-64">
          <DashboardPage
            activeSidebarItem={activeItem}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        </main>
      </div>
    </PageTransition>
  )
}
