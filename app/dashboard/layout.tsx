"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Sidebar } from "@/components/dashboard/sidebar"
import { UserNav } from "@/components/dashboard/user-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>("user")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Use a ref to track if we're already checking the user to prevent multiple simultaneous checks
  const isCheckingUser = useRef(false)
  // Use a ref to track if we've completed the initial auth check
  const initialAuthCheckComplete = useRef(false)
  // Store the session in a ref to prevent it from being lost
  const sessionRef = useRef<any>(null)

  // Function to log session details for debugging
  const logSessionDetails = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      console.log("Current session state:", {
        hasSession: !!data.session,
        expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        user: data.session?.user?.id,
        now: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging session details:", error)
    }
  }

  useEffect(() => {
    // Skip if we're already checking
    if (isCheckingUser.current) return

    const checkUser = async () => {
      // Set the flag to prevent multiple simultaneous checks
      isCheckingUser.current = true

      try {
        console.log("Checking user session...")
        await logSessionDetails()

        // Wrap the session fetch in a try-catch to handle network errors
        let session
        try {
          const { data, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            console.error("Session error:", sessionError)
            setError(`Failed to get session: ${sessionError.message}`)
            setLoading(false)
            isCheckingUser.current = false
            return
          }

          session = data.session
          // Store the session in the ref
          sessionRef.current = session
        } catch (fetchError: unknown) {
          console.error("Failed to fetch session:", fetchError)
          const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
          setError(`Network error when fetching session: ${errorMessage}`)
          setLoading(false)
          isCheckingUser.current = false
          return
        }

        if (!session) {
          console.log("No session found, checking for stored session...")

          // Try to recover from stored session if available
          if (sessionRef.current) {
            console.log("Using stored session reference")
            session = sessionRef.current
          } else {
            console.log("No stored session, redirecting to login")
            router.push("/login")
            isCheckingUser.current = false
            return
          }
        }

        console.log("Session found, user ID:", session.user.id)

        // Get profile from Profiles table with user_id field
        try {
          console.log("Fetching profile...")
          const { data: profileData, error: profileError } = await supabase
            .from("Profiles")
            .select("*")
            .eq("user_id", session.user.id)

          console.log("Profile query result:", { data: profileData, error: profileError })

          if (profileError) {
            console.error("Error fetching profile:", profileError)
            setError(`Failed to fetch user profile: ${profileError.message}`)
            setLoading(false)
            isCheckingUser.current = false
            return
          }

          // If profile exists, use it
          if (profileData && profileData.length > 0) {
            const profile = profileData[0]
            console.log("Found profile:", profile)

            // Only update state if it's different to prevent unnecessary re-renders
            if (
              userRole !== (profile.role || "user") ||
              user?.first_name !== (profile.f_name || "") ||
              user?.last_name !== (profile.l_name || "")
            ) {
              setUserRole(profile.role || "user")
              setUser({
                ...session.user,
                first_name: profile.f_name || "",
                last_name: profile.l_name || "",
              })
            }
          } else {
            // No profile exists, create one
            console.log("No profile found, creating one...")
            const { error: insertError } = await supabase.from("Profiles").insert({
              user_id: session.user.id,
              email: session.user.email,
              role: "user",
              created_at: new Date().toISOString(),
            })

            if (insertError) {
              console.error("Error creating profile:", insertError)
              setError(`Failed to create user profile: ${insertError.message}`)
              setLoading(false)
              isCheckingUser.current = false
              return
            }

            // Set default role and user info
            setUserRole("user")
            setUser({
              ...session.user,
              first_name: "",
              last_name: "",
            })
          }
        } catch (profileError: unknown) {
          console.error("Error in profile operations:", profileError)
          const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
          setError(`Error in profile operations: ${errorMessage}`)
          setLoading(false)
          isCheckingUser.current = false
          return
        }

        setLoading(false)
        // Mark initial auth check as complete
        initialAuthCheckComplete.current = true
      } catch (err: unknown) {
        console.error("Unexpected error:", err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`An unexpected error occurred: ${errorMessage}`)
        setLoading(false)
      } finally {
        // Reset the flag when done
        isCheckingUser.current = false
      }
    }

    checkUser()

    // Set up auth state change listener only once
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, "Session:", !!session)

      // Log detailed session info
      logSessionDetails()

      if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to login")
        // Clear the session ref
        sessionRef.current = null
        router.push("/login")
      } else if (event === "SIGNED_IN") {
        console.log("User signed in, updating session ref")
        // Update the session ref
        sessionRef.current = session

        // Only reload if we haven't completed the initial auth check
        if (!initialAuthCheckComplete.current) {
          console.log("Initial auth not complete, running check")
          checkUser()
        }
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed, updating session ref")
        // Update the session ref
        sessionRef.current = session
      }
    })

    // Set up a periodic session check to prevent session loss
    const intervalId = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          // Update the session ref
          sessionRef.current = data.session
        } else if (sessionRef.current) {
          // If we have a stored session but Supabase doesn't, try to recover
          console.log("Session lost but ref exists, attempting recovery...")
          await supabase.auth.setSession({
            access_token: sessionRef.current.access_token,
            refresh_token: sessionRef.current.refresh_token,
          })
        }
      } catch (error) {
        console.error("Error in session check interval:", error)
      }
    }, 60000) // Check every minute

    return () => {
      subscription.unsubscribe()
      clearInterval(intervalId)
    }
  }, [router, supabase]) // Only re-run if router or supabase client changes

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p>{error}</p>
          <div className="mt-4">
            <button
              onClick={async () => {
                try {
                  // Try to refresh the session
                  const { error } = await supabase.auth.refreshSession()
                  if (error) {
                    console.error("Error refreshing session:", error)
                  } else {
                    // Reload the page
                    window.location.reload()
                  }
                } catch (error) {
                  console.error("Error in refresh button:", error)
                }
              }}
              className="mr-4 rounded-md bg-secondary px-4 py-2 text-secondary-foreground"
            >
              Refresh Session
            </button>
            <button
              onClick={() => router.push("/login")}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <MobileNav role={userRole} />
            <h1 className="text-lg font-semibold">LoanEase Dashboard</h1>
          </div>
          <UserNav user={user} />
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar role={userRole} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

