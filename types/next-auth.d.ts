import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      restaurantId: string
      id: string
      name?: string
      email?: string
      image?: string
    }
  }

  interface User {
    accessToken: string
    restaurantId: string
    [key: string]: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    restaurantId: string
  }
} 