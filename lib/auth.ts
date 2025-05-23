import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { jwtDecode } from 'jwt-decode'

export const config = {
  basePath: '/api/auth',
  secret: process.env.NEXTAUTH_SECRET || 'my-secret-that-should-be-in-env-file',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e password sono obbligatori')
        }

        try {
          const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Autenticazione fallita')
          }

          if (!data.token) {
            throw new Error('Token non fornito dal server')
          }

          // Decodifica JWT per estrarre le informazioni
          const decoded = jwtDecode(data.token)
          
          return {
            id: data.user._id || data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            accessToken: data.token,
            restaurantId: data.user.restaurant || decoded.restaurantId,
            ...decoded
          }
        } catch (error) {
          console.error('Errore di autenticazione:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 giorni
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: any }) {
      if (user) {
        token.accessToken = user.accessToken
        token.restaurantId = user.restaurantId
      }
      return token
    },
    async session({ session, token }: { session: any, token: JWT }) {
      session.accessToken = token.accessToken as string
      session.user.restaurantId = token.restaurantId as string
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config) 