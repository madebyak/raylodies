'use client';

import { openCheckout } from '@/lib/paddle/client';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

export function BuyButton({ 
  priceId, 
  productId,
  productSlug,
}: { 
  priceId: string; 
  productId: string;
  productSlug: string;
}) {
  const router = useRouter();
  
  const handleBuy = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login first
      router.push(`/login?redirect=${encodeURIComponent(`/store/${productSlug}`)}`);
      return;
    }
    
    await openCheckout(priceId, {
      userId: user.id,
      userEmail: user.email!,
      productId: productId,
    });
  };
  
  return (
    <Button onClick={handleBuy} className="w-full flex items-center justify-center gap-2">
      <ShoppingBag size={18} />
      Buy Now
    </Button>
  );
}


