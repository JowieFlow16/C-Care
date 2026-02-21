import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Target, Users, Lightbulb, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  const values = [
    {
      title: "Educational Excellence",
      description: "We are committed to providing high-quality, curriculum-aligned resources that help students achieve their academic goals.",
      icon: Target,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Accessibility",
      description: "Education should be accessible to all. We design our platform to work on any device, even with limited internet connectivity.",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Innovation",
      description: "We continuously improve our platform with modern technology to enhance the learning experience for Ugandan students.",
      icon: Lightbulb,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Community",
      description: "We believe in the power of community. Our platform connects students with teachers for guidance and support.",
      icon: Heart,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                About Q{"'"}Vault
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Q{"'"}Vault is an educational platform dedicated to supporting Ugandan students 
                in their academic journey. We provide comprehensive resources aligned with 
                Uganda{"'"}s New Lower Secondary Curriculum (NLSC).
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-secondary/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">Our Mission</h2>
              <div className="bg-card rounded-2xl p-8 shadow-sm border">
                <p className="text-lg text-foreground leading-relaxed text-center">
                  To democratize access to quality educational resources for every Ugandan student, 
                  empowering them to excel in their studies and build a brighter future through 
                  comprehensive Activities of Integration, past papers, and direct support from educators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-background py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground">Our Values</h2>
              <p className="mt-4 text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title} className="text-center">
                  <CardHeader>
                    <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full ${value.bgColor}`}>
                      <value.icon className={`h-7 w-7 ${value.color}`} />
                    </div>
                    <CardTitle className="text-lg mt-4">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-secondary/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">Our Story</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p>
                  Q{"'"}Vault was born from a simple observation: many Ugandan students struggle 
                  to access quality educational materials aligned with the new curriculum. 
                  Traditional resources are often expensive, outdated, or simply unavailable 
                  in many regions.
                </p>
                <p className="mt-4">
                  We set out to change that. By creating a digital platform that works on any 
                  device, provides offline access, and connects students directly with teachers, 
                  we{"'"}re making quality education more accessible than ever before.
                </p>
                <p className="mt-4">
                  Today, Q{"'"}Vault serves students across Uganda, providing them with Activities 
                  of Integration, UCE past papers, project guides, and a supportive community 
                  of educators ready to help them succeed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
