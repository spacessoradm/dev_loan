"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function BankerDashboard() {
  const [applications, setApplications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [profile, setProfile] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      // Get banker's profile first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      setProfile(userProfile)

      if (!userProfile?.bank) return

      // Get applications for banker's bank
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .eq('bank', userProfile.bank)
        .order('created_at', { ascending: false })

      setApplications(apps || [])

      // Get unread notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })

      setNotifications(notifs || [])
    }

    fetchData()

    // Set up subscription only after we have the profile
    if (profile?.bank) {
      const channel = supabase
        .channel('new_applications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'applications',
          filter: `bank=eq.${profile.bank}`,
        }, payload => {
          // Handle new application
          setApplications(prev => [payload.new, ...prev])
          // Create notification
          createNotification(payload.new.id)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, profile?.bank])

  const createNotification = async (applicationId) => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) return
    
    await supabase.from('notifications').insert({
      user_id: session.user.id,
      application_id: applicationId,
      message: 'New loan application received'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'in_review':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Banker Dashboard</h1>
        <div className="relative">
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {notifications.length}
            </span>
          )}
        </div>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">You don't have any loan applications to review yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map(application => (
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
                    <dt className="text-sm text-gray-500">Applicant:</dt>
                    <dd className="text-sm font-medium">
                      {application.full_name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Amount:</dt>
                    <dd className="text-sm font-medium">
                      {formatCurrency(application.loan_amount)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Term:</dt>
                    <dd className="text-sm font-medium">
                      {application.loan_tenure} months
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
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateStatus(application.id, 'in_review')}
                  >
                    Review
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => viewDetails(application.id)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 