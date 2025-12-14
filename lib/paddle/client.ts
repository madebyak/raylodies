import { initializePaddle, Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | undefined = undefined;

export async function getPaddle(): Promise<Paddle | undefined> {
  if (paddleInstance) return paddleInstance;
  
  if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
    console.error("Paddle Client Token missing");
    return undefined;
  }

  try {
    paddleInstance = await initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });
    
    return paddleInstance;
  } catch (e) {
    console.error("Failed to initialize Paddle:", e);
    return undefined;
  }
}

export async function openCheckout(
  priceId: string, 
  customData: { userId: string; userEmail: string; productId: string }
) {
  const paddle = await getPaddle();
  
  if (!paddle) return;
  
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: customData, 
    customer: { email: customData.userEmail },
    settings: {
      displayMode: 'overlay',
      theme: 'dark',
      successUrl: `${window.location.origin}/account/purchases`,
    },
  });
}
