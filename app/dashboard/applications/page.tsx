"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CheckboxMultiSelect from "@/components/checkbox-multi-select";
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
import { XCircle, Eye, Download } from "lucide-react"
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [remarks, setRemarks] = useState<string>("")
  const supabase = createClientComponentClient()
  const [bankers, setBankers] = useState<any[]>([]);
  const [assignedBankers, setAssignedBankers] = useState<string[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [smallAdmins, setSmallAdmins] = useState<any[]>([]);



  const BASE_STORAGE_URL = "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/documents/";


  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
  
        if (!session) return;
  
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
  
        if (userError) throw userError;
  
        setUserRole(userData?.role);
  
        if (userData?.role !== "admin" && userData?.role !== "sadmin" && userData?.role !== "banker") {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this page",
            variant: "destructive",
          });
          return;
        }
  
        // Fetch bankers
        const { data: bankersData, error: bankersError } = await supabase
          .from("profiles")
          .select("id, full_name, bank_name")
          .eq("role", "banker")
          .eq("account_status", "activated");
  
        if (bankersError) throw bankersError;
        setBankers(bankersData || []);
  
        // Fetch sadmins
        const { data: sAdminData, error: sAdminError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "sadmin")
          .eq("account_status", "activated");
  
        if (sAdminError) throw sAdminError;
        setSmallAdmins(sAdminData || []);
  
        // Fetch applications
        const { data: applications, error: appError } = await supabase
          .from("applications")
          .select("*")
          .order("created_at", { ascending: false });
  
        if (appError) throw appError;
  
        // Fetch sub-applications
        const { data: subApplications, error: subAppError } = await supabase
          .from("sub_applications")
          .select("*");
  
        if (subAppError) throw subAppError;
  
        // Fetch statuses
        const { data: statuses, error: statusError } = await supabase
          .from("app_status")
          .select("*");
  
        if (statusError) throw statusError;
  
        // Merge process
        let mergedList: any[] = [];
  
        applications.forEach((app) => {
          const relatedSubApps = subApplications?.filter(
            (sub) => sub.application_id === app.id
          );
        
          if (relatedSubApps && relatedSubApps.length > 0) {
            relatedSubApps.forEach((subApp) => {
              const matchingStatus = statuses.find(
                (status) => Number(subApp.status) === status.id
              );
        
              mergedList.push({
                ...app,            // 1. Take everything from parent application first (full_name, etc.)
                ...subApp,         // 2. Then override with sub_application fields (loan_amount, status, etc.)
                parent_application_id: app.id,
                status_name: matchingStatus ? matchingStatus.status_name : "Unknown",
                isSubApplication: true,
              });
            });
          } else {
            const matchingStatus = statuses.find(
              (status) => Number(app.status) === status.id
            );
        
            mergedList.push({
              ...app,
              status_name: matchingStatus ? matchingStatus.status_name : "Unknown",
              isSubApplication: false,
            });
          }
        });
        
        console.log(mergedList)
  
        setApplications(mergedList || []);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  const handleAssignBanker = async (applicationId: string, bankerIds: string[]) => {
    setProcessingAction(true);
  
    const stringBankerIds = bankerIds.map(String);
  
    try {
      // 1. Update the main applications table
      const { error: updateError } = await supabase
        .from("applications")
        .update({ 
          assigned_to: stringBankerIds 
        })
        .eq("id", applicationId);
  
      if (updateError) {
        console.error("Error updating application:", updateError);
        throw updateError;
      }
  
      // 2. Create individual sub_applications records
      const inserts = stringBankerIds.map(bankerId => ({
        application_id: applicationId,
        status: 'assigned',
        assigned_to: bankerId,
        assigned_at: new Date().toISOString(),
      }));
  
      const { error: insertError } = await supabase
        .from("sub_applications")
        .insert(inserts);
  
      if (insertError) {
        console.error("Error inserting sub_applications:", insertError);
        throw insertError;
      }
  
      // 3. Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, assigned_to: bankerIds } : app
      ));
  
      // 4. Show success toast
      toast({
        title: "Banker(s) Assigned",
        description: "The application has been assigned successfully",
      });
  
      // 5. Close dialog
      setIsDialogOpen(false);
  
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign bankers",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleAssignAdmin = async (applicationId: string, adminId: string) => {
    if (!adminId) return;
  
    setProcessingAction(true);
  
    try {
      const { error } = await supabase
        .from('applications')
        .update({ submitter: adminId })
        .eq('id', applicationId);
  
      if (error) {
        throw error;
      }
  
      toast({
        title: "Success",
        description: "Admin assigned successfully.",
      });
  
      // Optionally reset
      setSelectedAdmin("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to assign admin.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };  

  const handleDownloadAllDocuments = async () => {
    if (!selectedApplication?.doc_paths || selectedApplication.doc_paths.length === 0) return;
  
    const zip = new JSZip();
  
    for (const doc of selectedApplication.doc_paths) {
      try {
        const response = await fetch(`https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/documents/${doc}`);
        const blob = await response.blob();
        const filename = doc.split("/").pop() || "document";
  
        zip.file(filename, blob);
      } catch (err) {
        console.error(`Failed to fetch document: ${doc}`, err);
      }
    }
  
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `application-documents.zip`);
  };

  const handleViewApplication = async (application: any) => {
    setSelectedApplication(application);

    if(application.assigned_to != null && application.assigned_to != ""){
      // Parse the stringified array into an actual array
      let assignedBankersArray = [];

      try {
          assignedBankersArray = JSON.parse(application.assigned_to);
      } catch (error) {
          console.error("Error parsing assigned_to:", error);
          assignedBankersArray = []; // Fallback to an empty array if parsing fails
      }

      setAssignedBankers(assignedBankersArray);
    }

    
    setIsDialogOpen(true);
  
    if (application.doc_paths) {
      const docUrls = await getDocumentUrls(application.doc_paths);
      setSelectedApplication((prev: any) => ({ ...prev, docUrls }));
    }
  };

  const handleAssigning = async (application: any) => {
    setSelectedApplication(application);

    console.log('here')

    if(application.assigned_to != null && application.assigned_to != ""){
      // Parse the stringified array into an actual array
      let assignedBankersArray = [];

      try {
          assignedBankersArray = JSON.parse(application.assigned_to);
      } catch (error) {
          console.error("Error parsing assigned_to:", error);
          assignedBankersArray = []; // Fallback to an empty array if parsing fails
      }

      setAssignedBankers(assignedBankersArray);
    }

    setIsAssignDialogOpen(true);
  }

  const handlePersonInCharge = async (application: any) => {
    setSelectedApplication(application);

    setIsAssignDialogOpen(false);
  }

  const getDocumentUrls = async (docPaths: string[]) => {
    try {
      if (!docPaths || docPaths.length === 0) return [];
  
      const signedUrls = await Promise.all(
        docPaths.map(async (path) => {
          const { data, error } = await supabase.storage
            .from("documents")
            .createSignedUrl(path, 60 * 60); // 1-hour expiration
  
          if (error) {
            console.error("Error getting signed URL:", error);
            return null;
          }
          return { name: path.split("/").pop(), url: data.signedUrl };
        })
      );
  
      return signedUrls.filter((url) => url !== null);
    } catch (error) {
      return [];
    }
  };
  
  const handleAcceptApplication = async (applicationId: string) => {
    if (userRole !== "banker") return; // Ensure only bankers can accept
  
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "accepted" })
        .eq("id", applicationId);
  
      if (error) {
        throw error;
      }
  
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: "accepted" } : app
      ));
  
      toast({
        title: "Application Accepted",
        description: "You have accepted the application successfully.",
      });
  
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept application",
        variant: "destructive",
      });
    }
  };

  const handleRequestApplication = async (applicationId: string) => {
    if (userRole !== "banker") return;
  
    try {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "request supporting documents", 
          remarks: remarks // Assuming remarks is a state variable
        })
        .eq("id", applicationId);
  
      if (error) throw error;
  
      // 🔄 Update the state to reflect the change
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: "request supporting documents", remarks } 
          : app
      ));
  
      toast({
        title: "Request Sent",
        description: "Requested supporting documents successfully.",
      });
  
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request documents",
        variant: "destructive",
      });
    }
  };
  
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
    console.log(status)
    switch (status.toLowerCase()) {
      case "approved":
        return <span className="inline-block bg-green-500 text-white px-2 py-1 rounded">Approved</span>
      case "accepted":
        return <span className="inline-block bg-green-500 text-white px-2 py-1 rounded">Accepted</span>
      case "pending":
        return <span className="inline-block bg-yellow-500 text-white px-2 py-1 rounded">Pending</span>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded">{status}</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
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
 
  if (userRole !== "admin" && userRole !== "banker") {
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
                  <TableHead>Property Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Incharge Admin</TableHead>
                  <TableHead>Incharge Banker/Bank(s)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.full_name}
                    </TableCell>
                    <TableCell className="capitalize">{application.loan_type}</TableCell>
                    <TableCell>{formatCurrency(application.loan_amount)}</TableCell>
                    <TableCell>{application.loan_term} months</TableCell>
                    <TableCell>{application.bank}</TableCell>
                    <TableCell>{getStatusBadge(application.status_name)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleViewApplication(application)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {userRole === "admin" && application.status === "7" && (
                        <Button
                          variant="secondary"
                          className="ml-2"
                          onClick={() => handleAssigning(application)}
                        >
                          Assign
                        </Button>
                      )}
                      {/* Show Accept button only for banker and if status is pending */}
                      {userRole === "banker" && application.status === "pending" && (
                        <Button
                          variant="secondary"
                          className="ml-2"
                          onClick={() => handleAcceptApplication(application.id)}
                        >
                          Accept
                        </Button>
                      )}
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
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Loan Application Details</DialogTitle>
              <DialogDescription>Review the application details before making a decision</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto pr-2 flex-grow">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Applicant Information</h3>
                    <p>
                      <span className="text-muted-foreground">Name:</span> {selectedApplication.full_name}{" "}
                      {selectedApplication.last_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span> {selectedApplication.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span> {selectedApplication.mobile}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Address:</span> {selectedApplication.address}
                    </p>
                  </div>

                  <div style={{ display: 'none' }}>
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

                  <div>
                    <h3 className="font-semibold mb-2">Financial Information</h3>
                    <p>
                      <span className="text-muted-foreground">Employment Status:</span>{" "}
                      {selectedApplication.employment}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Workplace:</span> {selectedApplication.workplace}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Application Status</h3>
                    <p>
                      <span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedApplication.status_name)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Date Applied:</span>{" "}
                      {formatDate(selectedApplication.created_at)}
                    </p>
                  </div>

                  {userRole === "banker" && selectedApplication.status === "accepted" && (
                    <div>
                      <textarea 
                        placeholder="Leave a remark for this request..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Assignment Section (for bankers only) */}
                  {userRole === "admin" && (
                    <div className="col-span-2"> {/* Make this take the full width */}
                      <h3 className="font-semibold mb-2">Assign to Bankers</h3>
                      <CheckboxMultiSelect
                        options={bankers}
                        selectedValues={assignedBankers}
                        onChange={setAssignedBankers}
                        maxHeight="200px"
                      />
                      <Button
                        className="mt-2"
                        onClick={() => handleAssignBanker(selectedApplication.id, assignedBankers)}
                        disabled={assignedBankers.length === 0 || processingAction}
                      >
                        {processingAction ? 'Assigning...' : 'Assign'}
                      </Button>

                      <div className="my-4 border-t" />

                      {/* Assign to Admin (single-select dropdown) */}
                      <h3 className="font-semibold mb-2">Assign to Admin</h3>
                      <select
                        className="w-full border rounded-md p-2"
                        value={selectedAdmin}
                        onChange={(e) => setSelectedAdmin(e.target.value)}
                      >
                        <option value="">Select an Admin</option>
                        {smallAdmins.map((smalladmin) => (
                          <option key={smalladmin.id} value={smalladmin.id}>
                            {smalladmin.full_name}
                          </option>
                        ))}
                      </select>
                      <Button
                        className="mt-2"
                        onClick={() => handleAssignAdmin(selectedApplication.id, selectedAdmin)}
                        disabled={!selectedAdmin || processingAction}
                      >
                        {processingAction ? 'Assigning to Admin...' : 'Assign to Admin'}
                      </Button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold mb-2">Documents</h3>
                      {selectedApplication?.doc_paths?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDownloadAllDocuments}
                          title="Download All Documents"
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    {Array.isArray(selectedApplication?.doc_paths) && selectedApplication.doc_paths.length > 0 ? (
                      <ul>
                        {selectedApplication.doc_paths.map((doc: string, index: number) => (
                          <li key={index}>
                            <a href={`https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/documents/${doc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                              download>
                              {doc.split("/").pop()}
                            </a>
                          </li>
                        ))}
                      </ul>                
                    ) : (
                      <span className="text-gray-400">No Documents Available</span>
                    )}

                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
            {userRole === "banker" && selectedApplication.status === "accepted" && (
              <>
                <Button 
                  onClick={() => handleRequestApplication(selectedApplication.id)} 
                  disabled={!remarks.trim()}
                >
                  Requested
                </Button>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedApplication && (
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Assign Person In Charge</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto pr-2 flex-grow">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button 
                  onClick={() => handlePersonInCharge(selectedApplication.id)} 
                  disabled={!remarks.trim()}
                >
                  Requested
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


    </div>
  )
}

