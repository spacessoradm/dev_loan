import { supabaseConfig } from "@/lib/config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function ConfigWarning() {
  if (supabaseConfig.isConfigured()) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>
        <p>
          Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
          environment variables in your .env.local file.
        </p>
        <p className="mt-2">
          <Link href="/env-debug" className="underline">
            Click here to debug environment variables
          </Link>
        </p>
      </AlertDescription>
    </Alert>
  )
}

