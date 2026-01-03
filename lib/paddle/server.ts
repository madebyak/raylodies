'use server'

/**
 * Server-side Paddle API client for creating products and prices
 * Requires PADDLE_API_KEY environment variable
 */

const PADDLE_API_URL = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com'

interface PaddleProduct {
  id: string
  name: string
  description: string | null
  status: string
}

interface PaddlePrice {
  id: string
  product_id: string
  unit_price: {
    amount: string
    currency_code: string
  }
  status: string
}

interface PaddleResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

interface PaddleError {
  error: {
    type: string
    code: string
    detail: string
  }
}

async function paddleRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: Record<string, unknown>
): Promise<{ data?: T; error?: string }> {
  const apiKey = process.env.PADDLE_API_KEY

  if (!apiKey) {
    console.error('PADDLE_API_KEY is not configured')
    return { error: 'Paddle API key not configured. Add PADDLE_API_KEY to your environment variables.' }
  }

  try {
    const response = await fetch(`${PADDLE_API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const json = await response.json()

    if (!response.ok) {
      const error = json as PaddleError
      console.error('Paddle API Error:', error)
      return { error: error.error?.detail || 'Failed to communicate with Paddle' }
    }

    return { data: (json as PaddleResponse<T>).data }
  } catch (err) {
    console.error('Paddle API request failed:', err)
    return { error: 'Failed to connect to Paddle API' }
  }
}

/**
 * Create a new product in Paddle
 */
export async function createPaddleProduct(
  name: string,
  description?: string
): Promise<{ data?: PaddleProduct; error?: string }> {
  return paddleRequest<PaddleProduct>('/products', 'POST', {
    name,
    description: description || null,
    tax_category: 'standard', // Digital goods
  })
}

/**
 * Update an existing product in Paddle
 */
export async function updatePaddleProduct(
  productId: string,
  name: string,
  description?: string
): Promise<{ data?: PaddleProduct; error?: string }> {
  return paddleRequest<PaddleProduct>(`/products/${productId}`, 'PATCH', {
    name,
    description: description || null,
  })
}

/**
 * Create a new price for a product in Paddle
 * Amount should be in the smallest currency unit (cents for USD)
 */
export async function createPaddlePrice(
  productId: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ data?: PaddlePrice; error?: string }> {
  // Convert dollars to cents (Paddle expects cents)
  const amountInCents = Math.round(amount * 100).toString()

  return paddleRequest<PaddlePrice>('/prices', 'POST', {
    product_id: productId,
    description: 'One-time purchase',
    unit_price: {
      amount: amountInCents,
      currency_code: currency,
    },
    billing_cycle: null, // One-time purchase, not subscription
  })
}

/**
 * Archive a price in Paddle (prices cannot be deleted, only archived)
 */
export async function archivePaddlePrice(
  priceId: string
): Promise<{ data?: PaddlePrice; error?: string }> {
  return paddleRequest<PaddlePrice>(`/prices/${priceId}`, 'PATCH', {
    status: 'archived',
  })
}

/**
 * Create or update a complete Paddle product with price
 * Returns the product ID and price ID
 */
export async function syncProductWithPaddle(
  options: {
    existingPaddleProductId?: string | null
    existingPaddlePriceId?: string | null
    name: string
    description?: string
    price: number
    currency?: string
  }
): Promise<{ 
  paddleProductId?: string
  paddlePriceId?: string
  error?: string 
}> {
  const { 
    existingPaddleProductId, 
    existingPaddlePriceId, 
    name, 
    description, 
    price,
    currency = 'USD' 
  } = options

  let paddleProductId = existingPaddleProductId
  let paddlePriceId = existingPaddlePriceId

  // Step 1: Create or update the product
  if (paddleProductId) {
    // Update existing product
    const productResult = await updatePaddleProduct(paddleProductId, name, description)
    if (productResult.error) {
      return { error: `Failed to update Paddle product: ${productResult.error}` }
    }
  } else {
    // Create new product
    const productResult = await createPaddleProduct(name, description)
    if (productResult.error) {
      return { error: `Failed to create Paddle product: ${productResult.error}` }
    }
    paddleProductId = productResult.data!.id
  }

  // Step 2: Handle price
  // Paddle prices are immutable - if price changes, archive old and create new
  if (paddlePriceId) {
    // For now, we'll create a new price and archive the old one
    // In production, you might want to check if price actually changed
    const archiveResult = await archivePaddlePrice(paddlePriceId)
    if (archiveResult.error) {
      console.warn('Failed to archive old price:', archiveResult.error)
      // Continue anyway - we'll create a new price
    }
  }

  // Create new price
  const priceResult = await createPaddlePrice(paddleProductId!, price, currency)
  if (priceResult.error) {
    return { error: `Failed to create Paddle price: ${priceResult.error}` }
  }
  paddlePriceId = priceResult.data!.id

  return {
    paddleProductId: paddleProductId!,
    paddlePriceId: paddlePriceId!,
  }
}


