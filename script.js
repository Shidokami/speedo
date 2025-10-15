let elements = {};
let speedMode = 1;
let indicators = 0;

// Ambil elemen jarum dari HTML
const needle = document.getElementById('needle');
let engineOn = false;
let displayedRPM = 0; // buat smoothing animasi

// Ambil angle start & end dari atribut data (dari PHP)
const angleStart = typeof ANGLE_START !== 'undefined' ? ANGLE_START : -190;
const angleEnd = typeof ANGLE_END !== 'undefined' ? ANGLE_END : 70;

/**
 * Rotasi jarum sesuai RPM (0–9000)
 * @param {number} rpm - RPM dari game (0–9000)
 */
function updateNeedle(rpm) {
    if (!needle) return;
    const clamped = Math.max(0, Math.min(rpm, 9000));
    const deg = (clamped / 9000) * (angleEnd - angleStart) + angleStart;
    needle.style.transform = `rotate(${deg}deg)`;
}

/**
 * Engine On/Off — ubah jarum ke posisi idle atau 0
 */
function setEngine(state) {
    engineOn = state;
    if (state) {
        updateNeedle(1000); // idle di 1K RPM
    } else {
        updateNeedle(0); // mati mesin
    }
}

/**
 * RPM dari game (0–1 range → ubah ke 0–9000)
 */
function setRPM(rpm) {
    if (!engineOn) rpm = 0;
    // RageMP kadang kirim RPM dalam range 0.0–1.0
    if (rpm <= 1) rpm = rpm * 9000;
    
    // smoothing biar gerak halus
    displayedRPM += (rpm - displayedRPM) * 0.2;
    updateNeedle(displayedRPM);
}

/**
 * Speed — nanti bisa dipakai buat bikin gauge speed analog lain
 */
function setSpeed(speed) {
    // ga dipakai buat tachometer, tapi fungsi wajib ada
}

/**
 * Fuel, health, dll tetep dummy supaya RageMP ga error
 */
function setFuel(fuel) {}
function setHealth(health) {}
function setGear(gear) {}
function setHeadlights(state) {}
function setLeftIndicator(state) {}
function setRightIndicator(state) {}
function setSeatbelts(state) {}
function setSpeedMode(mode) { speedMode = mode; }

/**
 * Inisialisasi dummy elemen (biar sesuai template lama)
 */
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        engine: document.getElementById('engine'),
        speed: document.getElementById('speed'),
        rpm: document.getElementById('rpm'),
        fuel: document.getElementById('fuel'),
        health: document.getElementById('health'),
        gear: document.getElementById('gear'),
        headlights: document.getElementById('headlights'),
        indicators: document.getElementById('indicators'),
        seatbelts: document.getElementById('seatbelts'),
        speedMode: document.getElementById('speed-mode'),
    };
});
