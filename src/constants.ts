import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export namespace Size {
    // Heading's Width (Max)
    export const HEADING_WIDTH = 1760;

    // Resolution Size
    export const COVER = [2040, 2040] as const;
    export const SCANCODE = [660, 170] as const;

    // Track/Album Metadata
    export const TRACKS = 83;
    export const HEADING = 160;
    export const ARTIST = 110;
    export const DURATION = 90;
    export const LYRICS = 95;
    export const LABEL = 60;

    // Album's Tracklist
    export const MAX_ROWS = 5;
    export const MAX_WIDTH = 2040;

    // Space between texts
    export const SPACING = 70;

    // Color Palette
    export const PL_WIDTH = 340;
    export const PL_HEIGHT = 85;
}

export namespace Position {
    export const COVER = [120, 120] as const;
    export const HEADING = [120, 2400] as const;
    export const ARTIST = [120, 2575] as const;
    export const LYRICS = [120, 2750] as const;
    export const TRACKS = [120, 2750] as const;
    export const LABEL = [2160, 3230] as const;
    export const DURATION = [2160, 2550] as const;
    export const PALETTE = [120, 2240] as const;
    export const ACCENT = [0, 3440, 2280, 3480] as const;
    export const SCANCODE = [90, 3220] as const;
}

export namespace Color {
    // Default Themes
    export const DARK = [193, 189, 178] as const;
    export const LIGHT = [50, 47, 48] as const;

    // Extra Themes
    export const CATPPUCCIN = [205, 214, 244] as const;
    export const GRUVBOX = [221, 199, 161] as const;
    export const NORD = [216, 222, 233] as const;
    export const ROSEPINE = [224, 222, 244] as const;
    export const EVERFOREST = [211, 198, 170] as const;

    // Spotify Scancode
    export const WHITE = [255, 255, 255, 255] as const;
    export const TRANSPARENT = [0, 0, 0, 0] as const;
}

export namespace ThemesSelector {
    export const THEMES = {
        Light: Color.LIGHT,
        Dark: Color.DARK,
        Catppuccin: Color.CATPPUCCIN,
        Gruvbox: Color.GRUVBOX,
        Nord: Color.NORD,
        RosePine: Color.ROSEPINE,
        Everforest: Color.EVERFOREST,
    } as const;

    export type Options = keyof typeof THEMES;
}

export namespace FilePath {
    export const FULLPATH = __dirname;
    export const ASSETS = join(FULLPATH, 'assets');

    export const FONTS = join(ASSETS, 'fonts');
    export const TEMPLATES = join(ASSETS, 'templates');
}