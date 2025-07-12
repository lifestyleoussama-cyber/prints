/**
 * Raised when no song matching the specified query is found.
 */
export class NoMathcingTrackFound extends Error {
    constructor(message = "No track was found matching the query or Spotify ID/URI/URL.") {
        super(message);
        this.name = "NoMatchingTrackFound";
    }
}

/**
 * Raised when no album matching the specified query is found.
 */
export class NoMatchingAlbumFound extends Error {
    constructor(message = "No album was found matching the query or Spotify ID/URI/URL.") {
        super(message);
        this.name = "NoMatchingAlbumFound";
    }
}

/**
 * Raised when no lyrics are available for the specified song.
 */
export class NoLyricsAvailable extends Error {
    constructor(message = "No lyrics were found for the specified song.") {
        super(message);
        this.message = message;
    }
}

/**
 * Raised when an invalid search limit is specified for tracks or albums.
 */
export class InvalidSearchLimit extends Error {
    constructor(message = "The search limit must be set to at least 1.") {
        super(message);
        this.message = message;
    }
}

/**
 * Raised when an invalid selection range is provided for lyrics.
 */
export class InvalidSelectionError extends Error {
    constructor(message = "Invalid range format. Please use 'start-end', ensuring start is less than end.") {
        super(message);
        this.message = message;
    }
}
/**
 * Raised when the selection in lyrics contains more or fewer than 4 lines.
 */
export class LineLimitExceededError extends Error {
    constructor(message = "Exactly 4 lines must be selected, no more, no less.") {
        super(message);
        this.message = message;
    }
}

/**
 * Raised when the format of the lyrics selection is invalid.
 */
export class InvalidFormatError extends Error {
    constructor(message = "Use format 'x-y' where x and y are positive integers.") {
        super(message);
        this.message = message;
    }
}

/**
 * Raised when the specified theme is not found or is invalid.
 */
export class ThemeNotFoundError extends Error {
    constructor(message = "The specified theme could not be found. Please ensure the theme name is valid.") {
        super(message);
        this.message = message;
    }
}