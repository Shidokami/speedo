<?php
// Matikan cache biar selalu update
header("Content-Type: text/html; charset=UTF-8");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// Ambil parameter dari URL
$bg = isset($_GET['bg']) ? htmlspecialchars($_GET['bg']) : 'https://i.imgur.com/ldz5ZpO.png';
$needleImg = isset($_GET['needle']) ? htmlspecialchars($_GET['needle']) : 'https://i.imgur.com/Z42441f.png';
$angleStart = isset($_GET['angleStart']) ? floatval($_GET['angleStart']) : -190; // posisi RPM 0
$angleEnd = isset($_GET['angleEnd']) ? floatval($_GET['angleEnd']) : 70;       // posisi RPM 9000
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>REVX Gauge (Dynamic Full)</title>
  <style>
    body {
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      overflow: hidden;
      margin: 0;
    }

    .gauge-container {
      position: relative;
      width: 512px;
      height: 256px;
    }

    .gauge-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      background: url('<?php echo $bg; ?>') center/contain no-repeat;
      z-index: 1;
    }

    .needle {
      position: absolute;
      width: 100px;
      height: 100px;
      top: 78px;
      left: 213px;
      transform-origin: 50.6% 42%;
      transform: rotate(0deg);
      background: url('<?php echo $needleImg; ?>') center/contain no-repeat;
      z-index: 2;
      transition: transform 0.15s linear;
      pointer-events: none;
    }

    .info {
      display: none;
    }
  </style>
</head>
<body>
  <div class="gauge-container">
    <div class="gauge-bg"></div>
    <div id="needle" class="needle"></div>
  </div>

  <div class="info">
    <div id="engine"></div>
    <div id="speed"></div>
    <div id="rpm"></div>
    <div id="fuel"></div>
    <div id="health"></div>
    <div id="gear"></div>
    <div id="headlights"></div>
    <div id="indicators"></div>
    <div id="seatbelts"></div>
    <div id="speed-mode"></div>
  </div>

  <script src="script.js"></script>

  <script>
    const needle = document.getElementById('needle');
    let engineOn = false;
    let displayedRPM = 0;

    // Rotasi awal dan akhir diambil dari PHP
    const angleStart = <?php echo $angleStart; ?>;
    const angleEnd = <?php echo $angleEnd; ?>;

    // === Fungsi update posisi jarum ===
    function updateNeedle(rpm) {
      const clamped = Math.max(0, Math.min(rpm, 9000));
      const deg = (clamped / 9000) * (angleEnd - angleStart) + angleStart;
      needle.style.transform = `rotate(${deg}deg)`;
    }

    // === Nyalakan / matikan mesin ===
    window.setEngine = function(state) {
      engineOn = state;
      if (state) updateNeedle(1000); // idle
      else updateNeedle(0); // mati
    };

    // === RPM dinamis (halus) ===
    window.setRPM = function(rpm) {
      if (!engineOn) rpm = 0;
      const clamped = Math.max(0, Math.min(rpm, 9000));
      displayedRPM += (clamped - displayedRPM) * 0.1;
      updateNeedle(displayedRPM);
    };

    // === Dummy biar script bawaan RageMP ga error ===
    window.setSpeed = window.setSpeed || function() {};
    window.setFuel = window.setFuel || function() {};
    window.setHealth = window.setHealth || function() {};
    window.setGear = window.setGear || function() {};
    window.setHeadlights = window.setHeadlights || function() {};
    window.setLeftIndicator = window.setLeftIndicator || function() {};
    window.setSeatbelts = window.setSeatbelts || function() {};
    window.setSpeedMode = window.setSpeedMode || function() {};
  </script>
</body>
</html>
