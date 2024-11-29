import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href: string
  active?: boolean
}

export function Breadcrumb({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" aria-hidden="true" />
            )}
            <Link
              href={item.href}
              className={`inline-flex items-center text-sm font-medium ${
                item.active
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-primary hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
