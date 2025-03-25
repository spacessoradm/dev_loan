"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"

export default function ApplyLoanPage() {
  const [loading, setLoading] = useState(false)
  const [loanType, setLoanType] = useState("")
  const [loanAmount, setLoanAmount] = useState(5000)
  const [loanTerm, setLoanTerm] = useState(12)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      // Get form data
      const formData = new FormData(e.target as HTMLFormElement)
      const firstName = formData.get("firstName") as string
      const lastName = formData.get("lastName") as string
      const email = formData.get("email") as string
      const phone = formData.get("phone") as string
      const address = formData.get("address") as string
      const employment = formData.get("employment") as string
      const income = formData.get("income") as string
      const purpose = formData.get("purpose") as string

      // Insert loan application into database
      const { data, error } = await supabase
        .from("applications")
        .insert([
          {
            user_id: session.user.id,
            loan_type: loanType,
            loan_amount: loanAmount,
            loan_tenure: loanTerm,
            full_name: `${firstName} ${lastName}`,
            email: email,
            phone_number: phone,
            address_line1: address,
            employment_type: employment,
            monthly_income: income,
            purpose: purpose,
            status: "pending",
          },
        ])
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully.",
      })

      router.push("/dashboard/loans")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while submitting your application.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Apply for a Loan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Loan Application Form</CardTitle>
          <CardDescription>
            Please fill out the form below to apply for a loan. All fields are required.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Loan Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType} required>
                    <SelectTrigger id="loanType">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Loan</SelectItem>
                      <SelectItem value="auto">Auto Loan</SelectItem>
                      <SelectItem value="home">Home Loan</SelectItem>
                      <SelectItem value="education">Education Loan</SelectItem>
                      <SelectItem value="business">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Loan Purpose</Label>
                  <Input id="purpose" name="purpose" placeholder="Purpose of the loan" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="loanAmount">Loan Amount: RM {loanAmount.toLocaleString()}</Label>
                </div>
                <Slider
                  id="loanAmount"
                  min={1000}
                  max={2000000}
                  step={1000}
                  value={[loanAmount]}
                  onValueChange={(value) => setLoanAmount(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>RM 1,000</span>
                  <span>RM 2,000,000</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="loanTerm">Loan Term: {loanTerm} months</Label>
                </div>
                <Slider
                  id="loanTerm"
                  min={6}
                  max={420}
                  step={6}
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 months</span>
                  <span>420 months</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="First name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Last name" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Email address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="Phone number" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" placeholder="Your current address" required />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employment">Employment Status</Label>
                  <Select name="employment" required>
                    <SelectTrigger id="employment">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="self-employed">Self-employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income</Label>
                  <Input id="income" name="income" placeholder="Monthly income" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Preferred Bank</Label>
              <Select name="bank" required>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Select your preferred bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maybank">Maybank</SelectItem>
                  <SelectItem value="CIMB">CIMB</SelectItem>
                  <SelectItem value="Public Bank">Public Bank</SelectItem>
                  <SelectItem value="RHB">RHB</SelectItem>
                  <SelectItem value="Hong Leong Bank">Hong Leong Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

