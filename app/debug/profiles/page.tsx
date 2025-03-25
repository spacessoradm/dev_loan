"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilesDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createResult, setCreateResult] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          setError(`Session error: ${sessionError.message}`)
          setLoading(false)
          return
        }

        setSession(sessionData.session)

        if (!sessionData.session) {
          setError("No active session. Please log in first.")
          setLoading(false)
          return
        }

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("*")
          .eq("user_id", sessionData.session.user.id)

        if (profileError) {
          setError(`Profile error: ${profileError.message}`)
        } else {
          setProfile(profileData && profileData.length > 0 ? profileData[0] : null)
        }
      } catch (err: any) {
        setError(`Unexpected error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const createProfile = async () => {
    if (!session) {
      setError("No active session. Please log in first.")
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("Profiles")
        .insert({
          user_id: session.user.id,
          email: session.user.email,
          role: "user",
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        setError(`Failed to create profile: ${error.message}`)
      } else {
        setCreateResult(data)

        // Refresh profile data
        const { data: profileData } = await supabase.from("Profiles").select("*").eq("user_id", session.user.id)

        setProfile(profileData && profileData.length > 0 ? profileData[0] : null)
      }
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profiles Table Debug</CardTitle>
          <CardDescription>This page helps diagnose issues with the Profiles table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Session Status</h3>
              <pre className="mt-2 rounded bg-muted p-4 overflow-auto">
                {session ? JSON.stringify(session, null, 2) : "No active session"}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium">Profile Status</h3>
              <pre className="mt-2 rounded bg-muted p-4 overflow-auto">
                {profile ? JSON.stringify(profile, null, 2) : "No profile found"}
              </pre>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                <h3 className="text-lg font-medium">Error</h3>
                <p>{error}</p>
              </div>
            )}

            {createResult && (
              <div className="rounded-md bg-green-100 p-4 text-green-800">
                <h3 className="text-lg font-medium">Profile Created</h3>
                <pre className="mt-2 overflow-auto">{JSON.stringify(createResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createProfile} disabled={loading || !!profile}>
            {profile ? "Profile Already Exists" : "Create Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

