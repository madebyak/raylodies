import { ImageResponse } from 'next/og';
import { createPublicClient } from '@/lib/supabase/public';

// Image metadata
export const alt = 'Raylodies Product';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // Fetch product data
  const { data: product } = await supabase
    .from('products')
    .select(`
      title,
      price,
      is_free,
      thumbnail,
      og_image,
      categories (name)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  // If custom og_image is set, fetch and return it directly
  if (product?.og_image) {
    try {
      const imageResponse = await fetch(product.og_image);
      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        return new Response(imageBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch {
      // Fall through to generated image if fetch fails
    }
  }

  // Format price
  const priceText = product?.is_free || product?.price === 0 
    ? 'FREE' 
    : `$${product?.price?.toFixed(0) ?? '0'}`;

  const title = product?.title ?? 'Product';
  // categories comes as a single object from the join, not an array
  const categoryData = product?.categories as { name: string } | null | undefined;
  const category = categoryData?.name ?? 'Digital Product';
  const productImage = product?.thumbnail;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: '#000000',
          position: 'relative',
        }}
      >
        {/* Background gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #0a0a0a 100%)',
          }}
        />

        {/* Product image section - left side */}
        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          ) : (
            <div
              style={{
                width: '300px',
                height: '400px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          )}
        </div>

        {/* Content section - right side */}
        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 60px 60px 20px',
            position: 'relative',
          }}
        >
          {/* Category */}
          <div
            style={{
              display: 'flex',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {category}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: title.length > 30 ? '36px' : '48px',
              fontWeight: 300,
              color: '#ffffff',
              margin: '0 0 24px 0',
              lineHeight: 1.2,
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </h1>

          {/* Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <span
              style={{
                fontSize: '32px',
                fontWeight: 400,
                color: product?.is_free || product?.price === 0 ? '#22c55e' : '#ffffff',
              }}
            >
              {priceText}
            </span>
            {!product?.is_free && product?.price !== 0 && (
              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                USD
              </span>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: '60px',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              marginBottom: '24px',
            }}
          />

          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.6)',
                fontStyle: 'italic',
              }}
            >
              Raylodies
            </span>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

