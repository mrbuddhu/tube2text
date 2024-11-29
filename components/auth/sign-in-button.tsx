"use client"

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut } from 'lucide-react'

export function SignInButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signIn('google')}
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  )
}
