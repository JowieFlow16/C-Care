import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Beaker, Globe, Languages, FileText, FolderKanban, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getSubjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .order("name")
  return data || []
}

export default async function ResourcesPage() {
  const subjects = await getSubjects()

  const subjectsByCategory = {
    sciences: subjects.filter(s => s.category === "sciences"),
    humanities: subjects.filter(s => s.category === "humanities"),
    languages: subjects.filter(s => s.category === "languages"),
  }

  const categories = [
    {
      title: "Sciences",
      description: "Physics, Chemistry, Mathematics, Biology",
      icon: Beaker,
      subjects: subjectsByCategory.sciences,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      href: "/resources/sciences",
    },
    {
      title: "Humanities",
      description: "Geography, History, Entrepreneurship",
      icon: Globe,
      subjects: subjectsByCategory.humanities,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/resources/humanities",
    },
    {
      title: "Languages",
      description: "English, Literature, Kiswahili",
      icon: Languages,
      subjects: subjectsByCategory.languages,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/resources/languages",
    },
  ]

  const additionalResources = [
    {
      title: "UCE Past Papers",
      description: "Access previous examination papers with marking guides for thorough preparation",
      icon: FileText,
      href: "/resources/past-papers",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Project Work",
      description: "Comprehensive project guides, templates, and examples for all subjects",
      icon: FolderKanban,
      href: "/resources/projects",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-background py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Educational Resources
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive learning materials aligned with Uganda{"'"}s New Lower Secondary Curriculum
              </p>
            </div>

            {/* Subject Categories */}
            <div className="grid gap-8 lg:grid-cols-3 mb-12">
              {categories.map((category) => (
                <Card key={category.title} className="h-full">
                  <CardHeader>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle className="text-xl mt-4">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.subjects.map((subject) => (
                        <Link
                          key={subject.id}
                          href={`/auth/login?redirect=/student/activities?subject=${subject.id}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors group"
                        >
                          <span className="text-sm font-medium">{subject.name}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="grid gap-6 md:grid-cols-2">
              {additionalResources.map((resource) => (
                <Link key={resource.title} href={resource.href} className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/20">
                    <CardHeader className="flex flex-row items-start gap-4">
                      <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${resource.bgColor}`}>
                        <resource.icon className={`h-7 w-7 ${resource.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="flex items-center justify-between text-xl">
                          {resource.title}
                          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                        </CardTitle>
                        <CardDescription className="mt-2">{resource.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
