import { JwtPayload } from 'jwt-decode'

declare module 'jwt-decode' {
  interface JwtPayload {
    userId?: string
    restaurantId?: string
    email?: string
    exp?: number
    iat?: number
  }
} 