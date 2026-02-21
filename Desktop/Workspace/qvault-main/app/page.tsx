import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Subjects } from "@/components/landing/subjects"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Subjects />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
