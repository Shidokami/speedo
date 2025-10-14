/**
 * CYBERPUNK SPEEDOMETER v2.0 - GTA V MOD VERSION
 * Same functionality as original spedoku but with cyberpunk styling
 */

// Dashboard Loading Animation Controller
class DashboardLoadingController {
    constructor() {
        this.dashboardLoading = document.getElementById('dashboard-loading');
        this.isLoaded = false;
        this.init();
    }

    init() {
        // Start loading sequence when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startLoadingSequence();
            });
        } else {
            this.startLoadingSequence();
        }
    }

    startLoadingSequence() {
        if (this.isLoaded) return;
        this.isLoaded = true;

        // Update loading text after 1 second
        setTimeout(() => {
            const loadingText = document.querySelector('.dashboard-loading-text');
            if (loadingText) {
                loadingText.textContent = 'SUCCESS';
            }
        }, 1000);

        // Hide dashboard loading indicator after animations complete
        setTimeout(() => {
            if (this.dashboardLoading) {
                this.dashboardLoading.style.display = 'none';
            }
        }, 2000);
    }
}

// Initialize dashboard loading controller
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

// Prevent any automatic playback (except alarm)
engineStartSound.pause();
engineStopSound.pause();
indicatorSound.pause();
seatbeltWarningSound.pause();
alarmSound.pause(); // Initially paused, will be controlled by alarm system

// Sound state tracking
let indicatorSoundInterval = null;
let seatbeltWarningInterval = null;
let alarmActive = false;
let alarmStartTime = null;

// Configuration - same as original spedoku
let currentSpeedMode = 0;
const SPEED_MODES = ['km/h', 'mph', 'knots'];
const CONVERSION_FACTORS = [3.6, 2.23694, 1.94384];
const RPM_DANGER_THRESHOLD = 0.85;

// Track previous engine state
let previousEngineState = false;

/**
 * Updates the display of the engine state and plays appropriate sound.
 * @param {boolean} state - If true, the engine is on; otherwise, it is off.
 */
function setEngine(state) {
    // Only play sounds if the state actually changed
    if (state !== previousEngineState) {
        engineIconEl.classList.toggle('active', state);
        if (state) {
            engineStartSound.currentTime = 0;
            engineStartSound.play();
        } else {
            engineStopSound.currentTime = 0;
            engineStopSound.play();
        }
        previousEngineState = state;
    }
}

/**
 * Updates the speed display and needle position based on the current speed mode.
 * @param {number} speed - The speed value in meters per second (m/s).
 */
function setSpeed(speed) {
    const convertedSpeed = speed * CONVERSION_FACTORS[currentSpeedMode];
    const displaySpeed = Math.floor(convertedSpeed);
    speedValueEl.textContent = displaySpeed;

    // Update needle position
    updateSpeedometerNeedle(displaySpeed);
}

/**
 * Updates the speedometer needle position based on speed.
 * @param {number} speed - The speed value in the current unit.
 */
function updateSpeedometerNeedle(speed) {
    const needleEl = document.getElementById('speedometer-needle');
    if (!needleEl) return;

    // Define max speed for different units
    const maxSpeeds = {
        0: 280, // km/h
        1: 280, // mph
        2: 280  // knots
    };

    const maxSpeed = maxSpeeds[currentSpeedMode] || 280;

    // Calculate needle rotation (-135deg to 135deg = 270deg range)
    // -135deg = 0 speed, 135deg = max speed
    const speedRatio = Math.min(speed / maxSpeed, 1); // Clamp to max
    const needleRotation = -135 + (speedRatio * 270); // Start at -135deg + 270deg range

    needleEl.style.transform = `rotate(${needleRotation}deg)`;
}

/**
 * Updates the RPM gauge with needle rotation and digital display.
 * @param {number} rpm - The RPM value (0 to 1).
 */
function setRPM(rpm) {
    if (!rpmNeedleEl || !rpmValueEl) {
        console.error('RPM gauge elements not found!');
        return;
    }

    // Calculate needle rotation (270 degrees total range, from -135 to 135)
    const needleRotation = -135 + (rpm * 270); // -135deg to 135deg

    // Update needle position
    rpmNeedleEl.style.transform = `rotate(${needleRotation}deg)`;

    // Update digital display (convert to RPM value, assuming max 8000 RPM)
    const rpmValue = Math.round(rpm * 8000);
    rpmValueEl.textContent = rpmValue;

    // Change needle color based on RPM level
    const needleLine = rpmNeedleEl.querySelector('.needle-line');
    const needleCenter = rpmNeedleEl.querySelector('.needle-center');

    if (rpm >= RPM_DANGER_THRESHOLD) {
        needleLine.style.background = 'linear-gradient(to top, #ff0000, #ff3333)';
        needleLine.style.boxShadow = '0 0 12px #ff0000';
        needleCenter.style.boxShadow = '0 0 15px #ff0000';
    } else if (rpm >= 0.6) {
        needleLine.style.background = 'linear-gradient(to top, #ff6600, #ffaa00)';
        needleLine.style.boxShadow = '0 0 10px #ff6600';
        needleCenter.style.boxShadow = '0 0 12px #ff6600';
    } else {
        needleLine.style.background = 'linear-gradient(to top, #ff0000, #ff6600)';
        needleLine.style.boxShadow = '0 0 8px rgba(255, 0, 0, 0.8)';
        needleCenter.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
    }

    console.log(`New RPM: ${rpm}, Needle rotation: ${needleRotation}deg, RPM value: ${rpmValue}`);
}

/**
 * Updates the fuel gauge with needle rotation and digital display.
 * @param {number} fuel - The fuel level (0 to 1).
 */
function setFuel(fuel) {
    if (!fuelNeedleEl || !fuelValueEl) {
        console.error('Fuel gauge elements not found!');
        return;
    }

    // Calculate needle rotation (180 degrees total range, from -135 to 45)
    // Full fuel (1.0) = 45deg, Empty fuel (0.0) = -135deg
    const needleRotation = -135 + (fuel * 180); // -135deg to 45deg

    // Update needle position
    fuelNeedleEl.style.transform = `rotate(${needleRotation}deg)`;

    // Update digital display
    const percentage = Math.max(0, Math.min(100, fuel * 100));
    fuelValueEl.textContent = Math.round(percentage);

    // Change needle color based on fuel level
    const needleLine = fuelNeedleEl.querySelector('.needle-line');
    const needleCenter = fuelNeedleEl.querySelector('.needle-center');

    if (fuel <= 0.15) { // Low fuel warning
        needleLine.style.background = 'linear-gradient(to top, #ff0000, #ff6600)';
        needleLine.style.boxShadow = '0 0 12px #ff0000';
        needleCenter.style.boxShadow = '0 0 15px #ff0000';
    } else if (fuel <= 0.3) { // Medium fuel
        needleLine.style.background = 'linear-gradient(to top, #ffaa00, var(--cyber-yellow))';
        needleLine.style.boxShadow = '0 0 10px #ffaa00';
        needleCenter.style.boxShadow = '0 0 12px #ffaa00';
    } else { // Good fuel level
        needleLine.style.background = 'linear-gradient(to top, #ffaa00, var(--cyber-yellow))';
        needleLine.style.boxShadow = '0 0 8px var(--cyber-yellow-glow)';
        needleCenter.style.boxShadow = '0 0 10px var(--cyber-yellow-glow)';
    }

    console.log(`New Fuel: ${fuel}, Needle rotation: ${needleRotation}deg, Percentage: ${percentage}%`);
}

/**
 * Updates the vehicle health display as a percentage.
 * @param {number} health - The vehicle health level (0 to 1).
 */
function setHealth(health) {
    const percentage = Math.max(0, Math.min(100, health * 100));
    healthBarEl.style.width = `${percentage}%`;
    healthValueEl.textContent = `${Math.round(percentage)}%`;
}

/**
 * Updates the current gear display.
 * @param {string|number} gear - The current gear to display (0 represents neutral/reverse).
 */
function setGear(gear) {
    if (gear === 0) {
        gearValueEl.textContent = 'N';
    } else if (typeof gear === 'string') {
        gearValueEl.textContent = gear.toUpperCase();
    } else {
        gearValueEl.textContent = gear;
    }
}

/**
 * Updates the headlights status display.
 * @param {number} state - The headlight state (0: Off, 1: On, 2: High Beam).
 */
function setHeadlights(state) {
    headlightsIconEl.classList.remove('low-beam', 'high-beam');
    switch (state) {
        case 1:
            headlightsIconEl.classList.add('low-beam');
            break;
        case 2:
            headlightsIconEl.classList.add('high-beam');
            break;
    }
}

/**
 * Sets the state of the left turn indicator and updates the display.
 * @param {boolean} state - If true, turns the left indicator on; otherwise, turns it off.
 */
function setLeftIndicator(state) {
    leftIndicatorEl.classList.toggle('active', state);
    handleIndicatorSound(state || rightIndicatorEl.classList.contains('active'));
}

/**
 * Sets the state of the right turn indicator and updates the display.
 * @param {boolean} state - If true, turns the right indicator on; otherwise, turns it off.
 */
function setRightIndicator(state) {
    rightIndicatorEl.classList.toggle('active', state);
    handleIndicatorSound(state || leftIndicatorEl.classList.contains('active'));
}

/**
 * Manages the indicator sound based on indicator state
 * @param {boolean} active - If true, starts the indicator sound; otherwise, stops it.
 */
function handleIndicatorSound(active) {
    if (active && !indicatorSoundInterval) {
        // Start the repeating sound if indicators are active
        indicatorSoundInterval = setInterval(() => {
            if (leftIndicatorEl.classList.contains('active') || rightIndicatorEl.classList.contains('active')) {
                indicatorSound.currentTime = 0;
                indicatorSound.play().catch(() => {
                    // Handle any playback errors silently
                });
            } else {
                // Stop if neither indicator is active
                clearInterval(indicatorSoundInterval);
                indicatorSoundInterval = null;
            }
        }, 600); // Sync with blink animation
    } else if (!active) {
        // Stop the repeating sound
        if (indicatorSoundInterval) {
            clearInterval(indicatorSoundInterval);
            indicatorSoundInterval = null;
        }
        indicatorSound.pause();
        indicatorSound.currentTime = 0;
    }
}

/**
 * Updates the seatbelt status display and manages warning sound.
 * @param {boolean} state - If true, indicates seatbelts are fastened; otherwise, indicates they are not.
 */
function setSeatbelts(state) {
    seatbeltIconEl.classList.toggle('active', !state);
    
    // Handle warning sound
    if (!state && !seatbeltWarningInterval) {
        // Start repeating warning sound if seatbelt is not fastened
        seatbeltWarningInterval = setInterval(() => {
            seatbeltWarningSound.currentTime = 0;
            seatbeltWarningSound.play().catch(() => {
                // Handle any playback errors silently
            });
        }, 2000); // Play every 2 seconds
    } else if (state) {
        // Stop warning sound if seatbelt is fastened
        if (seatbeltWarningInterval) {
            clearInterval(seatbeltWarningInterval);
            seatbeltWarningInterval = null;
        }
        seatbeltWarningSound.pause();
        seatbeltWarningSound.currentTime = 0;
    }
}

/**
 * Sets the speed display mode and updates the speed unit display.
 * @param {number} mode - The speed mode to set (0: KMH, 1: MPH, 2: Knots).
 */
function setSpeedMode(mode) {
    if (mode >= 0 && mode < SPEED_MODES.length) {
        currentSpeedMode = mode;
        speedUnitEl.textContent = SPEED_MODES[currentSpeedMode];
        updateSpeedNumbers();
    }
}

/**
 * Updates the speed numbers around the speedometer based on current mode.
 */
function updateSpeedNumbers() {
    const speedNumbers = document.querySelectorAll('.speed-number');
    const numberSets = {
        0: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200], // km/h
        1: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 120],      // mph
        2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]       // knots
    };

    const numbers = numberSets[currentSpeedMode] || numberSets[0];

    speedNumbers.forEach((numberEl, index) => {
        if (index < numbers.length) {
            numberEl.textContent = numbers[index];
        }
    });
}

// Dashboard ready - initialize analog speedometer
console.log('Cyberpunk Speedometer v2.0 - Dashboard Ready');

// Initialize speed numbers on load
document.addEventListener('DOMContentLoaded', () => {
    updateSpeedNumbers();
    initializeAlarmSystem();
    // Initialize alarm indicator as inactive
    updateAlarmIndicator();
});

/**
 * Alarm System Functions
 */

/**
 * Initializes the alarm system with autoplay functionality
 */
function initializeAlarmSystem() {
    // Start alarm automatically after page loads
    setTimeout(() => {
        startAlarm();
    }, 3000); // Start alarm 3 seconds after page load
}

/**
 * Starts the alarm sound
 */
function startAlarm() {
    if (!alarmActive) {
        alarmActive = true;
        alarmStartTime = Date.now();

        // Reset audio to beginning and play
        alarmSound.currentTime = 0;
        alarmSound.play().catch(error => {
            console.log('Alarm autoplay blocked by browser:', error);
            // If autoplay is blocked, we'll still set the alarm as active
            // so it can be stopped with Shift+A
        });

        // Update indicator
        updateAlarmIndicator();

        console.log('Alarm started - Press Shift+A to stop');
    }
}

/**
 * Stops the alarm sound
 */
function stopAlarm() {
    if (alarmActive) {
        alarmActive = false;
        alarmSound.pause();
        alarmSound.currentTime = 0;

        // Update indicator
        updateAlarmIndicator();

        const duration = alarmStartTime ? (Date.now() - alarmStartTime) / 1000 : 0;
        console.log(`Alarm stopped after ${duration.toFixed(1)} seconds`);
        alarmStartTime = null;
    }
}

/**
 * Toggles the alarm on/off
 */
function toggleAlarm() {
    if (alarmActive) {
        stopAlarm();
    } else {
        startAlarm();
    }
}

/**
 * Updates the alarm indicator visual state
 */
function updateAlarmIndicator() {
    if (!alarmIndicatorEl || !alarmStatusTextEl) return;

    if (alarmActive) {
        alarmIndicatorEl.classList.remove('inactive');
        alarmIndicatorEl.classList.add('active');
        alarmStatusTextEl.textContent = 'ALARM ON';
    } else {
        alarmIndicatorEl.classList.remove('active');
        alarmIndicatorEl.classList.add('inactive');
        alarmStatusTextEl.textContent = 'ALARM OFF';
    }
}

/**
 * Keyboard Event Handler for Alarm Control
 */
document.addEventListener('keydown', (event) => {
    // Check for Shift + A combination
    if (event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault(); // Prevent default browser behavior
        stopAlarm();
    }
});

// Also handle keyup to ensure we catch the combination properly
document.addEventListener('keyup', (event) => {
    // Additional handling if needed
    if (event.key === 'Shift' || event.key === 'A' || event.key === 'a') {
        // Could add visual feedback here if desired
    }
});

// Initialize dashboard on page load
window.addEventListener('load', () => {
    dashboardLoadingController.startLoading();

    // Test the new gauges after loading
    setTimeout(() => {
        console.log('Testing new gauges...');
        setRPM(0.5); // 50% RPM
        setFuel(0.75); // 75% fuel
    }, 2000);
});
