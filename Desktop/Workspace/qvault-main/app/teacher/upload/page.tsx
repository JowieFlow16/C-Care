"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BookOpen, FileText, Upload, ArrowLeft, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

type UploadType = "activity" | "paper" | "resource"

interface Subject {
  id: string
  name: string
  category: string
}

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type") as UploadType | null

  const [step, setStep] = useState<1 | 2>(typeParam ? 2 : 1)
  const [uploadType, setUploadType] = useState<UploadType | null>(typeParam)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [topicId, setTopicId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [difficulty, setDifficulty] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [scenario, setScenario] = useState("")
  const [learnerTask, setLearnerTask] = useState("")
  const [year, setYear] = useState("")
  const [paperType, setPaperType] = useState("Mock")

  useEffect(() => {
    async function fetchSubjects() {
      const supabase = createClient()
      const { data } = await supabase
        .from("subjects")
        .select("*")
        .order("name")
      if (data) setSubjects(data)
    }
    fetchSubjects()
  }, [])

  useEffect(() => {
    async function fetchTopics() {
      if (!subjectId) return setTopics([])
      const supabase = createClient()
      const { data } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectId)
        .order("name")
      if (data) setTopics(data)
    }
    fetchTopics()
  }, [subjectId])

  const handleTypeSelect = (type: UploadType) => {
    setUploadType(type)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to upload content")
      setIsLoading(false)
      return
    }

    try {
      // upload file for activity/papers/resources if provided
      let fileUrl: string | null = null
      if ((uploadType === "paper" || uploadType === "resource" || uploadType === "activity") && file) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicData } = await supabase.storage
          .from("resources")
          .getPublicUrl(uploadData?.path || filePath)

        fileUrl = publicData?.publicUrl ?? null
      }

      if (uploadType === "activity") {
        const generatedTitle = (scenario || "").trim().split("\n")[0].slice(0, 100) || `Activity ${Date.now()}`
        if (!subjectId) throw new Error("Please select a subject")
        if (!learnerTask) throw new Error("Please provide the learner task")
        if (!scenario) throw new Error("Please provide the scenario")

        const { error } = await supabase.from("activities").insert({
          title: generatedTitle,
          subject_id: subjectId,
          topic_id: topicId || null,
          scenario,
          learner_task: learnerTask,
          file_url: fileUrl,
          teacher_id: user.id,
          is_published: false,
        })
        if (error) throw error
      } else if (uploadType === "paper") {
        if (!fileUrl) throw new Error("A file is required for past papers")

        const { error } = await supabase.from("past_papers").insert({
          title,
          subject_id: subjectId,
          year: year ? parseInt(year) : new Date().getFullYear(),
          paper_type: paperType,
          file_url: fileUrl,
          uploaded_by: user.id,
        })
        if (error) throw error
      } else if (uploadType === "resource") {
        if (!fileUrl) throw new Error("A file is required for resources")

        const { error } = await supabase.from("resources").insert({
          title,
          description,
          subject_id: subjectId,
          resource_type: "document",
          file_url: fileUrl,
          teacher_id: user.id,
        })
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/teacher/dashboard")
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Content Uploaded Successfully</h2>
            <p className="text-muted-foreground mt-2">
              Your content has been saved. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {step === 2 && (
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Content</h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 
              ? "Choose what type of content you want to upload" 
              : `Create a new ${uploadType}`
            }
          </p>
        </div>
      </div>

      {step === 1 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleTypeSelect("activity")}
            className="group text-left"
          >
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 group-hover:bg-sky-100 transition-colors">
                  <BookOpen className="h-6 w-6 text-sky-600" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Activity of Integration</CardTitle>
                <CardDescription className="mt-2">
                  Create curriculum-aligned activities with questions and guidelines
                </CardDescription>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("paper")}
            className="group text-left"
          >
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 group-hover:bg-rose-100 transition-colors">
                  <FileText className="h-6 w-6 text-rose-600" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Past Paper</CardTitle>
                <CardDescription className="mt-2">
                  Upload examination papers with optional marking guides
                </CardDescription>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("resource")}
            className="group text-left"
          >
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <Upload className="h-6 w-6 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Study Resource</CardTitle>
                <CardDescription className="mt-2">
                  Share notes, study guides, and other learning materials
                </CardDescription>
              </CardContent>
            </Card>
          </button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {uploadType === "activity" && "Create Activity"}
              {uploadType === "paper" && "Upload Past Paper"}
              {uploadType === "resource" && "Upload Resource"}
            </CardTitle>
            <CardDescription>
              Fill in the details below to upload your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {uploadType !== "activity" && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title"
                      required
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subjectId} onValueChange={setSubjectId} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                  {uploadType === "activity" && (
                    <>
                      <div>
                        <Label htmlFor="topic">Topic</Label>
                        <Select value={topicId} onValueChange={setTopicId}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="scenario">Scenario</Label>
                        <Textarea
                          id="scenario"
                          value={scenario}
                          onChange={(e) => setScenario(e.target.value)}
                          placeholder="Describe the scenario or context for this activity"
                          rows={6}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="file">Support Material (image, video, or document)</Label>
                        <input
                          id="file"
                          type="file"
                          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="learnerTask">Learner Task</Label>
                        <Textarea
                          id="learnerTask"
                          value={learnerTask}
                          onChange={(e) => setLearnerTask(e.target.value)}
                          placeholder="Describe the learner task(s)"
                          rows={6}
                          className="mt-1.5 font-mono text-sm"
                        />
                      </div>
                    </>
                  )}

                

                {uploadType === "paper" && (
                  <>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g., 2024"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paperType">Paper Type</Label>
                      <Select value={paperType} onValueChange={setPaperType}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select paper type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UCE">UCE</SelectItem>
                          <SelectItem value="UACE">UACE</SelectItem>
                          <SelectItem value="Mock">Mock</SelectItem>
                          <SelectItem value="Terminal">Terminal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {uploadType !== "activity" && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a brief description..."
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                )}

                {(uploadType === "paper" || uploadType === "resource") && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="file">File</Label>
                    <input
                      id="file"
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      required
                      className="mt-1.5"
                    />
                  </div>
                )}

                
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload Content"}
                </Button>
                <Link href="/teacher/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
