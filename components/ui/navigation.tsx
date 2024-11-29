'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserButton, useAuth, useClerk } from "@clerk/nextjs"
import { Home, Video, History, Settings, CreditCard, LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from './button'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Convert', href: '/convert', icon: Video },
  { name: 'History', href: '/dashboard', icon: History },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname()
  const { signOut } = useClerk()

  return (
    <nav className={cn("flex h-full flex-col justify-between", className)}>
      <div className="flex flex-col gap-4 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </div>
      <div className="flex flex-col gap-4 p-4 border-t">
        <div className="flex items-center gap-3 px-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-gray-500">Account</span>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2" 
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
