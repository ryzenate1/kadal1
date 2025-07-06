// Fish types and their properties for recommendations
const fishData = [
  {
    id: 1,
    name: "Vangaram Fish",
    type: "Fish",
    popularity: 5, // 1-5 scale
    price: 3, // 1-5 scale (1=low, 5=high)
    taste: 4, // 1-5 scale (mild to strong)
    texture: 3, // 1-5 scale (soft to firm)
    omega3: 4, // 1-5 scale (low to high)
    bestFor: ["fry", "curry", "grill"],
    image: "/images/fish/vangaram.jpg",
    slug: "vangaram-fish"
  },
  {
    id: 2,
    name: "Sliced Vangaram",
    type: "Fish",
    popularity: 4,
    price: 3,
    taste: 4,
    texture: 3,
    omega3: 4,
    bestFor: ["fry", "curry"],
    image: "/images/fish/sliced-vangaram.jpg",
    slug: "sliced-vangaram"
  },
  {
    id: 3,
    name: "Dried Fish",
    type: "Dried Fish",
    popularity: 3,
    price: 2,
    taste: 5,
    texture: 5,
    omega3: 4,
    bestFor: ["fry", "curry"],
    image: "/images/fish/dried-vangaram.webp",
    slug: "dried-fish"
  },
  {
    id: 4,
    name: "Jumbo Prawns",
    type: "Prawns",
    popularity: 5,
    price: 5,
    taste: 5,
    texture: 4,
    omega3: 3,
    bestFor: ["grill", "fry", "curry"],
    image: "/images/fish/big-prawn.webp",
    slug: "jumbo-prawns"
  },
  {
    id: 5,
    name: "Sea Prawns",
    type: "Prawns",
    popularity: 4,
    price: 4,
    taste: 4,
    texture: 4,
    omega3: 3,
    bestFor: ["grill", "fry", "curry"],
    image: "/images/fish/sea-prawn.webp",
    slug: "sea-prawns"
  },
  {
    id: 6,
    name: "Fresh Lobster",
    type: "Shellfish",
    popularity: 5,
    price: 5,
    taste: 5,
    texture: 5,
    omega3: 4,
    bestFor: ["grill", "steam", "bake"],
    image: "/images/fish/lobster.jpg",
    slug: "fresh-lobster"
  },
  {
    id: 7,
    name: "Blue Crabs",
    type: "Crabs",
    popularity: 4,
    price: 4,
    taste: 4,
    texture: 4,
    omega3: 3,
    bestFor: ["steam", "curry", "fry"],
    image: "/images/fish/blue-crabs.jpg",
    slug: "blue-crabs"
  },
  {
    id: 8,
    name: "Sea Crabs",
    type: "Crabs",
    popularity: 3,
    price: 3,
    taste: 4,
    texture: 4,
    omega3: 3,
    bestFor: ["steam", "curry"],
    image: "/images/fish/normal crabs.jpg",
    slug: "sea-crabs"
  },
  {
    id: 9,
    name: "Fresh Squid",
    type: "Cephalopods",
    popularity: 4,
    price: 4,
    taste: 4,
    texture: 3,
    omega3: 3,
    bestFor: ["fry", "grill", "curry"],
    image: "/images/fish/squid.jpg",
    slug: "fresh-squid"
  }
];

// Recommendation algorithm
export function getRecommendedFish(preferences = {}) {
  const defaultPrefs = {
    budget: 3, // 1-5 scale (1=low, 5=high)
    tastePreference: 3, // 1-5 scale (mild to strong)
    cookingMethod: 'all', // 'fry', 'grill', 'curry', 'steam', 'bake', 'all'
    healthFocus: 3, // 1-5 scale (not important to very important)
    ...preferences
  };

  // Score each fish based on preferences
  const scoredFish = fishData.map(fish => {
    let score = 0;
    
    // Always boost Vangaram
    const isVangaram = fish.name.toLowerCase().includes('vangaram');
    if (isVangaram) score += 50;
    
    // Price match (closer to budget is better)
    const priceDiff = Math.abs(fish.price - defaultPrefs.budget);
    score += (5 - priceDiff) * 2;
    
    // Taste match
    const tasteDiff = Math.abs(fish.taste - defaultPrefs.tastePreference);
    score += (5 - tasteDiff) * 3;
    
    // Cooking method match
    if (defaultPrefs.cookingMethod !== 'all' && fish.bestFor.includes(defaultPrefs.cookingMethod)) {
      score += 10;
    }
    
    // Health focus (omega-3 content)
    score += fish.omega3 * (defaultPrefs.healthFocus / 2);
    
    // Popularity boost
    score += fish.popularity;
    
    return { ...fish, score };
  });

  // Sort by score and return top 6
  return scoredFish
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

// Get all fish for the combo page
export function getAllFish() {
  return fishData;
}

// Get fish by slug
export function getFishBySlug(slug: string) {
  return fishData.find(fish => fish.slug === slug) || null;
}
