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
        await getIPAddress();
        getUserAgent();
        getLanguage();
        getTimezone();
        getHardwareConcurrency();
        getDeviceMemory();
        await getCanvasFingerprint();
        await getWebGLInfo();
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

function getHardwareConcurrency() {
    const hardwareConcurrency = navigator.hardwareConcurrency || "Not supported";
    document.getElementById("hardware-concurrency").innerText = hardwareConcurrency + " cores";
}

function getDeviceMemory() {
    const deviceMemory = navigator.deviceMemory || "Not supported";
    document.getElementById("device-memory").innerText = deviceMemory + " GB";
}

async function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Hello fingerprint 👋", 10, 10);

    const dataUrl = canvas.toDataURL();

    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(dataUrl));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    document.getElementById("canvas-fingerprint").innerText = hashHex;
}

function getWebGLInfo() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
        console.warn("WebGL non supporté sur ce navigateur.");
        document.getElementById("webgl-vendor").innerText = "Not available";
        document.getElementById("webgl-renderer").innerText = "Not available";
        return;
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

    const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : "Not available";

    const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "Not available";

    document.getElementById("webgl-vendor").innerText = vendor;
    document.getElementById("webgl-renderer").innerText = renderer;
}
