"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CalculatorHeaderProps {
  title: string
  description: string
}

export function CalculatorHeader({ title, description }: CalculatorHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1e4388] to-[#0f2347] text-white py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#ffc107]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1e4388]/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      <div className="container relative mx-auto px-4">
        <Link 
          href="/"
          className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-xl text-white/80 max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  )
} 