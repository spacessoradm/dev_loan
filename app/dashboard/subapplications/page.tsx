"use client"

import React, { useState, useEffect } from "react"
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

// Explicitly define as a React function component
export default function SubApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [subApplications, setSubApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [remarks, setRemarks] = useState("")
  const supabase = createClientComponentClient()
  const BASE_STORAGE_URL = "https://pbvigsmmzasgbuqgwwdt.supabase.co/storage/v1/object/public/documents/"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view this page",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get user profile to check role
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (userError) throw userError;
        setUserRole(userData?.role);

        // Only allow bankers to view this page
        if (userData?.role !== "banker") {
          toast({
            title: "Access Denied",
            description: "Only bankers can view this page",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get sub_applications assigned to this banker
        const { data: subAppsData, error: subAppsError } = await supabase
          .from("sub_applications")
          .select("*")
          .eq("assigned_to", userData.id)
          .order("assigned_at", { ascending: false });

        if (subAppsError) throw subAppsError;

        // If there are sub applications, get the full application details
        if (subAppsData && subAppsData.length > 0) {
          // Extract all application IDs
          const applicationIds = subAppsData.map(subApp => subApp.application_id);

          // Get full application details for all application IDs
          const { data: applicationsData, error: applicationsError } = await supabase
            .from("applications")
            .select("*")
            .in("id", applicationIds);

          if (applicationsError) throw applicationsError;

          // Merge the data from both tables
          const mergedData = subAppsData.map(subApp => {
            const fullApp = applicationsData.find(app => app.id === subApp.application_id);
            return { ...subApp, application: fullApp };
          });

          setSubApplications(mergedData);
        } else {
          setSubApplications([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleViewApplication = async (subApp) => {
    try {
      // If we haven't already loaded the document URLs
      if (subApp.application && subApp.application.doc_paths && !subApp.docUrls) {
        const docUrls = await getDocumentUrls(subApp.application.doc_paths);
        subApp = { ...subApp, docUrls };
      }
      
      setSelectedApplication(subApp);
      setIsDialogOpen(true);
      
    } catch (error) {
      console.error("Error viewing application:", error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      });
    }
  };

  const getDocumentUrls = async (docPaths) => {
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

  const handleRequestDocuments = async (subAppId, applicationId) => {
    setProcessingAction(true);
    try {
      // Update the sub_application status
      const { error: subAppError } = await supabase
        .from("sub_applications")
        .update({ 
          status: "requested_documents",
          remarks: remarks
        })
        .eq("id", subAppId);

      if (subAppError) throw subAppError;

      // Also update the main application to reflect this status
      const { error: appError } = await supabase
        .from("applications")
        .update({ 
          status: "request supporting documents",
          remarks: remarks
        })
        .eq("id", applicationId);

      if (appError) throw appError;

      // Update local state
      setSubApplications(subApplications.map(app => 
        app.id === subAppId 
          ? { ...app, status: "requested_documents", remarks,
              application: { ...app.application, status: "request supporting documents", remarks } } 
          : app
      ));

      toast({
        title: "Documents Requested",
        description: "Successfully requested additional documents from applicant.",
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to request documents",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleApproveApplication = async (subAppId, applicationId) => {
    setProcessingAction(true);
    try {
      // Update the sub_application status
      const { error: subAppError } = await supabase
        .from("sub_applications")
        .update({ 
          status: "approved",
          remarks: remarks || "Application approved"
        })
        .eq("id", subAppId);

      if (subAppError) throw subAppError;

      // Update the main application
      const { error: appError } = await supabase
        .from("applications")
        .update({ 
          status: "approved" 
        })
        .eq("id", applicationId);

      if (appError) throw appError;

      // Update local state
      setSubApplications(subApplications.map(app => 
        app.id === subAppId 
          ? { ...app, status: "approved", remarks: remarks || "Application approved",
              application: { ...app.application, status: "approved" } } 
          : app
      ));

      toast({
        title: "Application Approved",
        description: "The loan application has been approved successfully",
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectApplication = async (subAppId, applicationId) => {
    setProcessingAction(true);
    try {
      // Update the sub_application status
      const { error: subAppError } = await supabase
        .from("sub_applications")
        .update({ 
          status: "rejected",
          remarks: remarks || "Application rejected"
        })
        .eq("id", subAppId);

      if (subAppError) throw subAppError;

      // Update the main application
      const { error: appError } = await supabase
        .from("applications")
        .update({ 
          status: "rejected" 
        })
        .eq("id", applicationId);

      if (appError) throw appError;

      // Update local state
      setSubApplications(subApplications.map(app => 
        app.id === subAppId 
          ? { ...app, status: "rejected", remarks: remarks || "Application rejected",
              application: { ...app.application, status: "rejected" } } 
          : app
      ));

      toast({
        title: "Application Rejected",
        description: "The loan application has been rejected",
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "assigned":
        return <Badge className="bg-blue-500">Assigned</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "requested_documents":
      case "request supporting documents":
        return <Badge className="bg-purple-500">Documents Requested</Badge>
      default:
        return <Badge>{status || "Unknown"}</Badge>
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
 
  if (userRole !== "banker") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Only bankers can access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Assigned Applications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>Review and process loan applications assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {subApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subApplications.map((subApp) => (
                  <TableRow key={subApp.id}>
                    <TableCell className="font-medium">
                      {subApp.application?.full_name}
                    </TableCell>
                    <TableCell className="capitalize">{subApp.application?.loan_type}</TableCell>
                    <TableCell>{formatCurrency(subApp.application?.loan_amount)}</TableCell>
                    <TableCell>{subApp.application?.loan_term} months</TableCell>
                    <TableCell>{formatDate(subApp.assigned_at)}</TableCell>
                    <TableCell>{getStatusBadge(subApp.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleViewApplication(subApp)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No Assigned Applications</h3>
              <p className="text-muted-foreground">You don't have any loan applications assigned to you at this time.</p>
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
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {selectedApplication.application?.full_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span> {selectedApplication.application?.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span> {selectedApplication.application?.mobile}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Address:</span> {selectedApplication.application?.address}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Loan Details</h3>
                    <p>
                      <span className="text-muted-foreground">Loan Type:</span> {selectedApplication.application?.loan_type}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Amount:</span>{" "}
                      {formatCurrency(selectedApplication.application?.loan_amount)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Term:</span> {selectedApplication.application?.loan_term} months
                    </p>
                    <p>
                      <span className="text-muted-foreground">Purpose:</span> {selectedApplication.application?.purpose}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Financial Information</h3>
                    <p>
                      <span className="text-muted-foreground">Employment Status:</span>{" "}
                      {selectedApplication.application?.employment}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Workplace:</span> {selectedApplication.application?.workplace}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Application Status</h3>
                    <p>
                      <span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedApplication.status)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Assigned Date:</span>{" "}
                      {formatDate(selectedApplication.assigned_at)}
                    </p>
                    {selectedApplication.remarks && (
                      <p>
                        <span className="text-muted-foreground">Remarks:</span>{" "}
                        {selectedApplication.remarks}
                      </p>
                    )}
                  </div>

                  {selectedApplication.status === "assigned" && (
                    <div className="col-span-2">
                      <h3 className="font-semibold mb-2">Add Remarks</h3>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Add your remarks or notes about this application..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <h3 className="font-semibold mb-2">Documents</h3>
                    {selectedApplication.application?.doc_paths && selectedApplication.application.doc_paths.length > 0 ? (
                      <ul className="space-y-1">
                        {selectedApplication.application.doc_paths.map((doc, index) => (
                          <li key={index} className="flex items-center">
                            <a 
                              href={`${BASE_STORAGE_URL}${doc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                              download
                            >
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
              {selectedApplication.status === "assigned" && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => handleRequestDocuments(
                      selectedApplication.id, 
                      selectedApplication.application?.id
                    )} 
                    disabled={!remarks.trim() || processingAction}
                  >
                    {processingAction ? "Processing..." : "Request Documents"}
                  </Button>
                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectApplication(
                        selectedApplication.id, 
                        selectedApplication.application?.id
                      )}
                      disabled={processingAction}
                      className="mr-2"
                    >
                      {processingAction ? "Processing..." : "Reject"}
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleApproveApplication(
                        selectedApplication.id, 
                        selectedApplication.application?.id
                      )} 
                      disabled={processingAction}
                    >
                      {processingAction ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}