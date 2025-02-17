import { getSong } from "./data.js";

export function getSongCounts(listenEvents) {
    const counts = {};
    listenEvents.forEach(event => {
        if (!counts[event.song_id]) counts[event.song_id] = { count: 0, duration: 0 };
        counts[event.song_id].count++;
        const song = getSong(event.song_id);
        if (song) counts[event.song_id].duration += song.duration_seconds;
    });
    return counts;
}

export async function getArtistCounts(listenEvents) {
    const counts = {};
    for (const event of listenEvents) {
        const song = await getSong(event.song_id);
        if (song && song.artist) {
            if (!counts[song.artist]) counts[song.artist] = { count: 0, duration: 0 };
            counts[song.artist].count++;
            counts[song.artist].duration += song.duration_seconds;
        }
    }
    return counts;
}

export function getMostPlayed(counts, type = "count") {
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1][type] - a[1][type]); 
    
    return sorted[0] ? sorted[0][0] : null;
}
