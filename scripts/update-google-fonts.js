const fs = require("fs")
const path = require("path")
const https = require("https")

const GOOGLE_FONTS_METADATA_URL = "https://fonts.google.com/metadata/fonts"
const OUTPUT_FILE = path.join(__dirname, "../data/google-fonts.json")

console.log("Fetching Google Fonts metadata...")

function fetchGoogleFontsMetadata() {
  return new Promise((resolve, reject) => {
    https
      .get(GOOGLE_FONTS_METADATA_URL, (res) => {
        let data = ""

        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`Redirected to: ${res.headers.location}`)
          https
            .get(res.headers.location, (redirectRes) => {
              let redirectData = ""

              redirectRes.on("data", (chunk) => {
                redirectData += chunk
              })

              redirectRes.on("end", () => {
                try {
                  const cleanedData = redirectData.replace(/^\)\]\}'/, "")
                  const jsonData = JSON.parse(cleanedData)
                  resolve(jsonData)
                } catch (error) {
                  reject(new Error(`Failed to parse redirected data: ${error.message}`))
                }
              })
            })
            .on("error", (error) => {
              reject(new Error(`Failed on redirect: ${error.message}`))
            })
          return
        }

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          try {
            const cleanedData = data.replace(/^\)\]\}'/, "")
            const jsonData = JSON.parse(cleanedData)
            resolve(jsonData)
          } catch (error) {
            reject(new Error(`Failed to parse Google Fonts metadata: ${error.message}`))
          }
        })
      })
      .on("error", (error) => {
        reject(new Error(`Failed to fetch Google Fonts metadata: ${error.message}`))
      })
  })
}

function processMetadata(metadata) {
  console.log("Processing metadata...")

  const fonts = metadata.familyMetadataList.map((font) => {
    const variants = []

    if (font.fonts) {
      Object.entries(font.fonts).forEach(([weight, fontData]) => {
        if (fontData.normal) {
          variants.push(weight === "400" ? "regular" : weight)
        }

        if (fontData.italic) {
          variants.push(weight === "400" ? "italic" : `${weight}italic`)
        }
      })
    }


    let category = font.category || "Sans Serif"

    const categoryMap = {
      "sans-serif": "Sans Serif",
      serif: "Serif",
      display: "Display",
      handwriting: "Handwriting",
      monospace: "Monospace",
    }

    category = categoryMap[category.toLowerCase()] || category

    if (variants.length === 0) {
      const defaultVariants = {
        "Sans Serif": ["regular", "700"],
        Serif: ["regular", "700"],
        Display: ["regular"],
        Handwriting: ["regular"],
        Monospace: ["regular", "700"],
      }

      variants.push(...(defaultVariants[category] || ["regular"]))
    }

    return {
      family: font.family,
      category: category,
      variants: variants,
    }
  })

  fonts.sort((a, b) => a.family.localeCompare(b.family))

  return { items: fonts }
}

async function main() {
  try {
    const metadata = await fetchGoogleFontsMetadata()
    console.log(`Successfully fetched metadata for ${metadata.familyMetadataList.length} font families`)

    const processedData = processMetadata(metadata)
    console.log(`Processed ${processedData.items.length} fonts`)

    const dir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2))
    console.log(`Successfully saved processed font data to: ${OUTPUT_FILE}`)

    const categoryCounts = {}
    processedData.items.forEach((font) => {
      categoryCounts[font.category] = (categoryCounts[font.category] || 0) + 1
    })
    console.log("Font categories distribution:")
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} fonts`)
    })

    const sampleFonts = [
      processedData.items.find((f) => f.family === "Roboto") || processedData.items[0],
      processedData.items.find((f) => f.family === "Open Sans"),
      processedData.items.find((f) => f.family === "Playfair Display"),
    ].filter(Boolean)

    sampleFonts.forEach((font) => {
      console.log(`Sample font "${font.family}" (${font.category}) has variants: ${font.variants.join(", ")}`)
    })
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()

