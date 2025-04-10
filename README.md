# Google Fonts Pairing Tool

An intuitive web app that helps designers and developers explore and pair Google Fonts with ease. Try it live at **[fonts.defeo.io](https://fonts.defeo.io)**

![Screenshot](public/og.jpg)

## Features

- Browse and pair any fonts from the [Google Fonts](https://fonts.google.com/) directory
- Live font previews with customizable text and sizes
- Font filtering and dropdown with dynamic data
- Modern, responsive UI built with performance in mind

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mdefeo/fonts.defeo.io.git
cd fonts.defeo.io
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Generate the Google Fonts List

Before running the app, you need to generate and update the Google Fonts data.

#### Step A: Fetch Active Google Fonts

This script retrieves the active list of fonts from the Google Fonts API. Run it from the root directory of the project.

```bash
node scripts/fetch-google-fonts.js
```

#### Step B: Update the Fonts JSON

Once fonts are fetched, update the local fonts.json file used by the app:

```bash
node scripts/update-google-fonts.js
```

### 4. Add Google Fonts API Key

- Rename .env.example to .env
- Add value for your Google Fonts API key
- Or, use your hosting environment to add the environment variable

## Development

This project is automatically deployed to Vercel. To start the local dev server:

```bash
pnpm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) to view it in the browser.

## To Do

- Add font previews to select
- Create AI suggestions for font pairings
- Add other text options, like gradients, shadows
- Add right click context menu to allow inline editing when selecting text

## License

[Apache](./LICENSE)

## Author

Marcello De Feo
[defeo.io](https://defeo.io/)
