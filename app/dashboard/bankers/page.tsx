"use client"

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Add a User type
type Banker = {
  id: string;
  full_name?: string;
  email?: string;
  bank_name?: string;
  role?: string;
  account_status?: string;
  created_at?: string;
};

export default function AdminBankersPage() {
  const [users, setUsers] = useState<Banker[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchBankers() {
      console.log("Fetching applications for banker...");
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "banker")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBankers();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", id);

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, account_status: status } : user
        )
      );

      toast({
        title: "Success",
        description: `Account status updated to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manage Bankers</h1>
      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Bankers</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p>No bankers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Full Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Bank</th>
                      <th className="text-left p-2">Account Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.full_name || "N/A"}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.bank_name || "N/A"}</td>
                        <td className="p-2">{user.account_status}</td>
                        <td className="p-2 space-x-2">
                          {user.account_status === "under review" && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => updateStatus(user.id, "active")}
                              >
                                Activate
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatus(user.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {user.account_status === "active" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(user.id, "banned")}
                            >
                              Ban
                            </Button>
                          )}
                          {user.account_status === "banned" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateStatus(user.id, "active")}
                            >
                              Activate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
