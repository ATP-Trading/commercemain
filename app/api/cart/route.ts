import { cartForSession } from '@/lib/cart/session-cart'
import { getValidAccessToken } from '@/lib/shopify/customer-account-oauth'
import { NextRequest, NextResponse } from 'next/server'
import { 
  getCart, 
  createCart, 
  addToCart, 
  removeFromCart, 
  updateCart 
} from '@/lib/shopify/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Validation schemas
const addToCartSchema = z.object({
  merchandiseId: z.string(),
  quantity: z.number().int().positive(),
})

const updateCartSchema = z.object({
  lineId: z.string(),
  merchandiseId: z.string(),
  quantity: z.number().int().min(0),
})

const removeFromCartSchema = z.object({
  lineIds: z.array(z.string()),
})

// Get current cart
export async function GET(request: NextRequest) {
  try {
    const existing = await getCart()
    const cart = existing ? await cartForSession(existing, await getValidAccessToken()) : undefined
    
    return NextResponse.json({
      success: true,
      cart
    })
    
  } catch (error) {
    console.error('Get cart error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// Add item to cart or create cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'add') {
      // Validate input
      const validatedData = addToCartSchema.parse(body)
      
      // Add to cart
      const cart = await addToCart([{
        merchandiseId: validatedData.merchandiseId,
        quantity: validatedData.quantity
      }])
      
      return NextResponse.json({
        success: true,
        cart,
        message: 'Item added to cart'
      })
      
    } else if (action === 'create') {
      // Create new cart
      const cart = await createCart()
      
      return NextResponse.json({
        success: true,
        cart,
        message: 'Cart created'
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Cart POST error:', error)
    
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
      { error: 'Failed to process cart operation' },
      { status: 500 }
    )
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = updateCartSchema.parse(body)
    
    // Update cart
    const cart = await updateCart([{
      id: validatedData.lineId,
      merchandiseId: validatedData.merchandiseId,
      quantity: validatedData.quantity
    }])
    
    return NextResponse.json({
      success: true,
      cart,
      message: 'Cart updated'
    })
    
  } catch (error) {
    console.error('Cart PUT error:', error)
    
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
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// Remove items from cart
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = removeFromCartSchema.parse(body)
    
    // Remove from cart
    const cart = await removeFromCart(validatedData.lineIds)
    
    return NextResponse.json({
      success: true,
      cart,
      message: 'Items removed from cart'
    })
    
  } catch (error) {
    console.error('Cart DELETE error:', error)
    
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
      { error: 'Failed to remove items from cart' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'