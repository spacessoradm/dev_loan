"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ConfigWarning } from "@/components/config-warning"
import { supabaseConfig } from "@/lib/config"
import { isSupabaseReachable } from "@/lib/supabase"
import { AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check Supabase connection on component mount
  useEffect(() => {
    async function checkConnection() {
      try {
        const isReachable = await isSupabaseReachable()
        setConnectionStatus(isReachable ? "connected" : "error")
      } catch (error) {
        console.error("Connection check error:", error)
        setConnectionStatus("error")
      }
    }

    if (supabaseConfig.isConfigured()) {
      checkConnection()
    } else {
      setConnectionStatus("error")
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Check connection status
    if (connectionStatus !== "connected") {
      setError("Cannot connect to Supabase. Please check your internet connection and Supabase configuration.")
      setLoading(false)
      return
    }

    try {
      // Register the user with timeout
      const registerPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Registration request timed out")), 10000),
      )

      // Race the promises
      const { data: authData, error: authError } = (await Promise.race([
        registerPromise,
        timeoutPromise.then(() => {
          throw new Error("Request timed out")
        }),
      ])) as any

      if (authError) {
        throw authError
      }

      // Update the profile with first and last name
      if (authData?.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error updating profile:", profileError)
          }
        } catch (profileError) {
          console.error("Exception updating profile:", profileError)
        }
      }

      // Show success message and redirect to login
      router.push("/login?registered=true")
    } catch (error: any) {
      console.error("Registration error:", error)

      // Provide more specific error messages
      if (error.message?.includes("fetch")) {
        setError(
          "Network error: Unable to connect to the authentication service. Please check your internet connection.",
        )
      } else if (error.message?.includes("timeout")) {
        setError("Request timed out. The server took too long to respond.")
      } else {
        setError(error.message || "An error occurred during registration")
      }
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
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your information to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <ConfigWarning />

            {connectionStatus === "error" && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Connection Issue</p>
                  <p>Cannot connect to Supabase. Please check your internet connection and Supabase configuration.</p>
                </div>
              </div>
            )}

            {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="bg-white/90"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  className="bg-white/90"
                />
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/90"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#ffc107] hover:bg-[#e5ac00] text-black"
              disabled={loading || connectionStatus !== "connected"}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ffc107] hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

