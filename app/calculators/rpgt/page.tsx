"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Facebook, Linkedin, PinIcon as Pinterest, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalculatorHeader } from "@/components/calculator-header"

export default function RPGTCalculatorPage() {
  // Input states
  const [purchaseDate, setPurchaseDate] = useState<string>("2013-01-01")
  const [purchasePrice, setPurchasePrice] = useState<string>("50000.00")
  const [purchaseMiscCost, setPurchaseMiscCost] = useState<string>("4000.00")
  const [acquisitionCost, setAcquisitionCost] = useState<string>("54000.00")
  const [disposalDate, setDisposalDate] = useState<string>("2025-04-05")
  const [sellingPrice, setSellingPrice] = useState<string>("200000.00")
  const [disposalMiscCost, setDisposalMiscCost] = useState<string>("6000.00")
  const [enhancementCost, setEnhancementCost] = useState<string>("20000.00")

  // Result states
  const [citizenRPGTRate, setCitizenRPGTRate] = useState<string>("0.0")
  const [nonCitizenRPGTRate, setNonCitizenRPGTRate] = useState<string>("10.0")
  const [companyRPGTRate, setCompanyRPGTRate] = useState<string>("10.0")

  const [chargeableGain, setChargeableGain] = useState<string>("120000.00")

  const [citizenExemption, setCitizenExemption] = useState<string>("12000.00")
  const [nonCitizenExemption, setNonCitizenExemption] = useState<string>("12000.00")
  const [companyExemption, setCompanyExemption] = useState<string>("0.00")

  const [citizenNetGain, setCitizenNetGain] = useState<string>("108000.00")
  const [nonCitizenNetGain, setNonCitizenNetGain] = useState<string>("108000.00")
  const [companyNetGain, setCompanyNetGain] = useState<string>("120000.00")

  const [citizenRPGTPayable, setCitizenRPGTPayable] = useState<string>("0.00")
  const [nonCitizenRPGTPayable, setNonCitizenRPGTPayable] = useState<string>("10800.00")
  const [companyRPGTPayable, setCompanyRPGTPayable] = useState<string>("12000.00")

  // Calculate acquisition cost when purchase price or misc cost changes
  useEffect(() => {
    const price = Number.parseFloat(purchasePrice.replace(/,/g, "")) || 0
    const misc = Number.parseFloat(purchaseMiscCost.replace(/,/g, "")) || 0
    const total = price + misc
    setAcquisitionCost(total.toFixed(2))
  }, [purchasePrice, purchaseMiscCost])

  // Calculate RPGT when inputs change
  const calculateRPGT = () => {
    // Parse input values
    const purchasePriceNum = Number.parseFloat(purchasePrice.replace(/,/g, "")) || 0
    const purchaseMiscCostNum = Number.parseFloat(purchaseMiscCost.replace(/,/g, "")) || 0
    const sellingPriceNum = Number.parseFloat(sellingPrice.replace(/,/g, "")) || 0
    const disposalMiscCostNum = Number.parseFloat(disposalMiscCost.replace(/,/g, "")) || 0
    const enhancementCostNum = Number.parseFloat(enhancementCost.replace(/,/g, "")) || 0

    // Calculate total acquisition cost
    const totalAcquisitionCost = purchasePriceNum + purchaseMiscCostNum
    setAcquisitionCost(totalAcquisitionCost.toFixed(2))

    // Calculate chargeable gain
    const gain = sellingPriceNum - totalAcquisitionCost - disposalMiscCostNum - enhancementCostNum
    const chargeableGainValue = Math.max(0, gain)
    setChargeableGain(chargeableGainValue.toFixed(2))

    // Calculate holding period in years
    const purchaseYear = new Date(purchaseDate).getFullYear()
    const disposalYear = new Date(disposalDate).getFullYear()
    const holdingPeriod = disposalYear - purchaseYear

    // Determine RPGT rates based on holding period
    let citizenRate = 0
    let nonCitizenRate = 0
    let companyRate = 0

    // Malaysian RPGT rates as of 2023
    if (holdingPeriod < 3) {
      citizenRate = 30
      nonCitizenRate = 30
      companyRate = 30
    } else if (holdingPeriod < 4) {
      citizenRate = 20
      nonCitizenRate = 30
      companyRate = 20
    } else if (holdingPeriod < 5) {
      citizenRate = 15
      nonCitizenRate = 30
      companyRate = 15
    } else if (holdingPeriod < 6) {
      citizenRate = 5
      nonCitizenRate = 30
      companyRate = 10
    } else {
      citizenRate = 0
      nonCitizenRate = 10
      companyRate = 10
    }

    setCitizenRPGTRate(citizenRate.toFixed(1))
    setNonCitizenRPGTRate(nonCitizenRate.toFixed(1))
    setCompanyRPGTRate(companyRate.toFixed(1))

    // Set exemptions
    // In Malaysia, citizens and permanent residents get RM10,000 or 10% of net gain (whichever is higher)
    // Companies don't get this exemption
    const citizenExemptionValue = Math.max(10000, chargeableGainValue * 0.1)
    const nonCitizenExemptionValue = Math.max(10000, chargeableGainValue * 0.1)
    const companyExemptionValue = 0

    setCitizenExemption(citizenExemptionValue.toFixed(2))
    setNonCitizenExemption(nonCitizenExemptionValue.toFixed(2))
    setCompanyExemption(companyExemptionValue.toFixed(2))

    // Calculate net chargeable gain
    const citizenNetGainValue = Math.max(0, chargeableGainValue - citizenExemptionValue)
    const nonCitizenNetGainValue = Math.max(0, chargeableGainValue - nonCitizenExemptionValue)
    const companyNetGainValue = Math.max(0, chargeableGainValue - companyExemptionValue)

    setCitizenNetGain(citizenNetGainValue.toFixed(2))
    setNonCitizenNetGain(nonCitizenNetGainValue.toFixed(2))
    setCompanyNetGain(companyNetGainValue.toFixed(2))

    // Calculate RPGT payable
    const citizenRPGTPayableValue = (citizenNetGainValue * citizenRate) / 100
    const nonCitizenRPGTPayableValue = (nonCitizenNetGainValue * nonCitizenRate) / 100
    const companyRPGTPayableValue = (companyNetGainValue * companyRate) / 100

    setCitizenRPGTPayable(citizenRPGTPayableValue.toFixed(2))
    setNonCitizenRPGTPayable(nonCitizenRPGTPayableValue.toFixed(2))
    setCompanyRPGTPayable(companyRPGTPayableValue.toFixed(2))
  }

  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value.replace(/,/g, ""))
    if (isNaN(num)) return ""
    return num.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculatorHeader 
        title="RPGT Calculator"
        description="Calculate your Real Property Gains Tax (RPGT) based on your property transaction details."
      />
        <div className="container mx-auto py-10 px-4 max-w-6xl">
        <Card className="mb-8">
            <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input Form */}
                <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Property Details</h2>

                {/* Purchase Details */}
                <div className="space-y-4">
                    <div className="flex items-center">
                    <label className="w-48 text-gray-700">Purchase Date</label>
                    <div className="relative flex-1">
                        <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                    </div>
                    </div>

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
                    <label className="w-48 text-gray-700">Miscellaneous Cost</label>
                    <div className="relative flex-1 flex">
                        <div className="bg-gray-200 flex items-center justify-center px-4 rounded-l-md">RM</div>
                        <Input
                        type="text"
                        value={purchaseMiscCost}
                        onChange={(e) => setPurchaseMiscCost(e.target.value)}
                        className="rounded-l-none"
                        />
                    </div>
                    </div>

                    <div className="flex items-center">
                    <label className="w-48 text-gray-700">Acquisition Cost</label>
                    <div className="relative flex-1">
                        <div className="bg-gray-200 p-3 rounded-md flex items-center">
                        <span className="mr-2">RM</span>
                        <span>{formatCurrency(acquisitionCost)}</span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Disposal Details */}
                <div className="space-y-4">
                    <div className="flex items-center">
                    <label className="w-48 text-gray-700">Disposal Date</label>
                    <div className="relative flex-1">
                        <Input type="date" value={disposalDate} onChange={(e) => setDisposalDate(e.target.value)} />
                    </div>
                    </div>

                    <div className="flex items-center">
                    <label className="w-48 text-gray-700">Selling Price</label>
                    <div className="relative flex-1 flex">
                        <div className="bg-gray-200 flex items-center justify-center px-4 rounded-l-md">RM</div>
                        <Input
                        type="text"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className="rounded-l-none"
                        />
                    </div>
                    </div>

                    <div className="flex items-center">
                    <label className="w-48 text-gray-700">Miscellaneous Cost</label>
                    <div className="relative flex-1 flex">
                        <div className="bg-gray-200 flex items-center justify-center px-4 rounded-l-md">RM</div>
                        <Input
                        type="text"
                        value={disposalMiscCost}
                        onChange={(e) => setDisposalMiscCost(e.target.value)}
                        className="rounded-l-none"
                        />
                    </div>
                    </div>

                    <div className="flex items-center">
                    <label className="w-48 text-gray-700">
                        Enhancement Cost
                        <br />
                        <span className="text-sm text-gray-500">(E.g. Renovation)</span>
                    </label>
                    <div className="relative flex-1 flex">
                        <div className="bg-gray-200 flex items-center justify-center px-4 rounded-l-md">RM</div>
                        <Input
                        type="text"
                        value={enhancementCost}
                        onChange={(e) => setEnhancementCost(e.target.value)}
                        className="rounded-l-none"
                        />
                    </div>
                    </div>
                </div>

                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={calculateRPGT}>
                    CALCULATE
                </Button>
                </div>

                {/* Right Column - Results */}
                <div>
                <div className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-4">
                    <div className="bg-gray-200 p-4"></div>
                    <div className="bg-orange-100 p-4 text-center font-medium">Citizen</div>
                    <div className="bg-orange-100 p-4 text-center font-medium">Non Citizen</div>
                    <div className="bg-orange-100 p-4 text-center font-medium">Company</div>
                    </div>

                    <div className="grid grid-cols-4 border-t">
                    <div className="bg-gray-100 p-4 font-medium">RPGT Rate</div>
                    <div className="bg-orange-50 p-4 text-center">{citizenRPGTRate}%</div>
                    <div className="bg-orange-50 p-4 text-center">{nonCitizenRPGTRate}%</div>
                    <div className="bg-orange-50 p-4 text-center">{companyRPGTRate}%</div>
                    </div>

                    <div className="grid grid-cols-4 border-t">
                    <div className="bg-gray-100 p-4 font-medium">Chargeable Gain</div>
                    <div className="bg-orange-50 p-4 text-center">RM {formatCurrency(chargeableGain)}</div>
                    <div className="bg-orange-50 p-4 text-center">RM {formatCurrency(chargeableGain)}</div>
                    <div className="bg-orange-50 p-4 text-center">RM {formatCurrency(chargeableGain)}</div>
                    </div>

                    <div className="grid grid-cols-4 border-t">
                    <div className="bg-gray-100 p-4 font-medium">Exemption</div>
                    <div className="p-4 text-center">RM {formatCurrency(citizenExemption)}</div>
                    <div className="p-4 text-center">RM {formatCurrency(nonCitizenExemption)}</div>
                    <div className="p-4 text-center">
                        {companyExemption === "0.00" ? "-" : `RM ${formatCurrency(companyExemption)}`}
                    </div>
                    </div>

                    <div className="grid grid-cols-4 border-t">
                    <div className="bg-gray-100 p-4 font-medium">Net Chargeable Gain</div>
                    <div className="bg-orange-50 p-4 text-center">RM {formatCurrency(citizenNetGain)}</div>
                    <div className="bg-orange-50 p-4 text-center">RM {formatCurrency(nonCitizenNetGain)}</div>
                    <div className="bg-orange-50 p-4 text-center">RM {formatCurrency(companyNetGain)}</div>
                    </div>

                    <div className="grid grid-cols-4 border-t">
                    <div className="bg-gray-100 p-4 font-medium">RPGT Payable</div>
                    <div className="bg-orange-50 p-4 text-center font-bold">RM {formatCurrency(citizenRPGTPayable)}</div>
                    <div className="bg-orange-50 p-4 text-center font-bold">
                        RM {formatCurrency(nonCitizenRPGTPayable)}
                    </div>
                    <div className="bg-orange-50 p-4 text-center font-bold">RM {formatCurrency(companyRPGTPayable)}</div>
                    </div>
                </div>
                </div>
            </div>
            </CardContent>
        </Card>

        <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            About RPGT in Malaysia
            </h2>
            <div className="space-y-4">
            <p>
                Real Property Gains Tax (RPGT) is a tax imposed on the gains arising from the disposal of real properties or
                shares in real property companies in Malaysia.
            </p>
            <p>
                The RPGT rate varies depending on the holding period of the property and the status of the property owner
                (citizen, permanent resident, non-citizen, or company).
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                    <th className="border p-2">Disposal Period</th>
                    <th className="border p-2">Malaysian Citizens & PRs</th>
                    <th className="border p-2">Non-Citizens</th>
                    <th className="border p-2">Companies</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className="border p-2">Within 3 years</td>
                    <td className="border p-2 text-center">30%</td>
                    <td className="border p-2 text-center">30%</td>
                    <td className="border p-2 text-center">30%</td>
                    </tr>
                    <tr>
                    <td className="border p-2">In the 4th year</td>
                    <td className="border p-2 text-center">20%</td>
                    <td className="border p-2 text-center">30%</td>
                    <td className="border p-2 text-center">20%</td>
                    </tr>
                    <tr>
                    <td className="border p-2">In the 5th year</td>
                    <td className="border p-2 text-center">15%</td>
                    <td className="border p-2 text-center">30%</td>
                    <td className="border p-2 text-center">15%</td>
                    </tr>
                    <tr>
                    <td className="border p-2">In the 6th year</td>
                    <td className="border p-2 text-center">5%</td>
                    <td className="border p-2 text-center">30%</td>
                    <td className="border p-2 text-center">10%</td>
                    </tr>
                    <tr>
                    <td className="border p-2">After the 6th year</td>
                    <td className="border p-2 text-center">0%</td>
                    <td className="border p-2 text-center">10%</td>
                    <td className="border p-2 text-center">10%</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500">
                Note: This calculator provides an estimate only. For accurate tax calculations, please consult with a tax
                professional.
            </p>
            </div>
        </div>
        </div>
    </div>
  )
}
