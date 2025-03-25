import { createClient } from "@supabase/supabase-js"
import type { Database } from "./supabase-types"
import { supabaseConfig } from "./config"

// Check if Supabase is configured
if (!supabaseConfig.isConfigured()) {
  console.warn(
    "⚠️ Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
  )
}

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Validate that URL is properly formatted
if (!isValidUrl(supabaseConfig.url)) {
  console.error(`Invalid Supabase URL format: ${supabaseConfig.url}`)
}

// Create the Supabase client with additional options
export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    fetch: (...args) => {
      // Add custom fetch with timeout
      return fetch(...args).catch((err) => {
        console.error("Supabase fetch error:", err)
        throw err
      })
    },
    headers: {
      "X-Client-Info": "loan-application-app",
    },
  },
  // Add more detailed error logging
  db: {
    schema: "public",
  },
  // Increase timeout for slow connections
  realtime: {
    timeout: 30000, // 30 seconds
  },
})

// Update the isSupabaseReachable function to be more robust
export async function isSupabaseReachable() {
  try {
    // First try Profiles table
    const { error: profilesError } = await supabase
      .from("Profiles")
      .select("userId", { count: "exact", head: true })
      .limit(1)

    if (!profilesError) {
      return true
    }

    // If that fails, try profiles table
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true }).limit(1)

    return !error
  } catch (error) {
    console.error("Error checking Supabase connection:", error)
    return false
  }
}

