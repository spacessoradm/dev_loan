import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Fast & Easy Loan Applications
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Apply for a loan in minutes with our streamlined application process. Get approved quickly and receive
                funds directly to your account.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/login">Apply Now</Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/calculators/personal">Calculate Payments</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/placeholder.svg?height=500&width=500"
              alt="Loan Application"
              className="aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

