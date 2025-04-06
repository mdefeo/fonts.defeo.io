const fs = require("fs")
const path = require("path")

const INPUT_FILE = path.join(__dirname, "../data/google-fonts.json")
const OUTPUT_FILE = path.join(__dirname, "../data/google-fonts-fixed.json")

console.log("Fixing font variants in the existing JSON file...")

const DEFAULT_VARIANTS = {
  "Sans Serif": [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
  Serif: [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
  Display: ["regular", "700"],
  Handwriting: ["regular", "italic"],
  Monospace: [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
}

const POPULAR_FONTS_VARIANTS = {
  Roboto: [
    "100",
    "300",
    "regular",
    "500",
    "700",
    "900",
    "100italic",
    "300italic",
    "italic",
    "500italic",
    "700italic",
    "900italic",
  ],
  "Open Sans": [
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
  ],
  Lato: ["100", "300", "regular", "700", "900", "100italic", "300italic", "italic", "700italic", "900italic"],
  Montserrat: [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
  "Roboto Condensed": ["300", "regular", "700", "300italic", "italic", "700italic"],
  "Source Sans Pro": [
    "200",
    "300",
    "regular",
    "600",
    "700",
    "900",
    "200italic",
    "300italic",
    "italic",
    "600italic",
    "700italic",
    "900italic",
  ],
  Oswald: ["200", "300", "regular", "500", "600", "700"],
  Raleway: [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
  Merriweather: ["300", "regular", "700", "900", "300italic", "italic", "700italic", "900italic"],
  Ubuntu: ["300", "regular", "500", "700", "300italic", "italic", "500italic", "700italic"],
  "Playfair Display": [
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
  "Roboto Mono": [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
  ],
  Nunito: [
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
  Poppins: [
    "100",
    "200",
    "300",
    "regular",
    "500",
    "600",
    "700",
    "800",
    "900",
    "100italic",
    "200italic",
    "300italic",
    "italic",
    "500italic",
    "600italic",
    "700italic",
    "800italic",
    "900italic",
  ],
}

function assignVariants(font) {
  if (POPULAR_FONTS_VARIANTS[font.family]) {
    return POPULAR_FONTS_VARIANTS[font.family]
  }

  return DEFAULT_VARIANTS[font.category] || ["regular", "700"]
}

try {
  const jsonData = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"))

  const fixedData = {
    items: jsonData.items.map((font) => ({
      ...font,
      variants: font.variants && font.variants.length > 0 ? font.variants : assignVariants(font),
    })),
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fixedData, null, 2))

  fs.writeFileSync(INPUT_FILE, JSON.stringify(fixedData, null, 2))

  console.log(`Successfully fixed variants for ${fixedData.items.length} fonts`)
  console.log(`Updated files: ${OUTPUT_FILE} and ${INPUT_FILE}`)

  const sampleFont = fixedData.items[0]
  console.log(`Sample font "${sampleFont.family}" now has variants: ${sampleFont.variants.join(", ")}`)
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}

