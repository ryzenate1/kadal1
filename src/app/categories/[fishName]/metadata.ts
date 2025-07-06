import { Metadata, ResolvingMetadata } from 'next';

// Enhanced Fish interface with nutritional info
interface FishDetail {
  id: string;
  name: string;
  image: string;
  price: number;
  type: string;
  description: string;
  slug: string;
  weights: { value: string; label: string; multiplier: number }[];
  omega3?: string;
  protein?: string;
  calories?: string;
  benefits?: string[];
  bestFor?: string[];
  rating?: number;
  origin?: string;
  isPopular?: boolean;
}

// Extended fish data with nutritional information
const fishDetailsData: FishDetail[] = [
  {
    id: 'vanjaram-fish',
    name: 'Vanjaram Fish',
    image: '/images/products/vangaram.jpg',
    price: 799,
    type: 'Fish',
    description: 'Vanjaram Fish, also known as King Fish or Spanish Mackerel, is a premium sea fish known for its firm texture and rich flavor. It\'s highly prized for its high omega-3 content and versatility in cooking. Perfect for grilling, frying, or making delicious curries.',
    slug: 'vanjaram-fish',
    weights: [], // Not used in metadata
    omega3: '3.4g',
    protein: '22g',
    calories: '124 kcal',
    benefits: ['Heart Health', 'Brain Function', 'Anti-inflammatory'],
    bestFor: ['Grilling', 'Frying', 'Curry'],
    rating: 4.8,
    origin: 'Bay of Bengal',
    isPopular: true
  },
  {
    id: 'sliced-vanjaram',
    name: 'Sliced Vanjaram',
    image: '/images/products/sliced-vangaram.jpg',
    price: 899,
    type: 'Fish',
    description: 'Expertly pre-cut Vanjaram (King Fish) slices, ready for your favorite recipes. Each slice is carefully cut to preserve the premium texture and flavor. These slices are perfect for quick cooking and maintain all the nutritional benefits of fresh Vanjaram.',
    slug: 'sliced-vanjaram',
    weights: [], // Not used in metadata
    omega3: '3.2g',
    protein: '21g',
    calories: '130 kcal',
    benefits: ['Convenience', 'Heart Health', 'Rich in DHA'],
    bestFor: ['Quick Fry', 'Grilling', 'Fish Curry'],
    rating: 4.7,
    origin: 'Bay of Bengal',
    isPopular: true
  },
  // Other fish data...
];

type Props = {
  params: { fishName: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const decodedFishName = decodeURIComponent(params.fishName);
  
  // Find the fish by name or slug (case-insensitive search)
  const fish = fishDetailsData.find(f => 
    f.name.toLowerCase() === decodedFishName.toLowerCase() || 
    f.slug.toLowerCase() === decodedFishName.toLowerCase()
  );
  
  // Default metadata if fish not found
  if (!fish) {
    return {
      title: 'Fish Not Found | Kadal Thunai Seafood',
      description: 'Sorry, we couldn\'t find the fish you were looking for. Browse our extensive collection of fresh seafood at Kadal Thunai.',
    }
  }
  
  // Generate structured data for the fish
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fish.name,
    image: `https://kadal-thunai.vercel.app${fish.image}`,
    description: fish.description,
    offers: {
      '@type': 'Offer',
      price: fish.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: fish.rating || 4.5,
      reviewCount: '12',
    },
    brand: {
      '@type': 'Brand',
      name: 'Kadal Thunai',
    },
    category: fish.type,
    sku: fish.id,
  }
  
  // Format benefits and recipe ideas
  const benefitsText = fish.benefits ? `Benefits: ${fish.benefits.join(', ')}. ` : '';
  const recipeIdeas = fish.bestFor ? `Great for: ${fish.bestFor.join(', ')}. ` : '';
  const nutritionInfo = `Contains ${fish.protein} protein and ${fish.omega3} omega-3 fatty acids per 100g.`;
  
  // Return metadata
  return {
    title: `${fish.name} | Premium Seafood | Kadal Thunai`,
    description: `${fish.description.slice(0, 120)}... ${benefitsText}${recipeIdeas}${nutritionInfo} Order fresh ${fish.name} online with home delivery.`,
    keywords: [fish.name, fish.type, 'fresh seafood', 'fish delivery', 'kadal thunai', 'premium seafood', 'online fish', 'seafood delivery'],
    openGraph: {
      title: `${fish.name} | Premium Seafood | Kadal Thunai`,
      description: `${fish.description.slice(0, 160)}... ${benefitsText}${nutritionInfo}`,
      images: [
        {
          url: `https://kadal-thunai.vercel.app${fish.image}`,
          width: 800,
          height: 600,
          alt: fish.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fish.name} | Kadal Thunai`,
      description: `${fish.description.slice(0, 200)}...`,
      images: [`https://kadal-thunai.vercel.app${fish.image}`],
    },
    alternates: {
      canonical: `https://kadal-thunai.vercel.app/categories/${encodeURIComponent(fish.name)}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
