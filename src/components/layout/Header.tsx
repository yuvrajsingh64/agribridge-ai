"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname()
  
  // Format pathname to a readable title
  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "Dashboard"
    const segment = pathname.split("/")[1]
    if (!segment) return "Dashboard"
    
    // special cases
    if (segment === "produce") return "My Produce"
    if (segment === "buyers") return "Find Buyers"
    if (segment === "agent") return "AI Agent"
    if (segment === "activity") return "AI Activity"
    
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center text-xl font-semibold">
          {getPageTitle()}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon" className="relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          <div className="flex items-center gap-x-4">
            <Avatar className="h-8 w-8 cursor-pointer border">
              <AvatarImage src="" alt="Ramesh Kumar" />
              <AvatarFallback className="bg-primary/10 text-primary">RK</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-semibold leading-6 text-gray-900 lg:block">
              Ramesh Kumar
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
