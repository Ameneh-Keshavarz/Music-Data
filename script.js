import { getUserIDs, getListenEvents, getSong } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
    const userSelect = document.getElementById("userDropdown");

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
});
