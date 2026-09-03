"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sprout,
  LayoutDashboard,
  Wheat,
  Users,
  ShoppingCart,
  ArrowRightLeft,
  Bot,
  BarChart3,
  ActivitySquare,
  UserCircle,
  Menu,
  X
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Produce", href: "/produce", icon: Wheat },
  { name: "Find Buyers", href: "/buyers", icon: Users },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "AI Agent", href: "/agent", icon: Bot },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Activity", href: "/activity", icon: ActivitySquare },
  { name: "Profile", href: "/profile", icon: UserCircle },
]

interface SidebarProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1a472a] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-[#d4a843]" />
            <span className="text-xl font-bold tracking-tight">AgriBridge AI</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-white lg:hidden hover:bg-white/10 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 shrink-0",
                    isActive ? "text-[#d4a843]" : "text-gray-400 group-hover:text-gray-300"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center rounded-lg bg-black/20 p-3">
            <Badge className="bg-[#d4a843] text-black hover:bg-[#c29837] border-none font-semibold shadow-none">
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>
    </>
  )
}
