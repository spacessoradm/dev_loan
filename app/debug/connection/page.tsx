"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseConfig } from "@/lib/config"

export default function ConnectionDebugPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setStatus("loading")
    setError(null)

    try {
      // Test 1: Check if Supabase URL is valid
      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return true
        } catch (e) {
          return false
        }
      }

      const results = {
        config: {
          url: supabaseConfig.url,
          isUrlValid: isValidUrl(supabaseConfig.url),
          hasAnonKey: !!supabaseConfig.anonKey,
          isConfigured: supabaseConfig.isConfigured(),
        },
        tests: {} as Record<string, any>,
      }

      // Test 2: Try to get session
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        results.tests.session = {
          success: !sessionError,
          error: sessionError ? sessionError.message : null,
          hasSession: !!sessionData.session,
        }
      } catch (e: any) {
        results.tests.session = {
          success: false,
          error: e.message,
          hasSession: false,
        }
      }

      // Test 3: Try to access Profiles table
      try {
        const { data, error: profilesError } = await supabase.from("Profiles").select("userId").limit(1)

        results.tests.profilesTable = {
          success: !profilesError,
          error: profilesError ? profilesError.message : null,
          data: data,
        }
      } catch (e: any) {
        results.tests.profilesTable = {
          success: false,
          error: e.message,
          data: null,
        }
      }

      // Test 4: Try to access profiles table (lowercase)
      try {
        const { data, error: profilesError } = await supabase.from("profiles").select("id").limit(1)

        results.tests.lowercaseProfilesTable = {
          success: !profilesError,
          error: profilesError ? profilesError.message : null,
          data: data,
        }
      } catch (e: any) {
        results.tests.lowercaseProfilesTable = {
          success: false,
          error: e.message,
          data: null,
        }
      }

      // Test 5: Try a raw query to check database connection
      try {
        const { data, error: rawError } = await supabase.rpc("get_system_time")

        results.tests.rawQuery = {
          success: !rawError,
          error: rawError ? rawError.message : null,
          data: data,
        }
      } catch (e: any) {
        results.tests.rawQuery = {
          success: false,
          error: e.message,
          data: null,
        }
      }

      setDetails(results)

      // Determine overall status
      const hasAnySuccess = Object.values(results.tests).some((test) => test.success)
      setStatus(hasAnySuccess ? "success" : "error")

      if (!hasAnySuccess) {
        setError("All connection tests failed. Please check your Supabase configuration.")
      }
    } catch (e: any) {
      setStatus("error")
      setError(`Failed to run connection tests: ${e.message}`)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Connection Debug</CardTitle>
          <CardDescription>This page tests your connection to Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status === "loading" ? (
              <div className="flex justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div
                  className={`p-4 rounded-md ${status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  <h3 className="text-lg font-medium">
                    {status === "success" ? "Connection Successful" : "Connection Failed"}
                  </h3>
                  {error && <p className="mt-2">{error}</p>}
                </div>

                {details && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium">Configuration</h3>
                      <pre className="mt-2 rounded bg-muted p-4 overflow-auto">
                        {JSON.stringify(details.config, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Test Results</h3>
                      <pre className="mt-2 rounded bg-muted p-4 overflow-auto">
                        {JSON.stringify(details.tests, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={status === "loading"}>
            {status === "loading" ? "Testing..." : "Run Tests Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

