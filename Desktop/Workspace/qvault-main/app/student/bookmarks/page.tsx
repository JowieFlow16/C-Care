import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Bookmark, BookOpen, FileText, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

async function getBookmarks(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("bookmarks")
    .select(`
      *,
      activities (
        id, 
        title, 
        description,
        subjects (id, name, category)
      ),
      past_papers (
        id,
        title,
        year,
        subjects (id, name, category)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return data || []
}

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const bookmarks = user ? await getBookmarks(user.id) : []

  const categoryColors: Record<string, { text: string; bg: string }> = {
    sciences: { text: "text-sky-700", bg: "bg-sky-50" },
    humanities: { text: "text-amber-700", bg: "bg-amber-50" },
    languages: { text: "text-emerald-700", bg: "bg-emerald-50" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Bookmarks</h1>
        <p className="text-muted-foreground mt-1">
          Quick access to your saved activities and resources
        </p>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => {
            const item = bookmark.activities || bookmark.past_papers
            const isActivity = !!bookmark.activities
            const subject = item?.subjects
            const colors = categoryColors[subject?.category || "sciences"]

            return (
              <Card key={bookmark.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isActivity ? (
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge 
                        variant="secondary" 
                        className={`${colors.bg} ${colors.text} border-0 text-xs`}
                      >
                        {subject?.name}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {isActivity ? "Activity" : "Past Paper"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-2 mt-2">
                    {item?.title}
                  </CardTitle>
                  {!isActivity && bookmark.past_papers?.year && (
                    <CardDescription>
                      Year: {bookmark.past_papers.year}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link 
                      href={isActivity 
                        ? `/student/activities/${item?.id}` 
                        : `/student/past-papers/${item?.id}`
                      }
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View
                      </Button>
                    </Link>
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
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No bookmarks yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
              Save activities and past papers for quick access later. 
              Click the bookmark icon on any resource to add it here.
            </p>
            <div className="flex gap-2 mt-4">
              <Link href="/student/activities">
                <Button variant="outline">
                  Browse Activities
                </Button>
              </Link>
              <Link href="/student/past-papers">
                <Button variant="outline">
                  Browse Past Papers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
