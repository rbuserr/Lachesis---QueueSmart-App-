"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import SnakeLogo from "@/components/ui/snake-logo.png"

type LoginErrors = {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      newErrors.email = "Email is required."
    } else if (!emailPattern.test(email.trim())) {
      newErrors.email = "Enter a valid email address."
    }

    if (!password) {
      newErrors.password = "Password is required."
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Mock login for the front-end assignment.
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#08090b] text-white">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            QueueSmart
          </Link>

          <p className="text-sm text-zinc-400">Smart Queue Management</p>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-800 bg-[#0b0c0f] shadow-2xl lg:grid-cols-2">
          <div className="hidden border-r border-zinc-800 p-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 inline-flex rounded-lg border border-zinc-700 p-3">
                <LockKeyhole className="h-7 w-7 text-violet-400" />
              </div>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Support without the waiting room.
              </h1>

              <p className="mt-5 max-w-md text-lg leading-8 text-zinc-400">
                Sign in to join support queues, track your position, and receive
                live status updates.
              </p>
            </div>

            <p className="text-sm text-zinc-500">
              QueueSmart · Proprietary Trading Support
            </p>
          </div>

          <Card className="rounded-none border-0 bg-transparent text-white shadow-none">
            <CardHeader className="space-y-2 px-8 pb-4 pt-10 sm:px-12">
              <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold">Sign in to QueueSmart</h2>

              <p className="text-zinc-400">
                Enter your email and password to continue.
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-10 sm:px-12">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-zinc-200"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)

                        if (errors.email) {
                          setErrors((current) => ({
                            ...current,
                            email: undefined,
                          }))
                        }
                      }}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? "login-email-error" : undefined
                      }
                      className="h-11 border-zinc-700 bg-[#08090b] pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                    />
                  </div>

                  {errors.email && (
                    <p
                      id="login-email-error"
                      className="text-sm text-red-400"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-zinc-200"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm text-violet-400 transition hover:text-violet-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)

                        if (errors.password) {
                          setErrors((current) => ({
                            ...current,
                            password: undefined,
                          }))
                        }
                      }}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "login-password-error" : undefined
                      }
                      className="h-11 border-zinc-700 bg-[#08090b] px-10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      id="login-password-error"
                      className="text-sm text-red-400"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-[#08090b] accent-violet-600"
                  />

                  Remember me
                </label>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full bg-white font-semibold text-black hover:bg-zinc-200"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <p className="text-center text-sm text-zinc-400">
                  Do not have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-violet-400 transition hover:text-violet-300"
                  >
                    Create an account
                  </Link>
                </p>

                <div className="rounded-lg border border-zinc-800 bg-[#08090b] p-4">
                  <p className="text-xs leading-5 text-zinc-500">
                    Demo note: Authentication is mocked for this assignment.
                    Enter any valid email and a password with at least six
                    characters.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-zinc-800">
        <div className="flex items-center justify-center gap-2 px-6 py-5 text-center text-sm font-semibold text-zinc-400">
          <span>QueueSmart • Version 1.0</span>

          <Image
            src={SnakeLogo}
            alt="QueueSmart Logo"
            width={36}
            height={36}
            className="object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>
      </footer>
    </main>
  )
}