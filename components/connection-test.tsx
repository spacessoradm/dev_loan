"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isSupabaseReachable } from "@/lib/supabase"
import { supabaseConfig } from "@/lib/config"
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"

export function ConnectionTest() {
  const [testResults, setTestResults] = useState<{
    configCheck: boolean | null
    urlCheck: boolean | null
    connectionCheck: boolean | null
    authCheck: boolean | null
    error: string | null
  }>({
    configCheck: null,
    urlCheck: null,
    connectionCheck: null,
    authCheck: null,
    error: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    setTestResults({
      configCheck: null,
      urlCheck: null,
      connectionCheck: null,
      authCheck: null,
      error: null,
    })

    try {
      // Check if config is set
      const configCheck = supabaseConfig.isConfigured()
      setTestResults((prev) => ({ ...prev, configCheck }))

      // Check URL format
      let urlCheck = false
      try {
        new URL(supabaseConfig.url)
        urlCheck = true
      } catch (e) {
        urlCheck = false
      }
      setTestResults((prev) => ({ ...prev, urlCheck }))

      // Check connection
      const connectionCheck = await isSupabaseReachable()
      setTestResults((prev) => ({ ...prev, connectionCheck }))

      // Check auth service
      try {
        const { error } = await supabase.auth.getSession()
        const authCheck = !error
        setTestResults((prev) => ({ ...prev, authCheck }))
      } catch (error) {
        setTestResults((prev) => ({ ...prev, authCheck: false }))
      }
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        error: error.message || "An unknown error occurred",
      }))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    if (status === true) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Supabase Connection Diagnostics
        </CardTitle>
        <CardDescription>Use this tool to diagnose connection issues with Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {testResults.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">{testResults.error}</div>
          )}

          <div className="flex items-center justify-between py-2 border-b">
            <span>Environment Variables Configured</span>
            <StatusIcon status={testResults.configCheck} />
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <span>Valid Supabase URL Format</span>
            <StatusIcon status={testResults.urlCheck} />
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <span>Supabase Connection</span>
            <StatusIcon status={testResults.connectionCheck} />
          </div>

          <div className="flex items-center justify-between py-2">
            <span>Authentication Service</span>
            <StatusIcon status={testResults.authCheck} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={runTests} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Run Tests Again"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

