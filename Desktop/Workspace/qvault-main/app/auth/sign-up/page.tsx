"use client"

import React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GraduationCap, Users } from "lucide-react"

type UserRole = "student" | "teacher"

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<UserRole | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [school, setSchool] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/${role}/dashboard`,
          data: {
            full_name: fullName,
            role: role,
            school: school,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              Q
            </div>
            <span className="text-2xl font-semibold text-foreground tracking-tight">
              Q{"'"}Vault
            </span>
          </Link>

          {step === 1 ? (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join Q{"'"}Vault</CardTitle>
                <CardDescription>
                  Select your role to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("student")}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-50 group-hover:bg-sky-100 transition-colors">
                      <GraduationCap className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">I{"'"}m a Student</p>
                      <p className="text-sm text-muted-foreground">
                        Access learning materials, activities, and past papers
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("teacher")}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">I{"'"}m a Teacher</p>
                      <p className="text-sm text-muted-foreground">
                        Upload resources, help students, and track progress
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>
                  {role === "student" 
                    ? "Start your learning journey today"
                    : "Join as an educator and help students excel"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="school">School (Optional)</Label>
                      <Input
                        id="school"
                        type="text"
                        placeholder="e.g., Jinja College"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="repeat-password">Confirm Password</Label>
                      <Input
                        id="repeat-password"
                        type="password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                        {error}
                      </p>
                    )}
                    <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="w-full"
                    >
                      Back to role selection
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
