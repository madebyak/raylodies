// Types
export interface Project {
  id: string;
  slug: string;
  title: string;
  category: "ai-images" | "ai-videos";
  year: string;
  description: string;
  thumbnail: string;
  media: { type: "image" | "video"; url: string }[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  category: string;
  keywords: string[];
  thumbnail: string;
  images: string[];
}

// Hardcoded Projects
export const projects: Project[] = [
  {
    id: "1",
    slug: "ethereal-landscapes",
    title: "Ethereal Landscapes",
    category: "ai-images",
    year: "2024",
    description:
      "A collection of dreamlike landscapes generated through advanced AI techniques, exploring the boundaries between reality and imagination. Each piece captures surreal environments that challenge our perception of natural beauty.",
    thumbnail:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop",
      },
    ],
  },
  {
    id: "2",
    slug: "neon-futures",
    title: "Neon Futures",
    category: "ai-images",
    year: "2024",
    description:
      "Cyberpunk-inspired cityscapes bathed in neon light, depicting possible futures where technology and urban life merge into breathtaking visual symphonies.",
    thumbnail:
      "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=800&h=600&fit=crop",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=1200&h=800&fit=crop",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop",
      },
    ],
  },
  {
    id: "3",
    slug: "abstract-motion",
    title: "Abstract Motion",
    category: "ai-videos",
    year: "2024",
    description:
      "Dynamic video pieces exploring fluid motion and abstract forms. These AI-generated animations push the boundaries of visual storytelling through movement and color.",
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop",
    media: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=800&fit=crop",
      },
    ],
  },
  {
    id: "4",
    slug: "digital-portraits",
    title: "Digital Portraits",
    category: "ai-images",
    year: "2023",
    description:
      "A series of AI-generated portraits that blur the line between photography and digital art. Each portrait captures unique expressions and emotions through algorithmic interpretation.",
    thumbnail:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&h=800&fit=crop",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
      },
    ],
  },
  {
    id: "5",
    slug: "cosmic-dreams",
    title: "Cosmic Dreams",
    category: "ai-videos",
    year: "2023",
    description:
      "Journey through AI-generated cosmic landscapes and celestial phenomena. These video pieces take viewers on a voyage through imagined galaxies and nebulae.",
    thumbnail:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop",
    media: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=800&fit=crop",
      },
    ],
  },
  {
    id: "6",
    slug: "organic-structures",
    title: "Organic Structures",
    category: "ai-images",
    year: "2023",
    description:
      "Explorations of organic forms and natural structures reimagined through AI. These pieces find beauty in the mathematical patterns underlying nature.",
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1200&h=800&fit=crop",
      },
    ],
  },
];

// Hardcoded Products
export const products: Product[] = [
  {
    id: "1",
    slug: "cinematic-landscapes-preset",
    title: "Cinematic Landscapes Preset Pack",
    description:
      "A comprehensive collection of AI prompts and settings for creating stunning cinematic landscape imagery. Includes 50+ carefully crafted prompts, negative prompts, and recommended settings for various AI models.",
    price: 29,
    category: "AI Presets",
    keywords: [
      "landscapes",
      "cinematic",
      "prompts",
      "midjourney",
      "stable diffusion",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "2",
    slug: "portrait-master-prompts",
    title: "Portrait Master Prompts",
    description:
      "Master the art of AI portrait generation with this curated collection of prompts. Perfect for creating realistic, artistic, and stylized portraits with consistent quality.",
    price: 39,
    category: "AI Presets",
    keywords: ["portraits", "faces", "realistic", "artistic", "prompts"],
    thumbnail:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "3",
    slug: "neon-cyberpunk-collection",
    title: "Neon Cyberpunk Collection",
    description:
      "Dive into the world of cyberpunk aesthetics with this specialized prompt collection. Create stunning neon-lit cityscapes, futuristic scenes, and sci-fi environments.",
    price: 34,
    category: "AI Presets",
    keywords: ["cyberpunk", "neon", "futuristic", "sci-fi", "cities"],
    thumbnail:
      "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "4",
    slug: "abstract-art-generator",
    title: "Abstract Art Generator",
    description:
      "Create unique abstract art pieces with this versatile prompt pack. Includes settings for various styles from minimalist to complex, colorful compositions.",
    price: 24,
    category: "AI Presets",
    keywords: ["abstract", "art", "minimalist", "colorful", "creative"],
    thumbnail:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "5",
    slug: "video-prompt-essentials",
    title: "Video Prompt Essentials",
    description:
      "Essential prompts and techniques for AI video generation. Perfect for creating smooth animations, transitions, and cinematic video content.",
    price: 49,
    category: "AI Presets",
    keywords: ["video", "animation", "motion", "cinematic", "sora"],
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "6",
    slug: "fantasy-worlds-bundle",
    title: "Fantasy Worlds Bundle",
    description:
      "Create magical and fantastical worlds with this comprehensive prompt bundle. From enchanted forests to mythical creatures, bring your imagination to life.",
    price: 44,
    category: "AI Presets",
    keywords: ["fantasy", "magical", "creatures", "worlds", "imagination"],
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "7",
    slug: "architectural-visions",
    title: "Architectural Visions",
    description:
      "Specialized prompts for generating stunning architectural concepts. From modern minimalism to futuristic structures, design the buildings of tomorrow.",
    price: 34,
    category: "AI Presets",
    keywords: ["architecture", "buildings", "modern", "futuristic", "design"],
    thumbnail:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "8",
    slug: "texture-materials-pack",
    title: "Texture & Materials Pack",
    description:
      "Generate seamless textures and materials for your projects. Perfect for 3D artists, game developers, and designers needing high-quality AI-generated surfaces.",
    price: 29,
    category: "AI Presets",
    keywords: ["textures", "materials", "seamless", "3D", "surfaces"],
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop",
    ],
  },
];

// Helper functions
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProjectsByCategory(
  category: "ai-images" | "ai-videos" | "all",
): Project[] {
  if (category === "all") return projects;
  return projects.filter((p) => p.category === category);
}

export function getFeaturedProjects(count: number = 4): Project[] {
  return projects.slice(0, count);
}

export function getFeaturedProducts(count: number = 4): Product[] {
  return products.slice(0, count);
}
