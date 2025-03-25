"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { XCircle, Eye } from "lucide-react"

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (userError) {
          throw userError
        }

        setUserRole(userData?.role)

        if (userData?.role !== "admin") {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this page",
            variant: "destructive",
          })
          return
        }

        // Fetch all loan applications
        const { data, error } = await supabase
          .from("loan_applications")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setApplications(data || [])
      } catch (error: any) {
        console.error("Error fetching applications:", error)
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application)
    setIsDialogOpen(true)
  }

  const handleApproveApplication = async (applicationId: string) => {
    if (userRole !== "admin") return

    setProcessingAction(true)
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("loan_applications")
        .update({ status: "approved" })
        .eq("id", applicationId)

      if (updateError) {
        throw updateError
      }

      // Get application details
      const { data: application, error: fetchError } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("id", applicationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Calculate interest rate (example: 5-10% based on loan type)
      const interestRateMap: Record<string, number> = {
        personal: 10,
        auto: 7,
        home: 5,
        education: 6,
        business: 8,
      }
      const interestRate = interestRateMap[application.loan_type] || 8

      // Calculate monthly payment
      const principal = application.loan_amount
      const monthlyInterestRate = interestRate / 100 / 12
      const numberOfPayments = application.loan_term
      const monthlyPayment =
        (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

      // Calculate start and end dates
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + application.loan_term)

      // Create loan record
      const { error: loanError } = await supabase.from("loans").insert([
        {
          user_id: application.user_id,
          application_id: applicationId,
          loan_type: application.loan_type,
          loan_amount: application.loan_amount,
          loan_term: application.loan_term,
          interest_rate: interestRate,
          monthly_payment: monthlyPayment,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
        },
      ])

      if (loanError) {
        throw loanError
      }

      // Update applications list
      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: "approved" } : app)))

      toast({
        title: "Application Approved",
        description: "The loan application has been approved successfully",
      })

      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error approving application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    if (userRole !== "admin") return

    setProcessingAction(true)
    try {
      const { error } = await supabase.from("loan_applications").update({ status: "rejected" }).eq("id", applicationId)

      if (error) {
        throw error
      }

      // Update applications list
      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: "rejected" } : app)))

      toast({
        title: "Application Rejected",
        description: "The loan application has been rejected",
      })

      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error rejecting application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Loan Applications</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Review and manage loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.first_name} {application.last_name}
                    </TableCell>
                    <TableCell className="capitalize">{application.loan_type}</TableCell>
                    <TableCell>{formatCurrency(application.loan_amount)}</TableCell>
                    <TableCell>{application.loan_term} months</TableCell>
                    <TableCell>{formatDate(application.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleViewApplication(application)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Applications</h3>
              <p className="text-muted-foreground">There are no loan applications to review at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApplication && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Loan Application Details</DialogTitle>
              <DialogDescription>Review the application details before making a decision</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Applicant Information</h3>
                  <p>
                    <span className="text-muted-foreground">Name:</span> {selectedApplication.first_name}{" "}
                    {selectedApplication.last_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {selectedApplication.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span> {selectedApplication.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Address:</span> {selectedApplication.address}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Loan Details</h3>
                  <p>
                    <span className="text-muted-foreground">Loan Type:</span> {selectedApplication.loan_type}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    {formatCurrency(selectedApplication.loan_amount)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Term:</span> {selectedApplication.loan_term} months
                  </p>
                  <p>
                    <span className="text-muted-foreground">Purpose:</span> {selectedApplication.purpose}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Financial Information</h3>
                <p>
                  <span className="text-muted-foreground">Employment Status:</span>{" "}
                  {selectedApplication.employment_status}
                </p>
                <p>
                  <span className="text-muted-foreground">Annual Income:</span> {selectedApplication.annual_income}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Application Status</h3>
                <p>
                  <span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedApplication.status)}
                </p>
                <p>
                  <span className="text-muted-foreground">Date Applied:</span>{" "}
                  {formatDate(selectedApplication.created_at)}
                </p>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {selectedApplication.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectApplication(selectedApplication.id)}
                    disabled={processingAction}
                  >
                    {processingAction ? "Processing..." : "Reject Application"}
                  </Button>
                  <Button onClick={() => handleApproveApplication(selectedApplication.id)} disabled={processingAction}>
                    {processingAction ? "Processing..." : "Approve Application"}
                  </Button>
                </>
              )}
              {selectedApplication.status !== "pending" && (
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

