"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import Image from "next/image"
import SnakeLogo from "@/components/ui/snake-logo.png"

type RegisterErrors = {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
}

export default function RegisterPage() {
    const router = useRouter()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [errors, setErrors] = useState<RegisterErrors>({})
    const [formError, setFormError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateForm = () => {
        const newErrors: RegisterErrors = {}
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!name.trim()) {
            newErrors.name = "Full name is required."
        } else if (name.trim().length < 2) {
            newErrors.name = "Enter at least 2 characters."
        }

        if (!email.trim()) {
            newErrors.email = "Email is required."
        } else if (!emailPattern.test(email)) {
            newErrors.email = "Enter a valid email address."
        }

        if (!password) {
            newErrors.password = "Password is required."
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters."
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password."
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match."
        }

        setErrors(newErrors)

        if (!acceptedTerms) {
            setFormError("You must accept the terms to create an account.")
        } else {
            setFormError("")
        }

        return Object.keys(newErrors).length === 0 && acceptedTerms
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        // Front-end mock registration.
        // A real backend can replace this later.
        setTimeout(() => {
            router.push("/login")
        }, 500)
    }

    return (
        <main className="min-h-screen bg-[#08090b] text-white">
            <header className="border-b border-zinc-800">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        QueueSmart
                    </Link>

                    <p className="text-sm text-zinc-400">
                        Smart Queue Management
                    </p>
                </div>
            </header>

            <section className="flex min-h-[calc(100vh-69px)] items-center justify-center px-6 py-12">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-800 bg-[#0b0c0f] shadow-2xl lg:grid-cols-2">
                    <div className="hidden border-r border-zinc-800 p-12 lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <div className="mb-8 inline-flex rounded-lg border border-zinc-700 p-3">
                                <User className="h-7 w-7 text-violet-400" />
                            </div>

                            <h1 className="max-w-md text-4xl font-bold leading-tight">
                                One account. Every queue update.
                            </h1>

                            <p className="mt-5 max-w-md text-lg leading-8 text-zinc-400">
                                Create your QueueSmart account to request support, monitor wait
                                times, and receive in-app notifications.
                            </p>

                            <div className="mt-8 space-y-4">
                                <Feature text="Join support queues in seconds" />
                                <Feature text="Track live queue position" />
                                <Feature text="Receive status-change notifications" />
                            </div>
                        </div>

                        <p className="text-sm text-zinc-500">
                            QueueSmart · Proprietary Trading Support
                        </p>
                    </div>

                    <Card className="rounded-none border-0 bg-transparent text-white shadow-none">
                        <CardHeader className="space-y-2 px-8 pb-4 pt-10 sm:px-12">
                            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
                                Get started
                            </p>

                            <h2 className="text-3xl font-bold">Create your account</h2>

                            <p className="text-zinc-400">
                                Enter your information to access QueueSmart.
                            </p>
                        </CardHeader>

                        <CardContent className="px-8 pb-10 sm:px-12">
                            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="name"
                                        className="text-sm font-medium text-zinc-200"
                                    >
                                        Full name
                                    </label>

                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="John Doe"
                                            autoComplete="name"
                                            value={name}
                                            onChange={(event) => {
                                                setName(event.target.value)

                                                if (errors.name) {
                                                    setErrors((current) => ({
                                                        ...current,
                                                        name: undefined,
                                                    }))
                                                }
                                            }}
                                            aria-invalid={Boolean(errors.name)}
                                            aria-describedby={
                                                errors.name ? "register-name-error" : undefined
                                            }
                                            className="h-11 border-zinc-700 bg-[#08090b] pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                                        />
                                    </div>

                                    {errors.name && (
                                        <p
                                            id="register-name-error"
                                            className="text-sm text-red-400"
                                        >
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

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
                                                errors.email ? "register-email-error" : undefined
                                            }
                                            className="h-11 border-zinc-700 bg-[#08090b] pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                                        />
                                    </div>

                                    {errors.email && (
                                        <p
                                            id="register-email-error"
                                            className="text-sm text-red-400"
                                        >
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-zinc-200"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 6 characters"
                                            autoComplete="new-password"
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
                                                errors.password
                                                    ? "register-password-error"
                                                    : "password-requirement"
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

                                    {errors.password ? (
                                        <p
                                            id="register-password-error"
                                            className="text-sm text-red-400"
                                        >
                                            {errors.password}
                                        </p>
                                    ) : (
                                        <p
                                            id="password-requirement"
                                            className="text-xs text-zinc-500"
                                        >
                                            Use at least 6 characters.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirm-password"
                                        className="text-sm font-medium text-zinc-200"
                                    >
                                        Confirm password
                                    </label>

                                    <div className="relative">
                                        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                                        <Input
                                            id="confirm-password"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(event) => {
                                                setConfirmPassword(event.target.value)

                                                if (errors.confirmPassword) {
                                                    setErrors((current) => ({
                                                        ...current,
                                                        confirmPassword: undefined,
                                                    }))
                                                }
                                            }}
                                            aria-invalid={Boolean(errors.confirmPassword)}
                                            aria-describedby={
                                                errors.confirmPassword
                                                    ? "register-confirm-password-error"
                                                    : undefined
                                            }
                                            className="h-11 border-zinc-700 bg-[#08090b] px-10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword((current) => !current)
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirmed password"
                                                    : "Show confirmed password"
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirmPassword && (
                                        <p
                                            id="register-confirm-password-error"
                                            className="text-sm text-red-400"
                                        >
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-400">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(event) => {
                                            setAcceptedTerms(event.target.checked)

                                            if (event.target.checked) {
                                                setFormError("")
                                            }
                                        }}
                                        className="mt-1 h-4 w-4 rounded border-zinc-700 bg-[#08090b] accent-violet-600"
                                    />

                                    <span>
                                        I agree to the QueueSmart terms of use and privacy policy.
                                    </span>
                                </label>

                                {formError && (
                                    <p className="text-sm text-red-400">{formError}</p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-11 w-full bg-white font-semibold text-black hover:bg-zinc-200"
                                >
                                    {isSubmitting ? "Creating account..." : "Create account"}
                                </Button>

                                <p className="text-center text-sm text-zinc-400">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-violet-400 hover:text-violet-300"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
            <footer className="mt-12 border-t border-zinc-800">
                <div className="flex items-center justify-center gap-2 py-6 text-center text-sm font-semibold text-zinc-400">
                    <span>QueueSmart Register • Version 1.0</span>

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

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-zinc-300">
            <CheckCircle2 className="h-5 w-5 text-violet-400" />
            <span>{text}</span>
        </div>
    )
}