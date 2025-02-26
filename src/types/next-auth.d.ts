import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      locationId?: string | null
    } & DefaultSession['user']
    accessToken?: string
    error?: string
  }

  interface User extends DefaultUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    locationId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string
    name?: string | null
    email?: string | null
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
    user?: any
  }
} 