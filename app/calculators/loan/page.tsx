"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalculatorHeader } from "@/components/calculator-header"

export default function LoanCalculator() {
  // Input states - all empty initially
  const [loanAmount, setLoanAmount] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [loanTermYears, setLoanTermYears] = useState<string>("")
  const [loanTermMonths, setLoanTermMonths] = useState<string>("")
  const [extraPayment, setExtraPayment] = useState<string>("")
  const [propertyTax, setPropertyTax] = useState<string>("")
  const [insurance, setInsurance] = useState<string>("")
  const [otherFees, setOtherFees] = useState<string>("")
  const [pmi, setPmi] = useState<string>("")
  const [pmiOption, setPmiOption] = useState<string>("cancel")
  const [propertyPrice, setPropertyPrice] = useState<string>("")

  // Result states
  const [monthlyPaymentWithPmi, setMonthlyPaymentWithPmi] = useState<string>("")
  const [monthlyPmi, setMonthlyPmi] = useState<string>("")
  const [monthlyPaymentWithoutPmi, setMonthlyPaymentWithoutPmi] = useState<string>("")
  const [totalPayment, setTotalPayment] = useState<string>("")
  const [totalInterest, setTotalInterest] = useState<string>("")
  const [annualPayment, setAnnualPayment] = useState<string>("")
  const [mortgageConstant, setMortgageConstant] = useState<string>("")
  const [interestSaving, setInterestSaving] = useState<string>("")
  const [payoffEarlier, setPayoffEarlier] = useState<string>("")

  const [showLoanTerm, setShowLoanTerm] = useState(false);


  // State to track if results should be shown
  const [showResults, setShowResults] = useState<boolean>(false)

  // State for amortization schedule
  const [amortizationSchedule, setAmortizationSchedule] = useState<any[]>([])
  const [pmiCancellationMonth, setPmiCancellationMonth] = useState<number>(0)
  const [isAmortizationOpen, setIsAmortizationOpen] = useState<boolean>(false)

  const calculateLoan = () => {
    // Convert inputs to numbers
    const loanAmountNum = Number.parseFloat(loanAmount) || 0
    const interestRateNum = Number.parseFloat(interestRate) || 0
    const loanTermYearsNum = Number.parseInt(loanTermYears) || 0
    const loanTermMonthsNum = Number.parseInt(loanTermMonths) || 0
    const extraPaymentNum = Number.parseFloat(extraPayment) || 0
    const propertyTaxNum = Number.parseFloat(propertyTax) || 0
    const insuranceNum = Number.parseFloat(insurance) || 0
    const otherFeesNum = Number.parseFloat(otherFees) || 0
    const pmiNum = Number.parseFloat(pmi) || 0
    const propertyPriceNum = Number.parseFloat(propertyPrice) || 0

    // Calculate total loan term in months
    const totalLoanTermMonths = loanTermYearsNum * 12 + loanTermMonthsNum

    // Calculate monthly interest rate
    const monthlyInterestRate = interestRateNum / 100 / 12

    // Calculate base monthly payment (principal + interest)
    const baseMonthlyPayment =
      (loanAmountNum * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalLoanTermMonths))) /
      (Math.pow(1 + monthlyInterestRate, totalLoanTermMonths) - 1)

    // Calculate monthly PMI
    const monthlyPmiAmount = (loanAmountNum * (pmiNum / 100)) / 12

    // Calculate monthly property tax, insurance, and other fees
    const monthlyPropertyTax = propertyTaxNum / 12
    const monthlyInsurance = insuranceNum / 12
    const monthlyOtherFees = otherFeesNum / 12

    // Calculate total monthly payment with PMI
    const totalMonthlyPaymentWithPmi =
      baseMonthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyOtherFees + monthlyPmiAmount

    // Calculate total monthly payment without PMI
    const totalMonthlyPaymentWithoutPmi = baseMonthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyOtherFees

    // Calculate when PMI will be cancelled (80% of property price)
    const pmiCancellationThreshold = propertyPriceNum * 0.8
    let pmiCancelMonth = 0
    let remainingBalance = loanAmountNum

    // Generate amortization schedule
    const schedule = []
    let totalInterestWithoutExtra = 0
    let totalInterestWithExtra = 0
    let payoffMonthWithExtra = 0

    // Reset for amortization schedule calculation
    remainingBalance = loanAmountNum

    for (let i = 1; i <= totalLoanTermMonths; i++) {
      const interestPayment = remainingBalance * monthlyInterestRate
      const principalPayment = baseMonthlyPayment - interestPayment

      // Check if PMI should be cancelled
      if (remainingBalance <= pmiCancellationThreshold && pmiCancelMonth === 0 && pmiOption === "cancel") {
        pmiCancelMonth = i
      }

      // Add to schedule
      schedule.push({
        month: i,
        payment:
          i < pmiCancelMonth || pmiCancelMonth === 0 ? totalMonthlyPaymentWithPmi : totalMonthlyPaymentWithoutPmi,
        basePayment:
          i < pmiCancelMonth || pmiCancelMonth === 0 ? baseMonthlyPayment + monthlyPmiAmount : baseMonthlyPayment,
        interest: interestPayment,
        principal: principalPayment,
        balance: remainingBalance - principalPayment,
        hasPmi: i < pmiCancelMonth || pmiCancelMonth === 0 || pmiOption === "life",
      })

      remainingBalance -= principalPayment
      totalInterestWithoutExtra += interestPayment

      if (remainingBalance <= 0) {
        break
      }
    }

    // Reset for calculations with extra payment
    remainingBalance = loanAmountNum

    // Calculate total interest with extra payment
    for (let i = 1; i <= totalLoanTermMonths; i++) {
      if (remainingBalance <= 0) {
        payoffMonthWithExtra = i - 1
        break
      }

      const interestPayment = remainingBalance * monthlyInterestRate
      const principalPayment = baseMonthlyPayment - interestPayment

      totalInterestWithExtra += interestPayment
      remainingBalance -= principalPayment + extraPaymentNum

      if (i === totalLoanTermMonths && remainingBalance > 0) {
        payoffMonthWithExtra = totalLoanTermMonths
      }
    }

    // Calculate interest savings
    const interestSavings = totalInterestWithoutExtra - totalInterestWithExtra

    // Calculate months saved
    const monthsSaved = totalLoanTermMonths - payoffMonthWithExtra

    // Calculate mortgage constant
    const mortgageConstantValue = ((baseMonthlyPayment * 12) / loanAmountNum) * 100

    // Update result states
    setMonthlyPaymentWithPmi(`${baseMonthlyPayment.toFixed(2)} + ${extraPaymentNum.toFixed(2)}`)
    setMonthlyPmi(monthlyPmiAmount.toFixed(2))
    setMonthlyPaymentWithoutPmi(`${baseMonthlyPayment.toFixed(2)} + ${extraPaymentNum.toFixed(2)}`)
    setTotalPayment((loanAmountNum + totalInterestWithoutExtra).toFixed(2))
    setTotalInterest(totalInterestWithoutExtra.toFixed(2))
    setAnnualPayment((baseMonthlyPayment * 12).toFixed(2))
    setMortgageConstant(mortgageConstantValue.toFixed(2) + "%")
    setInterestSaving(interestSavings.toFixed(2))
    setPayoffEarlier(monthsSaved.toString() + " months")

    // Update amortization schedule
    setAmortizationSchedule(schedule)
    setPmiCancellationMonth(pmiCancelMonth)

    // Show results
    setShowResults(true)
  }

  const resetForm = () => {
    // Clear all inputs
    setLoanAmount("")
    setInterestRate("")
    setLoanTermYears("")
    setLoanTermMonths("")
    setExtraPayment("")
    setPropertyTax("")
    setInsurance("")
    setOtherFees("")
    setPmi("")
    setPmiOption("cancel")
    setPropertyPrice("")

    // Clear results
    setMonthlyPaymentWithPmi("")
    setMonthlyPmi("")
    setMonthlyPaymentWithoutPmi("")
    setTotalPayment("")
    setTotalInterest("")
    setAnnualPayment("")
    setMortgageConstant("")
    setInterestSaving("")
    setPayoffEarlier("")

    // Clear amortization schedule
    setAmortizationSchedule([])
    setPmiCancellationMonth(0)

    // Hide results
    setShowResults(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace("$", "")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="Loan Calculator"
        description="Calculate your monthly payments and total interest with our easy-to-use loan calculator."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transform hover:scale-[1.01] transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Enter Loan Details</h2>
                  <p className="text-gray-600">Fill in the details below to calculate your loan.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount (RM)</Label>
                    <div className="relative">
                      <Input
                        id="loanAmount"
                        type="number"
                        placeholder="Enter loan amount"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <div className="relative">
                      <Input
                        id="interestRate"
                        type="number"
                        placeholder="Enter interest rate"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                      />
                    </div>
                  </div>

                  {showLoanTerm && (
                  <div className="space-y-2">
                    <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                    <div className="relative">
                      <Input
                        id="loanTermYears"
                        type="number"
                        placeholder="Enter loan term in years"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={loanTermYears}
                        onChange={(e) => setLoanTermYears(e.target.value)}
                      />
                    </div>
                  </div>)}

                  {showLoanTerm && (
                  <div className="space-y-2">
                    <Label htmlFor="loanTermMonths">Loan Term (Months)</Label>
                    <div className="relative">
                      <Input
                        id="loanTermMonths"
                        type="number"
                        placeholder="Enter loan term in months"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={loanTermMonths}
                        onChange={(e) => setLoanTermMonths(e.target.value)}
                      />
                    </div>
                  </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="extraPayment">Extra Payment a Month</Label>
                    <div className="relative">
                      <Input
                        id="extraPayment"
                        type="number"
                        placeholder="Enter extra payment"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(e.target.value)}
                      />
                    </div>
                  </div>

                  {showLoanTerm && (
                  <div className="space-y-2">
                    <Label htmlFor="propertyPrice">Property Price</Label>
                    <div className="relative">
                      <Input
                        id="propertyPrice"
                        type="number"
                        placeholder="Enter property price"
                        className="pl-8 transition-all duration-300 hover:border-[#1e4388]/50 focus:border-[#1e4388]"
                        value={propertyPrice}
                        onChange={(e) => setPropertyPrice(e.target.value)}
                      />
                    </div>
                  </div>)}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                  <Dialog open={isAmortizationOpen} onOpenChange={setIsAmortizationOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={!showResults}
                        onClick={() => {
                          if (showResults) {
                            setIsAmortizationOpen(true)
                          }
                        }}
                      >
                        Amortization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Amortization Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="grid grid-cols-[180px_1fr] gap-2">
                            <div className="text-right font-medium">Loan Amount:</div>
                            <div>{loanAmount}</div>

                            <div className="text-right font-medium">Interest Rate (%):</div>
                            <div>{interestRate}</div>

                            <div className="text-right font-medium">Loan Term:</div>
                            <div>
                              {loanTermYears} years {loanTermMonths} months
                            </div>

                            <div className="text-right font-medium">Extra Payment a Month:</div>
                            <div>{extraPayment}</div>

                            <div className="text-right font-medium">Property Price:</div>
                            <div>{propertyPrice}</div>
                          </div>
                        </div>
                        <div>
                          <div className="grid grid-cols-[auto_1fr] gap-2">
                            <div className="text-right font-medium">Monthly Payment with PMI:</div>
                            <div className="text-red-600 font-bold">{monthlyPaymentWithPmi}</div>

                            <div className="text-right font-medium">Monthly PMI:</div>
                            <div className="text-red-600 font-bold">{monthlyPmi}</div>

                            <div className="col-span-2 pt-2 pb-1 text-red-600 font-bold">
                              After {pmiCancellationMonth} Month{pmiCancellationMonth !== 1 ? "s" : ""}
                            </div>

                            <div className="text-right font-medium">Monthly Payment:</div>
                            <div className="text-red-600 font-bold">{monthlyPaymentWithoutPmi}</div>

                            <div className="text-right font-medium">Total Payment:</div>
                            <div className="text-red-600 font-bold">{totalPayment}</div>

                            <div className="text-right font-medium">Total Interest:</div>
                            <div className="text-red-600 font-bold">{totalInterest}</div>

                            <div className="text-right font-medium">Annual Payment:</div>
                            <div className="text-red-600 font-bold">{annualPayment}</div>

                            <div className="text-right font-medium">Mortgage Constant:</div>
                            <div className="text-red-600 font-bold">{mortgageConstant}</div>

                            <div className="col-span-2 pt-2 pb-1 text-red-600 font-bold">With Additional Payment</div>

                            <div className="text-right font-medium">Interest Saving:</div>
                            <div className="text-red-600 font-bold">{interestSaving}</div>

                            <div className="text-right font-medium">Payoff Earlier By:</div>
                            <div className="text-red-600 font-bold">{payoffEarlier}</div>
                          </div>
                        </div>
                      </div>
                      <ScrollArea className="h-[400px] rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Months</TableHead>
                              <TableHead>Monthly Payment</TableHead>
                              <TableHead>Interests</TableHead>
                              <TableHead>Principal</TableHead>
                              <TableHead>Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {amortizationSchedule.map((row, index) => (
                              <TableRow key={index} className={index % 2 === 1 ? "bg-yellow-50" : ""}>
                                <TableCell>{row.month}</TableCell>
                                <TableCell>{formatCurrency(row.basePayment)}</TableCell>
                                <TableCell>{formatCurrency(row.interest)}</TableCell>
                                <TableCell>{formatCurrency(row.principal)}</TableCell>
                                <TableCell>{formatCurrency(row.balance)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    className="w-full bg-[#1e4388] hover:bg-[#1e4388]/90 text-white transition-all duration-300"
                    onClick={calculateLoan}
                  >
                    Calculate
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Results</h3>
                  <p className="text-gray-600">Your calculated loan details</p>
                </div>

                <div className="space-y-4">
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Monthly Payment</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {monthlyPaymentWithPmi}
                    </div>
                  </div>

                  {showLoanTerm && (
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Monthly PMI</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      {monthlyPmi}
                    </div>
                  </div>)}

                  {showLoanTerm && (
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Monthly Payment without PMI</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {monthlyPaymentWithoutPmi}
                    </div>
                  </div>)}

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Total Payment</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {totalPayment}
                    </div>
                  </div>

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Total Interest</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {totalInterest}
                    </div>
                  </div>

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Annual Payment</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {annualPayment}
                    </div>
                  </div>
                  
                  {showLoanTerm && (
                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Mortgage Constant</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      {mortgageConstant}
                    </div>
                  </div>)}

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Interest Saving</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      RM {interestSaving}
                    </div>
                  </div>

                  <div className="group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="text-sm text-gray-600">Payoff Earlier By</div>
                    <div className="text-2xl font-bold text-[#1e4388] group-hover:scale-105 transition-transform">
                      {payoffEarlier}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How it works</h3>
              <p className="text-gray-600">
                Our calculator uses standard amortization formulas to determine your monthly payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

