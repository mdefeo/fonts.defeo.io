// Script to fetch Google Fonts metadata
const https = require('https');

const GOOGLE_FONTS_METADATA_URL = 'https://fonts.google.com/metadata/fonts';

console.log('Fetching Google Fonts metadata...');

// Function to fetch the metadata
function fetchGoogleFontsMetadata() {
  return new Promise((resolve, reject) => {
    https.get(GOOGLE_FONTS_METADATA_URL, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Redirected to: ${res.headers.location}`);
        https.get(res.headers.location, handleResponse).on('error', handleError);
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

function handleResponse(res) {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      // The response starts with ")]}'," to prevent JSON hijacking
      // We need to remove this before parsing
      const cleanedData = data.replace(/^\)\]\}'/, '');
      const jsonData = JSON.parse(cleanedData);
      processMetadata(jsonData);
    } catch (error) {
      console.error(`Failed to parse Google Fonts metadata: ${error.message}`);
    }
  });
}

function handleError(error) {
  console.error(`Failed to fetch Google Fonts metadata: ${error.message}`);
}

function processMetadata(metadata) {
  console.log(`Successfully fetched metadata for ${metadata.familyMetadataList?.length || 0} font families`);
  
  // Display some stats
  if (metadata.familyMetadataList) {
    console.log(`Total number of font families: ${metadata.familyMetadataList.length}`);
    
    // Show the first 5 fonts as a sample
    console.log('\nSample of first 5 fonts:');
    metadata.familyMetadataList.slice(0, 5).forEach(font => {
      console.log(`\nFont: ${font.family}`);
      console.log(`Category: ${font.category}`);
      
      // Show available weights and styles
      if (font.fonts) {
        console.log('Available variants:');
        Object.entries(font.fonts).forEach(([weight, fontData]) => {
          if (fontData.normal) console.log(`  - ${weight} normal`);
          if (fontData.italic) console.log(`  - ${weight} italic`);
        });
      }
    });
    
    // Process to our app's format for one sample font
    const sampleFont = metadata.familyMetadataList[0];
    const variants = [];
    
    if (sampleFont.fonts) {
      Object.entries(sampleFont.fonts).forEach(([weight, fontData]) => {
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
    
    console.log('\nSample processed font for our app format:');
    console.log(JSON.stringify({
      family: sampleFont.family,
      category: sampleFont.category,
      variants: variants
    }, null, 2));
  }
}

// Start execution
async function main() {
  try {
    const metadata = await fetchGoogleFontsMetadata();
    processMetadata(metadata);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();