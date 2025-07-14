import { Client, Track, Album } from 'spotify-api.js';
import { InvalidSearchLimit, NoMatchingAlbumFound, NoMathcingTrackFound } from './errors.js';

export const SpotifyURI = /^spotify:(track|album):([0-9A-Za-z]{22})$/;
export const SpotifyURL = /^https:\/\/(open|play)\.spotify\.com(\/intl-\w{2})?\/(track|album)\/([0-9A-Za-z]{22})$/
export const SpotifyID = /^([0-9A-Za-z]{22})$/;

/**
 * A class for interacting with the Spotify API to search and retrieve track and alnum metadata.
 */
export class Spotify {
    client: Client;

    /**
     * Initializes the Spotify client with credentials and obtains an access token.
     * @param {string} CLIENT_ID Spotify web API client ID.
     * @param {string} CLIENT_SECRET Spotify web API client secret.
     */
    constructor(
        public CLIENT_ID: string,
        public CLIENT_SECRET: string
    ) {
        this.client = new Client({
            refreshToken: true,
            token: {
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET
            }
        });
    }

    /**
     * Checks if the provided string is a valid Spotify ID, URI, or URL.
     * 
     * A valid Spotify identifier can be one of the following formats:
     * - Spotify URI: "spotify:{type}:{id}"
     * - Spotify URL: "https://open.spotify.com/{type}/{id}"
     * - Spotify ID: A 22-character Base62 string
     * 
     * @param {string} id The string to be checked.
     * @returns {boolean} True if the string is a valid Spotify identifier, false otherwise.
     */
    isSpotifyID(id: string): boolean {
        // Remove query parameters (e.g. ?si=...)
        const cleanId = id.split('?')[0]!;

        // Spotify URI: spotify:album:id or spotify:track:id
        if (SpotifyURI.test(cleanId)) {
            return true;
        }

        if (SpotifyURL.test(cleanId)) {
            return true;
        }

        // Spotify ID: 22-character Base62 string
        if (SpotifyID.test(cleanId)) {
            return true;
        }

        return false;
    }

    extractSpotifyID(input: string): { id: string; type: SpotifySearchType } | null {
        // Remove query parameters
        const cleanInput = input.split("?")[0]!;

        // URI (spotify:track:id or spotify:album:id)
        const uriMatch = cleanInput.match(SpotifyURI);
        if (uriMatch) {
            return { type: uriMatch[1] as SpotifySearchType, id: uriMatch[2]! };
        }

        // URL (https://open.spotify.com/track/... or https://play.spotify.com/track/...)
        const urlMatch = cleanInput.match(SpotifyURL);
        if (urlMatch) {
            return { type: urlMatch[3] as SpotifySearchType, id: urlMatch[4]! };
        }

        // ID (22-char base62)
        const rawIdMatch = cleanInput.match(SpotifyID);
        if (rawIdMatch) {
            return { type: null, id: rawIdMatch[1]! };
        }

        return null;
    }

    /**
     * Searches for tracks based on a query or Spotify ID/URI/URL and retrieves their metadata.
     * @param {string} query The search query or Spotify ID/URI/URL for the track.
     * @param {number} limit Max number of tracks to retrieve (only applies to search by text). 
     * @returns {Promise<TrackMetadata[] | TrackMetadata>} An array of track metadata or a single track metadata (if limit = 1 or query is URI/URl/ID).
     * @throws `InvalidSearchLimit` If the limit is less than 1.
     * @throws `NoMathcingTrackFound` If no matching tracks are found.
     * @example ```ts
     * spotify.getTrack('Romantic Homicide - d4vd') // TrackMetadata[]
     * spotify.getTrack('spotify:track:3N6OVnOAKr9op19GcbxB4g') // TrackMetadata
     * spotify.getTrack('https://open.spotify.com/track/3N6OVnOAKr9op19GcbxB4g')
     * ```
     */
    async getTrack(query: string, limit: 1): Promise<TrackMetadata>;
    async getTrack(query: string, limit?: number): Promise<TrackMetadata[]>;
    async getTrack(query: string, limit: number = 6): Promise<TrackMetadata[] | TrackMetadata> {
        try {
            if (this.isSpotifyID(query)) {
                const trackId = this.extractSpotifyID(query)!.id
                const track = await this.client.tracks.get(trackId);

                return this.getTrackMetadata(track!);
            } else {
                if (limit < 1) throw new InvalidSearchLimit();
                const search = await this.client.tracks.search(query, { limit });
                const metadata = await Promise.all(search.map(track => this.getTrackMetadata(track)));

                if (!metadata.length) throw new NoMathcingTrackFound();
                
                return limit === 1 ? metadata[0]! : metadata;

            }
        } catch (err) {
            if (err instanceof Error) throw err;
            throw new NoMathcingTrackFound();
        }
    }

     /**
     * Searches for album based on a query or Spotify ID/URI/URL and retrieves their metadata.
     * @param {string} query The search query or Spotify ID/URI/URL for the album.
     * @param {number} limit Max number of albums to retrieve (only applies to search by text). 
     * @returns {Promise<AlbumMetadata[] | AlbumMetadata>} An array of album metadata with track listings.
     * @throws `InvalidSearchLimit` If the limit is less than 1.
     * @throws `NoMatchingAlbumFound` If no matching albums are found.
     */
     async getAlbum(query: string, limit: 1): Promise<AlbumMetadata>;
     async getAlbum(query: string, limit?: number): Promise<AlbumMetadata[]>;
     async getAlbum(query: string, limit: number = 6, shuffle: boolean = false): Promise<AlbumMetadata[] | AlbumMetadata> {
        try {
            if (this.isSpotifyID(query)) {
                const albumId = this.extractSpotifyID(query)!.id
                const album = await this.client.albums.get(albumId);

                return this.getAlbumMetadata(album!, shuffle);
            } else {
                if (limit < 1) throw new InvalidSearchLimit();

                const search = await this.client.albums.search(query, { limit });
                const metadata = await Promise.all(
                    search.map(album => this.getAlbumMetadata(album, shuffle))
                );

                if (!metadata.length) throw new NoMatchingAlbumFound();
                
                return limit === 1 ? metadata[0]! : metadata;
            }
        } catch (err) {
            if (err instanceof Error) throw err;
            throw new NoMatchingAlbumFound();
        }
    }

    /**
     * Returns TrackMetadata from a Spotify track object.
     * @param {Track} track Spotify track object.
     */
    async getTrackMetadata(track: Track): Promise<TrackMetadata> {
        const album = (await this.client.albums.get(track.album!.id))!;
        const metadata = {
            name: track.name,
            artist: track.artists[0]?.name!,
            album: album.name,
            released: this.formatReleased(
                track.album!.releaseDate!, track.album!.releaseDatePrecision
            ),
            duration: this.formatDuration(track.duration),
            image: track.album?.images[0]?.url!,
            label: album.label && album.label.length < 35 ? album.label : track.artists[0]?.name!,
            id: track.id
        } satisfies TrackMetadata;

        return metadata;
    }

    /**
     * Returns AlbumMetadata from a Spotify album object.
     * @param {Album} album Spotify album object
     * @param {boolean} shuffle Whether to shuffle the tracks in the album
     */
    async getAlbumMetadata(album: Album, shuffle: boolean): Promise<AlbumMetadata> {
        const fetchedTracks = await this.client.albums.getTracks(album.id);
        const tracks = fetchedTracks.map(t => t.name);

        if (shuffle) {
            tracks.sort(() => Math.random() - 0.5);
        }

        const metadata = {
            name: album.name,
            artist: album.artists[0]?.name!,
            released: this.formatReleased(
                album.releaseDate, album.releaseDatePrecision
            ),
            image: album.images[0]?.url!,
            label: album.label && album.label.length < 35 ? album.label : album.artists[0]?.name!,
            id: album.id,
            tracks
        } satisfies AlbumMetadata;

        return metadata;
    }

    formatReleased(releaseDate: string, precision: string): string {
        const date = new Date(releaseDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        switch (precision) {
            case "day":
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            case "month":
                return `${year}-${month.toString().padStart(2, '0')}`;
            case "year":
                return `${year}`;
            default:
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Formats the duration of a track from milliseconds to `mm:ss` format.
     * @param {number} duration Duration of the track in milliseconds.
     * @returns {string} Formatted duration in `mm:ss` format.
     */
    formatDuration(duration: number): string {
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

export type SpotifySearchType = 'track' | 'album' | null;

export interface AlbumMetadata {
    name: string;
    artist: string;
    released: string;
    image: string;
    label: string;
    id: string;
    tracks: string[];
}

export interface TrackMetadata {
    name: string;
    artist: string;
    album: string;
    released: string;
    duration: string;
    image: string;
    label: string;
    id: string;
}