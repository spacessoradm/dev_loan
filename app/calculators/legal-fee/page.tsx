"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalculatorHeader } from "@/components/calculator-header"

export default function LegalFeeCalculator() {
  // Input states
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [loanAmount, setLoanAmount] = useState<string>("")
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>("")
  const [downPaymentAmount, setDownPaymentAmount] = useState<string>("0.00")

  // Result states
  const [salePurchaseLegalFee, setSalePurchaseLegalFee] = useState<string>("0.00")
  const [salePurchaseStampDuty, setSalePurchaseStampDuty] = useState<string>("0.00")
  const [loanLegalFee, setLoanLegalFee] = useState<string>("0.00")
  const [loanStampDuty, setLoanStampDuty] = useState<string>("0.00")
  const [totalFees, setTotalFees] = useState<string>("0.00")

  // Calculate down payment amount when purchase price or down payment percent changes
  useEffect(() => {
    if (purchasePrice && downPaymentPercent) {
      const price = Number.parseFloat(purchasePrice) || 0
      const percent = Number.parseFloat(downPaymentPercent) || 0
      const amount = price * (percent / 100)
      setDownPaymentAmount(amount.toFixed(2))
    } else {
      setDownPaymentAmount("0.00")
    }
  }, [purchasePrice, downPaymentPercent])

  // Calculate fees when inputs change
  useEffect(() => {
    calculateFees()
  }, [purchasePrice, loanAmount])

  const calculateFees = () => {
    const price = Number.parseFloat(purchasePrice) || 0
    const loan = Number.parseFloat(loanAmount) || 0

    // Calculate Sale & Purchase Agreement Legal Fee
    let spLegalFee = 0

    if (price <= 500000) {
      spLegalFee = price * 0.0125
      // Minimum fee of RM500
      spLegalFee = Math.max(spLegalFee, 500)
    } else if (price <= 7500000) {
      spLegalFee = 500000 * 0.0125 + (price - 500000) * 0.01
    } else {
      spLegalFee = 500000 * 0.0125 + 7000000 * 0.01
      // For amounts exceeding 7.5M, negotiable but not exceeding 1%
      spLegalFee += (price - 7500000) * 0.01
    }

    // Calculate Sale & Purchase Agreement Stamp Duty
    let spStampDuty = 0

    if (price <= 100000) {
      spStampDuty = price * 0.01
    } else if (price <= 500000) {
      spStampDuty = 100000 * 0.01 + (price - 100000) * 0.02
    } else if (price <= 1000000) {
      spStampDuty = 100000 * 0.01 + 400000 * 0.02 + (price - 500000) * 0.03
    } else {
      spStampDuty = 100000 * 0.01 + 400000 * 0.02 + 500000 * 0.03 + (price - 1000000) * 0.04
    }

    // Calculate Loan Agreement Legal Fee
    let loanFee = 0

    if (loan <= 500000) {
      loanFee = loan * 0.0125
      // Minimum fee of RM500
      loanFee = Math.max(loanFee, 500)
    } else if (loan <= 7500000) {
      loanFee = 500000 * 0.0125 + (loan - 500000) * 0.01
    } else {
      loanFee = 500000 * 0.0125 + 7000000 * 0.01
      // For amounts exceeding 7.5M, negotiable but not exceeding 1%
      loanFee += (loan - 7500000) * 0.01
    }

    // Calculate Loan Agreement Stamp Duty (0.5% of loan amount)
    const loanStampDuty = loan * 0.005

    // Update state with calculated values
    setSalePurchaseLegalFee(spLegalFee.toFixed(2))
    setSalePurchaseStampDuty(spStampDuty.toFixed(2))
    setLoanLegalFee(loanFee.toFixed(2))
    setLoanStampDuty(loanStampDuty.toFixed(2))

    // Calculate total
    const total = spLegalFee + spStampDuty + loanFee + loanStampDuty
    setTotalFees(total.toFixed(2))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="Legal Fee & Stamp Duty Calculator"
        description="Calculate legal fees and stamp duties for your property transaction."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Calculator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transform hover:scale-[1.01] transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Enter Property Details</h2>
                  <p className="text-gray-600">Calculate fees based on your property value.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <div className="relative">
                      <Input
                        id="purchasePrice"
                        type="number"
                        placeholder="Enter purchase price"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <div className="relative">
                      <Input
                        id="loanAmount"
                        type="number"
                        placeholder="Enter loan amount"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">RM</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downPaymentPercent">Down Payment (%)</Label>
                    <Input
                      id="downPaymentPercent"
                      type="text"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downPaymentAmount">Down Payment (RM)</Label>
                    <Input id="downPaymentAmount" type="text" value={downPaymentAmount} disabled className="bg-gray-100" />
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#1e4388] hover:bg-[#1e4388]/90 text-white transition-all duration-300"
                  onClick={calculateFees}
                >
                  Calculate Fees
                </Button>
              </div>

              {/* Results Section */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Calculated Fees</h3>
                  <p className="text-gray-600">Breakdown of all applicable fees</p>
                </div>

                <div className="space-y-4">
                  {/* Legal Fee Result */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Legal Fee</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {salePurchaseLegalFee}
                    </div>
                  </div>

                  {/* Stamp Duty Result */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Stamp Duty</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {salePurchaseStampDuty}
                    </div>
                  </div>

                  {/* Loan Legal Fee Result */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Loan Legal Fee</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {loanLegalFee}
                    </div>
                  </div>

                  {/* Loan Stamp Duty Result */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Loan Stamp Duty</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {loanStampDuty}
                    </div>
                  </div>

                  {/* Total Fees Result */}
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Total Fees</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {totalFees}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Fee Scale</h3>
              <p className="text-gray-600">
                Legal fees are calculated based on the statutory scale provided by the Legal Profession Act.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stamp Duty Rates</h3>
              <p className="text-gray-600">
                Stamp duty rates vary based on property value and are regulated by the Stamp Act.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Costs</h3>
              <p className="text-gray-600">
                Remember to consider other costs like registration fees and disbursements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

