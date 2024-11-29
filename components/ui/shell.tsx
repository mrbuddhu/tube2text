'use client'

import { Navigation } from "./navigation"
import { useAuth } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

export function Shell({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn } = useAuth()

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {isSignedIn && (
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <Navigation className="p-4" />
          </aside>
        )}
        <main className={cn(
          "relative py-6 px-4 md:px-6 lg:px-8",
          !isSignedIn && "col-span-2"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
