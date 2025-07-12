import { join } from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import { Vibrant } from 'node-vibrant/node';
import { Size, Position, Color, ThemesSelector, FilePath } from './constants.js';
import type { RGB } from './write.js';
import { pickRandom } from './utils.js';
import { Jimp, JimpMime, ResizeStrategy, rgbaToInt } from 'jimp';
import type { CanvasRenderingContext2D } from '@napi-rs/canvas';
import { readFile } from 'node:fs/promises';

export const TRANSPARENT = rgbaToInt(...Color.TRANSPARENT);
export const WHITE = rgbaToInt(...Color.WHITE);

export async function getPalette(image: Buffer): Promise<RGB[]> {
    const palette = await Vibrant.from(image).maxColorCount(6).getPalette()
    palette
    const colors = Object.values(palette)
        .filter(swatch => swatch !== null)
        .map(swatch => swatch.rgb.map(c => Math.round(c)) as RGB);

    return colors;
}

/**
 * Draws a color palette on the given image.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {Buffer} image The image from which the color palette will be drawn.
 * @param {boolean} accent If true, an accent color is added at the bottom. Defaults to false.
 */
export async function drawPalette(
    ctx: CanvasRenderingContext2D,
    image: Buffer,
    accent: boolean = false
): Promise<void> {
    const palette = await getPalette(image);

    for (let i = 0; i < palette.length; i++) {
        const [r, g, b] = palette[i]!;
        const [x, y] = Position.PALETTE;
        const [start, end] = [Size.PL_WIDTH * i, Size.PL_WIDTH * (i + 1)];

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x + start, y, end - start, Size.PL_HEIGHT);
    }

    if (accent) {
        const color = pickRandom(palette)!

        ctx.fillStyle = `rgb(${color.join(',')})`;
        ctx.fillRect(...Position.ACCENT);
    }
}

/**
 * Crops the image buffer to a square aspect ratio.
 * @param {Buffer} image The image from which the crop will be applied.
 * @returns {Promise<Buffer>} A new buffer containing the cropped square image.
 */
export async function crop(image: Buffer): Promise<Buffer> {
    const chop = async (buffer: Buffer): Promise<Buffer> => {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        const { width, height } = metadata;
        const minSize = Math.min(width, height);

        const left = Math.floor((width - minSize) / 2);
        const top = Math.floor((height - minSize) / 2);

        return await image.extract({ left, top, width: minSize, height: minSize }).toBuffer();
    }

    return await chop(image);
}

/**
 * Adjusts the brightness and contrast of an image buffer.
 * 
 * - Brightness is reduced by 10% (i.e., 90% of original)
 * - Contrast is reduced by 20% (i.e., 80% of original)
 * 
 * @param image Buffer or Sharp instance of the image
 * @returns Promise<Buffer> The processed image buffer
 */
export async function magicify(image: Buffer): Promise<Buffer> {
    const img = sharp(image);

    return await img
        .modulate({
            brightness: 0.9, // 90% of original brightness (-10%)
        })
        .linear(0.8, 0) // contrast: multiply by 0.8 (less contrast; -20%)
        .toBuffer();
}

/**
 * Generates a Spotify scannable code for a track or album.
 * @param {string} id The Spotify track or album ID.
 * @param {ThemesSelector.Options} theme The theme for the scannable code. Defaults to 'Light'.
 * @param {'track' | 'album'} item Specifies the type of the scannable code. Defaults to 'track'.
 * @returns {Promise<Buffer>} A buffer containing the resized scannable code image.
 */
export async function scannable(
    id: string,
    theme: ThemesSelector.Options = 'Light',
    item: 'track' | 'album' = 'track'
): Promise<Buffer> {
    const variant = [...ThemesSelector.THEMES[theme], 255];
    const scan_url = `https://scannables.scdn.co/uri/plain/png/101010/white/1280/spotify:${item}:${id}`;

    const data = (await axios.get(scan_url, { responseType: 'arraybuffer' })).data;
    const img = await Jimp.read(data);

    const { width, height } = img.bitmap;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const pixelColor = img.getPixelColor(x, y);

            if (pixelColor !== WHITE) {
                img.setPixelColor(TRANSPARENT, x, y);
            } else {
                // @ts-ignore cry ts
                img.setPixelColor(rgbaToInt(...variant), x, y);
            }
        }
    }

    img.resize({
        mode: ResizeStrategy.BICUBIC,
        w: Size.SCANCODE[0],
        h: Size.SCANCODE[1]
    });

    return await img.getBuffer(JimpMime.png);
}

/**
 * Fetches and processes an image from a URL or Buffer image.
 * @param {string} url The URL of the image.
 * @param {string | Buffer} source The local path of the image. If provided, the image will be loaded from this path; otherwise, it will be fetched from the URL.
 * @returns {Promise<Buffer>} A buffer containing the processed image.
 */
export async function cover(url: string, source?: string | Buffer): Promise<Buffer> {
    let buffer: Buffer;

    if (source) {
        if (typeof source === 'string') {
            if (source.startsWith('http')) {
                const res = await axios.get(source, { responseType: 'arraybuffer' });
                buffer = Buffer.from(res.data)
            } else {
                buffer = await readFile(source);
            }
        } else { buffer = source }
    } else {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        buffer = Buffer.from(res.data)
    }
    
    const cropped = await crop(buffer);
    return await magicify(cropped);
}

/**
 * Returns theme-related properties based on the selected theme.
 * @param {ThemesSelector.Options} theme The selected theme. Defaults to 'Light'.
 * @returns {[RGB, string]} A tuple containing the thee color and the template path.
 */
export function getTheme(theme: ThemesSelector.Options = 'Light'): [RGB, string] {
    const variant = ThemesSelector.THEMES[theme];
    const template = join(FilePath.TEMPLATES, `${theme.toLowerCase()}.png`);

    return [variant as unknown as RGB, template];
}