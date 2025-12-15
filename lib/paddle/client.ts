import { initializePaddle, Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | undefined = undefined;

export async function getPaddle(): Promise<Paddle | undefined> {
  if (paddleInstance) return paddleInstance;
  
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production';
  
  if (!token) {
    console.error("❌ Paddle Client Token missing - check NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
    return undefined;
  }

  console.log(`🏓 Initializing Paddle: environment=${environment}, token=${token.substring(0, 10)}...`);

  try {
    paddleInstance = await initializePaddle({
      environment: environment || 'sandbox',
      token: token,
    });
    
    console.log("✅ Paddle initialized successfully");
    return paddleInstance;
  } catch (e) {
    console.error("❌ Failed to initialize Paddle:", e);
    return undefined;
  }
}

export async function openCheckout(
  priceId: string, 
  customData: { userId: string; userEmail: string; productId: string }
) {
  console.log(`🛒 Opening checkout for price: ${priceId}`);
  
  const paddle = await getPaddle();
  
  if (!paddle) {
    console.error("❌ Paddle not initialized - cannot open checkout");
    alert("Payment system not available. Please try again later.");
    return;
  }
  
  try {
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
    console.log("✅ Checkout opened");
  } catch (e) {
    console.error("❌ Failed to open checkout:", e);
    alert("Failed to open checkout. Please try again.");
  }
}
