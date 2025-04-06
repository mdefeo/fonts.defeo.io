# 🎨 Google Fonts Pairing Tool

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

## Development

This project is automatically deployed to Vercel. To start the local dev server:

```bash
pnpm run dev
```

Then visit [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```bash
/fonts.defeo.io
│
├── public/            # Static assets and screenshot
├── scripts/           # Scripts for fetching and updating font data
├── src/               # App source code
│   └── components/    # UI components
│   └── lib/           # Utilities and logic
│   └── data/          # fonts.json lives here
├── .env               # Add your API key here
├── package.json
└── README.md
```

## To Do

- Add font previews to select
- Create AI suggestions for font pairings
- Add other text options, like gradients, shadows
- Add right click context menu to allow inline editing when selecting text

## License

[MIT](./LICENSE)

## Author

Marcello De Feo
[defeo.io](https://defeo.io/)
