import { Button } from '../ui/Button'

export const AdminFab = ({ onClick }) => {
  return (
    <div className="fixed bottom-5 right-5 z-30 md:bottom-8 md:right-8">
      <Button
        variant="primary"
        onClick={onClick}
        className="h-14 w-14 rounded-full p-0 text-2xl shadow-xl"
        aria-label="Add transaction"
      >
        +
      </Button>
    </div>
  )
}
