"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalculatorHeader } from "@/components/calculator-header"

export default function RefinanceCalculatorPage() {
  // Old mortgage states
  const [loanAmount, setLoanAmount] = useState<string>("")
  const [oldInterestRate, setOldInterestRate] = useState<string>("")
  const [oldLoanTermYears, setOldLoanTermYears] = useState<string>("")
  const [oldLoanTermMonths, setOldLoanTermMonths] = useState<string>("")
  const [paymentsMade, setPaymentsMade] = useState<string>("")

  // New mortgage states
  const [newInterestRate, setNewInterestRate] = useState<string>("")
  const [newLoanTermYears, setNewLoanTermYears] = useState<string>("")
  const [newLoanTermMonths, setNewLoanTermMonths] = useState<string>("")

  // Result states
  const [oldMonthlyPayment, setOldMonthlyPayment] = useState<string>("")
  const [newMonthlyPayment, setNewMonthlyPayment] = useState<string>("")
  const [oldRemainingInterest, setOldRemainingInterest] = useState<string>("")
  const [newTotalInterest, setNewTotalInterest] = useState<string>("")
  const [interestSaved, setInterestSaved] = useState<string>("")

  // State to track if results should be shown
  const [showResults, setShowResults] = useState<boolean>(false)

  const calculateRefinance = () => {
    // Convert inputs to numbers
    const loanAmountNum = Number.parseFloat(loanAmount) || 0
    const oldInterestRateNum = Number.parseFloat(oldInterestRate) || 0
    const oldLoanTermYearsNum = Number.parseInt(oldLoanTermYears) || 0
    const oldLoanTermMonthsNum = Number.parseInt(oldLoanTermMonths) || 0
    const paymentsMadeNum = Number.parseInt(paymentsMade) || 0
    const newInterestRateNum = Number.parseFloat(newInterestRate) || 0
    const newLoanTermYearsNum = Number.parseInt(newLoanTermYears) || 0
    const newLoanTermMonthsNum = Number.parseInt(newLoanTermMonths) || 0

    // Calculate monthly interest rates
    const oldMonthlyInterestRate = oldInterestRateNum / 100 / 12
    const newMonthlyInterestRate = newInterestRateNum / 100 / 12

    // Calculate total months for loan terms
    const oldTotalMonths = oldLoanTermYearsNum * 12 + oldLoanTermMonthsNum
    const newTotalMonths = newLoanTermYearsNum * 12 + newLoanTermMonthsNum

    // Calculate old monthly payment
    const oldMonthlyPaymentAmount =
      (loanAmountNum * (oldMonthlyInterestRate * Math.pow(1 + oldMonthlyInterestRate, oldTotalMonths))) /
      (Math.pow(1 + oldMonthlyInterestRate, oldTotalMonths) - 1)

    // Calculate new monthly payment
    const newMonthlyPaymentAmount =
      (loanAmountNum * (newMonthlyInterestRate * Math.pow(1 + newMonthlyInterestRate, newTotalMonths))) /
      (Math.pow(1 + newMonthlyInterestRate, newTotalMonths) - 1)

    // Calculate remaining balance on old loan
    let remainingBalance = loanAmountNum
    let totalInterestPaid = 0

    for (let i = 0; i < paymentsMadeNum; i++) {
      const interestPayment = remainingBalance * oldMonthlyInterestRate
      const principalPayment = oldMonthlyPaymentAmount - interestPayment
      totalInterestPaid += interestPayment
      remainingBalance -= principalPayment
    }

    // Calculate total interest for old loan (remaining)
    let oldRemainingInterestAmount = 0
    let tempBalance = remainingBalance

    for (let i = 0; i < oldTotalMonths - paymentsMadeNum; i++) {
      const interestPayment = tempBalance * oldMonthlyInterestRate
      const principalPayment = oldMonthlyPaymentAmount - interestPayment
      oldRemainingInterestAmount += interestPayment
      tempBalance -= principalPayment
    }

    // Calculate total interest for new loan
    let newTotalInterestAmount = 0
    tempBalance = loanAmountNum

    for (let i = 0; i < newTotalMonths; i++) {
      const interestPayment = tempBalance * newMonthlyInterestRate
      const principalPayment = newMonthlyPaymentAmount - interestPayment
      newTotalInterestAmount += interestPayment
      tempBalance -= principalPayment
    }

    // Calculate interest savings
    const interestSavingsAmount = oldRemainingInterestAmount - newTotalInterestAmount

    // Update result states
    setOldMonthlyPayment(oldMonthlyPaymentAmount.toFixed(2))
    setNewMonthlyPayment(newMonthlyPaymentAmount.toFixed(2))
    setOldRemainingInterest(oldRemainingInterestAmount.toFixed(2))
    setNewTotalInterest(newTotalInterestAmount.toFixed(2))
    setInterestSaved(interestSavingsAmount.toFixed(2))

    // Show results
    setShowResults(true)
  }

  const resetForm = () => {
    // Reset to default values
    setLoanAmount("450000")
    setOldInterestRate("4.8")
    setOldLoanTermYears("35")
    setOldLoanTermMonths("")
    setPaymentsMade("")
    setNewInterestRate("3.8")
    setNewLoanTermYears("35")
    setNewLoanTermMonths("")

    // Clear results
    setOldMonthlyPayment("")
    setNewMonthlyPayment("")
    setOldRemainingInterest("")
    setNewTotalInterest("")
    setInterestSaved("")

    // Hide results
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="Refinance Calculator"
        description="Calculate the interested saved after refinance."
      />
      <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Old Mortgage Section */}
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold mb-4">Old Mortgage</h2>

          <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
            <Label htmlFor="loanAmount" className="text-right">
              Loan Amount
            </Label>
            <Input
              id="loanAmount"
              type="text"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="max-w-xs"
            />

            <Label htmlFor="oldInterestRate" className="text-right">
              Interest Rate
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="oldInterestRate"
                type="text"
                value={oldInterestRate}
                onChange={(e) => setOldInterestRate(e.target.value)}
                className="max-w-xs"
              />
              <span>% per year</span>
            </div>

            <Label htmlFor="oldLoanTermYears" className="text-right">
              Loan Term
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="oldLoanTermYears"
                type="text"
                value={oldLoanTermYears}
                onChange={(e) => setOldLoanTermYears(e.target.value)}
                className="w-24"
              />
              <span>years</span>
              <Input
                id="oldLoanTermMonths"
                type="text"
                value={oldLoanTermMonths}
                onChange={(e) => setOldLoanTermMonths(e.target.value)}
                className="w-24"
              />
              <span>months</span>
            </div>

            <Label htmlFor="paymentsMade" className="text-right">
              Payment Made (month)
            </Label>
            <Input
              id="paymentsMade"
              type="text"
              value={paymentsMade}
              onChange={(e) => setPaymentsMade(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* New Mortgage Section */}
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold mb-4">New Mortgage</h2>

          <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
            <Label htmlFor="newInterestRate" className="text-right">
              Interest Rate
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="newInterestRate"
                type="text"
                value={newInterestRate}
                onChange={(e) => setNewInterestRate(e.target.value)}
                className="max-w-xs"
              />
              <span>% per year</span>
            </div>

            <Label htmlFor="newLoanTermYears" className="text-right">
              Loan Term
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="newLoanTermYears"
                type="text"
                value={newLoanTermYears}
                onChange={(e) => setNewLoanTermYears(e.target.value)}
                className="w-24"
              />
              <span>years</span>
              <Input
                id="newLoanTermMonths"
                type="text"
                value={newLoanTermMonths}
                onChange={(e) => setNewLoanTermMonths(e.target.value)}
                className="w-24"
              />
              <span>months</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="destructive" onClick={resetForm} className="w-40">
              Reset
            </Button>
            <Button onClick={calculateRefinance} className="w-40 bg-blue-600 hover:bg-blue-700">
              Calculate
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="bg-gray-100 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div></div>
              <div className="text-center font-bold">Old Mortgage</div>
              <div className="text-center font-bold">New Mortgage</div>

              <div className="text-right font-bold">Total Mortgage:</div>
              <div className="text-right text-red-600 font-bold">{Number(loanAmount).toLocaleString()}.00</div>
              <div className="text-right text-red-600 font-bold">{Number(loanAmount).toLocaleString()}.00</div>

              <div className="text-right font-bold">Monthly Payment:</div>
              <div className="text-right text-red-600 font-bold">{Number(oldMonthlyPayment).toLocaleString()}</div>
              <div className="text-right text-red-600 font-bold">{Number(newMonthlyPayment).toLocaleString()}</div>

              <div className="text-right font-bold">Remaining Interest:</div>
              <div className="text-right text-red-600 font-bold">{Number(oldRemainingInterest).toLocaleString()}</div>
              <div className="text-right text-red-600 font-bold">{Number(newTotalInterest).toLocaleString()}</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 bg-gray-200 p-2">
              <div className="text-right font-bold">Interest Saved:</div>
              <div className="text-right text-green-600 font-bold">{Number(interestSaved).toLocaleString()}</div>
              <div>
                {showResults && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-xs">
                    Contact us to save interest
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
