<h3 align="center">
    <img src="https://i.ibb.co/CWY693F/beatprints-logo.png" width="175"/>
</h3>
<h3 align="center">
    BeatPrints.js: Effortless, aesthetic music posters for tracks and albums 🎷✨
</h3>

<p align="center">A Node.js/TypeScript remake of the original <a href="https://github.com/TrueMyst/BeatPrints">BeatPrints</a> by <b>TrueMyst</b>.<br />
Design Pinterest-style music posters powered by <b>Spotify</b> and <b>LRClib</b> in your app. 🍀</p>

<p align="center">
  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
    <img alt="License" src="https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-%23c4b9a6?style=for-the-badge&logo=Pinboard&logoColor=%23b5a790&labelColor=%23312123">
  </a>
  <img alt="Built with TypeScript" src="https://img.shields.io/badge/TypeScript-%E2%9C%A8-c4b9a6?style=for-the-badge&logo=TypeScript&logoColor=%23b5a790&labelColor=%23312123">
  <img alt="Latest NPM version" src="https://img.shields.io/npm/v/beatprints.js.svg?style=for-the-badge&logo=npm&logoColor=%23b5a790&labelColor=%23312123&color=c4b9a6">
  <img alt="Spotify API" src="https://img.shields.io/badge/Spotify_API-integrated-c4b9a6.svg?style=for-the-badge&logo=Spotify&logoColor=%23b5a790&labelColor=%23312123">
</p>

---

## 🚀 What is BeatPrints.js?

BeatPrints.js is a visual utility to generate music posters from your favorite tracks and albums. This Node.js version brings the spirit of the original Python [BeatPrints](https://github.com/TrueMyst/BeatPrints) project to the JavaScript ecosystem, supporting:

* 🎨 Rich visual themes (Catppuccin, Nord, RosePine, etc.)
* 🖼️ Album/track art with Spotify scannables
* ✍️ Lyric highlights from [LRClib](https://lrclib.net)
* 📄 Output as file or in-memory buffer

![example](https://imgur.com/4pgAAVk.png)

---

## 📦 Installation

```bash
pnpm add beatprints.js
# or
npm install beatprints.js
```

---

## 🌱 Setup

Make sure you have a `.env` file with your Spotify credentials:

```env
SPOTIFY_CLIENT_ID="your-client-id"
SPOTIFY_CLIENT_SECRET="your-client-secret"
```

You can get these from: [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

---

## 🎀 Quick Poster Generation

```ts
import { Spotify, Lyrics, Poster } from 'beatprints.js';

const client = new Spotify(
    process.env.SPOTIFY_CLIENT_ID, 
    process.env.SPOTIFY_CLIENT_SECRET
);

const lrc = new Lyrics();
const poster = new Poster({ 
    filename: 'love_lost.png', 
    output: { 
        type: 'path',
        value: './path/to/output/dir'
    }
});

const search = await client.getTrack('love lost - boywithuke', 1);
const lyrics = await lrc.getLyrics(search, true);

const highLightedLyrics = await lrc.selectLines(lyrics, '31-34');

await poster.track(search, highLightedLyrics, { palette: true, accent: true });
```

<b>The example above will result in this:</b>
<div>
    <img src="https://imgur.com/2zKqGWL.png" width="200px" height="305px" />
</div>

---

## ✨ Features

* 📀 Album and 🎧 Track poster generation
* 🖌️ Theme support: Light, Dark, Catppuccin, Nord, Gruvbox, RosePine, Everforest
* 🧠 Smart text layout & column handling
* 🎼 Lyric support via LRClib
* 🌈 Accent colors from cover palette
* 📦 Buffer or file output
* 📝 Custom fonts

---

## 📁 Output Options

```ts
// Save poster to file
new Poster({ type: 'path', value: './output', filename: 'example.png' /* optional */ });

// Return poster as Buffer (useful for APIs)
new Poster({ type: 'buffer' });
```

---

## 🖼️ More Examples<br>

<div align="center">
    <table>
        <thead>
            <tr>
                <th>Track Poster</th>
                <th>Album poster</th>
                <th>Custom cover</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><img src="https://imgur.com/zjQVstw.png" width="400px" alt="Birds of a feather by Billie Eilish example" /></td>
                <td><img src="https://imgur.com/fhIa90z.png" width="400px" alt="Petals to thorns by d4vd example" /></td>
                <td><img src="https://imgur.com/YWC99MQ.png" width="400px" alt="Here with me by d4vd with custom cover example" /></td>
            </tr>
        </tbody>
    </table>
</div>

---

## 🎨 Themes

```ts
// Available themes: "Light", "Dark", "Catppuccin", "Gruvbox", "Nord", "RosePine", "Everforest"
await poster.track(metadata, selectedLyrics, {
    theme: 'Catppuccin'
});
```

---

## 📝 Loading custom fonts

If you want to add support for custom fonts not included by default (e.g., `NotoSansSC` for Simplified Chinese), you can register them dynamically like this:
```ts
import { registerCustomFonts } from 'beatprints.js';

// Paths to your font files. Each file should be named in the format Family-Weight.ttf
const fontPaths = [
  '/path/to/fonts/NotoSansSC/NotoSansSC-Regular.ttf',
  '/path/to/fonts/NotoSansSC/NotoSansSC-Bold.ttf',
  '/path/to/fonts/NotoSansSC/NotoSansSC-Light.ttf',
];

// Provide an alias mapping folder/family name to display name used internally
const aliases = {
  'NotoSansSC': 'Noto Sans SC',
};

// Register your custom fonts
registerCustomFonts(fontPaths, aliases);

// Now you can use "Noto Sans SC" as a font alias in rendering functions
```

> **Important**
>
> * "Make sure your font files follow the naming convention `Family-Weight.ttf` exactly."
> * "Register all weights you intend to use (e.g. Regular, Light, Bold)."

This allows you to seamlessly extend font support without modifying internal code or defaults.

---

## 📜 License

BeatPrints.js is a derivative of the original [BeatPrints](https://github.com/TrueMyst/BeatPrints) by TrueMyst.
Distributed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** License.

> You may:
>
> * ✅ Share and adapt the material
> * ❌ Not use it for commercial purposes
> * 🔁 Share alike with proper attribution

More: [LICENSE](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

## 💜 Credits & Thanks

* Original concept & inspiration: [TrueMyst](https://github.com/TrueMyst/BeatPrints)
* Fonts, layout, ideas based on the [Python version](https://github.com/TrueMyst/BeatPrints)
* Color palette extraction: [sharp-vibrant](https://github.com/LiveChart/sharp-vibrant)
* Lyrics: [LRClib](https://lrclib.net)

<p align="center">
    Made with 🌌 and too many playlists — BeatPrints.js 2025
</p>
