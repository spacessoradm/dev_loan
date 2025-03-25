// This file centralizes all configuration values for the application

// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pbvigsmmzasgbuqgwwdt.supabase.co",
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBidmlnc21temFzZ2J1cWd3d2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NDk0NjUsImV4cCI6MjA1ODIyNTQ2NX0.wmy_nZtPqjLVyHFcfUHIMoSEYd3iaZ_NLDqfWbrIgfg",

  // Function to check if the config is using default values
  isConfigured: () => {
    // For debugging
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "...")

    // Simplified check - if we have values, consider it configured
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
}

// Application configuration
export const appConfig = {
  name: "Demo_Loan",
  description: "Check | Apply | Approve",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Theme colors
  theme: {
    primary: "#1e4388", // Blue
    accent: "#ffc107", // Yellow
  },
}

