/**
 * CYBERPUNK SPEEDOMETER v2.1 - GTA V MOD VERSION
 * Fixed RPM behavior: engine off = 0, engine on = idle RPM
 */

// Dashboard Loading Animation Controller
class DashboardLoadingController {
    constructor() {
        this.dashboardLoading = document.getElementById('dashboard-loading');
        this.isLoaded = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startLoadingSequence());
        } else {
            this.startLoadingSequence();
        }
    }

    startLoadingSequence() {
        if (this.isLoaded) return;
        this.isLoaded = true;
        setTimeout(() => {
            const loadingText = document.querySelector('.dashboard-loading-text');
            if (loadingText) loadingText.textContent = 'SUCCESS';
        }, 1000);
        setTimeout(() => {
            if (this.dashboardLoading) this.dashboardLoading.style.display = 'none';
        }, 2000);
    }
}

const dashboardLoadingController = new DashboardLoadingController();

// DOM Elements
const speedValueEl = document.getElementById('speed-value');
const speedUnitEl = document.getElementById('speed-unit');
const rpmNeedleEl = document.getElementById('rpm-needle');
const rpmValueEl = document.getElementById('rpm-value');
const fuelNeedleEl = document.getElementById('fuel-needle');
const fuelValueEl = document.getElementById('fuel-value');
const healthBarEl = document.getElementById('health-bar');
const healthValueEl = document.getElementById('health-value');
const gearValueEl = document.getElementById('gear-value');
const leftIndicatorEl = document.getElementById('left-indicator-icon');
const rightIndicatorEl = document.getElementById('right-indicator-icon');
const headlightsIconEl = document.getElementById('headlights-icon');
const seatbeltIconEl = document.getElementById('seatbelt-icon');
const engineIconEl = document.getElementById('engine-icon');
const alarmIndicatorEl = document.getElementById('alarm-indicator');
const alarmStatusTextEl = document.getElementById('alarm-status-text');

// Sound Elements
const engineStartSound = document.getElementById('engine-start-sound');
const engineStopSound = document.getElementById('engine-stop-sound');
const indicatorSound = document.getElementById('indicator-sound');
const seatbeltWarningSound = document.getElementById('seatbelt-warning-sound');
const alarmSound = document.getElementById('alarm-sound');

// Pause sounds initially
engineStartSound.pause();
engineStopSound.pause();
indicatorSound.pause();
seatbeltWarningSound.pause();
alarmSound.pause();

// Sound tracking
let indicatorSoundInterval = null;
let seatbeltWarningInterval = null;
let alarmActive = false;
let alarmStartTime = null;

// Config
let currentSpeedMode = 0;
const SPEED_MODES = ['km/h', 'mph', 'knots'];
const CONVERSION_FACTORS = [3.6, 2.23694, 1.94384];
const RPM_DANGER_THRESHOLD = 0.85;

// Engine & RPM
let engineOn = false;      // engine state
let currentRPM = 0;        // 0–1 scale (0=0RPM, 1=Max 8000)

// ===== ENGINE & RPM =====
function setEngine(state) {
    if (state === engineOn) return;

    engineOn = state;
    engineIconEl.classList.toggle('active', state);

    if (state) {
        engineStartSound.currentTime = 0;
        engineStartSound.play().catch(() => {});
        setRPM(0.1); // idle RPM ~10%
    } else {
        engineStopSound.currentTime = 0;
        engineStopSound.play().catch(() => {});
        setRPM(0);   // engine off → 0 RPM
    }
}

function setRPM(rpm) {
    if (!rpmNeedleEl || !rpmValueEl) return;

    const clamped = Math.max(0, Math.min(rpm, 1));
    const needleRotation = -135 + (clamped * 270);
    rpmNeedleEl.style.transform = `rotate(${needleRotation}deg)`;

    const rpmVal = Math.round(clamped * 8000);
    rpmValueEl.textContent = rpmVal;

    const needleLine = rpmNeedleEl.querySelector('.needle-line');
    const needleCenter = rpmNeedleEl.querySelector('.needle-center');

    if (clamped >= RPM_DANGER_THRESHOLD) {
        needleLine.style.background = 'linear-gradient(to top, #ff0000, #ff3333)';
        needleLine.style.boxShadow = '0 0 12px #ff0000';
        needleCenter.style.boxShadow = '0 0 15px #ff0000';
    } else if (clamped >= 0.6) {
        needleLine.style.background = 'linear-gradient(to top, #ff6600, #ffaa00)';
        needleLine.style.boxShadow = '0 0 10px #ff6600';
        needleCenter.style.boxShadow = '0 0 12px #ff6600';
    } else {
        needleLine.style.background = 'linear-gradient(to top, #ff0000, #ff6600)';
        needleLine.style.boxShadow = '0 0 8px rgba(255,0,0,0.8)';
        needleCenter.style.boxShadow = '0 0 10px rgba(255,0,0,0.8)';
    }

    currentRPM = clamped;
}

// Update RPM only if engine on
function updateRPMFromServer(rpmValue) {
    if (!engineOn) return;
    const normalized = Math.max(0, Math.min(rpmValue / 8000, 1));
    setRPM(normalized);
}

// ===== SPEED, FUEL, GEAR, HEADLIGHTS, INDICATORS =====
function setSpeed(speed) {
    const converted = speed * CONVERSION_FACTORS[currentSpeedMode];
    speedValueEl.textContent = Math.floor(converted);
    updateSpeedometerNeedle(Math.floor(converted));
}

function updateSpeedometerNeedle(speed) {
    const needleEl = document.getElementById('speedometer-needle');
    if (!needleEl) return;

    const maxSpeeds = {0: 280, 1: 280, 2: 280};
    const ratio = Math.min(speed / (maxSpeeds[currentSpeedMode] || 280), 1);
    needleEl.style.transform = `rotate(${-135 + ratio*270}deg)`;
}

function setFuel(fuel) {
    if (!fuelNeedleEl || !fuelValueEl) return;
    const clamped = Math.max(0, Math.min(fuel, 1));
    fuelNeedleEl.style.transform = `rotate(${-135 + clamped*180}deg)`;
    fuelValueEl.textContent = Math.round(clamped*100);
}

function setHealth(health) {
    const pct = Math.max(0, Math.min(100, health*100));
    healthBarEl.style.width = `${pct}%`;
    healthValueEl.textContent = `${Math.round(pct)}%`;
}

function setGear(gear) {
    if (gear === 0) gearValueEl.textContent = 'N';
    else if (typeof gear === 'string') gearValueEl.textContent = gear.toUpperCase();
    else gearValueEl.textContent = gear;
}

function setHeadlights(state) {
    headlightsIconEl.classList.remove('low-beam','high-beam');
    if (state===1) headlightsIconEl.classList.add('low-beam');
    if (state===2) headlightsIconEl.classList.add('high-beam');
}

function setLeftIndicator(state) {
    leftIndicatorEl.classList.toggle('active', state);
    handleIndicatorSound(state || rightIndicatorEl.classList.contains('active'));
}

function setRightIndicator(state) {
    rightIndicatorEl.classList.toggle('active', state);
    handleIndicatorSound(state || leftIndicatorEl.classList.contains('active'));
}

function handleIndicatorSound(active) {
    if (active && !indicatorSoundInterval) {
        indicatorSoundInterval = setInterval(() => {
            if (leftIndicatorEl.classList.contains('active') || rightIndicatorEl.classList.contains('active')) {
                indicatorSound.currentTime = 0;
                indicatorSound.play().catch(()=>{});
            } else {
                clearInterval(indicatorSoundInterval);
                indicatorSoundInterval = null;
            }
        },600);
    } else if (!active && indicatorSoundInterval) {
        clearInterval(indicatorSoundInterval);
        indicatorSoundInterval = null;
        indicatorSound.pause();
        indicatorSound.currentTime = 0;
    }
}

function setSeatbelts(state) {
    seatbeltIconEl.classList.toggle('active', !state);
    if (!state && !seatbeltWarningInterval) {
        seatbeltWarningInterval = setInterval(()=>{seatbeltWarningSound.currentTime=0; seatbeltWarningSound.play().catch(()=>{});},2000);
    } else if (state && seatbeltWarningInterval) {
        clearInterval(seatbeltWarningInterval);
        seatbeltWarningInterval=null;
        seatbeltWarningSound.pause();
        seatbeltWarningSound.currentTime=0;
    }
}

// ===== SPEED MODE =====
function setSpeedMode(mode){
    if(mode>=0 && mode<SPEED_MODES.length){
        currentSpeedMode=mode;
        speedUnitEl.textContent=SPEED_MODES[currentSpeedMode];
        updateSpeedNumbers();
    }
}

function updateSpeedNumbers(){
    const speedNumbers=document.querySelectorAll('.speed-number');
    const sets={0:[0,20,40,60,80,100,120,140,160,180,200],1:[0,10,20,30,40,50,60,70,80,90,120],2:[0,10,20,30,40,50,60,70,80,90,100]};
    const numbers=sets[currentSpeedMode]||sets[0];
    speedNumbers.forEach((el,i)=>{if(i<numbers.length) el.textContent=numbers[i];});
}

// ===== ALARM SYSTEM =====
function initializeAlarmSystem(){setTimeout(startAlarm,3000);}
function startAlarm(){if(!alarmActive){alarmActive=true;alarmStartTime=Date.now();alarmSound.currentTime=0;alarmSound.play().catch(()=>{});updateAlarmIndicator();}}
function stopAlarm(){if(alarmActive){alarmActive=false;alarmSound.pause();alarmSound.currentTime=0;updateAlarmIndicator();alarmStartTime=null;}}
function toggleAlarm(){alarmActive?stopAlarm():startAlarm();}
function updateAlarmIndicator(){if(!alarmIndicatorEl||!alarmStatusTextEl)return;alarmIndicatorEl.classList.toggle('active',alarmActive);alarmIndicatorEl.classList.toggle('inactive',!alarmActive);alarmStatusTextEl.textContent=alarmActive?'ALARM ON':'ALARM OFF';}

document.addEventListener('keydown',(e)=>{if(e.shiftKey&&(e.key==='A'||e.key==='a')){e.preventDefault();stopAlarm();}});
document.addEventListener('keyup',(e)=>{});

window.addEventListener('load',()=>{
    dashboardLoadingController.startLoading();
    setTimeout(()=>{
        console.log('Testing gauges...');
        setRPM(0);   // start with 0
        setFuel(0.75);
    },2000);
});
