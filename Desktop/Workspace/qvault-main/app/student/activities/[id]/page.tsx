import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { BookOpen, Download, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ActivityDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      subjects (id, name, category),
      topics (id, name)
    `)
    .eq("id", resolvedParams.id)
    .limit(1)
    .single()

  if (error || !data) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-destructive">Activity not found.</p>
          <Link href="/student/activities">
            <Button variant="outline" className="mt-4">Back to Activities</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const activity: any = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/student/activities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{activity.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{activity.title}</CardTitle>
              <CardDescription>
                {activity.subjects?.name} {activity.topics ? `• ${activity.topics.name}` : ""}
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {activity.is_published ? "Published" : "Unpublished"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activity.scenario && (
            <section className="mb-4">
              <h3 className="text-lg font-semibold">Scenario</h3>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{activity.scenario}</p>
            </section>
          )}

          {activity.learner_task && (
            <section className="mb-4">
              <h3 className="text-lg font-semibold">Learner Task</h3>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{activity.learner_task}</p>
            </section>
          )}

          {activity.file_url && (
            <section className="mt-4">
              <h3 className="text-lg font-semibold">Support Material</h3>
              <div className="mt-2">
                <a href={activity.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Support Material
                  </Button>
                </a>
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
