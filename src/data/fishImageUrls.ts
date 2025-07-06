// Fish images URLs for public domain images to be saved locally
export const fishImageUrls = {
  "salmon": "https://upload.wikimedia.org/wikipedia/commons/3/39/Salmo_salar.jpg",
  "cod": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Gadus_morhua_Cod-2b-Atlanterhavsparken-Norway.JPG",
  "sardines": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Sardines.jpg/1280px-Sardines.jpg",
  "mackerel": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Scomber_scombrus_Linnaeus_1758.jpg/1280px-Scomber_scombrus_Linnaeus_1758.jpg",
  "anchovies": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Anchovies.jpg/1280px-Anchovies.jpg",
  "trout": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Salmo_trutta_GLERL_1.jpg/1280px-Salmo_trutta_GLERL_1.jpg",
  "sea-bass": "https://upload.wikimedia.org/wikipedia/commons/1/19/Dicentrarchus_labrax_sea-bass.jpg",
  "tilapia": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tilapia_lake_taal.jpg/1280px-Tilapia_lake_taal.jpg",
  "branzino": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Branzino_sea_bass.jpg/1280px-Branzino_sea_bass.jpg",
  "butter-sole": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Limanda_aspera.jpg",
  "hilsa": "https://upload.wikimedia.org/wikipedia/commons/4/43/Tenualosa_ilisha_fish.jpg",
  "oilfish": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ruvettus_pretiosus2.jpg",
  "halibut": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hippoglossus_hippoglossus2.jpg/1280px-Hippoglossus_hippoglossus2.jpg",
  "flounder": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Pseudopleuronectes_americanus.jpg/1280px-Pseudopleuronectes_americanus.jpg",
  "haddock": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Haddock.jpg/1280px-Haddock.jpg",
  "herring": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Clupea_harengus_Gervais.jpg/1280px-Clupea_harengus_Gervais.jpg",
  "swordfish": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Swordfish_skeleton.jpg/1280px-Swordfish_skeleton.jpg",
  "mahi-mahi": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Coryphaena_hippurus2.jpg/1280px-Coryphaena_hippurus2.jpg"
};

// Download instructions for the fish images
export const fishImageDownloadInstructions = `
# Fish Image Download Instructions

To download the fish images for the application:

1. Create a directory at: \`public/images/fish/\` (if it doesn't exist)
2. Download the following images from Wikimedia Commons (public domain):

${Object.entries(fishImageUrls).map(([id, url]) => `- ${id}: ${url} -> save as "public/images/fish/${id}.jpg"`).join('\n')}

These images are all licensed under Creative Commons or public domain and can be freely used in the application.
`;
