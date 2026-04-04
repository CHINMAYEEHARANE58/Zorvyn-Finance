import { DashboardPage } from './DashboardPage'
import { PageTransition } from '../components/ui/PageTransition'

export const DashboardAppPage = () => {
  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <DashboardPage />
      </main>
    </PageTransition>
  )
}
