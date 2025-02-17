import { getUserIDs, getListenEvents, getSong } from "./data.js";

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

            const stats = generateReport(listenEvents);
            displayResults(stats);
        } catch (error) {
            resultsContainer.innerHTML = "<p>Error fetching data. Please try again later.</p>";
        }
    });

    function generateReport(listenEvents) {
        const stats = {
            mostListenedSong: listenEvents[0], 
            mostListenedSongByTime: listenEvents[0]
        };
        return stats;
    }

    function displayResults(stats) {
        resultsContainer.innerHTML = "";

        if (stats.mostListenedSong) {
            resultsContainer.innerHTML += `<p>Most listened song (count): ${stats.mostListenedSong.song_id}</p>`;
        }
        if (stats.mostListenedSongByTime) {
            resultsContainer.innerHTML += `<p>Most listened song (time): ${stats.mostListenedSongByTime.song_id}</p>`;
        }
    }
});
