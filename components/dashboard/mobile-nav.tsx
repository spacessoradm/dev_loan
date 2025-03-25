"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Settings, 
  Users, 
  BarChart,
  PieChart
} from "lucide-react"

interface MobileNavProps {
  role?: string | null
}

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false)
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="grid gap-2 text-lg font-medium">
          {filteredNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                pathname === item.href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              )}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

