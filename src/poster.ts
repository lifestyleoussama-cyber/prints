import * as write from './write.js';
import * as image from './image.js';

import { filename, organizeTracks, zip } from './utils.js';
import { ThemeNotFoundError } from './errors.js';
import type { TrackMetadata, AlbumMetadata } from './spotify.js';
import { Size, Position, ThemesSelector } from './constants.js';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { Canvas, type CanvasRenderingContext2D, createCanvas, Image, loadImage } from '@napi-rs/canvas';

const boldFonts = write.fontPaths('Bold');
const regularFonts = write.fontPaths('Regular');
const lightFonts = write.fontPaths('Light');

/**
 * A class for generating and saving posters containing track or album information.
 */
export class Poster {
    constructor(private options?: PosterOptions) {
        this.options = this.options || {
            mimeType: 'image/png',
            output: {
                type: 'buffer'
            }
        }
    }

    private async _handleOutput(img: Buffer, name: string): Promise<Buffer> {
        if (this.options?.output?.type === 'file') {
            const filePath = join(this.options.output.path ?? process.cwd(), name);
            await writeFile(filePath, img, { flag: 'w+' });

            console.log(`✨ Poster saved to ${filePath}`);

            return img;
        }

        return img;
    }

    /**
     * Adds text like title, artist, and label info.
     */
    private async _drawTemplate(
        ctx: CanvasRenderingContext2D,
        metadata: TrackMetadata | AlbumMetadata,
        color: write.RGB
    ) {
        // Add heading (track or album name) in bold
        write.heading(
            ctx,
            Position.HEADING,
            Size.HEADING_WIDTH,
            metadata.name.toUpperCase(),
            color,
            boldFonts,
            Size.HEADING
        );

        // Add artist name
        write.text(
            ctx,
            Position.ARTIST,
            metadata.artist,
            color,
            regularFonts,
            Size.ARTIST,
            undefined,
            undefined,
            'lt'
        );

        // Add release year and label info
        write.text(
            ctx,
            Position.LABEL,
            `${metadata.released}\n${metadata.label}`,
            color,
            regularFonts,
            Size.LABEL,
            undefined,
            undefined,
            'rt'
        );
    }

    public async track(
        metadata: TrackMetadata,
        lyrics: string,
        options: PosterTrackOptions = {}
    ): Promise<Buffer> {
        const theme = options?.theme ?? 'Light';

        // Check if the theme is valid or not
        if (!(theme in ThemesSelector.THEMES)) {
            throw new ThemeNotFoundError();
        }

        // Get theme and template for the poster
        const [color, template] = image.getTheme(theme);

        // Get cover art and scannable
        const cover = await image.cover(metadata.image, options?.pcover);
        const scannable  = await image.scannable(metadata.id, theme, 'track');

        const poster = await loadImage(template);
        const canvas = createCanvas(poster.width, poster.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(poster, 0, 0);
        
        // Paste the track cover and scannable Spotify code
        ctx.drawImage(await this.BFT(cover), ...Position.COVER, ...Size.COVER)
        ctx.drawImage(await this.BFT(scannable), ...Position.SCANCODE);

        // Optionally add a color palette or design accents
        if (options?.palette) await image.drawPalette(ctx, cover, options?.accent);

        // Add album information (name, artist, etc.)
        await this._drawTemplate(ctx, metadata, color);

        // Add the track's duration and lyrics to the poster
        write.text(
            ctx,
            Position.DURATION,
            metadata.duration,
            color,
            regularFonts,
            Size.DURATION,
            undefined,
            undefined,
            'rb'
        );

        // Lyrics
        write.text(
            ctx,
            Position.LYRICS,
            lyrics,
            color,
            lightFonts,
            Size.LYRICS,
            undefined,
            undefined,
            'lt'
        );

        return this.save(canvas, metadata)
    }

    public async album(
        metadata: AlbumMetadata,
        options: PosterAlbumOptions = {}
    ): Promise<Buffer> {
        const theme = options?.theme ?? 'Light';
        const indexing = options?.indexing ?? false;

        // Check if the theme is valid or not
        if (!(theme in ThemesSelector.THEMES)) {
            throw new ThemeNotFoundError();
        }

        const [color, template] = image.getTheme(theme);
        const cover = await image.cover(metadata.image, options?.pcover);
        const scannable = await image.scannable(metadata.id, theme, 'album');

        const poster = await loadImage(template);
        const canvas = createCanvas(poster.width, poster.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(poster, 0, 0);

        // Paste the album cover and scannable Spotify code
        ctx.drawImage(await this.BFT(cover), ...Position.COVER, ...Size.COVER)
        ctx.drawImage(await this.BFT(scannable), ...Position.SCANCODE);

        // Optionally add a color palette or design accents
        if(options?.palette) await image.drawPalette(ctx, cover, options?.accent);

        // Add album information (name, artist, etc.)
        await this._drawTemplate(ctx, metadata, color);

        // Album's tracks
        const tracks = metadata.tracks;
        const [tracklist, trackWidths] = organizeTracks(tracks, indexing)
        
        // Starting positions
        let [x, y] = Position.TRACKS;

        // Render the tracklist, adjusting the position for each column
        for (const [trackColumn, columnWidth] of zip(tracklist, trackWidths)) {
            write.text(
                ctx,
                [x, y],
                trackColumn.join('\n'),
                color,
                lightFonts,
                Size.TRACKS,
                undefined,
                2,
                'lt'
            );

            x += columnWidth + Size.SPACING // Adjust x for next column
        }

        return this.save(canvas, metadata);
    }

    private async save(canvas: Canvas, metadata: TrackMetadata | AlbumMetadata): Promise<Buffer> {
        let img: Buffer | null = null;
        switch (this.options?.mimeType) {
            case 'image/png': 
                img = canvas.toBuffer('image/png')
                break;
            case 'image/avif':
                img = canvas.toBuffer('image/avif', { quality: 100 })
                break;
            case 'image/jpeg':
            case 'image/webp':
                img = canvas.toBuffer(this.options.mimeType, 100);
                break;
        }

        const name = this.options?.filename ? this.options.filename : filename(metadata.name, metadata.artist);
        return this._handleOutput(img!, name);
    }

    // wtf
    private async BFT(buffer: Buffer): Promise<Image> {
        return loadImage(buffer);
    }
}

export type OutputMode = { type: 'buffer' } | { type: 'file'; path: string };
export type PosterTrackOptions = {
    accent?: boolean;
    palette?: boolean;
    theme?: ThemesSelector.Options;
    pcover?: Buffer | string;
}

export type PosterAlbumOptions = {
    indexing?: boolean;
    accent?: boolean;
    palette?: boolean;
    theme?: ThemesSelector.Options;
    pcover?: Buffer | string;
}

export type PosterOptions = {
    filename?: string;
    mimeType?: 'image/png' | 'image/jpeg' | 'image/avif' | 'image/webp';
    output?: OutputMode;
}