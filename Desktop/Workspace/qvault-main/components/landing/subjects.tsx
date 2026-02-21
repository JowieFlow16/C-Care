import Link from "next/link"
import { ArrowRight, Beaker, Globe, Languages, FileText, FolderKanban } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const subjectCategories = [
  {
    title: "Sciences",
    description: "Physics, Chemistry, Mathematics, Biology",
    icon: Beaker,
    href: "/resources/sciences",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
  },
  {
    title: "Humanities",
    description: "Geography, History, Entrepreneurship",
    icon: Globe,
    href: "/resources/humanities",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    subjects: ["Geography", "History", "Entrepreneurship"],
  },
  {
    title: "Languages",
    description: "English, Literature, Kiswahili",
    icon: Languages,
    href: "/resources/languages",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    subjects: ["English", "Literature", "Kiswahili"],
  },
]

const additionalResources = [
  {
    title: "UCE Past Papers",
    description: "Access previous examination papers with marking guides",
    icon: FileText,
    href: "/resources/past-papers",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    title: "Project Work",
    description: "Comprehensive project guides and templates",
    icon: FolderKanban,
    href: "/resources/projects",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

export function Subjects() {
  return (
    <section className="bg-secondary/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore Subject Areas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive resources organized by subject category, aligned with the 
            New Lower Secondary Curriculum.
          </p>
        </div>

        {/* Subject Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {subjectCategories.map((category) => (
            <Link key={category.title} href={category.href} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20 bg-card">
                <CardHeader>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${category.bgColor} mb-4`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <CardTitle className="flex items-center justify-between text-xl">
                    {category.title}
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="grid gap-6 md:grid-cols-2">
          {additionalResources.map((resource) => (
            <Link key={resource.title} href={resource.href} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20 bg-card">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${resource.bgColor}`}>
                    <resource.icon className={`h-6 w-6 ${resource.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center justify-between text-xl">
                      {resource.title}
                      <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    </CardTitle>
                    <CardDescription className="mt-1">{resource.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
