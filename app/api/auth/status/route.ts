import { NextResponse } from 'next/server'
import {
  isLoggedIn,
  getValidAccessToken,
  queryCustomerAccountApi,
  clearTokens,
} from '@/lib/shopify/customer-account-oauth'

// GraphQL query to get basic customer info
const CUSTOMER_QUERY = `
  query getCustomer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
    }
  }
`

interface CustomerData {
  customer: {
    id: string
    firstName: string | null
    lastName: string | null
    emailAddress: {
      emailAddress: string
    } | null
    phoneNumber: {
      phoneNumber: string
    } | null
  } | null
}

export async function GET() {
  try {
    const loggedIn = await isLoggedIn()

    if (!loggedIn) {
      return NextResponse.json({
        isLoggedIn: false,
        customer: null,
      })
    }

    // Get a valid access token (will refresh if needed)
    const accessToken = await getValidAccessToken()

    if (!accessToken) {
      return NextResponse.json({
        isLoggedIn: false,
        customer: null,
      })
    }

    // Fetch customer data from Customer Account API
    try {
      const { data, errors } = await queryCustomerAccountApi<CustomerData>(
        accessToken,
        CUSTOMER_QUERY
      )

      if (errors?.length || !data?.customer) {
        console.error('[Auth/Status] Failed to fetch customer:', errors)
        return NextResponse.json({ error: 'Customer data temporarily unavailable' }, { status: 502, headers: { 'Cache-Control': 'private, no-store' } })
      }

      // Transform to a cleaner format
      const customer = {
        id: data.customer.id,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.emailAddress?.emailAddress,
        phone: data.customer.phoneNumber?.phoneNumber,
      }

      return NextResponse.json({
        isLoggedIn: true,
        customer,
      }, { headers: { 'Cache-Control': 'private, no-store' } })
    } catch (error) {
      console.error('[Auth/Status] Error fetching customer:', error)
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        await clearTokens()
        return NextResponse.json({ isLoggedIn: false, customer: null }, { headers: { 'Cache-Control': 'private, no-store' } })
      }
      return NextResponse.json({ error: 'Customer data temporarily unavailable' }, { status: 502, headers: { 'Cache-Control': 'private, no-store' } })
    }
  } catch (error) {
    console.error('[Auth/Status] Error checking auth status:', error)
    
    return NextResponse.json(
      { 
        isLoggedIn: false,
        customer: null,
        error: 'Failed to check authentication status'
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
