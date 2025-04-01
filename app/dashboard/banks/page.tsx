"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define Bank type
type Bank = {
  id: string;
  bank_name: string;
  status: boolean;
};

export default function BanksModule() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentBank, setCurrentBank] = useState<Bank | null>(null);
  const [newBank, setNewBank] = useState({ bank_name: "", status: true });

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchBanks() {
      console.log("Fetching banks...");
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

  const updateBankStatus = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase.from("banks").update({ status }).eq("id", id);
      if (error) throw error;

      setBanks((prevBanks) => prevBanks.map((bank) => (bank.id === id ? { ...bank, status } : bank)));

      toast({ title: "Success", description: "Bank status updated." });
    } catch (error) {
      console.error("Error updating bank status:", error);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const createBank = async () => {
    try {
      const { data, error } = await supabase.from("banks").insert([newBank]).select().single();
      if (error) throw error;

      setBanks([...banks, data]);
      toast({ title: "Success", description: "Bank added successfully." });
      setOpenModal(false);
      setNewBank({ bank_name: "", status: true });
    } catch (error) {
      console.error("Error creating bank:", error);
      toast({ title: "Error", description: "Failed to create bank.", variant: "destructive" });
    }
  };

  const updateBank = async () => {
    if (!currentBank) return;

    try {
      const { error } = await supabase.from("banks").update({ bank_name: currentBank.bank_name, status: currentBank.status }).eq("id", currentBank.id);
      if (error) throw error;

      setBanks((prevBanks) =>
        prevBanks.map((bank) => (bank.id === currentBank.id ? { ...bank, bank_name: currentBank.bank_name, status: currentBank.status } : bank))
      );

      toast({ title: "Success", description: "Bank updated successfully." });
      setEditModal(false);
      setCurrentBank(null);
    } catch (error) {
      console.error("Error updating bank:", error);
      toast({ title: "Error", description: "Failed to update bank.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manage Banks</h1>
      <Button onClick={() => setOpenModal(true)} className="mb-4">
        + Add Bank
      </Button>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Banks</CardTitle>
          </CardHeader>
          <CardContent>
            {banks.length === 0 ? (
              <p>No banks found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Bank Name</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank) => (
                      <tr key={bank.id} className="border-b">
                        <td className="p-2">{bank.bank_name}</td>
                        <td className="p-2">
                          <Select value={bank.status ? "true" : "false"} onValueChange={(value) => updateBankStatus(bank.id, value === "true")}>
                            <SelectTrigger>
                              <SelectValue>{bank.status ? "Active" : "Inactive"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Button size="sm" onClick={() => { setCurrentBank(bank); setEditModal(true); }}>
                            Edit
                          </Button>
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

      {/* Create Bank Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bank</DialogTitle>
          </DialogHeader>
          <Label>Bank Name</Label>
          <Input value={newBank.bank_name} onChange={(e) => setNewBank({ ...newBank, bank_name: e.target.value })} />
          <Button onClick={createBank}>Create</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank</DialogTitle>
          </DialogHeader>
          {currentBank && (
            <>
              <Label>Bank Name</Label>
              <Input value={currentBank.bank_name} onChange={(e) => setCurrentBank({ ...currentBank, bank_name: e.target.value })} />
              <Button onClick={updateBank}>Update</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
