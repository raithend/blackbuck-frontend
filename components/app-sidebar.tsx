"use client"

import { Home, Search, Users, Heart, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "ホーム",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "検索",
    icon: Search,
    href: "/search",
    color: "text-violet-500",
  },
  {
    label: "フォロー",
    icon: Users,
    href: "/follow",
    color: "text-pink-700",
  },
  {
    label: "いいね",
    icon: Heart,
    href: "/likes",
    color: "text-orange-700",
  },
  {
    label: "設定",
    icon: Settings,
    href: "/settings",
    color: "text-emerald-500",
  },
  {
    label: "プロフィール",
    icon: User,
    href: "/profile",
    color: "text-blue-700",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-sm font-medium p-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition",
                pathname === route.href ? "bg-accent" : "transparent"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              <p>{route.label}</p>
            </Link>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  )
} 