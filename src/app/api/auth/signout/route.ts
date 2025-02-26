import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * POST handler to sign out the user
 */
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  // Clear the authentication cookies
  cookieStore.delete('ghl_user')
  cookieStore.delete('ghl_access_token')
  cookieStore.delete('ghl_refresh_token')
  
  return NextResponse.json({ success: true })
} 