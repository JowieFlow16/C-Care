"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Send, Search, MessageCircle, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  full_name: string | null
  school: string | null
  unreadCount?: number
}

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  created_at: string
  is_read: boolean
}

export default function TeacherMessagesPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchStudentsWithMessages(user.id)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedStudent && currentUserId) {
      fetchMessages()
      // Set up real-time subscription
      const supabase = createClient()
      const channel = supabase
        .channel('teacher-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `recipient_id=eq.${currentUserId}`,
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedStudent, currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchStudentsWithMessages(teacherId: string) {
    const supabase = createClient()
    
    // Get unique student IDs who have messaged this teacher
    const { data: messageData } = await supabase
      .from("chat_messages")
      .select("sender_id, is_read")
      .eq("recipient_id", teacherId)
    
    if (!messageData || messageData.length === 0) {
      setStudents([])
      return
    }

    // Get unique sender IDs and count unread
    const studentIds = [...new Set(messageData.map(m => m.sender_id))]
    const unreadCounts: Record<string, number> = {}
    messageData.forEach(m => {
      if (!m.is_read) {
        unreadCounts[m.sender_id] = (unreadCounts[m.sender_id] || 0) + 1
      }
    })

    // Fetch student profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, school")
      .in("id", studentIds)
    
    if (profiles) {
      setStudents(profiles.map(p => ({
        ...p,
        unreadCount: unreadCounts[p.id] || 0
      })))
    }
  }

  async function fetchMessages() {
    if (!selectedStudent || !currentUserId) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedStudent.id}),and(sender_id.eq.${selectedStudent.id},recipient_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true })
    
    if (data) setMessages(data)

    // Mark messages as read
    await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("sender_id", selectedStudent.id)
      .eq("recipient_id", currentUserId)

    // Update unread count in local state
    setStudents(prev => prev.map(s => 
      s.id === selectedStudent.id ? { ...s, unreadCount: 0 } : s
    ))
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedStudent || !currentUserId) return

    setIsLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        content: newMessage,
        sender_id: currentUserId,
        recipient_id: selectedStudent.id,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data])
      setNewMessage("")
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Student Messages</h1>
        <p className="text-muted-foreground mt-1">
          Respond to student questions and provide guidance
        </p>
      </div>

      <div className="h-[calc(100vh-14rem)]">
        <div className="flex h-full gap-4">
          {/* Students List */}
          <Card className="w-80 shrink-0 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students
              </CardTitle>
              <CardDescription>
                {students.length} student{students.length !== 1 ? "s" : ""} have contacted you
              </CardDescription>
            </CardHeader>
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-10"
                />
              </div>
            </div>
            <CardContent className="flex-1 overflow-y-auto space-y-2 p-3 pt-0">
              {students.length > 0 ? (
                students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                      selectedStudent?.id === student.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {student.full_name?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.full_name || "Student"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.school || "Student"}
                      </p>
                    </div>
                    {student.unreadCount && student.unreadCount > 0 && (
                      <Badge variant="default" className="shrink-0">
                        {student.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Student questions will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col">
            {selectedStudent ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {selectedStudent.full_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {selectedStudent.full_name || "Student"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {selectedStudent.school || "Student"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isOwn = message.sender_id === currentUserId
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={cn(
                              "text-[10px] mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage(e)
                        }
                      }}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
                <div className="rounded-full bg-secondary p-4 mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Student Messages</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                  Select a student from the list to view and respond to their messages
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
