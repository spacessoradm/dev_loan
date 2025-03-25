import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if profiles table exists
    const { error: profilesError } = await supabase.from("profiles").select("id").limit(1)

    // Check if Profiles table exists
    const { error: ProfilesError } = await supabase.from("Profiles").select("userId").limit(1)

    let tableToUse = null

    // Create the appropriate table if neither exists
    if (profilesError && ProfilesError) {
      // Create profiles table (lowercase)
      const { error: createError } = await supabase.rpc("setup_profiles_table")

      if (createError) {
        // If RPC fails, try direct SQL
        await supabase.rpc("execute_sql", {
          sql: `
          CREATE TABLE IF NOT EXISTS Profiles (
            userId UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            f_name TEXT,
            l_name TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own Profile"
            ON profiles FOR SELECT
            USING (auth.uid() = id);
          
          CREATE POLICY "Users can update their own Profile"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);
          `,
        })

        tableToUse = "Profiles"
      }
    } else if (!profilesError) {
      tableToUse = "profiles"
    } else if (!ProfilesError) {
      tableToUse = "Profiles"
    }

    return NextResponse.json({
      success: true,
      profilesTableExists: !profilesError,
      ProfilesTableExists: !ProfilesError,
      tableToUse,
    })
  } catch (error) {
    console.error("Error in setup-db route:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

