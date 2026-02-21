import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { 
  BookOpen, 
  FileText, 
  FolderKanban, 
  Bookmark, 
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

async function getQuote() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .order("id", { ascending: false })
    .limit(10)
  
  if (data && data.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.length)
    return data[randomIndex]
  }
  return null
}

async function getSubjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("subjects")
    .select("*")
    .order("name")
  return data || []
}

async function getRecentActivity(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("bookmarks")
    .select(`
      *,
      activities (id, title, subject_id)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3)
  return data || []
}

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [quote, subjects] = await Promise.all([
    getQuote(),
    getSubjects(),
  ])

  const recentActivity = user ? await getRecentActivity(user.id) : []

  const quickLinks = [
    { 
      name: "Activities of Integration", 
      description: "Practice with curriculum-aligned activities",
      href: "/student/activities", 
      icon: BookOpen,
      color: "text-sky-600",
      bgColor: "bg-sky-50"
    },
    { 
      name: "UCE Past Papers", 
      description: "Access previous examination papers",
      href: "/student/past-papers", 
      icon: FileText,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    { 
      name: "Project Work", 
      description: "Project templates and guidelines",
      href: "/student/projects", 
      icon: FolderKanban,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    { 
      name: "My Bookmarks", 
      description: "Quick access to saved resources",
      href: "/student/bookmarks", 
      icon: Bookmark,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
  ]

  const subjectsByCategory = {
    sciences: subjects.filter(s => s.category === "sciences"),
    humanities: subjects.filter(s => s.category === "humanities"),
    languages: subjects.filter(s => s.category === "languages"),
  }

  return (
    <div className="space-y-6">
      {/* Welcome section with quote */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              Continue your learning journey with Q{"'"}Vault
            </p>
          </div>
          {quote && (
            <div className="flex items-start gap-3 max-w-md rounded-lg bg-card p-4 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm italic text-foreground">{`"${quote.text}"`}</p>
                {quote.author && (
                  <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.name} href={link.href} className="group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-2">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${link.bgColor}`}>
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base flex items-center justify-between">
                  {link.name}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {link.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Subjects by Category */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sciences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-sky-500" />
              Sciences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjectsByCategory.sciences.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/student/activities?subject=${subject.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <span className="text-sm font-medium">{subject.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Humanities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              Humanities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjectsByCategory.humanities.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/student/activities?subject=${subject.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <span className="text-sm font-medium">{subject.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjectsByCategory.languages.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/student/activities?subject=${subject.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <span className="text-sm font-medium">{subject.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-3xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Activities Completed</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-3xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Papers Attempted</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{recentActivity.length}</p>
                <p className="text-sm text-muted-foreground">Bookmarks</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <p className="text-3xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.activities?.title || "Bookmarked item"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bookmarked recently
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No recent activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start exploring activities to see your progress here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
