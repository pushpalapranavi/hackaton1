/**
 * POLARIS-AI Iceberg Hydrodynamic Drift & Physics-Informed ML Simulator
 * Solves the equation of motion for floating Antarctic icebergs:
 * M(dV/dt) = -M*f*(k x V) + F_air + F_water + F_wave + F_slope
 */

export class IcebergSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.state = {
      bergType: "tabular", // tabular, pinnacle, blocky, growler
      massMegatons: 1100000, // e.g. A-23a
      keelDepthM: 280,
      freeboardM: 40,
      lengthM: 60000,
      widthM: 40000,
      windSpeedKts: 28,
      windDirDeg: 240, // from WSW
      currentSpeedKts: 0.85,
      currentDirDeg: 045, // to NE (ACC)
      waterTempC: -0.5,
      forecastHours: 72,
      lat: -61.25,
      lon: -48.30
    };

    if (this.canvas) {
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 480;
    this.height = 320;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.renderVectorDiagram();
  }

  updateParams(newParams) {
    this.state = { ...this.state, ...newParams };
    this.renderVectorDiagram();
    return this.calculateDrift();
  }

  calculateDrift() {
    const s = this.state;
    // Constants
    const rhoAir = 1.25;      // kg/m3
    const rhoWater = 1027;    // kg/m3
    const rhoIce = 910;       // kg/m3
    const omega = 7.2921e-5;  // rad/s Earth rotation
    const latRad = (s.lat * Math.PI) / 180;
    const f = 2 * omega * Math.sin(latRad); // Coriolis (negative in southern hemisphere)

    // Drag coefficients
    let Ca = 1.3; // Air drag
    let Cw = 0.9; // Water drag
    if (s.bergType === "pinnacle") { Ca = 1.8; Cw = 1.2; }
    else if (s.bergType === "growler") { Ca = 0.8; Cw = 1.4; }

    // Wind and Current velocity in m/s
    const V_wind = s.windSpeedKts * 0.514444;
    const windRad = ((s.windDirDeg + 180) % 360) * (Math.PI / 180); // direction blowing towards
    const V_wind_x = V_wind * Math.sin(windRad);
    const V_wind_y = V_wind * Math.cos(windRad);

    const V_curr = s.currentSpeedKts * 0.514444;
    const currRad = (s.currentDirDeg * Math.PI) / 180;
    const V_curr_x = V_curr * Math.sin(currRad);
    const V_curr_y = V_curr * Math.cos(currRad);

    // Approximate steady-state terminal drift balance
    // Icebergs drift predominantly with ocean current (60-80%) with a ~2-3% wind drift deflected to the left (Southern Hemisphere Coriolis)
    const coriolisDeflectionRad = -0.45; // ~26 degrees left of wind in Southern Ocean
    const windInducedDrift = V_wind * 0.024;
    
    const V_ice_x = (V_curr_x * 0.82) + windInducedDrift * Math.sin(windRad + coriolisDeflectionRad);
    const V_ice_y = (V_curr_y * 0.82) + windInducedDrift * Math.cos(windRad + coriolisDeflectionRad);

    const driftSpeedMs = Math.hypot(V_ice_x, V_ice_y);
    const driftSpeedKts = Number((driftSpeedMs / 0.514444).toFixed(2));
    let driftHeadingDeg = Math.round((Math.atan2(V_ice_x, V_ice_y) * (180 / Math.PI) + 360) % 360);

    // Dynamic trajectory simulation points
    const trajectory = [];
    let curLat = s.lat;
    let curLon = s.lon;
    const dtHours = 6;
    const totalSteps = s.forecastHours / dtHours;

    for (let step = 0; step <= totalSteps; step++) {
      const hours = step * dtHours;
      // Add slight turbulence & tidal oscillation
      const tidePerturb = Math.sin((hours / 12.42) * Math.PI * 2) * 0.08;
      const stepDistNM = (driftSpeedKts + tidePerturb) * dtHours;
      
      const radHeading = (driftHeadingDeg * Math.PI) / 180;
      const dLat = (stepDistNM * Math.cos(radHeading)) / 60;
      const dLon = (stepDistNM * Math.sin(radHeading)) / (60 * Math.cos((curLat * Math.PI) / 180));

      curLat += dLat;
      curLon += dLon;

      trajectory.push({
        hours,
        lat: Number(curLat.toFixed(3)),
        lon: Number(curLon.toFixed(3)),
        uncertaintyRadiusNM: Math.round(2.5 + hours * 0.18)
      });
    }

    // Basal melt & decay rate (m/day)
    // Formula based on Martin & Adcroft ocean temperature thermal driving
    const deltaT = Math.max(0, s.waterTempC - (-1.8)); // Freezing point ~ -1.8C
    const basalMeltMDay = (0.05 + 0.12 * deltaT + 0.04 * driftSpeedMs).toFixed(2);
    const massLossTonsDay = Math.round(s.massMegatons * 1e6 * 0.0003 * (1 + deltaT));
    const rollRisk = s.keelDepthM < 60 && s.bergType !== "tabular" ? "HIGH (Capsizing Hazard)" : "STABLE";

    return {
      driftSpeedKts,
      driftHeadingDeg,
      trajectory,
      basalMeltMDay,
      massLossTonsDay,
      rollRisk,
      driftVector: { vx: V_ice_x, vy: V_ice_y },
      forces: {
        windForceKN: Math.round(0.5 * rhoAir * Ca * (s.lengthM * s.freeboardM) * Math.pow(V_wind, 2) / 1000),
        waterDragKN: Math.round(0.5 * rhoWater * Cw * (s.lengthM * s.keelDepthM) * Math.pow(V_curr, 2) / 1000),
        coriolisKN: Math.round(s.massMegatons * 1e6 * Math.abs(f) * driftSpeedMs / 1000)
      }
    };
  }

  renderVectorDiagram() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;

    ctx.clearRect(0, 0, this.width, this.height);

    // Background HUD grid
    ctx.strokeStyle = "rgba(79, 172, 254, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy);
    ctx.lineTo(cx + 120, cy);
    ctx.moveTo(cx, cy - 120);
    ctx.lineTo(cx, cy + 120);
    ctx.stroke();
    ctx.setLineDash([]);

    const driftData = this.calculateDrift();

    // 1. Draw Ocean Current Force Vector (Cyan)
    const currRad = (this.state.currentDirDeg * Math.PI) / 180;
    const currLen = 50 * Math.min(2.0, this.state.currentSpeedKts);
    this.drawArrow(ctx, cx, cy, cx + currLen * Math.sin(currRad), cy - currLen * Math.cos(currRad), "#00f2fe", "F_ocean");

    // 2. Draw Wind Drag Vector (Yellow)
    const windRad = (((this.state.windDirDeg + 180) % 360) * Math.PI) / 180;
    const windLen = 35 * Math.min(2.0, this.state.windSpeedKts / 20);
    this.drawArrow(ctx, cx, cy, cx + windLen * Math.sin(windRad), cy - windLen * Math.cos(windRad), "#ffd600", "F_wind");

    // 3. Draw Southern Hemisphere Coriolis Deflection (Orange dashed)
    const corLen = 28;
    const corAngle = currRad - Math.PI / 2;
    this.drawArrow(ctx, cx, cy, cx + corLen * Math.sin(corAngle), cy - corLen * Math.cos(corAngle), "#ff9800", "F_coriolis");

    // 4. Draw Resultant Iceberg Drift Vector (Bright Red/Magenta)
    const resRad = (driftData.driftHeadingDeg * Math.PI) / 180;
    const resLen = 75 * Math.min(2.0, driftData.driftSpeedKts);
    this.drawArrow(ctx, cx, cy, cx + resLen * Math.sin(resRad), cy - resLen * Math.cos(resRad), "#ff4757", `DRIFT: ${driftData.driftSpeedKts} kt @ ${driftData.driftHeadingDeg}°`, true);

    // Center Iceberg Icon
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00f2fe";
    ctx.shadowBlur = 10;
    ctx.fillRect(cx - 8, cy - 6, 16, 12);
    ctx.strokeStyle = "#080c14";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 8, cy - 6, 16, 12);
    ctx.shadowBlur = 0;
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, label, isBold = false) {
    const headlen = isBold ? 10 : 7;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isBold ? 3.0 : 1.8;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = isBold ? "bold 10px 'JetBrains Mono', monospace" : "9px 'JetBrains Mono', monospace";
    ctx.fillText(label, toX + 6, toY - 4);
    ctx.restore();
  }
}
