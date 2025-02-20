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
        const song = getSong(event.song_id);
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
    let longestSongs = [];
    let currentSongID = listenEvents[0].song_id;

    for (let i = 1; i < listenEvents.length; i++) {
        const { song_id } = listenEvents[i];

        if (song_id === currentSongID) {
            currentStreak++;
        } else {
            updateLongestSongs(currentStreak, currentSongID);
            currentSongID = song_id;
            currentStreak = 1;
        }
    }

    updateLongestSongs(currentStreak, currentSongID);

    const songs = longestSongs.map(songID => getSong(songID));
    return { songs, streak: maxStreak };

    function updateLongestSongs(streak, songID) {
        if (streak > maxStreak) {
            maxStreak = streak;
            longestSongs = [songID];
        } else if (streak === maxStreak) {
            longestSongs.push(songID);
        }
    }
}

export function getSongsListenedEveryDay(listenEvents) {
    if (listenEvents.length === 0) return [];

    listenEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const firstDay = new Date(listenEvents[0].timestamp).setHours(0, 0, 0, 0);
    const lastDay = new Date(listenEvents[listenEvents.length - 1].timestamp).setHours(0, 0, 0, 0);
    
    const songDays = {};

    listenEvents.forEach(event => {
        const songID = event.song_id;
        const eventDate = new Date(event.timestamp).setHours(0, 0, 0, 0); 

        if (!songDays[songID]) songDays[songID] = new Set();
        songDays[songID].add(eventDate);
    });

    const daysCount = Math.floor((lastDay - firstDay) / (1000 * 60 * 60 * 24)) + 1;

    const songsListenedEveryDay = Object.keys(songDays)
        .filter(songID => songDays[songID].size === daysCount)
        .map(songID => {
            const song = getSong(songID);
            return {
                title: song.title,
                artist: song.artist,
            };
        });

    return songsListenedEveryDay;
}

export function getTopGenresByListenCount(listenEvents) {
    const genreCounts = {};

    listenEvents.forEach(event => {
        const song = getSong(event.song_id);
        if (song && song.genre) {
            const genre = song.genre;
            if (!genreCounts[genre]) genreCounts[genre] = 0;
            genreCounts[genre]++;
        }
    });

    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return sortedGenres.map(entry => entry[0]); 
}






