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
  },
  {
    english: "Salmon",
    tamil: "சால்மன் மீன்",
    tanglish: ["salmon", "salmon fish"],
    category: "premium fish",
    description: "Rich, oily fish with a buttery texture"
  },
  {
    english: "Red Snapper",
    tamil: "செவ்வல் மீன்",
    tanglish: ["red snapper", "sevval", "sevval meen"],
    category: "premium fish",
    description: "Firm white fish with a sweet, clean flavor"
  },
  {
    english: "Hilsa",
    tamil: "இலிஷ் மீன்",
    tanglish: ["hilsa", "ilish", "ilish meen"],
    category: "premium fish",
    description: "Seasonal oily fish prized for its rich taste"
  },
  {
    english: "Sea Bass",
    tamil: "கடல் பாஸ் மீன்",
    tanglish: ["sea bass", "koduva meen"],
    alternateNames: ["Koduva fish"],
    category: "premium fish",
    description: "Mild, flaky white fish"
  },
  {
    english: "European Sea Bass",
    tamil: "ஐரோப்பிய கடல் பாஸ்",
    tanglish: ["branzino", "european sea bass"],
    category: "premium fish",
    description: "Mediterranean sea bass with a mild sweet flavor"
  },
  {
    english: "Swordfish",
    tamil: "வாள் மீன்",
    tanglish: ["swordfish", "nilai meen"],
    category: "premium fish",
    description: "Dense, meaty fish ideal for grilling"
  },
  {
    english: "Mahi Mahi",
    tamil: "மகி-மகி மீன்",
    tanglish: ["mahi mahi", "avoli meen"],
    category: "premium fish",
    description: "Lean tropical fish with a sweet flavor"
  },
  {
    english: "Halibut",
    tamil: "ஹாலிபட் மீன்",
    tanglish: ["halibut", "vella meen"],
    category: "premium fish",
    description: "Large flatfish with firm white flesh"
  },
  {
    english: "Cod",
    tamil: "காட் மீன்",
    tanglish: ["cod", "cod fish", "koduva meen"],
    category: "white fish",
    description: "Mild, flaky white fish"
  },
  {
    english: "Haddock",
    tamil: "ஹாடாக் மீன்",
    tanglish: ["haddock", "sankara meen"],
    category: "white fish",
    description: "Lean white fish with a clean, slightly sweet flavor"
  },
  {
    english: "Flounder",
    tamil: "பிளவுண்டர் மீன்",
    tanglish: ["flounder", "nakku meen"],
    category: "flat fish",
    description: "Flatfish with a delicate texture"
  },
  {
    english: "Butter Sole",
    tamil: "பட்டர் சோல் மீன்",
    tanglish: ["butter sole", "naaval meen"],
    category: "flat fish",
    description: "Delicate sole with a buttery texture"
  },
  {
    english: "Trout",
    tamil: "ட்ரவுட் மீன்",
    tanglish: ["trout", "kalanji meen"],
    category: "freshwater fish",
    description: "Freshwater fish with a mild, delicate flavor"
  },
  {
    english: "Katla",
    tamil: "கட்லா மீன்",
    tanglish: ["katla", "katla fish"],
    category: "freshwater fish",
    description: "Popular Indian major carp"
  },
  {
    english: "Trevally",
    tamil: "பாறை மீன்",
    tanglish: ["trevally", "paarai"],
    category: "marine fish",
    description: "Firm-textured coastal fish"
  },
  {
    english: "Big Trevally",
    tamil: "பெரிய பாறை மீன்",
    tanglish: ["big trevally", "periya paarai"],
    category: "marine fish",
    description: "Large trevally with firm white flesh"
  },
  {
    english: "Yellow Trevally",
    tamil: "மஞ்சள் பாறை மீன்",
    tanglish: ["yellow trevally", "manjal paarai"],
    category: "marine fish",
    description: "Yellow variety of trevally"
  },
  {
    english: "Oil Fish",
    tamil: "எண்ணெய் மீன்",
    tanglish: ["oil fish", "enna meen"],
    category: "oily fish",
    description: "High-oil fish with a rich flavor"
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

export function getTamilNameForFish(fishName: string, tanglishName?: string): string | null {
  const normalized = [fishName, tanglishName]
    .filter((value): value is string => Boolean(value))
    .map(value => value.toLowerCase().trim());

  const matchedEntry = fishNames.find(entry => {
    const english = entry.english.toLowerCase();
    const aliases = entry.alternateNames?.map(name => name.toLowerCase()) ?? [];

    return normalized.some(candidate =>
      candidate === english ||
      candidate.includes(english) ||
      english.includes(candidate) ||
      aliases.some(alias => candidate === alias || candidate.includes(alias) || alias.includes(candidate))
    );
  });

  if (matchedEntry?.tamil) {
    return matchedEntry.tamil;
  }

  const fallbackMap: Record<string, string> = {
    'sliced vanjaram': 'வஞ்சிரம் மீன்',
    'vanjaram fish': 'வஞ்சிரம் மீன்',
    'seer fish': 'வஞ்சிரம் மீன்',
    'seer fish slices': 'வஞ்சிரம் மீன்',
    'dried seer fish': 'வஞ்சிரம் மீன்',
    'tuna fish': 'சூரை மீன்',
    'salmon fish': 'சால்மன் மீன்',
    'sea bass': 'கடல் பாஸ் மீன்',
    'branzino': 'ஐரோப்பிய கடல் பாஸ்',
    'swordfish': 'வாள் மீன்',
    'mahi mahi': 'மகி-மகி மீன்',
    'halibut': 'ஹாலிபட் மீன்',
    'cod fish': 'காட் மீன்',
    'haddock': 'ஹாடாக் மீன்',
    'flounder': 'பிளவுண்டர் மீன்',
    'butter sole': 'பட்டர் சோல் மீன்',
    'trout': 'ட்ரவுட் மீன்',
    'katla fish': 'கட்லா மீன்',
    'big trevally': 'பெரிய பாறை மீன்',
    'trevally': 'பாறை மீன்',
    'yellow trevally': 'மஞ்சள் பாறை மீன்',
    'oil fish': 'எண்ணெய் மீன்',
    'red snapper': 'செவ்வல் மீன்',
    'hilsa fish': 'இலிஷ் மீன்'
  };

  for (const candidate of normalized) {
    if (fallbackMap[candidate]) {
      return fallbackMap[candidate];
    }
  }

  return tanglishName ?? null;
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
