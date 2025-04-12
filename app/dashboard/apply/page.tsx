"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { FileUploader } from "@/components/file-uploader"
import { v4 as uuidv4 } from "uuid"

export default function ApplyLoanPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [employmentStatus, setEmploymentStatus] = useState("")
  const [workplace, setWorkplace] = useState("")

  type Bank = {
    id: string;
    bank_name: string;
    status: boolean;
  };

  useEffect(() => {
    async function fetchBanks() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("banks").select("*").order("bank_name", { ascending: true });
        if (error) throw error;
        setBanks(data || []);
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast({ title: "Error", description: "Failed to load banks.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    fetchBanks();
  }, []);
  
  const handleBankChange = (bank: string) => {
    setSelectedBanks(prev => {
      if (prev.includes(bank)) {
        return prev.filter(b => b !== bank)
      } else {
        return [...prev, bank]
      }
    })
  }

  const handleFileChange = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleEmploymentChange = (value: string) => {
    setEmploymentStatus(value);
  }

  const handleWorkplaceChange = (value: string) => {
    setWorkplace(value);
  }

  const renderDocumentRequirements = () => {
    if (!employmentStatus || !workplace) return null;

    if (employmentStatus === "employed" && workplace === "malaysia") {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <h4 className="font-medium mb-2">Documents Required (For Private Employee):</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>IC</li>
            <li>Latest 3 month payslip</li>
            <li>EPF statement 2024 & 2025</li>
            <li>EA Form 2023 & 2024</li>
            <li>Borang BE 2023/2024</li>
            <li>Latest 3 months bank statement that match your salary payment</li>
            <li>Other personal saving/FD/shares/unit trust/ASNB (Whichever applicable)</li>
          </ol>
        </div>
      );
    } else if (employmentStatus === "self-employed" && workplace === "malaysia") {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <h4 className="font-medium mb-2">Documents Required (For Business Owner):</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>IC</li>
            <li>Borang B 2023 & 2024 (latest 2 year)</li>
            <li>Tax receipt 2023 & 2024 (latest 2 year)</li>
            <li>E lejar</li>
            <li>SSM</li>
            <li>Latest 6 months Biz current account</li>
            <li>Savings account, FD, Unit Trust, Shares, amamah saham, etc.</li>
          </ol>
        </div>
      );
    } else if (employmentStatus === "employed" && workplace === "singapore") {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <h4 className="font-medium mb-2">Documents Required:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Malaysia IC front back</li>
            <li>PR ID front back / working visa</li>
            <li>6 months latest payslips</li>
            <li>6 months latest bank statement</li>
            <li>Credit bureau report (Latest Date)</li>
            <li>2 years latest Income Tax statement</li>
            <li>Employment Verification letter</li>
            <li>Any Saving /FD /Investment</li>
          </ol>
        </div>
      );
    } else if (employmentStatus === "self-employed" && workplace === "singapore") {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <h4 className="font-medium mb-2">Documents Required (For Business Owner):</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Passport</li>
            <li>Singapore ID front back</li>
            <li>SG Income Tax NOA 2023, 2024</li>
            <li>6 months latest company bank statements</li>
            <li>ACRA/Company profile</li>
            <li>Latest audit report/management account for 2 years latest</li>
            <li>Any Saving /FD /Investment</li>
          </ol>
        </div>
      );
    }
    
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      //const applicationId = uuidv4()

      // Get user ID
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("No session found")
      }
      
      // Upload files to Supabase storage
      const docPaths = []
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${session?.user?.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)
          
        if (uploadError) {
          throw uploadError
        }
        
        docPaths.push(fileName)
      }
      
      
      // Generate a new UUID for each application
      const uniqueAppId = uuidv4();
        
      const { error } = await supabase.from('applications').insert({
        id: uniqueAppId,
        user_id: session.user.id,
        full_name: formData.get('full_name') as string,
        email: formData.get('email') as string,
        mobile: formData.get('mobile') as string,
        address: formData.get('address') as string,
        postal_code: formData.get('postal_code') as string,
        city: formData.get('city') as string,
        loan_type: 'home',
        loan_amount: 0,
        loan_tenure: 0,
        purpose: '',
        employment: formData.get('employment') as string,
        workplace: formData.get('workplace') as string,
        income: 0,
        bank: formData.get('bank') as string,
        status: 'pending',
        doc_paths: docPaths,
        created_at: new Date().toISOString()
      })
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully.",
      })
      
      router.push("/dashboard/loans")
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
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
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Loan Application Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" name="mobile" placeholder="Enter your mobile number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ic_number">IC Number</Label>
                  <Input id="ic_number" name="ic_number" placeholder="Enter your IC number" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" placeholder="Enter your address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input id="postal_code" name="postal_code" placeholder="Enter postal code" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="Enter city" required />
                </div>
              </div>
            </div>

            <div className="space-y-4" style={{ display: 'none' }}>
              <h3 className="text-lg font-medium">Loan Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loan_type">Loan Type</Label>
                  <Select name="loan_type">
                    <SelectTrigger id="loan_type">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Loan</SelectItem>
                      <SelectItem value="home">Home Loan</SelectItem>
                      <SelectItem value="car">Car Loan</SelectItem>
                      <SelectItem value="education">Education Loan</SelectItem>
                      <SelectItem value="business">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_amount">Loan Amount (RM)</Label>
                  <Input id="loan_amount" name="loan_amount" type="number" placeholder="Enter loan amount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_tenure">Loan Tenure (months)</Label>
                  <Input id="loan_tenure" name="loan_tenure" type="number" placeholder="Enter loan tenure" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Loan Purpose</Label>
                  <Textarea id="purpose" name="purpose" placeholder="Describe the purpose of your loan" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employment">Employment Status</Label>
                  <Select name="employment" required onValueChange={handleEmploymentChange}>
                    <SelectTrigger id="employment">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workplace">Workplace</Label>
                  <Select name="workplace" required onValueChange={handleWorkplaceChange}>
                    <SelectTrigger id="workplace">
                      <SelectValue placeholder="Select workplace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="malaysia">Malaysia</SelectItem>
                      <SelectItem value="singapore">Singapore</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2" style={{ display: 'none' }}>
                  <Label htmlFor="income">Monthly Income</Label>
                  <Input id="income" name="income" placeholder="Monthly income" />
                </div>
                {renderDocumentRequirements()}
              </div>
            </div>

            <div className="space-y-4" style={{ display: 'none' }}>
              <h3 className="text-lg font-medium">Preferred Banks</h3>
              {loading ? (
                <div className="h-10 flex items-center">Loading banks...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {banks.length === 0 ? (
                    <p className="text-gray-500">No banks available.</p>
                  ) : (
                    banks.map((bank) => (
                      <div key={bank.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={bank.id}
                          checked={selectedBanks.includes(bank.bank_name)}
                          onCheckedChange={() => handleBankChange(bank.bank_name)}
                        />
                        <Label htmlFor={bank.id}>{bank.bank_name}</Label>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedBanks.length === 0 && !loading && (
                <p className="text-sm text-red-500">Please select at least one bank</p>
              )}
            </div>

            <div className="space-y-2">
                  <Label htmlFor="bank">Preferred Bank</Label>
                  <Input id="bank" name="bank" placeholder="Preferred Bank" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Supporting Documents</h3>
              <div className="space-y-2">
                <Label>Upload Documents (PDF, JPG, PNG)</Label>
                <FileUploader 
                  onFilesSelected={handleFileChange}
                  acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                  maxFileSizeMB={10}
                  multiple={true}
                />
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

