"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CalculatorHeader } from "@/components/calculator-header"

export default function LegalFeeCalculatorPage() {
  // Input states
  const [purchasePrice, setPurchasePrice] = useState<string>("300000.00")
  const [marginOfFinance, setMarginOfFinance] = useState<string>("90")
  const [tenure, setTenure] = useState<string>("30")
  const [interestRate, setInterestRate] = useState<string>("4.5")
  const [totalLoan, setTotalLoan] = useState<string>("270000.00")
  const [monthlyInstallment, setMonthlyInstallment] = useState<string>("1368.05")

  // Result states
  const [spaLegalFee, setSpaLegalFee] = useState<string>("3000.00")
  const [spaStampDuty, setSpaStampDuty] = useState<string>("5000.00")
  const [loanLegalFee, setLoanLegalFee] = useState<string>("2700.00")
  const [loanStampDuty, setLoanStampDuty] = useState<string>("1350.00")
  const [downpayment, setDownpayment] = useState<string>("30000.00")
  const [totalPayment, setTotalPayment] = useState<string>("492498.12")
  const [principalPercentage, setPrincipalPercentage] = useState<number>(54.8)
  const [interestPercentage, setInterestPercentage] = useState<number>(45.2)
  const [activeTab, setActiveTab] = useState<string>("legal-fees")

  // Calculate total loan when purchase price or margin of finance changes
  useEffect(() => {
    if (purchasePrice && marginOfFinance) {
      const price = Number.parseFloat(purchasePrice.replace(/,/g, "")) || 0
      const margin = Number.parseFloat(marginOfFinance) || 0
      const loan = price * (margin / 100)
      setTotalLoan(loan.toFixed(2))

      // Calculate downpayment
      const down = price - loan
      setDownpayment(down.toFixed(2))
    }
  }, [purchasePrice, marginOfFinance])

  // Calculate monthly installment when total loan, interest rate, or tenure changes
  useEffect(() => {
    if (totalLoan && interestRate && tenure) {
      const loan = Number.parseFloat(totalLoan.replace(/,/g, "")) || 0
      const rate = Number.parseFloat(interestRate) || 0
      const years = Number.parseFloat(tenure) || 0

      // Monthly interest rate
      const monthlyRate = rate / 100 / 12
      // Total number of payments
      const payments = years * 12

      // Calculate monthly payment using loan formula
      const x = Math.pow(1 + monthlyRate, payments)
      const monthly = (loan * x * monthlyRate) / (x - 1)

      setMonthlyInstallment(monthly.toFixed(2))

      // Calculate total payment
      const totalPay = monthly * payments
      setTotalPayment(totalPay.toFixed(2))

      // Calculate interest vs principal percentages
      const totalInterest = totalPay - loan
      const principalPercent = (loan / totalPay) * 100
      const interestPercent = (totalInterest / totalPay) * 100

      setPrincipalPercentage(Math.round(principalPercent * 10) / 10)
      setInterestPercentage(Math.round(interestPercent * 10) / 10)
    }
  }, [totalLoan, interestRate, tenure])

  // Calculate fees when purchase price or total loan changes
  useEffect(() => {
    calculateFees()
  }, [purchasePrice, totalLoan])

  const calculateFees = () => {
    const price = Number.parseFloat(purchasePrice.replace(/,/g, "")) || 0
    const loan = Number.parseFloat(totalLoan.replace(/,/g, "")) || 0

    // Calculate Sale & Purchase Agreement Legal Fee
    let spLegalFee = 0

    if (price <= 500000) {
      spLegalFee = price * 0.01
      // Minimum fee of RM500
      spLegalFee = Math.max(spLegalFee, 500)
    } else if (price <= 1000000) {
      spLegalFee = 5000 + (price - 500000) * 0.008
    } else {
      spLegalFee = 9000 + (price - 1000000) * 0.005
    }

    // Calculate Sale & Purchase Agreement Stamp Duty
    let spStampDuty = 0

    if (price <= 100000) {
      spStampDuty = price * 0.01
    } else if (price <= 500000) {
      spStampDuty = 1000 + (price - 100000) * 0.02
    } else if (price <= 1000000) {
      spStampDuty = 9000 + (price - 500000) * 0.03
    } else {
      spStampDuty = 24000 + (price - 1000000) * 0.04
    }

    // Calculate Loan Agreement Legal Fee
    let loanFee = 0

    if (loan <= 500000) {
      loanFee = loan * 0.01
      // Minimum fee of RM500
      loanFee = Math.max(loanFee, 500)
    } else if (loan <= 1000000) {
      loanFee = 5000 + (loan - 500000) * 0.008
    } else {
      loanFee = 9000 + (loan - 1000000) * 0.005
    }

    // Calculate Loan Agreement Stamp Duty (0.5% of loan amount)
    const loanStampDuty = loan * 0.005

    // Update state with calculated values
    setSpaLegalFee(spLegalFee.toFixed(2))
    setSpaStampDuty(spStampDuty.toFixed(2))
    setLoanLegalFee(loanFee.toFixed(2))
    setLoanStampDuty(loanStampDuty.toFixed(2))
  }

  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value.replace(/,/g, ""))
    if (isNaN(num)) return ""
    return num.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="Legal Fee and Stamp Duty Calculator"
        description="To help calculate all the basic costs that are involved in your property purchasing process."
      />
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div>
            <div className="space-y-6">
              <div className="flex items-center">
                <label className="w-48 text-gray-700">Purchase Price</label>
                <div className="relative flex-1 flex">
                  <div className="bg-gray-200 flex items-center justify-center px-4 rounded-l-md">RM</div>
                  <Input
                    type="text"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-48 text-gray-700">Margin of Finance</label>
                <div className="relative flex-1 flex">
                  <Input
                    type="text"
                    value={marginOfFinance}
                    onChange={(e) => setMarginOfFinance(e.target.value)}
                    className="rounded-r-none"
                  />
                  <div className="bg-gray-200 flex items-center justify-center px-4 rounded-r-md">%</div>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-48 text-gray-700">Tenure</label>
                <div className="relative flex-1 flex">
                  <Input
                    type="text"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="rounded-r-none"
                  />
                  <div className="bg-gray-200 flex items-center justify-center px-4 rounded-r-md">Year(s)</div>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-48 text-gray-700">Interest Rate p.a.</label>
                <div className="relative flex-1 flex">
                  <Input
                    type="text"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="rounded-r-none"
                  />
                  <div className="bg-gray-200 flex items-center justify-center px-4 rounded-r-md">%</div>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-48 text-gray-700">Total Loan</label>
                <div className="relative flex-1">
                  <div className="bg-gray-200 p-3 rounded-md flex items-center">
                    <span className="mr-2">RM</span>
                    <span>{formatCurrency(totalLoan)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-48 text-gray-700">Monthly Installment</label>
                <div className="relative flex-1">
                  <div className="bg-gray-200 p-3 rounded-md flex items-center">
                    <span className="mr-2">RM</span>
                    <span>{formatCurrency(monthlyInstallment)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <Button variant="outline" className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50">
                  VIEW INTEREST RATE
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={calculateFees}>
                  CALCULATE
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="border rounded-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none h-auto">
                <TabsTrigger
                  value="total-payment"
                  className="py-3 rounded-none data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Total Payment
                </TabsTrigger>
                <TabsTrigger
                  value="legal-fees"
                  className="py-3 rounded-none data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Legal Fees & Stamp Duty
                </TabsTrigger>
              </TabsList>

              <TabsContent value="total-payment" className="p-6 pt-10">
                <div className="flex flex-col items-center">
                  <div className="w-64 h-64 relative mb-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#4dabf7"
                        strokeWidth="20"
                        strokeDasharray={`${principalPercentage} ${interestPercentage}`}
                        strokeDashoffset="25"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#4dd4ac"
                        strokeWidth="20"
                        strokeDasharray={`${interestPercentage} ${principalPercentage}`}
                        strokeDashoffset={`${-principalPercentage + 25}`}
                      />
                    </svg>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-lg font-medium">Total Payment</p>
                    <p className="text-4xl font-bold text-gray-800">RM {formatCurrency(totalPayment)}</p>
                  </div>

                  <div className="flex justify-center space-x-8">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#4dd4ac] rounded-full mr-2"></div>
                      <span>Interest {interestPercentage}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#4dabf7] rounded-full mr-2"></div>
                      <span>Principal {principalPercentage}%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="legal-fees" className="p-0">
                <div className="p-6 bg-gray-50">
                  <h3 className="font-medium mb-4">Sale & Purchase Agreement Costs</h3>
                  <div className="flex justify-between py-2">
                    <span>SPA Legal Fees:</span>
                    <span className="font-medium">RM {formatCurrency(spaLegalFee)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>SPA Stamp Duty:</span>
                    <span className="font-medium">RM {formatCurrency(spaStampDuty)}</span>
                  </div>

                  <h3 className="font-medium mt-6 mb-4">Loan Documentation Costs</h3>
                  <div className="flex justify-between py-2">
                    <span>Loan Documentation Legal Fees:</span>
                    <span className="font-medium">RM {formatCurrency(loanLegalFee)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Loan Documentation Stamp Duty:</span>
                    <span className="font-medium">RM {formatCurrency(loanStampDuty)}</span>
                  </div>

                  <h3 className="font-medium mt-6 mb-4">Others</h3>
                  <div className="flex justify-between py-2 border-b">
                    <span>Downpayment:</span>
                    <span className="font-medium">RM {formatCurrency(downpayment)}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
