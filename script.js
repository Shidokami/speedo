// ==========================
// GTA V RageMP Custom Speedometer Script
// ==========================

// DOM Elements
const rpmNeedleEl = document.getElementById('rpm-needle');
const rpmValueEl = document.getElementById('rpm-value');
const speedNeedleEl = document.getElementById('speedometer-needle');
const speedValueEl = document.getElementById('speed-value');

let engineOn = false;
let currentRPM = 0; // 0 - 8000
let currentSpeed = 0; // km/h

// Konfigurasi jarum
const RPM_MAX = 8000;
const SPEED_MAX = 280; // km/h
const RPM_START_ANGLE = -135; // deg
const RPM_RANGE = 270; // deg
const SPEED_START_ANGLE = -135;
const SPEED_RANGE = 270;

// ==========================
// Fungsi update jarum RPM
// ==========================
function updateRPM(rpm) {
    const clampedRPM = Math.max(0, Math.min(rpm, RPM_MAX));
    const ratio = clampedRPM / RPM_MAX;
    const deg = RPM_START_ANGLE + ratio * RPM_RANGE;
    rpmNeedleEl.style.transform = `rotate(${deg}deg)`;
    rpmValueEl.textContent = Math.round(clampedRPM);
    currentRPM = clampedRPM;
}

// ==========================
// Fungsi update jarum Speed
// ==========================
function updateSpeed(speed) {
    const clampedSpeed = Math.max(0, Math.min(speed, SPEED_MAX));
    const ratio = clampedSpeed / SPEED_MAX;
    const deg = SPEED_START_ANGLE + ratio * SPEED_RANGE;
    speedNeedleEl.style.transform = `rotate(${deg}deg)`;
    speedValueEl.textContent = Math.round(clampedSpeed);
    currentSpeed = clampedSpeed;
}

// ==========================
// Fungsi engine
// ==========================
function setEngine(state) {
    engineOn = state;
    if (engineOn) {
        // Idle RPM ketika mesin nyala
        updateRPM(1000);
    } else {
        // Mesin mati → RPM 0
        updateRPM(0);
    }
}

// ==========================
// Contoh simulasi update (bisa diganti event dari server RageMP)
// ==========================
function simulate() {
    if (!engineOn) return;

    // Simulasi RPM naik turun secara acak
    let dir = Math.random() > 0.5 ? 1 : -1;
    let newRPM = currentRPM + dir * 200;
    newRPM = Math.max(1000, Math.min(newRPM, RPM_MAX));
    updateRPM(newRPM);

    // Simulasi Speed mengikuti RPM (bisa diganti input asli dari server)
    let newSpeed = (newRPM / RPM_MAX) * SPEED_MAX;
    updateSpeed(newSpeed);
}

// ==========================
// Event loop simulasi
// ==========================
setInterval(simulate, 100);

// ==========================
// Contoh kontrol
// ==========================
window.setEngine = setEngine;
window.setRPM = updateRPM;
window.setSpeed = updateSpeed;

// Auto start engine simulasi
setEngine(true);
