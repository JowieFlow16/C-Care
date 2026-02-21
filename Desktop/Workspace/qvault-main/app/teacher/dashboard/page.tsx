import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { 
  BookOpen, 
  FileText, 
  Upload,
  MessageCircle,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  Eye,
  Download as DownloadIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

async function getTeacherStats(userId: string) {
  const supabase = await createClient()
  
  // Get activities count
  const { count: activitiesCount } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)

  // Get resources count
  const { count: resourcesCount } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("uploaded_by", userId)

  // Get unread messages count
  const { count: messagesCount } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("is_read", false)

  return {
    activities: activitiesCount || 0,
    resources: resourcesCount || 0,
    messages: messagesCount || 0,
  }
}

async function getRecentActivities(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("activities")
    .select(`
      *,
      subjects (id, name)
    `)
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(5)
  return data || []
}

async function getRecentMessages(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("chat_messages")
    .select(`
      *,
      sender:profiles!chat_messages_sender_id_fkey (id, full_name)
    `)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)
  return data || []
}

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [stats, recentActivities, recentMessages] = await Promise.all([
    getTeacherStats(user.id),
    getRecentActivities(user.id),
    getRecentMessages(user.id),
  ])

  const quickActions = [
    { 
      name: "Upload Activity", 
      description: "Create a new activity of integration",
      href: "/teacher/upload?type=activity", 
      icon: BookOpen,
      color: "text-sky-600",
      bgColor: "bg-sky-50"
    },
    { 
      name: "Upload Past Paper", 
      description: "Add examination papers with guides",
      href: "/teacher/upload?type=paper", 
      icon: FileText,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    { 
      name: "Upload Resource", 
      description: "Share study materials and notes",
      href: "/teacher/upload?type=resource", 
      icon: Upload,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    { 
      name: "View Messages", 
      description: "Respond to student questions",
      href: "/teacher/messages", 
      icon: MessageCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your content and help students excel
          </p>
        </div>
        <Link href="/teacher/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Upload New Content
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Activities
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activities}</div>
            <p className="text-xs text-muted-foreground">
              Activities created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resources Uploaded
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resources}</div>
            <p className="text-xs text-muted-foreground">
              Study materials shared
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Messages
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Reach
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Students helped
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.name} href={action.href} className="group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-2">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base flex items-center justify-between">
                  {action.name}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-muted-foreground" />
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Content and Messages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <Link href="/teacher/activities">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subjects?.name} • {activity.is_published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <Badge variant={activity.is_published ? "default" : "secondary"}>
                      {activity.is_published ? "Live" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No activities yet</p>
                <Link href="/teacher/upload?type=activity">
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Create Your First Activity
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Student Messages</CardTitle>
            <Link href="/teacher/messages">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {message.sender?.full_name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {message.sender?.full_name || "Student"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                    {!message.is_read && (
                      <Badge variant="default" className="shrink-0">New</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Student questions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
