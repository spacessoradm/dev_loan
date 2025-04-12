"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Eye, Download, X, Upload } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { FileUploader } from "@/components/file-uploader"

type Application = {
  id: string
  loan_type: string
  loan_amount: number
  loan_tenure: number
  status: string
  created_at: string
  purpose: string
  full_name?: string
  email?: string
  mobile?: string
  address?: string
  employment?: string
  workplace?: string
  income?: number
  bank?: string
  doc_paths?: string[]
  postal_code?: string
  city?: string
}

export default function LoansPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Application | null>(null)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'in_review':
        return 'bg-yellow-500'
      case 'requested':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleEdit = (application: Application) => {
    console.log("Editing application with ID:", application.id);
    setEditFormData({...application})
    setEditDialogOpen(true)
  }

  const handleView = (application: Application) => {
    console.log("Viewing application with ID:", application.id);
    setSelectedApplication(application)
    setViewDialogOpen(true)
  }

  const handleFileChange = (files: File[]) => {
    setNewFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const downloadDocument = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(path)
      
      if (error) throw error
      
      // Create a download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = path.split('/').pop() || 'document'
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editFormData) return
    
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!editFormData) return
    
    setEditFormData({
      ...editFormData,
      [name]: value
    })
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData) return
    
    console.log("Attempting to update application with ID:", editFormData.id)
    
    if (window.confirm("Are you sure you want to update this application? This will change the status to 'pending' and submit it for review.")) {
      setSubmitting(true)
      
      try {
        // Upload new files if any
        const docPaths = [...(editFormData.doc_paths || [])]
        
        if (newFiles.length > 0) {
          console.log("Uploading new files...", newFiles)
          for (const file of newFiles) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${editFormData.id}/${Date.now()}.${fileExt}`
            
            console.log("Uploading file:", fileName)
            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(fileName, file)
            
            if (uploadError) {
              console.error("Upload error:", uploadError)
              throw uploadError
            }
            
            docPaths.push(fileName)
          }
          console.log("All files uploaded, updated docPaths:", docPaths)
        }

        console.log("editFormData:", editFormData);
        
        // Update application in database
        console.log("Updating application in database with ID:", editFormData.id)
        const { data, error } = await supabase
          .from('applications')
          .update({
            full_name: editFormData.full_name,
            email: editFormData.email,
            mobile: editFormData.mobile,
            address: editFormData.address,
            postal_code: editFormData.postal_code,
            city: editFormData.city,
            loan_type: editFormData.loan_type,
            loan_amount: Number(editFormData.loan_amount),
            loan_tenure: Number(editFormData.loan_tenure),
            purpose: editFormData.purpose,
            employment: editFormData.employment,
            income: Number(editFormData.income),
            doc_paths: docPaths,
            status: 'pending' // Change status from requested to pending
          })
          .eq('id', editFormData.id)
          .select('*')
          .single()
        
        console.log("Update response for ID", editFormData.id, ":", { data, error })
        
        if (error) throw error
        
        // Add a small delay before refreshing to ensure the database update completes
        setTimeout(() => {
          fetchApplications(); // Refresh the applications list
        }, 500);
        
        toast({
          title: "Application Updated",
          description: "Your loan application has been updated successfully.",
        })
        
        setEditDialogOpen(false)
        setNewFiles([])
        
      } catch (error) {
        console.error('Error updating application:', error)
        toast({
          title: "Update Failed",
          description: "There was an error updating your application. Please try again.",
          variant: "destructive"
        })
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Loans</h1>
          <Button asChild>
            <Link href="/dashboard/apply">Apply for a Loan</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">You haven't applied for any loans yet.</p>
            <Button asChild>
              <Link href="/dashboard/apply">Apply Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Loans</h1>
        <Button asChild>
          <Link href="/dashboard/apply">Apply for a Loan</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="capitalize">
                  {application.loan_type} Loan
                </CardTitle>
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Preferred Bank:</dt>
                  <dd className="text-sm font-medium">
                    {application.bank ? application.bank : "Not Preferred"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Applied:</dt>
                  <dd className="text-sm font-medium">
                    {formatDate(application.created_at)}
                  </dd>
                </div>
              </dl>
              
              <div className="mt-4 flex gap-2">
                {application.status.toLowerCase() === 'requested' ? (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(application)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(application)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Application Details</DialogTitle>
            <DialogDescription>
              Application submitted on {selectedApplication && formatDate(selectedApplication.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Status</h3>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status}
                </Badge>
              </div>
              
              <Separator />
              
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedApplication.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedApplication.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{selectedApplication.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{selectedApplication.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Loan Details */}
              <div style={{ display: 'none' }}>
                <h3 className="text-lg font-semibold mb-3">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Loan Type</p>
                    <p className="font-medium capitalize">{selectedApplication.loan_type} Loan</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loan Amount</p>
                    <p className="font-medium">{formatCurrency(selectedApplication.loan_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loan Tenure</p>
                    <p className="font-medium">{selectedApplication.loan_tenure} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank</p>
                    <p className="font-medium">{selectedApplication.bank || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Purpose</p>
                    <p className="font-medium">{selectedApplication.purpose}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employment Status</p>
                    <p className="font-medium capitalize">{selectedApplication.employment || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Workplace</p>
                    <p className="font-medium capitalize">{selectedApplication.workplace || 'N/A'}</p>
                  </div>
                  <div style={{ display: 'none' }}>
                    <p className="text-sm text-gray-500">Monthly Income</p>
                    <p className="font-medium">{selectedApplication.income ? formatCurrency(selectedApplication.income) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Documents */}
              {selectedApplication.doc_paths && selectedApplication.doc_paths.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.doc_paths.map((path, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-sm truncate max-w-[70%]">
                            {path.split('/').pop()}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => downloadDocument(path)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Loan Application</DialogTitle>
            <DialogDescription>
              Update your loan application details
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <form onSubmit={handleSubmitEdit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      name="full_name" 
                      value={editFormData.full_name || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={editFormData.email || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input 
                      id="mobile" 
                      name="mobile" 
                      value={editFormData.mobile || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      value={editFormData.address || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input 
                      id="postal_code" 
                      name="postal_code" 
                      value={editFormData.postal_code || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      value={editFormData.city || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Loan Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan_type">Loan Type</Label>
                    <Select 
                      value={editFormData.loan_type} 
                      onValueChange={(value) => handleSelectChange('loan_type', value)}
                    >
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
                    <Input 
                      id="loan_amount" 
                      name="loan_amount" 
                      type="number" 
                      value={editFormData.loan_amount || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan_tenure">Loan Tenure (months)</Label>
                    <Input 
                      id="loan_tenure" 
                      name="loan_tenure" 
                      type="number" 
                      value={editFormData.loan_tenure || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="purpose">Loan Purpose</Label>
                    <Textarea 
                      id="purpose" 
                      name="purpose" 
                      value={editFormData.purpose || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment">Employment Status</Label>
                    <Select 
                      value={editFormData.employment || ''} 
                      onValueChange={(value) => handleSelectChange('employment', value)}
                    >
                      <SelectTrigger id="employment">
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self-employed">Self-Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income (RM)</Label>
                    <Input 
                      id="income" 
                      name="income" 
                      type="number" 
                      value={editFormData.income || ''} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Documents</h3>
                
                {/* Existing Documents */}
                {editFormData.doc_paths && editFormData.doc_paths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Existing Documents</h4>
                    <div className="space-y-2">
                      {editFormData.doc_paths.map((path, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-sm truncate max-w-[70%]">
                            {path.split('/').pop()}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => downloadDocument(path)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload New Documents */}
                <div className="space-y-2">
                  <Label>Upload Additional Documents (PDF, JPG, PNG)</Label>
                  <FileUploader 
                    onFilesSelected={handleFileChange}
                    acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                    maxFileSizeMB={10}
                    multiple={true}
                  />
                  
                  {newFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">New Files to Upload:</p>
                      <ul className="space-y-1">
                        {newFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-md">
                            <span className="truncate max-w-[70%]">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitEdit}
                >
                  {submitting ? "Updating..." : "Update Application"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

