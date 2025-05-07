import type { DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string
    user: {
      restaurantId: string
      id: string
    } & DefaultSession['user']
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