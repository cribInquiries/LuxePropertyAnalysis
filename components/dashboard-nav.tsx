"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  DollarSign,
  Home,
  Settings,
  TrendingUp,
  Wrench,
  Package,
  Sparkles,
  Building2,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Revenue", href: "#revenue", icon: DollarSign },
  { name: "Maintenance", href: "#maintenance", icon: Wrench },
  { name: "Setup Costs", href: "#setup", icon: Package },
  { name: "Value Add", href: "#value", icon: Sparkles },
  { name: "Portfolio", href: "#portfolio", icon: Building2 },
  { name: "Analytics", href: "#analytics", icon: BarChart3 },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:fixed md:top-0 md:left-0 md:h-screen md:w-64 md:flex md:flex-col md:bg-card md:border-r md:border-border md:z-40">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Luxe Analytics</h1>
            <p className="text-xs text-muted-foreground">Property Insights</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/" ? pathname === "/" : pathname.includes(item.href.slice(1))

              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </a>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" size="sm">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-foreground">Luxe Analytics</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-card">
            <div className="space-y-1 px-2 py-3">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = item.href === "/" ? pathname === "/" : pathname.includes(item.href.slice(1))

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </a>
                )
              })}
              <div className="pt-2 mt-2 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for mobile */}
      <div className="md:hidden h-14" />
    </>
  )
}
