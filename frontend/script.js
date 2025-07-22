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
        displayScore();
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


const fingerprintAttributes = [
    { id: "ip-address", weight: 10 },

    {
        id: "language",
        weight: 5,
        evaluate: evaluateLanguage
    },

    {
        id: "timezone",
        weight: 5,
        evaluate: evaluateTimezone
    },

    {
        id: "user-agent",
        weight: 15,
        evaluate: evaluateUserAgent
    },
    {
        id: "hardware-concurrency",
        weight: 5,
        evaluate: (value) => {
            if (value === "8") return 5;
            if (value === "6") return 4;
            if (value === "4") return 3;
            if (value === "2") return 2;
            return 1;
        }
    },

    { 
        id: "device-memory",
        weight: 5,
        evaluate: (value) => {
            if (value === "16") return 5;
            if (value === "12") return 4;
            if (value === "8") return 3;
            if (value === "4") return 2;
            return 1;
        }
    },

    { id: "canvas-fingerprint", weight: 20 },
    { id: "webgl-vendor", weight: 10 },
    { id: "webgl-renderer", weight: 15 },
];

function calculateUniquenessScore() {
  let score = 0;

  fingerprintAttributes.forEach(attr => {
    const element = document.getElementById(attr.id);
    if (element) {
      const value = element.innerText.trim();
      if (value && value !== "Not available" && value !== "Error") {
        if (typeof attr.evaluate === "function") {
          score += Math.min(attr.evaluate(value), attr.weight);
        } else {
          score += attr.weight;
        }
      }
    }
  });

  return score;
}


function displayScore() {
  const score = calculateUniquenessScore();
  const scoreElement = document.getElementById("uniqueness-score");
  if (scoreElement) {
    scoreElement.innerText = `Uniqueness Score: ${score} / 100`;
  }
}

// Language rarity calculation
const languageRarityScores = {
  "en": 0.10,  // English
  "es": 0.50,  // Spanish
  "de": 0.52,  // German
  "ja": 0.55,  // Japanese
  "fr": 0.60,  // French
  "pt": 0.65,  // Portuguese
  "ru": 0.66,  // Russian
  "it": 0.72,  // Italian
  "nl": 0.78,  // Dutch
  "pl": 0.82,  // Polish
  "tr": 0.83,  // Turkish
  "fa": 0.88,  // Persian
  "zh": 0.89,  // Chinese
  "vi": 0.89,  // Vietnamese
  "id": 0.89,  // Indonesian
  "cs": 0.90,  // Czech
  "ko": 0.92,  // Korean
  "uk": 0.94,  // Ukrainian
  "hu": 0.94,  // Hungarian
  "sv": 0.95   // Swedish
};

// Score evaluation of language rarity
function evaluateLanguage(value) {
  if (!value) return 0;
  const langCode = value.slice(0, 2).toLowerCase();
  const rarity = languageRarityScores[langCode] || 1.0; // Default to 1.0 if not found
  const maxWeight = 5;
  return rarity * maxWeight;
}

// Timezone rarity calculation
// All timezones and ponderation scores are based on approximative population data and common web usage
const timezoneRarityScores = {
  "Etc/UTC": 0.10,
  "Europe/London": 0.15,
  "Europe/Paris": 0.20,
  "America/New_York": 0.25,
  "America/Los_Angeles": 0.30,
  "Asia/Tokyo": 0.35,
  "Asia/Shanghai": 0.40,
  "Europe/Berlin": 0.45,
  "America/Chicago": 0.50,
  "America/Sao_Paulo": 0.55,
  "Asia/Kolkata": 0.60,
  "Australia/Sydney": 0.65,
  "Europe/Moscow": 0.70,
  "Asia/Dubai": 0.75,
  "America/Denver": 0.80,
  "Europe/Rome": 0.85,
  "America/Toronto": 0.90,
  "Asia/Jakarta": 0.95,
  "Pacific/Auckland": 0.99,
};

function evaluateTimezone(value) {
  if (!value) return 0;
  const rarity = timezoneRarityScores[value] || 1.0; // Default to 1.0 if not found
  const maxWeight = 5;
  return rarity * maxWeight;
}

function evaluateUserAgent(uaString) {
  if (!uaString) return 0;

  const ua = uaString.toLowerCase();

  // Function to extract the version of a browser
  function getMajorVersion(regex) {
    const match = ua.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  // Detecting browser
  let browser = "unknown";
  let version = null;

  if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) {
    browser = "chrome";
    version = getMajorVersion(/chrome\/(\d+)/);
  } else if (ua.includes("firefox")) {
    browser = "firefox";
    version = getMajorVersion(/firefox\/(\d+)/);
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "safari";
    version = getMajorVersion(/version\/(\d+)/);
  } else if (ua.includes("edg")) {
    browser = "edge";
    version = getMajorVersion(/edg\/(\d+)/);
  } else if (ua.includes("opr") || ua.includes("opera")) {
    browser = "opera";
    version = getMajorVersion(/opr\/(\d+)/) || getMajorVersion(/opera\/(\d+)/);
  } else if (ua.includes("trident") || ua.includes("msie")) {
    browser = "ie";
    version = getMajorVersion(/(msie |rv:)(\d+)/);
    if (!version) version = 11; // Default to IE 11 if no version found
  } else if (ua.includes("brave")) {
    browser = "brave";
    version = getMajorVersion(/brave\/(\d+)/);
  } else if (ua.includes("vivaldi")) {
    browser = "vivaldi";
    version = getMajorVersion(/vivaldi\/(\d+)/);
  }

  // Detecting OS
  let os = "unknown";
  if (ua.includes("windows nt")) os = "windows";
  else if (ua.includes("mac os x")) os = "macos";
  else if (ua.includes("android")) os = "android";
  else if (ua.includes("linux")) os = "linux";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) os = "ios";

  // Browser rarity scores based on common usage and market share
  const browserRarity = {
    chrome: 0.1,
    firefox: 0.25,
    safari: 0.3,
    edge: 0.2,
    opera: 0.6,
    ie: 0.9,
    brave: 0.7,
    vivaldi: 0.8,
    unknown: 1,
  };

  // Operating System rarity scores based on common usage and market share
  const osRarity = {
    windows: 0.1,
    macos: 0.2,
    android: 0.3,
    ios: 0.3,
    linux: 0.4,
    unknown: 1,
  };

  function versionScore(v) {
    if (!v) return 0.5; // if version isn't detected or available, assume a mid-range score
    if (v >= 100) return 0.05; // if version is very modern, it's common (100+ versions)
    if (v >= 80) return 0.1; // if version is modern, it's still common, but less so (80-99 versions)
    if (v >= 50) return 0.2; // if version is somewhat modern, it's less common (50-79 versions)
    if (v >= 20) return 0.5; // if version is old, it's rare (20-49 versions)
    return 0.9; // if version is very old, it's very rare (<20 versions)
  }

  // Calcul du score final
  const browserScore = browserRarity[browser] || 1;
  const osScore = osRarity[os] || 1;
  const verScore = versionScore(version);

  const maxWeight = 15;

  // Browser represent 60%, OS 20% and browser version 20%
  const combinedRarity = (browserScore * 0.6) + (osScore * 0.2) + (verScore * 0.2);

  const finalScore = combinedRarity * maxWeight;

  return Math.min(finalScore, maxWeight);
}
