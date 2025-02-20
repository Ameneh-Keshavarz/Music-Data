import { getUserIDs, getListenEvents, getSong } from "./data.js";
import { getSongCounts, getArtistCounts, getMostPlayed, getFridayNightSongStats, getLongestStreakSong,
         getSongsListenedEveryDay,getTopGenresByListenCount } from "./reportUtils.js";

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
            displayResults(report,userID);
        } catch (error) {
            resultsContainer.innerHTML = "<p>Error fetching data. Please try again later.</p>";
        }
    });

    async function generateReport(listenEvents) {
        const songCounts = getSongCounts(listenEvents);
        const artistCounts =  await getArtistCounts(listenEvents);
    
        const songsData = {};
    
        for (const event of listenEvents) {
            const song =  getSong(event.song_id);
            if (song) {
                songsData[song.id] = song;
            }
        }
    
        const mostListenedSongID = getMostPlayed(songCounts, "count");
        const mostListenedSongByTimeID = getMostPlayed(songCounts, "duration");
        const mostListenedArtistID =  getMostPlayed(artistCounts, "count");
        const mostListenedArtistByTimeID =  getMostPlayed(artistCounts, "duration");
    
        const fridayNightStats = getFridayNightSongStats(listenEvents);
        const longestStreak = getLongestStreakSong(listenEvents); 
        const songsListenedEveryDay = getSongsListenedEveryDay(listenEvents, songsData);
        const topGenres = getTopGenresByListenCount(listenEvents);
    
        return {
            mostListenedSong: mostListenedSongID ?  getSong(mostListenedSongID) : null,
            mostListenedSongByTime: mostListenedSongByTimeID ?  getSong(mostListenedSongByTimeID) : null,
            mostListenedArtist: mostListenedArtistID,
            mostListenedArtistByTime: mostListenedArtistByTimeID,
            fridayNightSongByCount: fridayNightStats.songByCount ?  getSong(fridayNightStats.songByCount) : null,
            fridayNightSongByTime: fridayNightStats.songByTime ?  getSong(fridayNightStats.songByTime) : null,
            longestStreakSong: longestStreak ? longestStreak.songs : null,
            longestStreak: longestStreak ? longestStreak.streak : 0, 
            songsListenedEveryDay: songsListenedEveryDay,
            topGenres: topGenres,
        };
    } 

    function createTableRow(label, value) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${label}</td>
            <td>${value}</td>
        `;
        return row;
    }
    
    function createTable(headers, rows) {
        const table = document.createElement("table");
        table.setAttribute("border", "1"); 
    
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
    
        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
    
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        const tbody = document.createElement("tbody");
        rows.forEach(row => {
            tbody.appendChild(row);
        });
    
        table.appendChild(tbody);
        return table;
    }
    
    function displayResults(report, userID) {
        resultsContainer.innerHTML = "";
    
        const headers = ["Question", `User ${userID}`];
    
        const results = [
            { label: "Most listened song (count)", value: report.mostListenedSong ? `${report.mostListenedSong.artist} - ${report.mostListenedSong.title}` : null },
            { label: "Most listened song (time)", value: report.mostListenedSongByTime ? `${report.mostListenedSongByTime.artist} - ${report.mostListenedSongByTime.title}` : null },
            { label: "Most listened artist (count)", value: report.mostListenedArtist || "N/A" },
            { label: "Most listened artist (time)", value: report.mostListenedArtistByTime || "N/A" },
            { label: "Friday night song (count)", value: report.fridayNightSongByCount ? `${report.fridayNightSongByCount.artist} - ${report.fridayNightSongByCount.title}` : null },
            { label: "Friday night song (time)", value: report.fridayNightSongByTime ? `${report.fridayNightSongByTime.artist} - ${report.fridayNightSongByTime.title}` : null },
            { label: "Longest streak song", value: report.longestStreakSong ? `${report.longestStreakSong[0].artist} - ${report.longestStreakSong[0].title} - ${report.longestStreak} times in a row.` : null },
            { label: "Every day songs", value: report.songsListenedEveryDay.length > 0 ? report.songsListenedEveryDay.map(song => `${song.artist} - ${song.title}`).join(", ") : null },
            { label: "Top genres", value: report.topGenres.length > 0 ? report.topGenres.join(", ") : "N/A" }
        ];
    
        const rows = results
            .filter(item => item.value !== null)
            .map(item => createTableRow(item.label, item.value));
    
        const table = createTable(headers, rows);
    
        resultsContainer.appendChild(table);
    }       
});
