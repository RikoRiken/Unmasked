/*
     _   _                           _            _ 
    | | | |_ __  _ __ ___   __ _ ___| | _____  __| |
    | | | | '_ \| '_ ` _ \ / _` / __| |/ / _ \/ _` |
    | |_| | | | | | | | | | (_| \__ \   <  __/ (_| |
     \___/|_| |_|_| |_| |_|\__,_|___/_|\_\___|\__,_|
                                                
Unmasked, a simple web application to discover your fingerprint on websites. */

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("new-scan");

    button.addEventListener("click", async () => {
        getUserAgent();
        getLanguage();
        getTimezone();
        await getIPAddress();
    });
});

function getUserAgent() {
  const userAgent = navigator.userAgent;
  document.getElementById("user-agent").innerText = userAgent;
}

function getLanguage() {
    const language = navigator.language || navigator.userLanguage;
    document.getElementById("language").innerText = language;
}

function getTimezone() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById("timezone").innerText = timezone;
}

async function getIPAddress() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        const ip = data.ip;
        document.getElementById("ip-address").innerText = ip;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("ip-address").innerText = "Error";
    }
}