"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Settings, 
  Users, 
  BarChart,
  PieChart
} from "lucide-react"

interface SidebarProps {
  role?: string | null
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  // Define navigation items based on user role
  const navItems = [
    {
      title: "Dashboard",
      href: role === "admin" ? "/dashboard/admin" : 
            role === "banker" ? "/dashboard/banker" : "/dashboard",
      icon: LayoutDashboard,
      roles: ["user", "admin", "banker"]
    },
    {
      title: "My Loans",
      href: "/dashboard/loans",
      icon: CreditCard,
      roles: ["user"]
    },
    {
      title: "Apply",
      href: "/dashboard/apply",
      icon: FileText,
      roles: ["user"]
    },
    {
      title: "Applications",
      href: "/dashboard/applications",
      icon: FileText,
      roles: ["banker", "admin"]
    },
    {
      title: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
      roles: ["admin"]
    },
    {
      title: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: BarChart,
      roles: ["admin"]
    },
    {
      title: "Reports",
      href: "/dashboard/admin/reports",
      icon: PieChart,
      roles: ["admin"]
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["user", "admin", "banker"]
    }
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(role || "user")
  )

  return (
    <div className="hidden border-r bg-gray-100/40 md:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {filteredNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  pathname === item.href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

