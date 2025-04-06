// Script to fetch Google Fonts metadata and convert it to the format used in our app
const fs = require('fs');
const path = require('path');
const https = require('https');

const GOOGLE_FONTS_METADATA_URL = 'https://fonts.google.com/metadata/fonts';
const OUTPUT_FILE = path.join(__dirname, '../data/google-fonts.json');

console.log('Fetching Google Fonts metadata...');

function fetchGoogleFontsMetadata() {
  return new Promise((resolve, reject) => {
    https.get(GOOGLE_FONTS_METADATA_URL, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Redirected to: ${res.headers.location}`);
        https.get(res.headers.location, (redirectRes) => {
          let redirectData = '';
          
          redirectRes.on('data', (chunk) => {
            redirectData += chunk;
          });
          
          redirectRes.on('end', () => {
            try {
              const cleanedData = redirectData.replace(/^\)\]\}'/, '');
              const jsonData = JSON.parse(cleanedData);
              resolve(jsonData);
            } catch (error) {
              reject(new Error(`Failed to parse redirected data: ${error.message}`));
            }
          });
        }).on('error', (error) => {
          reject(new Error(`Failed on redirect: ${error.message}`));
        });
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // The response starts with ")]}'," to prevent JSON hijacking
          // We need to remove this before parsing
          const cleanedData = data.replace(/^\)\]\}'/, '');
          const jsonData = JSON.parse(cleanedData);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse Google Fonts metadata: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch Google Fonts metadata: ${error.message}`));
    });
  });
}

function processMetadata(metadata) {
  // Convert Google Fonts metadata to our app's format
  const fonts = metadata.familyMetadataList.map(font => {
    // Extract variants (weights and styles)
    const variants = [];
    
    if (font.fonts) {
      Object.entries(font.fonts).forEach(([weight, fontData]) => {
        // Regular style
        if (fontData.normal) {
          variants.push(weight === '400' ? 'regular' : weight);
        }
        
        // Italic style
        if (fontData.italic) {
          variants.push(weight === '400' ? 'italic' : `${weight}italic`);
        }
      });
    }
    
    return {
      family: font.family,
      category: font.category,
      variants: variants
    };
  });
  
  return { items: fonts };
}

// Start execution
async function main() {
  try {
    const metadata = await fetchGoogleFontsMetadata();
    console.log(`Successfully fetched metadata for ${metadata.familyMetadataList.length} font families`);
    
    // Process metadata to match our app's format
    const processedData = processMetadata(metadata);
    console.log(`Processed ${processedData.items.length} fonts`);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write processed data to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2));
    console.log(`Successfully saved processed font data to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();