"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SessionDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const supabase = createClientComponentClient({
    options: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  const checkSession = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError(error.message)
      } else {
        setSession(data.session)
        setError(null)
      }
    } catch (err) {
      setError(`Failed to check session: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        setError(error.message)
      } else {
        setSession(data.session)
        setError(null)
        setRefreshCount((prev) => prev + 1)
      }
    } catch (err) {
      setError(`Failed to refresh session: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()

    const interval = setInterval(() => {
      checkSession()
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Session Debug</CardTitle>
          <CardDescription>This page helps diagnose session-related issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Session Status</h3>
              <span
                className={`px-2 py-1 rounded text-sm ${session ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {session ? "Active" : "Not Active"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">{error}</div>
            ) : session ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">User ID:</div>
                  <div className="font-mono text-sm">{session.user.id}</div>

                  <div className="font-medium">Email:</div>
                  <div>{session.user.email}</div>

                  <div className="font-medium">Created At:</div>
                  <div>{new Date(session.user.created_at).toLocaleString()}</div>

                  <div className="font-medium">Expires At:</div>
                  <div>{new Date(session.expires_at * 1000).toLocaleString()}</div>

                  <div className="font-medium">Refresh Count:</div>
                  <div>{refreshCount}</div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Token Information</h4>
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                    <pre>
                      {JSON.stringify(
                        {
                          access_token_length: session.access_token?.length || 0,
                          refresh_token_length: session.refresh_token?.length || 0,
                          provider_token: session.provider_token ? "Present" : "Not Present",
                          provider_refresh_token: session.provider_refresh_token ? "Present" : "Not Present",
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-700">
                No active session found. Please log in.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={checkSession} disabled={loading}>
            Check Session
          </Button>
          <Button onClick={refreshSession} disabled={loading || !session}>
            Refresh Session
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check if your session is active. If not, try logging in again.</li>
              <li>If your session expires quickly, there might be an issue with your Supabase configuration.</li>
              <li>Try refreshing your session using the button above.</li>
              <li>Clear your browser cookies and cache, then log in again.</li>
              <li>Check your network connection and ensure Supabase is reachable.</li>
              <li>Verify that your environment variables are correctly set.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

