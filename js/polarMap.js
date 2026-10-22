/**
 * POLARIS-AI Antarctic Polar Stereographic Canvas Engine
 * High-performance rendering of Antarctic geography, dynamic sea-ice concentration heatmaps,
 * ocean current streamlines, katabatic wind vectors, iceberg drift tracks, and vessel navigation paths.
 */

export class PolarMap {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error(`Canvas #${canvasId} not found`);
    this.ctx = this.canvas.getContext("2d");
    
    // View state
    this.scale = options.initialScale || 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.hoverCoord = null;
    this.forecastHours = 0; // 0 to 168 (7 days)
    
    // Layer visibility flags
    this.layers = {
      seaIce: true,
      icebergs: true,
      currents: true,
      winds: false,
      stations: true,
      vessels: true,
      routes: true,
      graticule: true
    };

    // Animated particles
    this.particles = [];
    this.initParticles();
    
    // Selected entities
    this.selectedIceberg = null;
    this.selectedStation = null;
    this.selectedVessel = null;
    this.activeRoute = null;
    this.vesselSimProgress = 0; // 0 to 1 for animated simulation

    // Callbacks
    this.onSelectEntity = options.onSelectEntity || (() => {});
    this.onCoordHover = options.onCoordHover || (() => {});

    this.setupEvents();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    
    // Animation loop
    this.lastTimestamp = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 650;
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  setupEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.panX += dx;
        this.panY += dy;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }

      // Check mouse over canvas for coords
      const rect = this.canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const mouseCanvasX = e.clientX - rect.left;
        const mouseCanvasY = e.clientY - rect.top;
        const geo = this.screenToGeo(mouseCanvasX, mouseCanvasY);
        this.hoverCoord = geo;
        this.onCoordHover(geo);
        this.checkHoverEntities(mouseCanvasX, mouseCanvasY);
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
      const newScale = Math.max(0.6, Math.min(6.0, this.scale * zoomFactor));
      
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
      this.scale = newScale;
    }, { passive: false });

    // Click selection
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.handleCanvasClick(mx, my);
    });
  }

  // Polar Stereographic Projection
  // South Pole is center (lat = -90). Outer boundary is lat = -50.
  geoToScreen(lat, lon) {
    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;
    const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;
    
    // Distance from pole: lat -90 is 0, lat -50 is 1
    const clampedLat = Math.min(-50, Math.max(-90, lat));
    const distRatio = (90 - Math.abs(clampedLat)) / 40; // 0 at 90S, 1 at 50S
    const r = distRatio * baseRadius;
    
    // Longitude angle in radians (Standard Antarctic orientation: 0° Greenwich pointing UP)
    const angleRad = (lon - 90) * (Math.PI / 180);
    const x = cx + r * Math.cos(angleRad);
    const y = cy + r * Math.sin(angleRad);

    return { x, y, r, angleRad };
  }

  screenToGeo(screenX, screenY) {
    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;
    const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;

    const dx = screenX - cx;
    const dy = screenY - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    
    const distRatio = r / baseRadius;
    const lat = -(90 - distRatio * 40);

    let angleRad = Math.atan2(dy, dx);
    let lon = (angleRad * (180 / Math.PI)) + 90;
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;

    return {
      lat: Math.max(-90, Math.min(-50, lat)),
      lon,
      sic: this.calculateSIC(lat, lon, this.forecastHours)
    };
  }

  calculateSIC(lat, lon, forecastHours = 0) {
    // Sea Ice Concentration (0-100%) model based on latitude, sea sectors, and temporal shift
    if (lat < -85) return 100; // Ice shelf / inland
    if (lat > -58) return 0;   // Open Sub-Antarctic ocean
    
    // Base latitude gradient
    const t = (-lat - 58) / (85 - 58); // 0 at 58S, 1 at 85S
    let base = Math.pow(t, 1.4) * 98;

    // Longitudinal sector variation:
    // Weddell Sea (-60 to -20 lon) has heavier perennial pack ice
    // Ross Sea (160 to -150 lon) has high ice with Ross Polynya near coast
    // Bellingshausen/Amundsen Sea (-130 to -70 lon) has dynamic leads
    const lonRad = (lon * Math.PI) / 180;
    const sectorMod = 
      Math.sin(lonRad + 0.5) * 12 + 
      Math.cos(lonRad * 2) * 8 +
      Math.sin(lonRad * 3 - 0.8) * 6;

    // Temporal dynamic forecast variation (simulating wave break-up or freeze-up)
    const timeWave = Math.sin((lon * 0.05) + (forecastHours * 0.04)) * 7;

    let sic = Math.round(base + sectorMod + timeWave);
    return Math.max(0, Math.min(100, sic));
  }

  initParticles() {
    this.particles = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        lat: -55 - Math.random() * 25,
        lon: -180 + Math.random() * 360,
        speed: 0.15 + Math.random() * 0.35,
        age: Math.random() * 120,
        maxAge: 80 + Math.random() * 100,
        type: Math.random() > 0.4 ? "current" : "wind"
      });
    }
  }

  updateParticles() {
    this.particles.forEach((p) => {
      p.age++;
      if (p.age > p.maxAge) {
        p.age = 0;
        p.lat = -55 - Math.random() * 25;
        p.lon = -180 + Math.random() * 360;
      }
      // Antarctic Circumpolar Current drifts eastward (+lon)
      // Katabatic winds blow outward from pole (lat decreases towards -50)
      if (p.type === "current") {
        p.lon += p.speed * 0.8;
        if (p.lon > 180) p.lon -= 360;
      } else {
        p.lat += p.speed * 0.06;
        p.lon -= p.speed * 0.3;
        if (p.lat > -50) p.lat = -85;
      }
    });
  }

  // Map Data Setup
  setData({ icebergs, stations, vessels, activeRoute }) {
    this.icebergs = icebergs || [];
    this.stations = stations || [];
    this.vessels = vessels || [];
    this.activeRoute = activeRoute || null;
  }

  setForecastHours(h) {
    this.forecastHours = h;
  }

  setLayer(layerName, visible) {
    if (this.layers.hasOwnProperty(layerName)) {
      this.layers[layerName] = visible;
    }
  }

  resetView() {
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  animate(timestamp) {
    this.updateParticles();
    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Deep Space/Ocean Polar Background
    this.drawOceanBackground();

    // 2. Graticule (Lat/Lon grid)
    if (this.layers.graticule) {
      this.drawGraticule();
    }

    // 3. Dynamic Sea Ice Concentration Heatmap
    if (this.layers.seaIce) {
      this.drawSeaIceHeatmap();
    }

    // 4. Antarctic Continental Landmass & Ice Shelves
    this.drawAntarcticaContinent();

    // 5. Ocean Currents & Wind Particles
    this.drawStreamlineParticles();

    // 6. Navigation Routes (AI-optimized, Direct, Escort)
    if (this.layers.routes && this.activeRoute) {
      this.drawRoutes();
    }

    // 7. Tracked Icebergs & Drift Vectors
    if (this.layers.icebergs) {
      this.drawIcebergs();
    }

    // 8. Research Stations
    if (this.layers.stations) {
      this.drawStations();
    }

    // 9. Vessels & Telemetry Markers
    if (this.layers.vessels) {
      this.drawVessels();
    }

    // 10. Radar Range Rings & North Indicator
    this.drawCompassAndHUD();
  }

  drawOceanBackground() {
    const ctx = this.ctx;
    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;
    const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
    grad.addColorStop(0, "#081226");
    grad.addColorStop(0.5, "#060d1b");
    grad.addColorStop(1, "#03060c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGraticule() {
    const ctx = this.ctx;
    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;
    const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;

    ctx.save();
    ctx.strokeStyle = "rgba(79, 172, 254, 0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    // Concentric latitude circles (80°S, 70°S, 60°S, 50°S)
    const lats = [-80, -70, -60, -50];
    lats.forEach((lat) => {
      const distRatio = (90 - Math.abs(lat)) / 40;
      const r = distRatio * baseRadius;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = "rgba(79, 172, 254, 0.4)";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`${Math.abs(lat)}°S`, cx + 6, cy - r + 12);
    });

    // Radial longitude meridians (every 30°)
    for (let lon = -180; lon < 180; lon += 30) {
      const angleRad = (lon - 90) * (Math.PI / 180);
      const x1 = cx + (baseRadius * 0.15) * Math.cos(angleRad);
      const y1 = cy + (baseRadius * 0.15) * Math.sin(angleRad);
      const x2 = cx + baseRadius * Math.cos(angleRad);
      const y2 = cy + baseRadius * Math.sin(angleRad);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Longitude labels at outer ring
      ctx.fillStyle = "rgba(0, 242, 254, 0.5)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      const lx = cx + (baseRadius + 14) * Math.cos(angleRad);
      const ly = cy + (baseRadius + 14) * Math.sin(angleRad);
      const labelText = lon === 0 ? "0°" : lon === 180 ? "180°" : lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText, lx, ly);
    }

    ctx.restore();
  }

  drawSeaIceHeatmap() {
    const ctx = this.ctx;
    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;
    const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;

    // Render multi-layer concentric and sector sea-ice concentration rings
    // Colors: Low SIC (0-30%) dark translucent cyan, Mid (30-70%) bright electric ice cyan, High (70-100%) glowing glacier white
    const latSteps = [-78, -74, -70, -66, -62, -58];
    const lonSteps = 36; // 10 degree sectors

    ctx.save();
    for (let i = 0; i < latSteps.length - 1; i++) {
      const innerLat = latSteps[i];
      const outerLat = latSteps[i + 1];
      const rInner = ((90 - Math.abs(innerLat)) / 40) * baseRadius;
      const rOuter = ((90 - Math.abs(outerLat)) / 40) * baseRadius;

      for (let j = 0; j < lonSteps; j++) {
        const startLon = -180 + (j * 360) / lonSteps;
        const endLon = -180 + ((j + 1) * 360) / lonSteps;
        const midLat = (innerLat + outerLat) / 2;
        const midLon = (startLon + endLon) / 2;
        
        const sic = this.calculateSIC(midLat, midLon, this.forecastHours);
        if (sic < 15) continue; // Open water

        const startAngle = (startLon - 90) * (Math.PI / 180);
        const endAngle = (endLon - 90) * (Math.PI / 180);

        // Alpha & color based on SIC
        let fill;
        if (sic >= 85) {
          fill = `rgba(240, 249, 255, ${0.45 + (sic / 100) * 0.35})`; // Dense Fast Ice
        } else if (sic >= 60) {
          fill = `rgba(0, 229, 255, ${0.30 + (sic / 100) * 0.30})`;  // Close Pack
        } else if (sic >= 35) {
          fill = `rgba(0, 168, 255, ${0.20 + (sic / 100) * 0.25})`;  // Open Pack
        } else {
          fill = `rgba(0, 110, 220, 0.18)`;                          // Open Drift
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, startAngle, endAngle);
        ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawAntarcticaContinent() {
    const ctx = this.ctx;
    
    // Accurate Antarctic continent coastal key coordinates for polar projection
    const antarcticPoly = [
      // Antarctic Peninsula extending North-West
      { lat: -63.5, lon: -57.5 },
      { lat: -64.2, lon: -61.0 },
      { lat: -65.5, lon: -64.2 },
      { lat: -68.0, lon: -67.5 },
      { lat: -71.5, lon: -73.0 },
      // Bellingshausen Sea & Amundsen Sea coastline
      { lat: -73.0, lon: -85.0 },
      { lat: -73.5, lon: -100.0 },
      { lat: -74.2, lon: -115.0 },
      { lat: -74.8, lon: -130.0 },
      // Marie Byrd Land to Ross Ice Shelf
      { lat: -76.0, lon: -145.0 },
      { lat: -77.5, lon: -160.0 },
      // Ross Ice Shelf Edge
      { lat: -78.2, lon: -175.0 },
      { lat: -78.8, lon: 180.0 },
      { lat: -77.8, lon: 170.0 }, // McMurdo Sound
      { lat: -75.0, lon: 165.0 }, // Victoria Land
      { lat: -71.0, lon: 168.0 }, // Cape Adare
      // East Antarctica coastline
      { lat: -67.5, lon: 155.0 },
      { lat: -66.5, lon: 140.0 }, // Dumont d'Urville
      { lat: -66.0, lon: 125.0 },
      { lat: -65.5, lon: 110.0 },
      { lat: -66.2, lon: 95.0 },
      { lat: -66.8, lon: 85.0 },
      { lat: -69.2, lon: 76.0 },  // Prydz Bay / Bharati
      { lat: -67.5, lon: 60.0 },  // Mawson Coast
      { lat: -68.5, lon: 45.0 },
      { lat: -69.8, lon: 30.0 },  // Queen Maud Land
      { lat: -70.5, lon: 12.0 },  // Maitri / Princess Astrid Coast
      { lat: -70.2, lon: -5.0 },  // Neumayer
      // Weddell Sea / Ronne-Filchner Ice Shelf
      { lat: -72.0, lon: -20.0 },
      { lat: -75.0, lon: -35.0 }, // Halley VI / Brunt Shelf
      { lat: -78.0, lon: -50.0 }, // Ronne Shelf inner
      { lat: -75.5, lon: -60.0 },
      { lat: -70.0, lon: -62.0 }, // Larsen C Ice Shelf
      { lat: -66.0, lon: -62.5 }
    ];

    ctx.save();
    ctx.beginPath();
    antarcticPoly.forEach((pt, idx) => {
      const scr = this.geoToScreen(pt.lat, pt.lon);
      if (idx === 0) ctx.moveTo(scr.x, scr.y);
      else ctx.lineTo(scr.x, scr.y);
    });
    ctx.closePath();

    // Continental gradient with glowing shelf borders
    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;
    const landGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260 * this.scale);
    landGrad.addColorStop(0, "#1e3355");
    landGrad.addColorStop(0.7, "#142642");
    landGrad.addColorStop(1, "#0d1b30");

    ctx.fillStyle = landGrad;
    ctx.shadowColor = "rgba(0, 242, 254, 0.4)";
    ctx.shadowBlur = 18;
    ctx.fill();

    // Continental shelf boundary glow line
    ctx.strokeStyle = "#4facfe";
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Inland topographic elevation contours (Transantarctic Mountains / South Pole plateau)
    ctx.beginPath();
    ctx.arc(cx, cy, 45 * this.scale, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // South Pole marker
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SOUTH POLE 90°S", cx, cy + 13);

    // Major Ice Shelves Labels
    this.drawShelfLabel("ROSS ICE SHELF", -81, 180);
    this.drawShelfLabel("RONNE-FILCHNER", -78, -45);
    this.drawShelfLabel("AMERY SHELF", -70, 72);
    this.drawShelfLabel("LARSEN C", -67.5, -62);

    ctx.restore();
  }

  drawShelfLabel(text, lat, lon) {
    const ctx = this.ctx;
    const scr = this.geoToScreen(lat, lon);
    ctx.fillStyle = "rgba(165, 216, 255, 0.45)";
    ctx.font = "italic 9px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, scr.x, scr.y);
  }

  drawStreamlineParticles() {
    const ctx = this.ctx;
    ctx.save();
    this.particles.forEach((p) => {
      if ((p.type === "current" && !this.layers.currents) ||
          (p.type === "wind" && !this.layers.winds)) {
        return;
      }

      const scr = this.geoToScreen(p.lat, p.lon);
      const alpha = Math.sin((p.age / p.maxAge) * Math.PI) * 0.7;

      if (p.type === "current") {
        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255, 214, 0, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 1.0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  drawIcebergs() {
    const ctx = this.ctx;
    if (!this.icebergs) return;

    this.icebergs.forEach((berg) => {
      const scr = this.geoToScreen(berg.lat, berg.lon);

      ctx.save();
      // Forecast trajectory & cone of uncertainty
      if (berg.forecastTrajectory && berg.forecastTrajectory.length > 0) {
        ctx.beginPath();
        ctx.moveTo(scr.x, scr.y);
        ctx.strokeStyle = "rgba(255, 82, 82, 0.7)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);

        berg.forecastTrajectory.forEach((fPt) => {
          const fScr = this.geoToScreen(fPt.lat, fPt.lon);
          ctx.lineTo(fScr.x, fScr.y);
        });
        ctx.stroke();

        // Draw 72h waypoint circle
        const lastPt = berg.forecastTrajectory[berg.forecastTrajectory.length - 1];
        const lastScr = this.geoToScreen(lastPt.lat, lastPt.lon);
        ctx.fillStyle = "rgba(255, 82, 82, 0.25)";
        ctx.beginPath();
        ctx.arc(lastScr.x, lastScr.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ff5252";
        ctx.stroke();
      }

      // Iceberg Symbol (Tabular polygon with warning halo)
      ctx.shadowColor = "#ff5252";
      ctx.shadowBlur = 12;

      // Pulse ring for critical megabergs like A-23a
      if (berg.threatLevel === "CRITICAL") {
        const pulse = (Math.sin(performance.now() * 0.004) + 1) * 6;
        ctx.strokeStyle = "rgba(255, 82, 82, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 10 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tabular berg box
      const isSelected = this.selectedIceberg && this.selectedIceberg.id === berg.id;
      ctx.fillStyle = isSelected ? "#ffffff" : "#ff4757";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.fillRect(scr.x - 5, scr.y - 4, 10, 8);
      ctx.strokeRect(scr.x - 5, scr.y - 4, 10, 8);

      // Label
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(berg.id, scr.x + 9, scr.y + 3);

      ctx.restore();
    });
  }

  drawStations() {
    const ctx = this.ctx;
    if (!this.stations) return;

    this.stations.forEach((st) => {
      const scr = this.geoToScreen(st.lat, st.lon);
      const isSelected = this.selectedStation && this.selectedStation.id === st.id;

      ctx.save();
      // Outer ping
      ctx.strokeStyle = isSelected ? "#00f2fe" : "rgba(0, 242, 254, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, isSelected ? 8 : 5, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = isSelected ? "#00f2fe" : "#ffffff";
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Station name label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px 'Inter', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(st.name.replace(" Station", ""), scr.x + 8, scr.y + 3);
      ctx.restore();
    });
  }

  drawVessels() {
    const ctx = this.ctx;
    if (!this.vessels) return;

    this.vessels.forEach((v) => {
      const scr = this.geoToScreen(v.currentLat, v.currentLon);
      const isSelected = this.selectedVessel && this.selectedVessel.id === v.id;

      ctx.save();
      ctx.translate(scr.x, scr.y);
      // Rotate according to heading
      const headingRad = (v.heading * Math.PI) / 180;
      ctx.rotate(headingRad);

      // Ship icon
      ctx.fillStyle = isSelected ? "#38ef7d" : "#00f2fe";
      ctx.shadowColor = isSelected ? "#38ef7d" : "#00f2fe";
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(5, 7);
      ctx.lineTo(0, 4);
      ctx.lineTo(-5, 7);
      ctx.closePath();
      ctx.fill();

      // Heading vector beam
      ctx.strokeStyle = "rgba(0, 242, 254, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, -22);
      ctx.stroke();

      ctx.restore();

      // Vessel Name Tag
      ctx.save();
      ctx.fillStyle = "#38ef7d";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${v.name} (${v.speedKts}kt)`, scr.x + 10, scr.y - 2);
      ctx.restore();
    });
  }

  drawRoutes() {
    const ctx = this.ctx;
    const r = this.activeRoute;
    if (!r) return;

    // 1. Draw Direct (Naive) Route in warning amber/red
    if (r.directWaypoints && r.directWaypoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 171, 0, 0.7)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      r.directWaypoints.forEach((pt, i) => {
        const scr = this.geoToScreen(pt.lat, pt.lon);
        if (i === 0) ctx.moveTo(scr.x, scr.y);
        else ctx.lineTo(scr.x, scr.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw POLARIS AI-Optimized Safe & Fuel Route in Glowing Green/Cyan
    if (r.aiWaypoints && r.aiWaypoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = "#00f2fe";
      ctx.lineWidth = 3.0;
      ctx.shadowColor = "#00f2fe";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      r.aiWaypoints.forEach((pt, i) => {
        const scr = this.geoToScreen(pt.lat, pt.lon);
        if (i === 0) ctx.moveTo(scr.x, scr.y);
        else ctx.lineTo(scr.x, scr.y);
      });
      ctx.stroke();

      // Waypoint nodes
      r.aiWaypoints.forEach((pt, i) => {
        const scr = this.geoToScreen(pt.lat, pt.lon);
        ctx.fillStyle = i === 0 ? "#ffab00" : i === r.aiWaypoints.length - 1 ? "#38ef7d" : "#ffffff";
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#080c14";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Animated simulated vessel along route
      if (this.vesselSimProgress > 0 && this.vesselSimProgress <= 1) {
        const totalWps = r.aiWaypoints.length;
        const exactIdx = (totalWps - 1) * this.vesselSimProgress;
        const currIdx = Math.floor(exactIdx);
        const nextIdx = Math.min(totalWps - 1, currIdx + 1);
        const frac = exactIdx - currIdx;

        const p1 = r.aiWaypoints[currIdx];
        const p2 = r.aiWaypoints[nextIdx];
        const interpLat = p1.lat + (p2.lat - p1.lat) * frac;
        const interpLon = p1.lon + (p2.lon - p1.lon) * frac;

        const vScr = this.geoToScreen(interpLat, interpLon);
        ctx.fillStyle = "#ffeb3b";
        ctx.shadowColor = "#ffeb3b";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(vScr.x, vScr.y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.fillText("SIM SHIP", vScr.x + 10, vScr.y - 6);
      }

      ctx.restore();
    }
  }

  drawCompassAndHUD() {
    const ctx = this.ctx;
    // Compass rose in top right
    const rx = this.width - 50;
    const ry = 50;

    ctx.save();
    ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(rx, ry, 26, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 242, 254, 0.8)";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("N (0°)", rx, ry - 30);
    ctx.fillText("S", rx, ry + 36);
    ctx.fillText("E", rx + 36, ry + 3);
    ctx.fillText("W", rx - 36, ry + 3);

    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(rx - 8, ry);
    ctx.lineTo(rx + 8, ry);
    ctx.moveTo(rx, ry - 8);
    ctx.lineTo(rx, ry + 8);
    ctx.stroke();
    ctx.restore();
  }

  handleCanvasClick(x, y) {
    // Check click on icebergs
    if (this.icebergs) {
      for (let berg of this.icebergs) {
        const scr = this.geoToScreen(berg.lat, berg.lon);
        const dist = Math.hypot(scr.x - x, scr.y - y);
        if (dist <= 14) {
          this.selectedIceberg = berg;
          this.onSelectEntity({ type: "iceberg", data: berg });
          return;
        }
      }
    }

    // Check click on stations
    if (this.stations) {
      for (let st of this.stations) {
        const scr = this.geoToScreen(st.lat, st.lon);
        const dist = Math.hypot(scr.x - x, scr.y - y);
        if (dist <= 12) {
          this.selectedStation = st;
          this.onSelectEntity({ type: "station", data: st });
          return;
        }
      }
    }

    // Check click on vessels
    if (this.vessels) {
      for (let v of this.vessels) {
        const scr = this.geoToScreen(v.currentLat, v.currentLon);
        const dist = Math.hypot(scr.x - x, scr.y - y);
        if (dist <= 14) {
          this.selectedVessel = v;
          this.onSelectEntity({ type: "vessel", data: v });
          return;
        }
      }
    }
  }

  checkHoverEntities(x, y) {
    let hovered = false;
    if (this.icebergs) {
      for (let berg of this.icebergs) {
        const scr = this.geoToScreen(berg.lat, berg.lon);
        if (Math.hypot(scr.x - x, scr.y - y) <= 12) {
          this.canvas.style.cursor = "pointer";
          hovered = true;
          break;
        }
      }
    }
    if (!hovered && this.stations) {
      for (let st of this.stations) {
        const scr = this.geoToScreen(st.lat, st.lon);
        if (Math.hypot(scr.x - x, scr.y - y) <= 10) {
          this.canvas.style.cursor = "pointer";
          hovered = true;
          break;
        }
      }
    }
    if (!hovered) {
      this.canvas.style.cursor = this.isDragging ? "grabbing" : "crosshair";
    }
  }

  focusOn(lat, lon) {
    const targetScale = 2.0;
    this.scale = targetScale;
    
    // Calculate required pan
    const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;
    const distRatio = (90 - Math.abs(lat)) / 40;
    const r = distRatio * baseRadius;
    const angleRad = (lon - 90) * (Math.PI / 180);
    
    this.panX = -r * Math.cos(angleRad);
    this.panY = -r * Math.sin(angleRad);
  }
}
