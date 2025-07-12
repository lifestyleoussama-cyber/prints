import { Size } from "./constants.js";
import * as write from './write.js';

export function zip<T, Q>(array: T[], other: Q[]) {
    return array.map((item, index) => [item, other[index]]) as [T, Q][];
}

export function pickRandom<T>(arr: T[]): T | null {
    if (arr.length === 0) return null
    return arr[~~(Math.random() * arr.length)] as T;
}

/**
 * Adds a flat index to each track name in a nested list.
 * @param {string[][]} nlist A nested array of track names.
 * @returns {string[][]} The modified nested list with flat indexes added to track names.
 */
export function addIndexes(nlist: string[][]): string[][] {
    let index = 1;

    for (let i = 0; i < nlist.length; i++) {
        for (let j = 0; j < nlist[i]?.length!; j++) {
            nlist[i]![j] = `${index}. ${nlist[i]?.[j]}`
            index++;
        }
    }

    return nlist;
}

/**
 * Distributes tracks into columns while ensuring they fit within the maximum allowed width.
 * @param {string[]} tracks A list of track names to be organized into columns.
 * @param {boolean} index If true, adds index numbers to the tracks. Defaults to false.
 * @returns {OrganizeResult} A tuple containing the organized columns of tracks and their respective widths.
 */
export function organizeTracks(
    tracks: string[],
    index: boolean = false
): OrganizeResult {
    const font = write.fontPaths('Light');
    const getColumnWidth = (col: string[], idxWidth: number): number => {
        const size = Size.TRACKS;

        return Math.max(...col.map(item => write.textWidth(item, font, size))) + idxWidth;
    };

    const idxWidth = index ? write.textWidth("00. ", font, Size.TRACKS) : 0;

    let cols: string[][] = [];
    let colWidths: number[] = [];

    const tracksCopy = [...tracks];

    while (true) {
        cols = [];
        for (let i = 0; i < tracksCopy.length; i += Size.MAX_ROWS) {
            cols.push(tracksCopy.slice(i, i + Size.MAX_ROWS));
        }

        colWidths = cols.map(col => getColumnWidth(col, idxWidth))

        const totalWidth = colWidths.reduce((a, b) => a + b, 0) + Size.SPACING * (cols.length - 1);

        if (totalWidth <= Size.MAX_WIDTH) break;

        const widestIndex = colWidths.indexOf(Math.max(...colWidths));
        const widestCol = cols[widestIndex];
        if (!widestCol) break;

        const longest = widestCol.reduce((a, b) => (a.length > b.length ? a : b));
        const indexToRemove = tracksCopy.indexOf(longest);
        if (indexToRemove >= 0) tracksCopy.splice(indexToRemove, 1);
    }

    if (index) {
        cols = addIndexes(cols);
    }

    return [cols, colWidths];
}

/**
 * Creates a safe filename based on the song and artist names.
 * @param {string} song The name of a song.
 * @param {string} artist The name of the artist.
 * @returns {string} A sanitized filename that is safe for file systems.
 */
export function filename(song: string, artist: string): string {
    const fullText = `${song} by ${artist}` as const;

    // Replace illegal characters with underscores and sanitize the text.
    let safeText = fullText
        .replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, '_')
        .trim()
        .replace(/^\.+|\.+$/g, '')
        .toLowerCase()
        .replace(/ /g, '_');

    // Remove consecutive underscores
    safeText = safeText.replace(/_{2,}/, '_');

    // Limit filename length to 255 characters (filesystem limit)
    safeText = safeText.slice(0, 255);

    // Append 3 random hexadecimal digits to make the filename unique
    const randomHex = Array.from({ length: 3 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const filename = `${safeText}_${randomHex}.png`;

    return filename;
}

type OrganizeResult = [cols: string[][], colWidths: number[]];
