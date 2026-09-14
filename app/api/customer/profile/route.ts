import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  getValidAccessToken, 
  queryCustomerAccountApi,
  isLoggedIn 
} from '@/lib/shopify/customer-account-oauth'

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
}).strict().refine(data => data.firstName !== undefined || data.lastName !== undefined, 'No profile changes provided')


// GraphQL query to get customer profile
const CUSTOMER_PROFILE_QUERY = `
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
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        country
        territoryCode
        zoneCode
        zip
        phoneNumber
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            country
            territoryCode
            zoneCode
            zip
            phoneNumber
          }
        }
      }
      orders(first: 10) {
        edges {
          node {
            id
            number
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

// GraphQL mutation to update customer
const CUSTOMER_UPDATE_MUTATION = `
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
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
      userErrors {
        field
        message
        code
      }
    }
  }
`

interface CustomerData {
  customer: {
    id: string
    firstName: string | null
    lastName: string | null
    emailAddress: { emailAddress: string } | null
    phoneNumber: { phoneNumber: string } | null
    defaultAddress: Address | null
    addresses: { edges: Array<{ node: Address }> }
    orders: { edges: Array<{ node: Order }> }
  } | null
}

interface Address {
  id: string
  firstName: string | null
  lastName: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  country: string | null
  territoryCode: string | null
  zoneCode: string | null
  zip: string | null
  phoneNumber: string | null
}

interface Order {
  id: string
  number: number
  processedAt: string
  totalPrice: { amount: string; currencyCode: string }
  lineItems: { edges: Array<{ node: LineItem }> }
}

interface LineItem {
  title: string
  quantity: number
  image: { url: string; altText: string | null } | null
}

// Get customer profile
export async function GET() {
  try {
    const loggedIn = await isLoggedIn()
    
    if (!loggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const accessToken = await getValidAccessToken()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Get customer data from Customer Account API
    try {
      const { data, errors } = await queryCustomerAccountApi<CustomerData>(
        accessToken,
        CUSTOMER_PROFILE_QUERY
      )

      if (errors?.length || !data?.customer) {
        console.error('[Profile] Failed to fetch customer:', errors)
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }

      // Transform to a cleaner format compatible with the existing frontend
      const customer = {
        id: data.customer.id,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.emailAddress?.emailAddress,
        phone: data.customer.phoneNumber?.phoneNumber,
        defaultAddress: data.customer.defaultAddress
          ? {
              ...data.customer.defaultAddress,
              phone: data.customer.defaultAddress.phoneNumber,
              provinceCode: data.customer.defaultAddress.zoneCode,
              countryCode: data.customer.defaultAddress.territoryCode,
            }
          : null,
        addresses: data.customer.addresses.edges.map(e => ({
          ...e.node,
          phone: e.node.phoneNumber,
          provinceCode: e.node.zoneCode,
          countryCode: e.node.territoryCode,
        })),
        orders: {
          edges: data.customer.orders.edges.map(e => ({
            node: {
              ...e.node,
              orderNumber: e.node.number,
              processedAt: e.node.processedAt,
              totalPriceV2: e.node.totalPrice,
              lineItems: {
                edges: e.node.lineItems.edges.map(li => ({
                  node: {
                    title: li.node.title,
                    quantity: li.node.quantity,
                    variant: {
                      title: '',
                      image: li.node.image,
                    },
                  },
                })),
              },
            },
          })),
        },
      }

      return NextResponse.json({
        success: true,
        customer
      })
    } catch (apiError) {
      // Handle API errors gracefully - if the API fails, treat as unauthenticated
      console.error('[Profile] Customer Account API error:', apiError)
      return NextResponse.json(
        { error: apiError instanceof Error ? apiError.message : 'Failed to fetch customer data' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('[Profile] Get customer profile error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update customer profile
export async function PUT(request: NextRequest) {
  try {
    const loggedIn = await isLoggedIn()
    
    if (!loggedIn) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const accessToken = await getValidAccessToken()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    // Build the input for the Customer Account API
    const input: Record<string, unknown> = {}
    if (validatedData.firstName !== undefined) input.firstName = validatedData.firstName
    if (validatedData.lastName !== undefined) input.lastName = validatedData.lastName
    // Note: Email and phone updates may require different mutations in Customer Account API

    // Update customer using Customer Account API
    const { data, errors } = await queryCustomerAccountApi<{
      customerUpdate: {
        customer: CustomerData['customer']
        userErrors: Array<{ field: string[]; message: string; code: string }>
      }
    }>(accessToken, CUSTOMER_UPDATE_MUTATION, { input })

    if (errors?.length) {
      console.error('[Profile] Update failed:', errors)
      return NextResponse.json(
        { error: errors[0]?.message || 'Update failed' },
        { status: 400 }
      )
    }

    // Check for user errors
    if (data?.customerUpdate?.userErrors?.length) {
      const error = data.customerUpdate.userErrors[0]
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          field: error.field
        },
        { status: 400 }
      )
    }

    const customer = data?.customerUpdate?.customer
    if (!customer) return NextResponse.json({ error: 'Profile update was not confirmed' }, { status: 502 })
    
    return NextResponse.json({
      success: true,
      customer: customer ? {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.emailAddress?.emailAddress,
        phone: customer.phoneNumber?.phoneNumber,
      } : null,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('[Profile] Update customer profile error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
