import { ConnectionTest } from "@/components/connection-test"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseConfig } from "@/lib/config"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Debug Tools</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <ConnectionTest />

        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>Current configuration and environment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Supabase Configuration</h3>
                <div className="mt-2 rounded-md bg-muted p-4">
                  <p className="text-sm font-mono break-all">
                    <span className="font-semibold">URL:</span> {supabaseConfig.url.substring(0, 8)}...
                  </p>
                  <p className="text-sm font-mono break-all">
                    <span className="font-semibold">Key:</span> {supabaseConfig.anonKey.substring(0, 8)}...
                  </p>
                  <p className="text-sm font-mono">
                    <span className="font-semibold">Configured:</span> {supabaseConfig.isConfigured() ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Browser Information</h3>
                <div className="mt-2 rounded-md bg-muted p-4">
                  <p className="text-sm">
                    <span className="font-semibold">User Agent:</span>{" "}
                    {typeof navigator !== "undefined" ? navigator.userAgent : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

