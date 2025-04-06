const fs = require("fs")
const path = require("path")
const https = require("https")

const GOOGLE_FONTS_METADATA_URL = "https://fonts.google.com/metadata/fonts"
const OUTPUT_FILE = path.join(__dirname, "../data/google-fonts-full.json")

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

async function main() {
  try {
    const metadata = await fetchGoogleFontsMetadata()
    console.log(`Successfully fetched metadata for ${metadata.familyMetadataList?.length || 0} font families`)

    const dir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2))
    console.log(`Successfully saved Google Fonts metadata to: ${OUTPUT_FILE}`)

    if (metadata.familyMetadataList) {
      console.log(`Total number of font families: ${metadata.familyMetadataList.length}`)
    }
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()

