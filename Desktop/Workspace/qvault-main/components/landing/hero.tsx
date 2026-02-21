import Link from "next/link"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.08),rgba(255,255,255,0))]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Uganda{"'"}s New Lower Secondary Curriculum
          </div>

          {/* Main heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Excel in Your Studies with{" "}
            <span className="text-primary">Q{"'"}Vault</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Access comprehensive Activities of Integration, UCE past papers, and curated 
            educational resources aligned with Uganda{"'"}s curriculum. Everything you need 
            to succeed, in one place.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/resources">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base bg-transparent">
                Browse Resources
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">500+</span>
              <span className="text-sm text-muted-foreground">Activities</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">9</span>
              <span className="text-sm text-muted-foreground">Subject Areas</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">1000+</span>
              <span className="text-sm text-muted-foreground">Students</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
