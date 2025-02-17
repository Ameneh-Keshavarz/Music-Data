import { getUserIDs, getListenEvents, getSong } from "./data.js";
import { getSongCounts, getArtistCounts,getMostPlayed} from "./reportUtils.js";

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
    
        const mostListenedSongID = getMostPlayed(songCounts, "count");  
        const mostListenedSongByTimeID = getMostPlayed(songCounts, "duration");  
        const mostListenedArtistID = getMostPlayed(artistCounts, "count");  
        const mostListenedArtistByTimeID = getMostPlayed(artistCounts, "duration");  
    
        return {
            mostListenedSong: mostListenedSongID ? await getSong(mostListenedSongID) : null,
            mostListenedSongByTime: mostListenedSongByTimeID ? await getSong(mostListenedSongByTimeID) : null,
            mostListenedArtist: mostListenedArtistID,
            mostListenedArtistByTime: mostListenedArtistByTimeID,
        };
    }
    
    function displayResults(report) {
        resultsContainer.innerHTML = "";

        if (report.mostListenedSong) {
            resultsContainer.innerHTML += `<p>Most listened song (count): ${report.mostListenedSong.title}</p>`;
        }
        if (report.mostListenedSongByTime) {
            resultsContainer.innerHTML += `<p>Most listened song (time): ${report.mostListenedSongByTime.title}</p>`;
        }
        if (report.mostListenedArtist) {
            resultsContainer.innerHTML += `<p>Most listened artist (count): ${report.mostListenedArtist}</p>`;
        }
        if (report.mostListenedArtistByTime) {
            resultsContainer.innerHTML += `<p>Most listened artist (time): ${report.mostListenedArtistByTime}</p>`;
        }
    }
});
