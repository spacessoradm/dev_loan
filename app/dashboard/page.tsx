"use client";

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

const BASE_STORAGE_URL = "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/documents/"

export default function DashboardPage() {
  const supabase = createClientComponentClient()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!session) return

        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (userError) throw userError

        setUserRole(userData?.role)
        console.log(userData)

        // Role validation
        if (userData?.role !== "admin" && userData?.role !== "banker" && userData?.role !== "superadmin") {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this page",
            variant: "destructive",
          })
          return
        }

        // Fetch applications with status name (join)
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select(`
            *
          `)

        if (applicationsError) throw applicationsError

        console.log('here:', applicationsData)

        setApplications(applicationsData ?? [])
      } catch (error: any) {
        console.error("Error fetching data:", error.message)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (userRole === "banker") {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Banker dashboard coming soon.</p>
      </div>
    )
  }

  if (!userRole) return null

  const pendingLoans = applications.filter(app => app.status !== "4" && app.status !== "5").length;
  const totalLoanSize = applications
    .filter(app => app.status !== "5")
    .reduce((sum, app) => sum + Number(app.loan_amount || 0), 0);
  const followUpLoans = applications.filter(app => app.status === "6").length

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      {/* Render your dashboard cards here using pendingLoans, totalLoanSize, followUpLoans */}
      {/* Example: */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Total Applications</h3>
          <p>{applications.length}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Pending Loans</h3>
          <p>{pendingLoans}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Follow-up Loans</h3>
          <p>{followUpLoans}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Total Loan Size</h3>
          <p>{totalLoanSize}</p>
        </div>
      </div>
    </div>
  )
}

