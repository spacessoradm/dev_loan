"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/hooks/use-toast"
import { ConfigWarning } from "@/components/config-warning"
import { supabaseConfig } from "@/lib/config"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkSession()

    if (registered) {
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account before logging in.",
      })
    }
  }, [registered, router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("Profiles")
          .select("*")
          .eq("user_id", String(data.session.user.id))
        
        // If no profile exists, create one
        if (profileError && profileError.code === "PGRST116") {
          await supabase.from("Profiles").insert({
            user_id: data.session.user.id,
            email: data.session.user.email,
            role: "user",
            created_at: new Date().toISOString(),
          })
        }

        // Redirect to dashboard after successful login
        router.push("/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e4388] flex items-center justify-center px-4 py-12">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center space-x-2 text-white">
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
      </div>

      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <ConfigWarning />

            {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/90"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-[#1e4388] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/90"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#ffc107] hover:bg-[#e5ac00] text-black"
              disabled={loading || !supabaseConfig.isConfigured()}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#ffc107] hover:underline font-medium">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

