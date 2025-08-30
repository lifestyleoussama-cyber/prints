## 💔 v1.2.1 - "Foolishness" - *2025-08-30*

### 🛠 Changes

* Forgot to build the project. 🥀💔

---

## 🖼 v1.2.0 - "Formats in Focus" - *2025-08-30*

### ✨ Added

* **Configurable output mime type**:
  Poster generation now supports choosing the output format via `options.mimeType`.
  Available options:
  * `image/png`
  * `image/jpeg`
  * `image/webp`
  * `image/avif`

---

### 🛠 Changed

* **Poster options refined**:  
  * `output` type was updated for better clarity:  
    - **Before:** `{ type: 'buffer' } | { type: 'path'; value: string }`  
    - **Now:** `{ type: 'buffer' } | { type: 'file'; path: string }`
  
  * Poster now takes a `PosterOptions` object instead of `{ filename?: string; output: OutputMode }`.

* **Default Spotify search limit increased**:
  Album/track search now defaults to **8 results** instead of 6.

* **Font size adjustments for better readability and balance**:
  * Lyrics: **95** (was 87)
  * Album tracks: **83** (was 80)
---

## 🔧 v1.1.1 - *2025-07-13*

### 🛠 Changed

* **sharp-vibrant**:
  Replaced `node-vibrant` with `sharp-vibrant` for improved performance and native image pipeline compatibility.

* **Tweaked constants for text positioning and sizing**:
  * Adjusted alignment for album tracks and lyrics text.
  * Increased default lyric font size for better visual balance.

---

### 🧠 Improved

* **Enhanced Spotify client regex matching**:
  Added support for internationalized (intl) Spotify URLs like `spotify.com/intl-es/track/...`

---

### 📚 Updated

* Updated usage examples to reflect the latest changes in API and layout, ensuring consistency and clarity for new users.

---

## 🎉 v1.1.0 - "Scannable Serenity"

### ✨ Added

* **Multi-threaded image post-processing**:
  Offloaded color manipulation for Spotify scannables (`replaceWhite`) to a `worker_thread` to improve responsiveness and allow parallel rendering.

* **Palette speed boost**:
  Introduced image downscaling before color extraction using `node-vibrant`, resulting in palette generation time dropping from \~200ms to \~35ms on average.

* **Custom font registration support**:
  New utility: `registerCustomFonts(paths, aliases)`
  Allows users to register fonts dynamically by specifying folder-based aliases. Files must follow `Family-Weight.ttf` naming.

* **Support for poster generation without lyrics**:
  Lyrics and poster generation functions now gracefully handle instrumental tracks or missing lyrics without throwing.

* **Improved JSdoc and typing** across the image and lyrics modules for better DX and maintainability.

---

### 🛠 Changed

* **`Lyrics.selectLines()` is now async**:
  Accepts track metadata to automatically detect instrumental songs and return empty results instead of throwing.

* **Major refactor in `image.ts`**:

  * Removed unnecessary `await` keywords (replaced with direct `return ...`)
  * Optimized palette and resizing workflows
  * Clearer separation of logic for better debuggability

* **Improved font aliasing system**:
  `getFontAlias()` now accepts custom alias mappings to improve clarity and extensibility.

* **Better fallback handling**:
  `NotoSans` is now used as a fallback font behind `Oswald` for extended glyph support (e.g., Latin, rare symbols).

---

### 🐛 Fixed

* 🧱 Fixed a bug where fonts wouldn't display correctly due to inconsistent aliasing.
* 🖼 Resolved issue where scannables appeared with a black background — now properly transparent with `ensureAlpha()`.
* 🧪 Poster creation now works even when lyrics are not included (e.g., instrumental tracks or empty input).

---

### 🗑 Removed

* 🚮 Dropped support for the following rarely-used fonts:

  * `NotoSansTC` (Traditional Chinese)
  * `NotoSansSC` (Simplified Chinese)
  * `NotoSansBengali` (Bengali script)

These can now be registered manually if needed via the new `registerCustomFonts()` function.