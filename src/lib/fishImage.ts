const DEFAULT_FISH_IMAGE = "/images/fish/mackerel.jpg";

const KEYWORD_TO_IMAGE: Array<[string, string]> = [
  ["vanjaram", "/images/fish/sliced-vangaram.jpg"],
  ["seer", "/images/fish/sliced-vangaram.jpg"],
  ["snapper", "/images/fish/red-snapper.jpg"],
  ["sardine", "/images/fish/sardines.jpg"],
  ["mathi", "/images/fish/mathi-fish.jpg"],
  ["mackerel", "/images/fish/mackerel.jpg"],
  ["prawn", "/images/fish/sea-prawn.webp"],
  ["crab", "/images/fish/blue-crabs.jpg"],
  ["squid", "/images/fish/squid.jpg"],
  ["tuna", "/images/fish/tuna-fish.jpg"],
  ["combo", "/images/fish/vareity-fishes.jpg"],
  ["fish", "/images/fish/vareity-fishes.jpg"],
];

export function getFallbackFishImage(name?: string): string {
  const normalized = (name || "").toLowerCase();

  for (const [keyword, imagePath] of KEYWORD_TO_IMAGE) {
    if (normalized.includes(keyword)) {
      return imagePath;
    }
  }

  return DEFAULT_FISH_IMAGE;
}

export function getSafeFishImage(image?: string, name?: string): string {
  if (!image) {
    return getFallbackFishImage(name);
  }

  // Keep local assets only; avoid brittle remote links on product cards.
  if (image.startsWith("/")) {
    return image;
  }

  return getFallbackFishImage(name);
}
