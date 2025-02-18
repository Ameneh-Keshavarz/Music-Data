import { getUserIDs, getListenEvents, getSong } from "./data.js";
import { getSongCounts, getArtistCounts, getMostPlayed, getFridayNightSongStats, getLongestStreakSong,getSongsListenedEveryDay,getTopGenresByListenCount } from "./reportUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    const userSelect = document.getElementById("userDropdown");
    const resultsContainer = document.getElementById("results");

    populateUserDropdown();
    
    function populateUserDropdown() {
        const users = getUserIDs();
        users.forEach((userID) => {
            const option = document.createElement("option");
            option.value = userID;
            option.innerText = `User ${userID}`;
            userSelect.appendChild(option);
        });
    }

    userSelect.addEventListener("change", async (event) => {
        const userID = event.target.value;
        resultsContainer.innerHTML = "";
        if (!userID) return;

        try {
            const listenEvents = await getListenEvents(userID);
            if (listenEvents.length === 0) {
                resultsContainer.innerHTML = "<p>This user didn’t listen to any songs.</p>";
                return;
            }

            const report = await generateReport(listenEvents);
            displayResults(report);
        } catch (error) {
            console.error("Error fetching data:", error);
            resultsContainer.innerHTML = "<p>Error fetching data. Please try again later.</p>";
        }
        
    });
    
    async function generateReport(listenEvents) {
        const songCounts = getSongCounts(listenEvents);
        const artistCounts = await getArtistCounts(listenEvents);
        
        const songsData = {};
        
        for (const event of listenEvents) {
            const song = await getSong(event.song_id); 
            if (song) {
                songsData[song.id] = song; 
            }
        }
    
        const mostListenedSongID = getMostPlayed(songCounts, "count");
        const mostListenedSongByTimeID = getMostPlayed(songCounts, "duration");
        const mostListenedArtistID = getMostPlayed(artistCounts, "count");
        const mostListenedArtistByTimeID = getMostPlayed(artistCounts, "duration");
    
        const fridayNightStats = getFridayNightSongStats(listenEvents);
        const longestStreak = getLongestStreakSong(listenEvents);
        const songsListenedEveryDay = getSongsListenedEveryDay(listenEvents, songsData);
        const topGenres = getTopGenresByListenCount(listenEvents);
    
        return {
            mostListenedSong: mostListenedSongID ? await getSong(mostListenedSongID) : null,
            mostListenedSongByTime: mostListenedSongByTimeID ? await getSong(mostListenedSongByTimeID) : null,
            mostListenedArtist: mostListenedArtistID,
            mostListenedArtistByTime: mostListenedArtistByTimeID,
            fridayNightSongByCount: fridayNightStats.songByCount ? await getSong(fridayNightStats.songByCount) : null,
            fridayNightSongByTime: fridayNightStats.songByTime ? await getSong(fridayNightStats.songByTime) : null,
            longestStreakSong: longestStreak ? longestStreak.song : null,
            longestStreak: longestStreak ? longestStreak.streak : 0,
            songsListenedEveryDay: songsListenedEveryDay,
            topGenres: topGenres,
        };
    }
    
    function displayResults(report) {
        resultsContainer.innerHTML = "";
    
        if (report.mostListenedSong) {
            resultsContainer.innerHTML += `<p>Most listened song (count): ${report.mostListenedSong.artist} - ${report.mostListenedSong.title}</p>`;
        }
        if (report.mostListenedSongByTime) {
            resultsContainer.innerHTML += `<p>Most listened song (time): ${report.mostListenedSongByTime.artist} - ${report.mostListenedSongByTime.title}</p>`;
        }
        if (report.mostListenedArtist) {
            resultsContainer.innerHTML += `<p>Most listened artist (count): ${report.mostListenedArtist}</p>`;
        }
        if (report.mostListenedArtistByTime) {
            resultsContainer.innerHTML += `<p>Most listened artist (time): ${report.mostListenedArtistByTime}</p>`;
        }
        if (report.fridayNightSongByCount) {
            resultsContainer.innerHTML += `<p>Most listened song on Friday night (count): ${report.fridayNightSongByCount.artist} - ${report.fridayNightSongByCount.title}</p>`;
        }
        if (report.fridayNightSongByTime) {
            resultsContainer.innerHTML += `<p>Most listened song on Friday night (time): ${report.fridayNightSongByTime.artist} - ${report.fridayNightSongByTime.title}</p>`;
        }
        if (report.longestStreakSong) {
            resultsContainer.innerHTML += `<p>Longest streak song: ${report.longestStreakSong.artist} - ${report.longestStreakSong.title} - ${report.longestStreak} times in a row.</p>`;
        }
        if (report.songsListenedEveryDay.length !== 0) {
            const songsList = report.songsListenedEveryDay
                .map(song => `${song.artist} - ${song.title}`)
                .join(", ");
            resultsContainer.innerHTML += `<p>Songs listened to every day: ${songsList}</p>`;
        }
        if (report.topGenres.length > 0) {
            const topGenresText = report.topGenres.length === 1 ? "Top genre" : `Top ${report.topGenres.length} genres`;
            resultsContainer.innerHTML += `<p>${topGenresText}: ${report.topGenres.join(", ")}</p>`;
        }
    }
    
});
