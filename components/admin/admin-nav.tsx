"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/sessions", label: "Sessions" },
    { href: "/admin/codes", label: "Codes" },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="border-b border-black/5 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center gap-2">
              <Link href="/admin" className="text-lg font-light tracking-tight text-foreground hover:opacity-70 transition-opacity">
                Tarot <span className="font-medium">Admin</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "border-black text-foreground"
                      : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View Site
              </Button>
            </Link>
            <form action="/api/admin/logout" method="POST"> 
               <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Logout</Button>
            </form>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 text-muted-foreground hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isOpen && (
        <div className="sm:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl">
          <div className="space-y-1 pb-3 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors",
                  isActive(link.href)
                    ? "border-black bg-black/[0.02] text-foreground"
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-black/5 pb-3 pt-4">
            <div className="space-y-1">
              <Link
                href="/"
                className="block px-4 py-2 text-base font-medium text-muted-foreground hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setIsOpen(false)}
              >
                View Site
              </Link>
              <form action="/api/admin/logout" method="POST" className="w-full">
                <button
                  type="submit"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
