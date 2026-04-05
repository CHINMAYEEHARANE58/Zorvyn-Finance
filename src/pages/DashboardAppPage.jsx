import { useState } from 'react'
import { FinanceSidebar } from '../components/layout/FinanceSidebar'
import { PageTransition } from '../components/ui/PageTransition'
import { DashboardPage } from './DashboardPage'

export const DashboardAppPage = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <PageTransition>
      <div className="zorvyn-hero min-h-screen">
        <FinanceSidebar
          activeItem={activeItem}
          onSelect={setActiveItem}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="lg:ml-64">
          <div className="container-custom py-4 md:py-6">
            <DashboardPage
              activeSidebarItem={activeItem}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            />
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
