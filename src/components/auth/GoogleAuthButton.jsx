import { Button } from '../ui/Button'

export const GoogleAuthButton = ({ onSuccess, onError, label = 'Continue with Google' }) => {
  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={() => {
        try {
          onSuccess()
        } catch {
          onError?.()
        }
      }}
    >
      {label}
    </Button>
  )
}
