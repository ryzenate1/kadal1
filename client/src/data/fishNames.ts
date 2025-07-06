// Fish names database with English, Tamil, and transliteration (Tanglish) variations
// This helps the search functionality match fish names across different languages and spellings

export interface FishNameEntry {
  english: string;
  tamil?: string;
  tanglish: string[];
  alternateNames?: string[];
  category: string;
  description?: string;
}

export const fishNames: FishNameEntry[] = [
  {
    english: "Anchovy",
    tamil: "நெத்திலி மீன்",
    tanglish: ["nethili", "nethili meen", "netthili", "nettili"],
    alternateNames: ["Indian anchovy", "Small anchovy"],
    category: "small fish",
    description: "Small, silver-colored fish with a strong flavor"
  },
  {
    english: "Sardine",
    tamil: "மத்தி மீன்",
    tanglish: ["mathi", "mathi meen", "matthi", "chala"],
    alternateNames: ["Indian oil sardine", "Malabar sardine"],
    category: "small fish",
    description: "Small, oily fish with soft bones"
  },
  {
    english: "Mackerel",
    tamil: "அயிலை மீன்",
    tanglish: ["ayilai", "ayilai meen", "ailai", "kumbula"],
    alternateNames: ["Indian mackerel", "Rastrelliger kanagurta"],
    category: "medium fish",
    description: "Medium-sized fish with dark meat and rich flavor"
  },
  {
    english: "Seer Fish",
    tamil: "வங்காரம் மீன்",
    tanglish: ["vanjiram", "vanjaram", "vangaram", "seela", "neymeen"],
    alternateNames: ["King fish", "Spanish mackerel", "Indo-Pacific king mackerel"],
    category: "premium fish",
    description: "Premium white fish with firm texture and mild flavor"
  },
  {
    english: "Pomfret",
    tamil: "வாவல் மீன்",
    tanglish: ["vaaval", "vaaval meen", "vaval", "pomfret"],
    alternateNames: ["Black pomfret", "White pomfret", "Silver pomfret"],
    category: "premium fish",
    description: "Flat, disc-shaped fish with delicate flavor"
  },
  {
    english: "Red Snapper",
    tamil: "சங்கரா மீன்",
    tanglish: ["sankara", "sankara meen", "sangara"],
    alternateNames: ["Malabar red snapper", "Crimson snapper"],
    category: "premium fish",
    description: "Reddish fish with firm texture and sweet, nutty flavor"
  },
  {
    english: "Tuna",
    tamil: "சூரை மீன்",
    tanglish: ["soorai", "soorai meen", "choora", "tuna"],
    alternateNames: ["Little tuna", "Frigate tuna", "Bullet tuna"],
    category: "medium fish",
    description: "Dark-fleshed fish with rich flavor"
  },
  {
    english: "Tilapia",
    tamil: "ஜிலேபி மீன்",
    tanglish: ["jilebi", "jilebi meen", "tilapia"],
    category: "freshwater fish",
    description: "Mild, white-fleshed freshwater fish"
  },
  {
    english: "Rohu",
    tamil: "ரோகு மீன்",
    tanglish: ["rohu", "rohu meen", "kendai"],
    category: "freshwater fish",
    description: "Popular freshwater carp with tender flesh"
  },
  {
    english: "Catfish",
    tamil: "கெளுத்தி மீன்",
    tanglish: ["keluthi", "keluthi meen", "etta", "thedu"],
    category: "freshwater fish",
    description: "Freshwater fish with whisker-like barbels"
  },
  {
    english: "Shark",
    tamil: "சுறா மீன்",
    tanglish: ["sura", "sura meen", "sravu"],
    category: "premium fish",
    description: "Firm-textured fish with mild flavor"
  },
  {
    english: "Barracuda",
    tamil: "சீலா மீன்",
    tanglish: ["seela", "seela meen", "sheela", "oozhai"],
    category: "medium fish",
    description: "Predatory fish with firm, white flesh"
  },
  {
    english: "Mullet",
    tamil: "மடவை மீன்",
    tanglish: ["madavai", "madavai meen", "kanambu", "thirutha"],
    category: "medium fish",
    description: "Medium-sized fish with mild flavor"
  },
  {
    english: "Threadfin Bream",
    tamil: "கீச்சான் மீன்",
    tanglish: ["keechan", "keechan meen", "kilangan", "kilichi"],
    category: "medium fish",
    description: "Pink-colored fish with soft, sweet flesh"
  },
  {
    english: "Sole Fish",
    tamil: "நாக்கு மீன்",
    tanglish: ["nakku", "nakku meen", "naaku", "manthal"],
    category: "flat fish",
    description: "Flat fish with delicate, mild flavor"
  },
  {
    english: "Crab",
    tamil: "நண்டு",
    tanglish: ["nandu", "nandu meen", "kalkandu"],
    category: "shellfish",
    description: "Popular shellfish with sweet, tender meat"
  },
  {
    english: "Prawns",
    tamil: "இறால்",
    tanglish: ["eral", "iraal", "era", "prawn"],
    category: "shellfish",
    description: "Popular shellfish with sweet, tender meat"
  },
  {
    english: "Squid",
    tamil: "கணவாய்",
    tanglish: ["kanavai", "kanava", "kadamba", "squid"],
    category: "shellfish",
    description: "Cephalopod with tender, mild-flavored meat"
  },
  {
    english: "Cuttlefish",
    tamil: "கணவாய்",
    tanglish: ["kanavai", "kanava", "kadamba"],
    category: "shellfish",
    description: "Cephalopod similar to squid with tender meat"
  },
  {
    english: "Lobster",
    tamil: "சிங்கி இறால்",
    tanglish: ["singi eral", "singi", "lobster"],
    category: "premium shellfish",
    description: "Premium shellfish with sweet, tender meat"
  }
];

// Function to get all searchable terms from the fish database
export function getAllFishSearchTerms(): string[] {
  const terms: string[] = [];
  
  fishNames.forEach(fish => {
    // Add English name
    terms.push(fish.english.toLowerCase());
    
    // Add Tamil name if available
    if (fish.tamil) {
      terms.push(fish.tamil);
    }
    
    // Add all Tanglish variations
    fish.tanglish.forEach(term => {
      terms.push(term.toLowerCase());
    });
    
    // Add alternate names if available
    if (fish.alternateNames) {
      fish.alternateNames.forEach(name => {
        terms.push(name.toLowerCase());
      });
    }
    
    // Add category
    terms.push(fish.category.toLowerCase());
  });
  
  // Remove duplicates using Set and convert back to array
  const uniqueTerms = new Set<string>(terms);
  return Array.from(uniqueTerms);
}

// Function to find fish by search term
export function findFishByTerm(searchTerm: string): FishNameEntry[] {
  const term = searchTerm.toLowerCase().trim();
  
  return fishNames.filter(fish => {
    // Check English name
    if (fish.english.toLowerCase().includes(term)) return true;
    
    // Check Tamil name
    if (fish.tamil && fish.tamil.includes(term)) return true;
    
    // Check Tanglish variations
    if (fish.tanglish.some(t => t.toLowerCase().includes(term))) return true;
    
    // Check alternate names
    if (fish.alternateNames && fish.alternateNames.some(name => name.toLowerCase().includes(term))) return true;
    
    // Check category
    if (fish.category.toLowerCase().includes(term)) return true;
    
    return false;
  });
}

// Function to get closest matching fish name for a search term
export function getClosestFishMatch(searchTerm: string): string | null {
  const term = searchTerm.toLowerCase().trim();
  if (term.length < 3) return null;
  
  let bestMatch: string | null = null;
  let bestScore = Infinity;
  
  const allTerms = getAllFishSearchTerms();
  
  // Convert Set to Array to avoid iteration issues
  allTerms.forEach(fishTerm => {
    // Skip very short terms
    if (fishTerm.length < 3) return;
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(term, fishTerm);
    
    // Normalize by the length of the longer string to get a better comparison
    const normalizedScore = distance / Math.max(term.length, fishTerm.length);
    
    // If this is a better match and the score is below our threshold
    if (normalizedScore < bestScore && normalizedScore < 0.4) {
      bestScore = normalizedScore;
      bestMatch = fishTerm;
    }
  });
  
  return bestMatch;
}

// Levenshtein distance calculation
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}
