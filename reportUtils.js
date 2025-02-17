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

export function getFridayNightListenEvents(listenEvents) {
    return listenEvents.filter(event => {
        const date = new Date(event.timestamp); 
        const dayOfWeek = date.getDay(); 
        const hours = date.getHours(); 
         
        const isFridayNight = (dayOfWeek === 5 && hours >= 17) || (dayOfWeek === 6 && hours < 4);

        return isFridayNight;
    });
}

export function getFridayNightSongStats(listenEvents) {

    const fridayNightEvents = getFridayNightListenEvents(listenEvents);
        
    if (fridayNightEvents.length === 0) return { songByCount: null, songByTime: null };

    const songCounts = getSongCounts(fridayNightEvents);
    const songByCount = getMostPlayed(songCounts, "count");
    
    const songByTime = getMostPlayed(songCounts, "duration");

    return { songByCount, songByTime };
}

export function getLongestStreakSong(listenEvents) {
    if (listenEvents.length === 0) return null;

    let maxStreak = 0;
    let currentStreak = 1;
    let longestSongID = listenEvents[0].song_id;
    let currentSongID = listenEvents[0].song_id;

    for (let i = 1; i < listenEvents.length; i++) {
        if (listenEvents[i].song_id === currentSongID) {
            currentStreak++;
        } else {
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
                longestSongID = currentSongID;
            }
            currentSongID = listenEvents[i].song_id;
            currentStreak = 1;
        }
    }

    if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        longestSongID = currentSongID;
    }

    const song = getSong(longestSongID);
    return { song, streak: maxStreak };
}





