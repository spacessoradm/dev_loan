"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/about",
      label: "About Us",
      active: pathname === "/about",
    },
  ]

  return (
    <nav className="hidden md:flex gap-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-white/80",
            route.active ? "text-white" : "text-white/70",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

