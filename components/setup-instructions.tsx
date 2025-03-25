"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabaseConfig } from "@/lib/config"

export function SetupInstructions() {
  const [copied, setCopied] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Check if Supabase is configured
  useEffect(() => {
    setIsVisible(!supabaseConfig.isConfigured())
  }, [])

  // Hide the component if Supabase is configured
  if (!isVisible) {
    return null
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const envFileContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Setup Required</AlertTitle>
        <AlertDescription>
          Your application is not fully configured. Please follow the instructions below to set up Supabase.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to configure your application with Supabase authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="local">
            <TabsList className="mb-4">
              <TabsTrigger value="local">Local Development</TabsTrigger>
              <TabsTrigger value="vercel">Vercel Deployment</TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Create a Supabase Project</h3>
                <p className="text-sm text-muted-foreground">
                  If you haven&apos;t already, create a new project on{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    Supabase <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Get Your API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Go to Project Settings &gt; API and copy your project URL and anon key.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Create a .env.local File</h3>
                <p className="text-sm text-muted-foreground">
                  Create a .env.local file in the root of your project with the following content:
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">{envFileContent}</pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(envFileContent, "env")}
                  >
                    {copied === "env" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. Restart Your Development Server</h3>
                <p className="text-sm text-muted-foreground">
                  After creating the .env.local file, restart your development server for the changes to take effect.
                </p>
                <div className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                  <code>npm run dev</code>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vercel" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Create a Supabase Project</h3>
                <p className="text-sm text-muted-foreground">
                  If you haven&apos;t already, create a new project on{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    Supabase <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Get Your API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Go to Project Settings &gt; API and copy your project URL and anon key.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Add Environment Variables to Vercel</h3>
                <p className="text-sm text-muted-foreground">
                  Go to your Vercel project settings, navigate to the Environment Variables section, and add:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL
                  </li>
                  <li>
                    <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon key
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. Redeploy Your Application</h3>
                <p className="text-sm text-muted-foreground">
                  After adding the environment variables, redeploy your application for the changes to take effect.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsVisible(false)}>
            Dismiss
          </Button>
          <Button asChild>
            <a
              href="https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase Docs <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

