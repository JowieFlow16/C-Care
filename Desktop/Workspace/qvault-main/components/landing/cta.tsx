import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="bg-primary py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Excel?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join thousands of Ugandan students who are already using Q{"'"}Vault 
            to improve their grades and understanding.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/sign-up">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto gap-2 text-base font-semibold"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/resources">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Explore Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
