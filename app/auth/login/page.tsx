"use client"

import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LockKeyhole, MailIcon } from "lucide-react"
import BubbleBackground from "@/components/bubble-background"

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri")
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true)
      
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        toast({
          title: "Errore di accesso",
          description: result.error,
          variant: "destructive"
        })
        return
      }

      router.push(callbackUrl)
      
    } catch (error) {
      console.error("Errore durante il login:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-20 h-20 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
                alt="MenuChat Logo"
                width={80}
                height={80}
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1B9AAA] mb-2">MenuChat</h1>
            <p className="text-gray-700 text-center max-w-xs">
              Accedi al tuo account per gestire i tuoi menu e template WhatsApp
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">
                {error === "CredentialsSignin" 
                  ? "Email o password non validi"
                  : "Si è verificato un errore durante l'accesso"}
              </p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@esempio.com"
                    className="pl-10 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    disabled={isLoading}
                    {...register("email")}
                  />
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <CustomButton
                  type="submit"
                  className="w-full py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    "Accedi"
                  )}
                </CustomButton>
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <Link href="/auth/register" className="text-[#1B9AAA] hover:underline">
                Non hai un account? Registrati
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
} 