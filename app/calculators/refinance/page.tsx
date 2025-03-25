"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalculatorHeader } from "@/components/calculator-header"

export default function RefinanceCalculator() {
  // Original mortgage states
  const [existingLoanAmount, setExistingLoanAmount] = useState<string>("")
  const [remainingTenure, setRemainingTenure] = useState<string>("")
  const [originalInterestRate, setOriginalInterestRate] = useState<string>("")

  // New mortgage states
  const [newTenure, setNewTenure] = useState<string>("")
  const [newInterestRate, setNewInterestRate] = useState<string>("")
  const [closingCosts, setClosingCosts] = useState<string>("")

  // Result states
  const [currentInstallment, setCurrentInstallment] = useState<string>("")
  const [currentTotalPayment, setCurrentTotalPayment] = useState<string>("")
  const [currentTotalInterest, setCurrentTotalInterest] = useState<string>("")
  const [currentAnnualPayment, setCurrentAnnualPayment] = useState<string>("")

  const [newInstallment, setNewInstallment] = useState<string>("")
  const [newTotalPayment, setNewTotalPayment] = useState<string>("")
  const [newTotalInterest, setNewTotalInterest] = useState<string>("")
  const [newAnnualPayment, setNewAnnualPayment] = useState<string>("")

  const [totalInterestSaving, setTotalInterestSaving] = useState<string>("")

  // State to track if results should be shown
  const [showResults, setShowResults] = useState<boolean>(false)

  const calculateRefinance = () => {
    // Convert inputs to numbers
    const existingLoanAmountNum = Number.parseFloat(existingLoanAmount) || 0
    const remainingTenureNum = Number.parseInt(remainingTenure) || 0
    const originalInterestRateNum = Number.parseFloat(originalInterestRate) || 0
    const newTenureNum = Number.parseInt(newTenure) || 0
    const newInterestRateNum = Number.parseFloat(newInterestRate) || 0
    const closingCostsNum = Number.parseFloat(closingCosts) || 0

    // Calculate monthly interest rates
    const originalMonthlyInterestRate = originalInterestRateNum / 100 / 12
    const newMonthlyInterestRate = newInterestRateNum / 100 / 12

    // Calculate remaining months
    const remainingMonths = remainingTenureNum * 12
    const newTenureMonths = newTenureNum * 12

    // Calculate current monthly payment
    const currentMonthlyPayment =
      (existingLoanAmountNum *
        (originalMonthlyInterestRate * Math.pow(1 + originalMonthlyInterestRate, remainingMonths))) /
      (Math.pow(1 + originalMonthlyInterestRate, remainingMonths) - 1)

    // Calculate new monthly payment
    const newMonthlyPayment =
      (existingLoanAmountNum * (newMonthlyInterestRate * Math.pow(1 + newMonthlyInterestRate, newTenureMonths))) /
      (Math.pow(1 + newMonthlyInterestRate, newTenureMonths) - 1)

    // Calculate total payments and interest
    const currentTotalPaymentAmount = currentMonthlyPayment * remainingMonths
    const currentTotalInterestAmount = currentTotalPaymentAmount - existingLoanAmountNum

    const newTotalPaymentAmount = newMonthlyPayment * newTenureMonths + closingCostsNum
    const newTotalInterestAmount = newTotalPaymentAmount - existingLoanAmountNum - closingCostsNum

    // Calculate annual payments
    const currentAnnualPaymentAmount = currentMonthlyPayment * 12
    const newAnnualPaymentAmount = newMonthlyPayment * 12

    // Calculate interest savings
    const interestSavings = currentTotalInterestAmount - newTotalInterestAmount

    // Update result states
    setCurrentInstallment(currentMonthlyPayment.toFixed(2))
    setCurrentTotalPayment(currentTotalPaymentAmount.toFixed(0))
    setCurrentTotalInterest(currentTotalInterestAmount.toFixed(2))
    setCurrentAnnualPayment(currentAnnualPaymentAmount.toFixed(2))

    setNewInstallment(newMonthlyPayment.toFixed(2))
    setNewTotalPayment(newTotalPaymentAmount.toFixed(0))
    setNewTotalInterest(newTotalInterestAmount.toFixed(2))
    setNewAnnualPayment(newAnnualPaymentAmount.toFixed(2))

    setTotalInterestSaving(interestSavings.toFixed(2))

    // Show results
    setShowResults(true)
  }

  const resetForm = () => {
    // Clear all inputs
    setExistingLoanAmount("")
    setRemainingTenure("")
    setOriginalInterestRate("")
    setNewTenure("")
    setNewInterestRate("")
    setClosingCosts("")

    // Clear results
    setCurrentInstallment("")
    setCurrentTotalPayment("")
    setCurrentTotalInterest("")
    setCurrentAnnualPayment("")
    setNewInstallment("")
    setNewTotalPayment("")
    setNewTotalInterest("")
    setNewAnnualPayment("")
    setTotalInterestSaving("")

    // Hide results
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="Refinance Calculator"
        description="Compare your current loan with refinancing options to make an informed decision."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Calculator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transform hover:scale-[1.01] transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Loan Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Current Loan Details</h2>
                  <p className="text-gray-600">Enter your existing loan information.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentLoanAmount">Outstanding Loan Amount</Label>
                    <div className="relative">
                      <Input
                        id="currentLoanAmount"
                        type="number"
                        placeholder="Enter current loan amount"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={existingLoanAmount}
                        onChange={(e) => setExistingLoanAmount(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentInterestRate">Current Interest Rate (%)</Label>
                    <Input
                      id="currentInterestRate"
                      type="number"
                      placeholder="Enter current interest rate"
                      className="transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                      value={originalInterestRate}
                      onChange={(e) => setOriginalInterestRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remainingTerm">Remaining Term (Years)</Label>
                    <Input
                      id="remainingTerm"
                      type="number"
                      placeholder="Enter remaining years"
                      className="transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                      value={remainingTenure}
                      onChange={(e) => setRemainingTenure(e.target.value)}
                    />
                  </div>
                </div>

                {/* New Loan Section */}
                <div className="space-y-4 pt-6 border-t">
                  <h2 className="text-2xl font-bold text-gray-900">New Loan Details</h2>
                  <p className="text-gray-600">Enter the refinancing options.</p>

                  <div className="space-y-2">
                    <Label htmlFor="newInterestRate">New Interest Rate (%)</Label>
                    <Input
                      id="newInterestRate"
                      type="number"
                      placeholder="Enter new interest rate"
                      className="transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                      value={newInterestRate}
                      onChange={(e) => setNewInterestRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newTerm">New Loan Term (Years)</Label>
                    <Input
                      id="newTerm"
                      type="number"
                      placeholder="Enter new loan term"
                      className="transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                      value={newTenure}
                      onChange={(e) => setNewTenure(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refinanceCosts">Refinancing Costs</Label>
                    <div className="relative">
                      <Input
                        id="refinanceCosts"
                        type="number"
                        placeholder="Enter refinancing costs"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={closingCosts}
                        onChange={(e) => setClosingCosts(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#1e4388] hover:bg-[#1e4388]/90 text-white transition-all duration-300"
                  onClick={calculateRefinance}
                >
                  Compare Loans
                </Button>
              </div>

              {/* Results Section */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Comparison Results</h3>
                  <p className="text-gray-600">See how refinancing affects your loan</p>
                </div>

                <div className="space-y-4">
                  {/* Current Loan Monthly Payment */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Current Monthly Payment</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {currentInstallment}
                    </div>
                  </div>

                  {/* New Loan Monthly Payment */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">New Monthly Payment</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {newInstallment}
                    </div>
                  </div>

                  {/* Monthly Savings */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Monthly Savings</div>
                    <div className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform">
                      RM {totalInterestSaving}
                    </div>
                  </div>

                  {/* Break-even Period */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Break-even Period</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      {/* Calculate break-even period */}
                    </div>
                  </div>

                  {/* Lifetime Savings */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Lifetime Savings</div>
                    <div className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform">
                      RM {/* Calculate lifetime savings */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Break-even Analysis</h3>
              <p className="text-gray-600">
                Consider how long it will take to recover the refinancing costs through monthly savings.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interest Savings</h3>
              <p className="text-gray-600">
                Lower interest rates can lead to significant savings over the life of your loan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Consider All Costs</h3>
              <p className="text-gray-600">
                Include all refinancing fees when calculating the total cost of switching loans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

