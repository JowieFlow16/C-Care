import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { BookOpen, Filter, Search } from "lucide-react"
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

async function getActivities(subjectId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("activities")
    .select(`
      *,
      subjects (id, name, category),
      topics (id, name)
    `)
    .order("created_at", { ascending: false })

  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  const { data } = await query.limit(20)
  return data || []
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; search?: string }>
}) {
  const params = await searchParams
  const [subjects, activities] = await Promise.all([
    getSubjects(),
    getActivities(params.subject),
  ])

  const categoryColors: Record<string, { text: string; bg: string }> = {
    sciences: { text: "text-sky-700", bg: "bg-sky-50" },
    humanities: { text: "text-amber-700", bg: "bg-amber-50" },
    languages: { text: "text-emerald-700", bg: "bg-emerald-50" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activities of Integration</h1>
        <p className="text-muted-foreground mt-1">
          Practice with curriculum-aligned activities across all subjects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <form className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search activities..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
          <form>
            <Select name="subject" defaultValue={params.subject || "all"}>
              <SelectTrigger className="w-[180px]">
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
          </form>
        </div>
      </div>

      {/* Activities Grid */}
      {activities.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => {
            const categoryKey = activity.subjects?.category || "sciences"
            const colors = categoryColors[categoryKey] || categoryColors["sciences"]
            return (
              <Link key={activity.id} href={`/student/activities/${activity.id}`}>
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${colors.bg} ${colors.text} border-0`}
                      >
                        {activity.subjects?.name}
                      </Badge>
                      {activity.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {activity.difficulty}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2 mt-2">
                      {activity.title}
                    </CardTitle>
                    {activity.topics && (
                      <CardDescription className="text-sm">
                        Topic: {activity.topics.name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {activity.estimated_time || "15"} min
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No activities found</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              {params.subject 
                ? "No activities available for this subject yet. Check back later!"
                : "No activities have been added yet. Check back soon!"
              }
            </p>
            {params.subject && (
              <Link href="/student/activities">
                <Button variant="outline" className="mt-4 bg-transparent">
                  View All Activities
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
