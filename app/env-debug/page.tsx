import { EnvDebug } from "@/components/env-debug"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EnvDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <p className="mb-4">This page helps you diagnose issues with environment variables in your application.</p>

      <EnvDebug />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Make sure your .env.local file is in the root directory of your project</li>
          <li>Verify that the variable names are exactly NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>Restart your development server after making changes to .env.local</li>
          <li>Clear your browser cache or try in an incognito window</li>
          <li>Make sure there are no spaces around the = sign in your .env.local file</li>
        </ol>
      </div>

      <div className="mt-8">
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}

