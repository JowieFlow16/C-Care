import { Download, MessageCircle, Bookmark, Clock, Shield, Smartphone } from "lucide-react"

const features = [
  {
    name: "Offline Access",
    description: "Download resources for offline study. Perfect for areas with limited internet connectivity.",
    icon: Download,
  },
  {
    name: "Ask for Help",
    description: "Connect with teachers and peers. Get answers to your questions through our chat system.",
    icon: MessageCircle,
  },
  {
    name: "Save & Bookmark",
    description: "Bookmark your favorite activities and resources for quick access later.",
    icon: Bookmark,
  },
  {
    name: "Track Progress",
    description: "Monitor your learning journey with progress tracking and activity history.",
    icon: Clock,
  },
  {
    name: "Verified Content",
    description: "All resources are reviewed and aligned with the official NCDC curriculum.",
    icon: Shield,
  },
  {
    name: "Mobile Friendly",
    description: "Access Q'Vault from any device. Optimized for smartphones and tablets.",
    icon: Smartphone,
  },
]

export function Features() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Designed for Ugandan Students
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Features built with your needs in mind, from offline access to 
            direct support from educators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-colors hover:border-primary/20"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{feature.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
