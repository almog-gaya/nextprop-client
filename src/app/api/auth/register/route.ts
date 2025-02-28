import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Go High Level API endpoints
const GHL_API_V1_BASE_URL = process.env.GHL_API_V1_BASE_URL || 'https://rest.gohighlevel.com/v1'
const AGENCY_API_TOKEN = process.env.GHL_AGENCY_API_TOKEN

/**
 * POST handler for registering a new user with Go High Level
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { firstName, lastName, email, password, businessName, phone } = body
    
    console.log('Registering new user:', { firstName, lastName, email, businessName })
    
    if (!AGENCY_API_TOKEN) {
      console.error('Missing GHL_AGENCY_API_TOKEN environment variable')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Step 1: Create a new location using API 1.0
    console.log('Creating new location using API 1.0...')
    console.log('API Token:', AGENCY_API_TOKEN ? 'Present (not showing for security)' : 'Missing')
    console.log('API URL:', `${GHL_API_V1_BASE_URL}/locations`)
    
    const locationRequestBody = {
      businessName,
      address: '',
      city: '',
      state: '',
      country: 'US',
      postalCode: '',
      website: '',
      timezone: 'US/Central',
      firstName,
      lastName,
      email,
      phone,
      settings: {
        allowDuplicateContact: false,
        allowDuplicateOpportunity: false,
        allowFacebookNameMerge: false,
        disableContactTimezone: false
      }
    }
    
    console.log('Location request body:', JSON.stringify(locationRequestBody))
    
    const locationResponse = await fetch(`${GHL_API_V1_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENCY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationRequestBody),
    })
    
    console.log('Location response status:', locationResponse.status)
    console.log('Location response status text:', locationResponse.statusText)
    
    // Check if the response is empty
    const locationResponseText = await locationResponse.text()
    console.log('Location response text:', locationResponseText)
    
    if (!locationResponse.ok) {
      return NextResponse.json({ error: `Failed to create location: ${locationResponseText}` }, { status: 500 })
    }
    
    // Parse the response if it's not empty
    let locationData
    try {
      locationData = locationResponseText ? JSON.parse(locationResponseText) : {}
    } catch (parseError) {
      console.error('Error parsing location response:', parseError)
      return NextResponse.json({ error: 'Invalid response from location API' }, { status: 500 })
    }
    
    const locationId = locationData.id
    const locationApiKey = locationData.apiKey
    
    if (!locationId) {
      console.error('No location ID returned')
      return NextResponse.json({ error: 'No location ID returned from API' }, { status: 500 })
    }
    
    console.log('Location created successfully:', locationId)
    
    // Step 2: Create a user for the location using API 1.0
    console.log('Creating user for location using API 1.0...')
    
    const userRequestBody = {
      firstName,
      lastName,
      email,
      password,
      type: 'account',
      role: 'admin',
      locationIds: [locationId],
      permissions: {
        contactsEnabled: true,
        workflowsEnabled: true,
        dashboardStatsEnabled: true,
        bulkRequestsEnabled: true,
        appointmentsEnabled: true,
        reviewsEnabled: true,
        onlineListingsEnabled: true,
        phoneCallEnabled: true,
        conversationsEnabled: true,
        settingsEnabled: true,
        tagsEnabled: true,
        leadValueEnabled: true,
        marketingEnabled: true
      }
    }
    
    console.log('User request body:', JSON.stringify(userRequestBody))
    
    const userResponse = await fetch(`${GHL_API_V1_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENCY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userRequestBody),
    })
    
    console.log('User response status:', userResponse.status)
    console.log('User response status text:', userResponse.statusText)
    
    // Check if the response is empty
    const userResponseText = await userResponse.text()
    console.log('User response text:', userResponseText)
    
    if (!userResponse.ok) {
      // If user creation fails, attempt to delete the location
      try {
        await fetch(`${GHL_API_V1_BASE_URL}/locations/${locationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${AGENCY_API_TOKEN}`,
          },
        })
        console.log('Cleaned up location after user creation failure')
      } catch (cleanupError) {
        console.error('Failed to clean up location:', cleanupError)
      }
      
      return NextResponse.json({ error: `Failed to create user account: ${userResponseText}` }, { status: 500 })
    }
    
    // Parse the response if it's not empty
    let userData
    try {
      userData = userResponseText ? JSON.parse(userResponseText) : {}
    } catch (parseError) {
      console.error('Error parsing user response:', parseError)
      return NextResponse.json({ error: 'Invalid response from user API' }, { status: 500 })
    }
    
    console.log('User created successfully:', userData.id)
    
    // Step 3: Get an access token for the new user
    console.log('Getting access token for the new user...')
    
    try {
      // Use the location API key to authenticate the user
      const cookieStore = cookies()
      
      // Store the user data in cookies
      cookieStore.set('user', JSON.stringify({
        id: userData.id,
        name: `${firstName} ${lastName}`,
        email: email,
        locationId: locationId,
        client_id: String(process.env.GHL_CLIENT_ID || '')
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      })
      
      // Store the location API key as the access token
      cookieStore.set('access_token', locationApiKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      })
      
      console.log('User credentials stored in cookies')
    } catch (cookieError) {
      console.error('Error storing user credentials in cookies:', cookieError)
      // Continue with the registration process even if cookie storage fails
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      locationId,
      userId: userData.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 })
  }
} 