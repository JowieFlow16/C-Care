import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { FileText, Download, Calendar, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

async function getSubjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .order("name")
  return data || []
}

async function getPastPapers(subjectId?: string, year?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("past_papers")
    .select(`
      *,
      subjects (id, name, category)
    `)
    .order("year", { ascending: false })

  if (subjectId && subjectId !== "all") {
    query = query.eq("subject_id", subjectId)
  }

  if (year && year !== "all") {
    query = query.eq("year", parseInt(year))
  }

  const { data } = await query.limit(30)
  return data || []
}

export default async function PastPapersPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; year?: string }>
}) {
  const params = await searchParams
  const [subjects, papers] = await Promise.all([
    getSubjects(),
    getPastPapers(params.subject, params.year),
  ])

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const categoryColors: Record<string, { text: string; bg: string }> = {
    sciences: { text: "text-sky-700", bg: "bg-sky-50" },
    humanities: { text: "text-amber-700", bg: "bg-amber-50" },
    languages: { text: "text-emerald-700", bg: "bg-emerald-50" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">UCE Past Papers</h1>
        <p className="text-muted-foreground mt-1">
          Access previous examination papers with marking guides
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="search"
            placeholder="Search papers..."
            className="pl-10"
          />
        </form>
        <div className="flex gap-2">
          <Select name="subject" defaultValue={params.subject || "all"}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="year" defaultValue={params.year || "all"}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Papers Grid */}
      {papers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => {
            const colors = categoryColors[paper.subjects?.category || "sciences"]
            return (
              <Card key={paper.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${colors.bg} ${colors.text} border-0`}
                    >
                      {paper.subjects?.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {paper.year}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {paper.title}
                  </CardTitle>
                  <CardDescription>
                    Paper {paper.paper_number} • {paper.term || "Annual"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {paper.file_url && (
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                        <a href={paper.file_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Paper
                        </a>
                      </Button>
                    )}
                    {paper.marking_guide_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={paper.marking_guide_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No past papers found</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              No past papers match your filters. Try adjusting your selection or check back later.
            </p>
            <Link href="/student/past-papers">
              <Button variant="outline" className="mt-4 bg-transparent">
                Clear Filters
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
