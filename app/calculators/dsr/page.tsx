"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { CalculatorHeader } from "@/components/calculator-header"

export default function DSRCalculator() {
  // Income states
  const [basicSalary, setBasicSalary] = useState<string>("")
  const [fixedAllowance, setFixedAllowance] = useState<string>("")
  const [variableIncome, setVariableIncome] = useState<string>("")
  const [otherIncome, setOtherIncome] = useState<string>("")

  // Commitment states
  const [carLoan, setCarLoan] = useState<string>("")
  const [personalLoan, setPersonalLoan] = useState<string>("")
  const [creditCard, setCreditCard] = useState<string>("")
  const [otherLoans, setOtherLoans] = useState<string>("")

  // Result states
  const [totalIncome, setTotalIncome] = useState<string>("")
  const [totalCommitments, setTotalCommitments] = useState<string>("")
  const [dsrPercentage, setDsrPercentage] = useState<string>("")
  const [dsrStatus, setDsrStatus] = useState<string>("")

  const calculateDSR = () => {
    // Convert all inputs to numbers
    const basicSalaryNum = Number(basicSalary) || 0
    const fixedAllowanceNum = Number(fixedAllowance) || 0
    const variableIncomeNum = Number(variableIncome) || 0
    const otherIncomeNum = Number(otherIncome) || 0

    const carLoanNum = Number(carLoan) || 0
    const personalLoanNum = Number(personalLoan) || 0
    const creditCardNum = Number(creditCard) || 0
    const otherLoansNum = Number(otherLoans) || 0

    // Calculate totals
    const totalIncomeAmount = basicSalaryNum + fixedAllowanceNum + (variableIncomeNum * 0.8) + (otherIncomeNum * 0.8)
    const totalCommitmentsAmount = carLoanNum + personalLoanNum + creditCardNum + otherLoansNum

    // Calculate DSR percentage
    const dsrValue = (totalCommitmentsAmount / totalIncomeAmount) * 100

    // Determine DSR status
    let status = ""
    if (dsrValue <= 70) {
      status = "Good"
    } else {
      status = "High Risk"
    }

    // Update states
    setTotalIncome(totalIncomeAmount.toFixed(2))
    setTotalCommitments(totalCommitmentsAmount.toFixed(2))
    setDsrPercentage(dsrValue.toFixed(2))
    setDsrStatus(status)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="Debt Service Ratio (DSR) Calculator"
        description="Calculate your debt service ratio to understand your loan eligibility."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transform hover:scale-[1.01] transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Income Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Monthly Income</h2>
                  <p className="text-gray-600">Enter your monthly income details.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary</Label>
                    <div className="relative">
                      <Input
                        id="basicSalary"
                        type="number"
                        placeholder="Enter basic salary"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixedAllowance">Fixed Allowance</Label>
                    <div className="relative">
                      <Input
                        id="fixedAllowance"
                        type="number"
                        placeholder="Enter fixed allowance"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={fixedAllowance}
                        onChange={(e) => setFixedAllowance(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variableIncome">Variable Income</Label>
                    <div className="relative">
                      <Input
                        id="variableIncome"
                        type="number"
                        placeholder="Enter variable income"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={variableIncome}
                        onChange={(e) => setVariableIncome(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherIncome">Other Income</Label>
                    <div className="relative">
                      <Input
                        id="otherIncome"
                        type="number"
                        placeholder="Enter other income"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={otherIncome}
                        onChange={(e) => setOtherIncome(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>
                </div>

                {/* Commitments Section */}
                <div className="space-y-4 pt-6 border-t">
                  <h2 className="text-2xl font-bold text-gray-900">Monthly Commitments</h2>
                  <p className="text-gray-600">Enter your monthly loan commitments.</p>

                  <div className="space-y-2">
                    <Label htmlFor="carLoan">Car Loan</Label>
                    <div className="relative">
                      <Input
                        id="carLoan"
                        type="number"
                        placeholder="Enter car loan payment"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={carLoan}
                        onChange={(e) => setCarLoan(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personalLoan">Personal Loan</Label>
                    <div className="relative">
                      <Input
                        id="personalLoan"
                        type="number"
                        placeholder="Enter personal loan payment"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={personalLoan}
                        onChange={(e) => setPersonalLoan(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditCard">Credit Card</Label>
                    <div className="relative">
                      <Input
                        id="creditCard"
                        type="number"
                        placeholder="Enter credit card payment"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={creditCard}
                        onChange={(e) => setCreditCard(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherLoans">Other Loans</Label>
                    <div className="relative">
                      <Input
                        id="otherLoans"
                        type="number"
                        placeholder="Enter other loan payments"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={otherLoans}
                        onChange={(e) => setOtherLoans(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#1e4388] hover:bg-[#1e4388]/90 text-white transition-all duration-300"
                  onClick={calculateDSR}
                >
                  Calculate DSR
                </Button>
              </div>

              {/* Results Section */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">DSR Results</h3>
                  <p className="text-gray-600">Your debt service ratio analysis</p>
                </div>

                <div className="space-y-4">
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Total Monthly Income</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {totalIncome}
                    </div>
                  </div>

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Total Monthly Commitments</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {totalCommitments}
                    </div>
                  </div>

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">DSR Percentage</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      {dsrPercentage}%
                    </div>
                  </div>

                  <div className={`group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                    dsrStatus === 'Good' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="text-sm text-gray-600">DSR Status</div>
                    <div className={`text-2xl font-bold group-hover:scale-105 transition-transform ${
                      dsrStatus === 'Good' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dsrStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What is DSR?</h3>
              <p className="text-gray-600">
                DSR measures your ability to repay loans by comparing your monthly debt commitments to your income.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ideal DSR</h3>
              <p className="text-gray-600">
                A DSR below 70% is generally considered good for loan approval.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Income Calculation</h3>
              <p className="text-gray-600">
                Variable and other income are typically calculated at 80% of their value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

