import * as lrc from 'lrclib-api';
import type { TrackMetadata } from './spotify.js';

import { 
    NoLyricsAvailable,
    InvalidFormatError,
    InvalidSelectionError,
    LineLimitExceededError
} from './errors.js';

import { Instrumental } from './constants.js';

/**
 * A class for interacting with the LRClib API to fetch and manage song lyrics.
 */
export class Lyrics {
    api: lrc.Client;

    constructor() {
        this.api = new lrc.Client();
    }

    /**
     * Determines if a track is instrumental.
     * @param {TrackMetadata} metadata The metadata of the track.
     * @returns {boolean} True if the track is instrumental (i.e., no lyrics found), false otherwise.
     * @throws `NoLyricsAvailable` if no lyrics are found for the specified track and artist.
     */
    public async checkInstrumental(metadata: TrackMetadata): Promise<boolean> {
        const result = await this.api.findLyrics({ track_name: metadata.name, artist_name: metadata.artist });

        return result.instrumental;
    }

    public async getLyrics(metadata: TrackMetadata, index: boolean = false): Promise<string> {
        const lyrics = (await this.api.findLyrics({
            track_name: metadata.name,
            artist_name: metadata.artist
        })).plainLyrics;

        if (await this.checkInstrumental(metadata)) {
            return Instrumental.DESC();
        }

        if (!lyrics) {
            throw new NoLyricsAvailable();
        }

        // Remove blanks between verses
        const clearedLyrics = lyrics.split('\n').filter(x => x.trim())
        return index ? clearedLyrics.map((verse, i) => `${i+1}. ${verse}`).join('\n') : clearedLyrics.join('\n');
    }

    /**
     * 
     * @param {string} lyrics The full lyrics of the song as a single string.
     * @param {string} selection The range of lines to extract, specified in the format "start-end" (e.g., '2-5')
     * @returns {string} A string containing exactly 4 extracted lines, separated by newline characters.
     * @throws `InvalidFormatError` If the selection argument is not in the correct "start-end" format.
     * @throws `InvalidSelectionError` If the specified range is out of bounds or otherwise invalid.
     * @throws `LineLimitExceededError` If the selected range does not include exactly 4 non-empty lines.
     */
    public selectLines(lyrics: string, selection: `${number}-${number}`): string;
    public selectLines(lyrics: string, selection: `${number}-${number}`): string | undefined {
        const rawLines = lyrics.split('\n');
        let lines: string[]

        // Remove indexes (e.g., 1. Verse) from lyrics if exists
        if (rawLines.some(v => /^\d+\./.test(v))) {
            lines = rawLines.map(line => line.replace(/^\d+\.\s*/, ''));
        } else lines = rawLines;

        const lineCount = lines.length;

        try {
            const pattern = /^\d+-\d+$/;
            if (!pattern.test(selection)) {
                throw new InvalidFormatError();
            }

            const selected = selection.split('-').map((num) => parseInt(num, 10));

            if (
                selected.length !== 2 ||
                selected[0]! >= selected[1]! ||
                selected[0]! <= 0 ||
                selected[1]! > lineCount
            ) {
                throw new InvalidSelectionError();
            }

            const extracted = lines.slice(selected[0]! - 1, selected[1]!);
            const selectedLines = extracted.filter(line => line !== '');

            if (selectedLines.length !== 4) {
                throw new LineLimitExceededError();
            }

            return selectedLines.join('\n').trim();
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
        }
    }
}