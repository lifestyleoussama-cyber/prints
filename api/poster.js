import { Spotify, Lyrics, Poster } from 'beatprints.js';

export default async function handler(req, res) {
  try {
    const q = (req.query?.q || 'love lost - boywithuke').toString();

    const client = new Spotify(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET
    );

    const lrc = new Lyrics();
    const poster = new Poster({ type: 'buffer' });

    const search = await client.getTrack(q, 1);
    const lyrics = await lrc.getLyrics(search, true);

    // returns a PNG buffer when type === 'buffer'
    const buffer = await poster.track(search, lyrics, { palette: true, accent: true });

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message || 'poster_error' });
  }
}
