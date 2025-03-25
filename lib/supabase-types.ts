export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      loan_applications: {
        Row: {
          id: string
          user_id: string
          loan_type: string
          loan_amount: number
          loan_term: number
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string
          employment_status: string
          annual_income: string
          purpose: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          loan_type: string
          loan_amount: number
          loan_term: number
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string
          employment_status: string
          annual_income: string
          purpose: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          loan_type?: string
          loan_amount?: number
          loan_term?: number
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string
          employment_status?: string
          annual_income?: string
          purpose?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          user_id: string
          application_id: string
          loan_type: string
          loan_amount: number
          loan_term: number
          interest_rate: number
          monthly_payment: number
          start_date: string
          end_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          application_id: string
          loan_type: string
          loan_amount: number
          loan_term: number
          interest_rate: number
          monthly_payment: number
          start_date: string
          end_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string
          loan_type?: string
          loan_amount?: number
          loan_term?: number
          interest_rate?: number
          monthly_payment?: number
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

