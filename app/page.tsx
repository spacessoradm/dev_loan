"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, ChevronDown, ArrowRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { SetupInstructions } from "@/components/setup-instructions"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

const images = [
  "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//slide_1.jpg",
  "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//slide_2.jpg",
  "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//slide_3.jpg",
  "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//slide_4.jpg",
]

const slides = [
  {
    url: "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//hero1.jpg",
    title: "Fast & Easy Loan Applications",
    description: "Get the financial support you need with our streamlined process"
  },
  {
    url: "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//hero2.jpg",
    title: "Competitive Interest Rates",
    description: "We offer some of the most competitive rates in the market"
  },
  {
    url: "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//hero3.jpg",
    title: "Flexible Payment Options",
    description: "Choose from various repayment plans that suit your needs"
  },
  {
    url: "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/home//hero4.jpg",
    title: "Quick Approval Process",
    description: "Get a decision on your loan application within hours"
  }
]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen flex-col" style={{fontFamily: 'Poppins'}}>
      {/* Move the hero section above the header */}
      {/* Hero Section */}
      <div className="embla relative h-screen" ref={emblaRef}>
        <div className="embla__container h-full">
          {slides.map((slide, index) => (
            <div key={index} className="embla__slide relative h-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.url})`,
                }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8">
                      {slide.description}
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        asChild
                        size="lg"
                        className="bg-[#ffc107] hover:bg-[#e5ac00] text-black"
                      >
                        <Link href="/register">Get Started</Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white hover:bg-white/10 text-white"
                        style={{ color: 'black' }}
                      >
                        <Link href="/about">Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header - Now positioned absolutely over the hero */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent text-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <svg viewBox="0 0 50 50" fill="white" className="h-8 w-8">
                <path
                  d="M25,2C12.3,2,2,12.3,2,25s10.3,23,23,23s23-10.3,23-23S37.7,2,25,2z M25,11c4.4,0,8,3.6,8,8s-3.6,8-8,8s-8-3.6-8-8
                S20.6,11,25,11z M25,43c-5.3,0-10.2-2.1-13.8-5.5c-0.6-0.6-0.9-1.3-0.9-2.1c0-4.1,3.3-7.4,7.4-7.4h14.7c4.1,0,7.4,3.3,7.4,7.4
                c0,0.8-0.3,1.5-0.9,2.1C35.2,40.9,30.3,43,25,43z"
                />
              </svg>
              <div>
                <div className="text-xl font-bold">Demo_Loan</div>
                <div className="text-xs">Check | Apply | Approve</div>
              </div>
            </Link>

            <div className="hidden md:flex">
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-white/80">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium transition-colors hover:text-white/80">
              Blog
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-white hover:text-white/80 hover:bg-transparent"
                >
                  <span>Calculator</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/calculators/loan" className="w-full">
                    Loan Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/calculators/refinance" className="w-full">
                    Refinance Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/calculators/legal-fee" className="w-full">
                    Legal Fee & Stamp Duty Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/calculators/dsr" className="w-full">
                    DSR Calculator
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="outline" className="text-black border-white hover:bg-white hover:text-[#1e4388]">
              <Link href="/login">Log in</Link>
            </Button>
          </nav>

          <Button className="md:hidden" variant="outline" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>
      <SetupInstructions />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1e4388] to-[#ffc107] bg-clip-text text-transparent">
              Your Credit Solutions in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover a smarter way to manage your loans with our comprehensive suite of tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#1e4388]/20 transition-all duration-300 hover:shadow-2xl">
              <div className="mb-6 relative">
                <div className="w-14 h-14 bg-[#1e4388]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1e4388] transition-colors duration-300">
                  <svg
                    className="w-7 h-7 text-[#1e4388] group-hover:text-white transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#1e4388] transition-colors duration-300">
                Quick Eligibility Check
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant feedback on your loan eligibility without impacting your credit score.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#1e4388]/20 transition-all duration-300 hover:shadow-2xl">
              <div className="mb-6">
                <div className="w-14 h-14 bg-[#1e4388]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1e4388] transition-colors duration-300">
                  <svg
                    className="w-7 h-7 text-[#1e4388] group-hover:text-white transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#1e4388] transition-colors duration-300">
                Competitive Rates
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access the best rates from multiple banks, all in one convenient platform.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#1e4388]/20 transition-all duration-300 hover:shadow-2xl">
              <div className="mb-6">
                <div className="w-14 h-14 bg-[#1e4388]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1e4388] transition-colors duration-300">
                  <svg
                    className="w-7 h-7 text-[#1e4388] group-hover:text-white transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#1e4388] transition-colors duration-300">
                Fast Approval
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get your loan approved quickly with our streamlined application process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1e4388] to-[#ffc107] bg-clip-text text-transparent">
              Explore Loan Options
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect financing solution tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Loan Type 1 - Home Loans */}
            <div className="group relative overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-500 ease-out">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e4388] to-[#1e4388]/80 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative p-8 transition-all duration-500 group-hover:translate-y-[-1rem]">
                <div className="mb-6 w-14 h-14 rounded-xl bg-[#1e4388]/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500">
                  <svg
                    className="w-7 h-7 text-[#1e4388] group-hover:text-white transition-colors duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-white transition-colors duration-500">
                  Home Loans
                </h3>
                <p className="text-gray-600 group-hover:text-white/80 transition-colors duration-500 mb-6">
                  Find the best mortgage rates for your dream home purchase or refinancing needs.
                </p>
                <Link 
                  href="/loans/home" 
                  className="inline-flex items-center text-[#1e4388] group-hover:text-white transition-colors duration-500"
                >
                  Learn more 
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Loan Type 2 - Auto Loans */}
            <div className="group relative overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-500 ease-out">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffc107] to-[#ffc107]/80 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative p-8 transition-all duration-500 group-hover:translate-y-[-1rem]">
                <div className="mb-6 w-14 h-14 rounded-xl bg-[#ffc107]/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500">
                  <svg
                    className="w-7 h-7 text-[#ffc107] group-hover:text-white transition-colors duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-white transition-colors duration-500">
                  Auto Loans
                </h3>
                <p className="text-gray-600 group-hover:text-white/80 transition-colors duration-500 mb-6">
                  Get competitive rates to finance your next vehicle purchase.
                </p>
                <Link 
                  href="/loans/auto" 
                  className="inline-flex items-center text-[#ffc107] group-hover:text-white transition-colors duration-500"
                >
                  Learn more 
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Loan Type 3 - Personal Loans */}
            <div className="group relative overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-500 ease-out">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e4388] to-[#1e4388]/80 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative p-8 transition-all duration-500 group-hover:translate-y-[-1rem]">
                <div className="mb-6 w-14 h-14 rounded-xl bg-[#1e4388]/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500">
                  <svg
                    className="w-7 h-7 text-[#1e4388] group-hover:text-white transition-colors duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-white transition-colors duration-500">
                  Personal Loans
                </h3>
                <p className="text-gray-600 group-hover:text-white/80 transition-colors duration-500 mb-6">
                  Flexible personal loans for your various financial needs.
                </p>
                <Link 
                  href="/loans/personal" 
                  className="inline-flex items-center text-[#1e4388] group-hover:text-white transition-colors duration-500"
                >
                  Learn more 
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Loan Type 4 - Business Loans */}
            <div className="group relative overflow-hidden rounded-2xl bg-white hover:shadow-2xl transition-all duration-500 ease-out">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffc107] to-[#ffc107]/80 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative p-8 transition-all duration-500 group-hover:translate-y-[-1rem]">
                <div className="mb-6 w-14 h-14 rounded-xl bg-[#ffc107]/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500">
                  <svg
                    className="w-7 h-7 text-[#ffc107] group-hover:text-white transition-colors duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-white transition-colors duration-500">
                  Business Loans
                </h3>
                <p className="text-gray-600 group-hover:text-white/80 transition-colors duration-500 mb-6">
                  Grow your business with our tailored financing solutions.
                </p>
                <Link 
                  href="/loans/business" 
                  className="inline-flex items-center text-[#ffc107] group-hover:text-white transition-colors duration-500"
                >
                  Learn more 
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Promo Section */}
      <section className="bg-gradient-to-br from-[#1e4388]/5 to-[#ffc107]/5 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="md:w-1/2 space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e4388] to-[#ffc107] bg-clip-text text-transparent">
                  Smart Financial Planning
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Make informed decisions with our suite of financial calculators. Estimate payments, check eligibility, and plan your future.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Calculator Stats - Animated on scroll */}
                <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#1e4388]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calculator className="w-6 h-6 text-[#1e4388]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1e4388]">5000+</div>
                      <div className="text-sm text-gray-600">Calculations Daily</div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#ffc107]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-[#ffc107]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#ffc107]">98%</div>
                      <div className="text-sm text-gray-600">Accuracy Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculator Types */}
              <div className="space-y-4 pt-6">
                <div className="group flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="w-10 h-10 bg-[#1e4388]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-5 h-5 text-[#1e4388]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1e4388] transition-colors duration-300">Loan Calculator</h3>
                    <p className="text-sm text-gray-600">Calculate EMI, interest rates, and loan terms</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#1e4388] group-hover:translate-x-2 transition-all duration-300" />
                </div>

                <div className="group flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="w-10 h-10 bg-[#ffc107]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-5 h-5 text-[#ffc107]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#ffc107] transition-colors duration-300">DSR Calculator</h3>
                    <p className="text-sm text-gray-600">Check your Debt Service Ratio instantly</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#ffc107] group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Right Content - Calculator Preview */}
            <div className="md:w-1/2">
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute -top-6 -right-6 w-72 h-72 bg-[#1e4388]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-[#ffc107]/5 rounded-full blur-3xl" />
                
                {/* Calculator Preview Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Loan Calculator</h3>
                      <Calculator className="w-6 h-6 text-[#1e4388]" />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Loan Amount</label>
                        <div className="mt-1 relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">RM</span>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e4388]/20 focus:border-[#1e4388] transition-all duration-300"
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600">Interest Rate (%)</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e4388]/20 focus:border-[#1e4388] transition-all duration-300"
                          placeholder="Enter rate"
                        />
                      </div>
                      
                      <Button className="w-full bg-[#1e4388] hover:bg-[#1e4388]/90 text-white transition-all duration-300">
                        Calculate Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e4388] to-[#0f2347] text-white py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#ffc107]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1e4388]/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          </div>
        </div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="group space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Ready to Transform Your
                <span className="block bg-gradient-to-r from-[#ffc107] to-white bg-clip-text text-transparent">
                  Financial Future?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Join thousands of satisfied customers who've found their perfect loan match with us.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="group/item">
                  <div className="text-3xl md:text-4xl font-bold text-[#ffc107] mb-2 group-hover/item:scale-110 transition-transform">
                    98%
                  </div>
                  <div className="text-sm text-gray-300">Approval Rate</div>
                </div>
                <div className="group/item">
                  <div className="text-3xl md:text-4xl font-bold text-[#ffc107] mb-2 group-hover/item:scale-110 transition-transform">
                    24/7
                  </div>
                  <div className="text-sm text-gray-300">Support Available</div>
                </div>
                <div className="group/item">
                  <div className="text-3xl md:text-4xl font-bold text-[#ffc107] mb-2 group-hover/item:scale-110 transition-transform">
                    50K+
                  </div>
                  <div className="text-sm text-gray-300">Happy Customers</div>
                </div>
                <div className="group/item">
                  <div className="text-3xl md:text-4xl font-bold text-[#ffc107] mb-2 group-hover/item:scale-110 transition-transform">
                    RM5B+
                  </div>
                  <div className="text-sm text-gray-300">Loans Processed</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  asChild
                  size="lg"
                  className="group relative bg-[#ffc107] hover:bg-[#ffc107]/90 text-black text-lg px-8 py-6 rounded-full overflow-hidden"
                >
                  <Link href="/register" className="flex items-center gap-2">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="group border-white/30 hover:border-white text-white text-lg px-8 py-6 rounded-full"
                >
                  <Link href="/about" className="flex items-center gap-2">
                    Learn More
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
          </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1729] text-white pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Company Info */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center space-x-2">
                <svg viewBox="0 0 50 50" fill="white" className="h-10 w-10">
                  <path d="M25,2C12.3,2,2,12.3,2,25s10.3,23,23,23s23-10.3,23-23S37.7,2,25,2z M25,11c4.4,0,8,3.6,8,8s-3.6,8-8,8s-8-3.6-8-8S20.6,11,25,11z M25,43c-5.3,0-10.2-2.1-13.8-5.5c-0.6-0.6-0.9-1.3-0.9-2.1c0-4.1,3.3-7.4,7.4-7.4h14.7c4.1,0,7.4,3.3,7.4,7.4c0,0.8-0.3,1.5-0.9,2.1C35.2,40.9,30.3,43,25,43z" />
                </svg>
            <div>
                  <div className="text-2xl font-bold">Demo_Loan</div>
                  <div className="text-sm text-gray-400">Check | Apply | Approve</div>
                </div>
              </Link>
              <p className="text-gray-400 max-w-xs">
                Transforming the way people access financial services through technology and innovation.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons with hover effects */}
                <a href="#" className="group p-2 bg-white/5 rounded-full hover:bg-[#ffc107]/20 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#ffc107] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="group p-2 bg-white/5 rounded-full hover:bg-[#ffc107]/20 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#ffc107] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="group p-2 bg-white/5 rounded-full hover:bg-[#ffc107]/20 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#ffc107] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.016 18.6c-.24.12-.48.24-.72.36-.961.481-1.922.962-2.883 1.442-.24.12-.48.12-.72 0-4.923-2.462-9.847-4.923-14.77-7.385-.24-.12-.24-.36 0-.48.24-.12.48-.24.72-.36.961-.481 1.922-.962 2.883-1.442.24-.12.48-.12.72 0 4.923 2.462 9.847 4.923 14.77 7.385.24.12.24.36 0 .48z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                {['About Us', 'Our Services', 'How It Works', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#" 
                      className="text-gray-400 hover:text-[#ffc107] transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      <span>{item}</span>
                  </Link>
                </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-4">
                {['Blog', 'Calculators', 'Help Center', 'Privacy Policy'].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#" 
                      className="text-gray-400 hover:text-[#ffc107] transition-colors flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      <span>{item}</span>
                    </Link>
                </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#ffc107] text-white placeholder-gray-500 transition-colors"
                  />
                </div>
                <Button className="w-full bg-[#ffc107] hover:bg-[#ffc107]/90 text-black transition-colors">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 Demo_Loan. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="#" className="text-gray-400 hover:text-[#ffc107] text-sm transition-colors">Terms of Service</Link>
                <Link href="#" className="text-gray-400 hover:text-[#ffc107] text-sm transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-[#ffc107] text-sm transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

