"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function EnvDebug() {
  const [showVars, setShowVars] = useState(false)

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Environment Variables Debug</CardTitle>
        <CardDescription>Check if your environment variables are being loaded correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowVars(!showVars)}>{showVars ? "Hide Variables" : "Show Variables"}</Button>

        {showVars && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto">
            <h3 className="font-bold mb-2">NEXT_PUBLIC_* Variables:</h3>
            <pre className="text-xs">
              {Object.entries(process.env)
                .filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
                .map(([key, value]) => `${key}: ${key.includes("KEY") ? value?.substring(0, 10) + "..." : value}\n`)
                .join("")}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        <p>Note: Only NEXT_PUBLIC_* variables are accessible in the browser. Server-side variables won't show here.</p>
      </CardFooter>
    </Card>
  )
}

