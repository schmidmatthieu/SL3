import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Unauthorized Access</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
