'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import FishDetailPage, { Fish } from '@/components/fish/FishDetailPage';

// Sample fish data (You should ideally fetch this from a CMS or database)
// For now, let's use a slightly expanded version of the fishData from fish-combo
const fishData: Fish[] = [
  {
    id: 'paal-sura',
    name: "Paal Sura",
    src: "/images/fishes picss/Paal-sura.jpg",
    type: "Freshwater Fish",
    price: 450,
    omega3: 1.2,
    protein: 22,
    calories: 120,
    benefits: ["Rich in protein", "High in Omega-3", "Low in calories", "Good for brain development"],
    bestFor: ["Fry", "Curry", "Grill", "Steam"],
    rating: 4.5,
    description: "Paal Sura, also known as Milk Shark, is a delicacy in many coastal regions. Its tender meat and mild flavor make it versatile for various culinary preparations. It's particularly favored for its soft texture once cooked.",
    isPopular: true,
    serves: "2-3 people",
    netWeight: "Approx. 450-550g",
    grossWeight: "Approx. 600-700g"
  },
  {
    id: 'vangaram-fish',
    name: "Vangaram Fish",
    src: "/images/fish/vangaram.jpg",
    type: "Sea Fish",
    price: 550,
    omega3: 1.5,
    protein: 24,
    calories: 130,
    benefits: ["High in protein", "Rich in Omega-3", "Good for heart health", "Supports immune system"],
    bestFor: ["Curry", "Fry", "Grill", "Bake"],
    rating: 4.7,
    description: "Vangaram Fish is known for its rich flavor and firm texture. It's a popular choice for traditional fish curries and is highly nutritious with excellent protein content.",
    isPopular: true,
    serves: "2-3 people",
    netWeight: "Approx. 500-600g",
    grossWeight: "Approx. 650-750g"
  },
  {
    id: 'sliced-vangaram',
    name: "Sliced Vangaram",
    src: "/images/fish/sliced-vangaram.jpg",
    type: "Sea Fish",
    price: 580,
    omega3: 1.5,
    protein: 24,
    calories: 130,
    benefits: ["High in protein", "Rich in Omega-3", "Good for heart health", "Supports immune system"],
    bestFor: ["Curry", "Fry", "Grill", "Bake"],
    rating: 4.6,
    description: "Conveniently sliced Vangaram Fish, ready to cook. Perfect for quick and easy meal preparation while retaining all the nutritional benefits.",
    isPopular: false,
    serves: "2-3 people",
    netWeight: "Approx. 500-600g",
    grossWeight: "Approx. 650-750g"
  },
  {
    id: 'dried-fish',
    name: "Dried Fish",
    src: "/images/fish/dried-vangaram.webp",
    type: "Dried Fish",
    price: 350,
    omega3: 1.0,
    protein: 30,
    calories: 150,
    benefits: ["Long shelf life", "Concentrated protein", "Rich flavor", "Traditional preservation"],
    bestFor: ["Curry", "Chutney", "Stir-fry"],
    rating: 4.3,
    description: "Traditionally dried fish with intense flavor. A staple in many coastal cuisines, it adds a unique umami taste to dishes.",
    isPopular: false,
    serves: "3-4 people",
    netWeight: "Approx. 300g",
    grossWeight: "Approx. 350g"
  },
  {
    id: 'fish-combo',
    name: "Fish Combo Pack",
    src: "/images/fish/fish-combo.jpg",
    type: "Combo Pack",
    price: 999,
    omega3: 1.8,
    protein: 25,
    calories: 140,
    benefits: ["Variety of fish", "Value for money", "Complete meal solution", "Balanced nutrition"],
    bestFor: ["Family meals", "Party", "Weekly stock"],
    rating: 4.8,
    description: "A curated selection of premium fish varieties perfect for a family meal. This combo pack offers great value and variety.",
    isPopular: true,
    serves: "4-5 people",
    netWeight: "Approx. 1kg",
    grossWeight: "Approx. 1.2kg"
  },
  {
    id: 'big-paarai-fish', // Slug should match this
    name: "Big Paarai Fish",
    src: "/images/fishes picss/big-paarai-fish.jpg",
    type: "Saltwater Fish",
    price: 580,
    omega3: 1.8,
    protein: 24,
    calories: 130,
    benefits: ["High in protein", "Rich in vitamins", "Great for grilling", "Supports heart health"],
    bestFor: ["Grill", "Fry", "Bake", "Curry"],
    rating: 4.3,
    description: "Big Paarai, or Malabar Trevally, is known for its firm texture and delicious taste. It's a popular choice for grilling and tandoori preparations due to its ability to hold flavors well.",
    isPopular: false,
    serves: "3-4 people",
    netWeight: "Approx. 700-800g",
    grossWeight: "Approx. 900-1000g"
  },
  {
    id: 'kalava',
    name: "Kalava",
    src: "/images/fishes picss/kalava.jpg",
    type: "Saltwater Fish",
    price: 520,
    omega3: 2.1,
    protein: 26,
    calories: 140,
    benefits: ["High in Omega-3", "Rich in minerals", "Low in mercury", "Boosts immunity"],
    bestFor: ["Fry", "Curry", "Bake", "Steamed"],
    rating: 4.7,
    description: "Kalava, or Grouper, is a prized fish for its flaky white meat and mild, sweet flavor. It's highly versatile and can be cooked in numerous ways, from simple fries to elaborate curries.",
    isPopular: true,
    serves: "2-3 people",
    netWeight: "Approx. 480-520g",
    grossWeight: "Approx. 650-750g"
  },
  {
    id: 'vangaram-fish', // Example from your URL
    name: "Vangaram Fish",
    src: "/images/fish/vangaram.jpg", // Assuming this path is correct
    type: "Saltwater Fish",
    price: 620,
    omega3: 2.5,
    protein: 25,
    calories: 150,
    benefits: ["Excellent source of lean protein", "Rich in Omega-3 fatty acids", "Contains Vitamin D and B12"],
    bestFor: ["Grilling", "Pan-Frying", "Curry"],
    rating: 4.8,
    description: "Vangaram, also known as King Mackerel or Seer Fish, is a popular table fish in South India. It has a firm texture and a rich, slightly oily flavor, making it ideal for steaks and curries.",
    isPopular: true,
    serves: "3-4 people",
    netWeight: "Approx. 500g (steaks)",
    grossWeight: "Approx. 700g (whole)"
  }
  // Add other fish from your fish-combo/page.tsx here, ensuring 'id' matches the slug generation
];

interface FishPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const FishDetailPageWrapper: React.FC<FishPageProps> = ({ params }) => {
  const { slug } = use(params);
  const [fish, setFish] = useState<Fish | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundFish = fishData.find(f => f.id === slug);
    setFish(foundFish || null);
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center" data-component-name="FishDetailPageWrapper">
        <p>Loading fish details...</p>
      </div>
    );
  }

  if (!fish) {
    return (
      <div className="container mx-auto px-4 py-12 text-center" data-component-name="FishDetailPageWrapper">
        <h1 className="text-2xl font-bold mb-4">Fish not found</h1>
        <Link href="/" className="text-tendercuts-blue hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return <FishDetailPage fish={fish} />;
};

export default FishDetailPageWrapper;
