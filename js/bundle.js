/**
 * POLARIS-AI Master Consolidated Engine
 * Works natively in both HTTP(S) servers and direct local filesystem (file:///)
 * Contains: Data Registry, Polar Canvas GIS, Route Planner, Iceberg Simulator, Charts & HUD.
 */

(function () {
  "use strict";

  // ================= 1. DATA REGISTRY =================
  const ANTARCTIC_STATIONS = [
    {
      id: "mcmurdo",
      name: "McMurdo Station",
      country: "USA (USAP)",
      lat: -77.846,
      lon: 166.668,
      iceCondition: "Heavy Fast Ice / Seasonal Breakup",
      sicCurrent: 78,
      temp: -22,
      wind: "32 kts SSW",
      resupplyWindow: "Jan 10 - Feb 28",
      status: "Icebreaker Channel Required",
      polarClassReq: "PC-3 / PC-4"
    },
    {
      id: "rothera",
      name: "Rothera Research Station",
      country: "United Kingdom (BAS)",
      lat: -67.571,
      lon: -68.125,
      iceCondition: "Open Drift / Scattered Growlers",
      sicCurrent: 34,
      temp: -8,
      wind: "18 kts NW",
      resupplyWindow: "Dec 01 - Mar 30",
      status: "Accessible by PC-5/PC-6",
      polarClassReq: "PC-5"
    },
    {
      id: "maitri",
      name: "Maitri Station",
      country: "India (NCPOR)",
      lat: -70.766,
      lon: 11.733,
      iceCondition: "Fast Ice Shelf Edge / Polynyas",
      sicCurrent: 62,
      temp: -16,
      wind: "28 kts SE (Katabatic)",
      resupplyWindow: "Dec 15 - Feb 20",
      status: "Offload at India Bay Fast Ice",
      polarClassReq: "PC-4 / PC-5"
    },
    {
      id: "bharati",
      name: "Bharati Station",
      country: "India (NCPOR)",
      lat: -69.407,
      lon: 76.191,
      iceCondition: "Coastal Lead / Moderate Pack",
      sicCurrent: 48,
      temp: -12,
      wind: "22 kts E",
      resupplyWindow: "Nov 25 - Mar 15",
      status: "Quayside Anchorage Accessible",
      polarClassReq: "PC-5"
    },
    {
      id: "neumayer",
      name: "Neumayer-Station III",
      country: "Germany (AWI)",
      lat: -70.666,
      lon: -8.266,
      iceCondition: "Atka Bay Sea Ice Shelf",
      sicCurrent: 71,
      temp: -19,
      wind: "25 kts ENE",
      resupplyWindow: "Dec 20 - Feb 15",
      status: "Sea Ice Unloading Operations",
      polarClassReq: "PC-3 / PC-4"
    },
    {
      id: "esperanza",
      name: "Base Esperanza",
      country: "Argentina (DNA)",
      lat: -63.396,
      lon: -56.998,
      iceCondition: "Open Pack Ice / Tabular Bergs",
      sicCurrent: 29,
      temp: -4,
      wind: "38 kts SW (Storm Alert)",
      resupplyWindow: "Nov 15 - Apr 15",
      status: "High Iceberg Density Alert",
      polarClassReq: "PC-6 / PC-7"
    },
    {
      id: "dumont",
      name: "Dumont d'Urville Station",
      country: "France (IPEV)",
      lat: -66.662,
      lon: 140.001,
      iceCondition: "Tidal Ice Floes",
      sicCurrent: 55,
      temp: -14,
      wind: "42 kts SE",
      resupplyWindow: "Dec 10 - Feb 25",
      status: "L'Astrolabe Transit Inbound",
      polarClassReq: "PC-5"
    },
    {
      id: "halley",
      name: "Halley VI Research Station",
      country: "United Kingdom (BAS)",
      lat: -75.583,
      lon: -26.200,
      iceCondition: "Weddell Sea Heavy Compressive Ice",
      sicCurrent: 88,
      temp: -27,
      wind: "19 kts S",
      resupplyWindow: "Jan 05 - Feb 10",
      status: "Severe Ice Encroachment Risk",
      polarClassReq: "PC-2 / PC-3"
    }
  ];

  const DEPARTURE_PORTS = [
    { id: "ushuaia", name: "Ushuaia, Argentina", lat: -54.801, lon: -68.303 },
    { id: "punta_arenas", name: "Punta Arenas, Chile", lat: -53.163, lon: -70.917 },
    { id: "cape_town", name: "Cape Town, South Africa", lat: -33.924, lon: 18.424 },
    { id: "hobart", name: "Hobart, Australia", lat: -42.882, lon: 147.327 },
    { id: "christchurch", name: "Christchurch / Lyttelton, NZ", lat: -43.603, lon: 172.719 }
  ];

  const TRACKED_ICEBERGS = [
    {
      id: "A-23a",
      name: "Iceberg A-23a (Megaberg)",
      origin: "Filchner-Ronne Ice Shelf (Calved 1986)",
      areaKm2: 3820,
      thicknessM: 280,
      massMegatons: 1100000,
      lat: -61.25,
      lon: -48.30,
      driftSpeedKts: 0.65,
      driftHeadingDeg: 38,
      threatLevel: "CRITICAL",
      notes: "World's largest tabular iceberg drifting into the Southern Ocean 'Iceberg Alley'. Sub-surface keel poses extreme collision and sonar hazard to Drake Passage vessels.",
      forecastTrajectory: [
        { lat: -60.30, lon: -47.10, hours: 24 },
        { lat: -59.40, lon: -45.90, hours: 48 },
        { lat: -58.35, lon: -44.50, hours: 72 },
        { lat: -56.80, lon: -42.80, hours: 120 }
      ]
    },
    {
      id: "A-76a",
      name: "Iceberg A-76a (Fragment)",
      origin: "Ronne Ice Shelf",
      areaKm2: 1240,
      thicknessM: 260,
      massMegatons: 290000,
      lat: -55.80,
      lon: -36.40,
      driftSpeedKts: 1.15,
      driftHeadingDeg: 62,
      threatLevel: "HIGH",
      notes: "Approaching South Georgia Island marine ecosystem. Heavy fragmentation creating high density of bergy bits (<100m) invisible to standard marine radar in high sea state.",
      forecastTrajectory: [
        { lat: -55.10, lon: -35.20, hours: 24 },
        { lat: -54.30, lon: -33.90, hours: 48 },
        { lat: -53.40, lon: -32.50, hours: 72 }
      ]
    },
    {
      id: "A-81",
      name: "Iceberg A-81",
      origin: "Brunt Ice Shelf (Halley VI calve)",
      areaKm2: 1550,
      thicknessM: 190,
      massMegatons: 270000,
      lat: -75.90,
      lon: -34.80,
      driftSpeedKts: 0.35,
      driftHeadingDeg: 285,
      threatLevel: "MODERATE",
      notes: "Weddell Sea Coastal Current drift. Trapped in heavy sea ice pack, slow westward clockwise translation.",
      forecastTrajectory: [
        { lat: -76.05, lon: -36.10, hours: 24 },
        { lat: -76.15, lon: -37.50, hours: 48 },
        { lat: -76.25, lon: -39.00, hours: 72 }
      ]
    },
    {
      id: "B-22A",
      name: "Iceberg B-22A",
      origin: "Thwaites Glacier Tongue (Amundsen Sea)",
      areaKm2: 2450,
      thicknessM: 310,
      massMegatons: 680000,
      lat: -73.40,
      lon: -108.20,
      driftSpeedKts: 0.22,
      driftHeadingDeg: 315,
      threatLevel: "ELEVATED",
      notes: "Recently ungrounded from underwater shoal; now drifting northwest toward Pine Island Bay deep channel.",
      forecastTrajectory: [
        { lat: -73.25, lon: -108.70, hours: 24 },
        { lat: -73.05, lon: -109.30, hours: 48 },
        { lat: -72.80, lon: -110.10, hours: 72 }
      ]
    },
    {
      id: "D-28",
      name: "Iceberg D-28",
      origin: "Amery Ice Shelf",
      areaKm2: 1480,
      thicknessM: 210,
      massMegatons: 280000,
      lat: -65.70,
      lon: 71.90,
      driftSpeedKts: 0.48,
      driftHeadingDeg: 260,
      threatLevel: "MODERATE",
      notes: "Drifting westward along East Antarctic continental slope; proximity to Prydz Bay shipping corridor for Bharati / Davis stations.",
      forecastTrajectory: [
        { lat: -65.75, lon: 70.90, hours: 24 },
        { lat: -65.80, lon: 69.80, hours: 48 },
        { lat: -65.82, lon: 68.60, hours: 72 }
      ]
    }
  ];

  const POLAR_VESSELS = [
    {
      id: "rv_polarstern",
      name: "R/V Polarstern",
      flag: "Germany",
      operator: "Alfred Wegener Institute (AWI)",
      polarClass: "PC-2",
      lengthM: 118,
      beamM: 25,
      displacementT: 17300,
      enginePowerMW: 14.7,
      iceBreakingCapM: 1.5,
      fuelConsumptionOpenTonneDay: 28,
      fuelConsumptionIceTonneDay: 58,
      carbonFactor: 3.206,
      currentLat: -64.82,
      currentLon: -58.45,
      destination: "Rothera Station",
      speedKts: 11.2,
      heading: 195,
      iceConcentrationSurrounding: 42,
      hullStressPct: 48,
      bowImpactKN: 1850,
      ciiScore: "A"
    },
    {
      id: "rv_att",
      name: "RRS Sir David Attenborough",
      flag: "United Kingdom",
      operator: "British Antarctic Survey (BAS)",
      polarClass: "PC-4",
      lengthM: 129,
      beamM: 24,
      displacementT: 15000,
      enginePowerMW: 16.0,
      iceBreakingCapM: 1.0,
      fuelConsumptionOpenTonneDay: 24,
      fuelConsumptionIceTonneDay: 52,
      carbonFactor: 3.206,
      currentLat: -60.10,
      currentLon: -46.50,
      destination: "Halley VI / Rothera",
      speedKts: 13.5,
      heading: 170,
      iceConcentrationSurrounding: 18,
      hullStressPct: 22,
      bowImpactKN: 820,
      ciiScore: "A"
    },
    {
      id: "rv_bharati",
      name: "MV Bharati Resupply",
      flag: "India",
      operator: "National Centre for Polar and Ocean Research (NCPOR)",
      polarClass: "PC-5",
      lengthM: 132,
      beamM: 22,
      displacementT: 14200,
      enginePowerMW: 12.8,
      iceBreakingCapM: 0.8,
      fuelConsumptionOpenTonneDay: 22,
      fuelConsumptionIceTonneDay: 46,
      carbonFactor: 3.206,
      currentLat: -66.40,
      currentLon: 68.30,
      destination: "Bharati Station",
      speedKts: 9.8,
      heading: 115,
      iceConcentrationSurrounding: 55,
      hullStressPct: 62,
      bowImpactKN: 2150,
      ciiScore: "B"
    },
    {
      id: "rv_palmer",
      name: "RV Nathaniel B. Palmer",
      flag: "USA",
      operator: "National Science Foundation / USAP",
      polarClass: "PC-3",
      lengthM: 94,
      beamM: 18.3,
      displacementT: 6600,
      enginePowerMW: 9.5,
      iceBreakingCapM: 1.0,
      fuelConsumptionOpenTonneDay: 19,
      fuelConsumptionIceTonneDay: 39,
      carbonFactor: 3.206,
      currentLat: -73.15,
      currentLon: 174.50,
      destination: "McMurdo Sound",
      speedKts: 8.5,
      heading: 182,
      iceConcentrationSurrounding: 76,
      hullStressPct: 78,
      bowImpactKN: 2790,
      ciiScore: "B"
    }
  ];

  const POLAR_CLASS_SPECS = {
    "PC-1": { label: "PC-1 Year-round in all polar waters", maxSafeSIC: 100, resistanceFactor: 0.70 },
    "PC-2": { label: "PC-2 Year-round in moderate multi-year ice", maxSafeSIC: 95, resistanceFactor: 0.82 },
    "PC-3": { label: "PC-3 Year-round in second-year ice", maxSafeSIC: 85, resistanceFactor: 1.00 },
    "PC-4": { label: "PC-4 Year-round in thick first-year ice", maxSafeSIC: 75, resistanceFactor: 1.22 },
    "PC-5": { label: "PC-5 Year-round in medium first-year ice", maxSafeSIC: 65, resistanceFactor: 1.55 },
    "PC-6": { label: "PC-6 Summer/autumn in medium ice", maxSafeSIC: 50, resistanceFactor: 2.10 },
    "PC-7": { label: "PC-7 Summer/autumn in thin ice", maxSafeSIC: 35, resistanceFactor: 3.20 }
  };

  const SATELLITE_DATA_FEEDS = [
    {
      sensor: "Sentinel-1A/B SAR",
      agency: "ESA Copernicus",
      resolution: "10m - 50m EW/IW",
      spectrum: "C-Band Radar (5.405 GHz)",
      latency: "38 mins (NRT)"
    },
    {
      sensor: "AMSR2 Passive Microwave",
      agency: "JAXA GCOM-W1",
      resolution: "6.25km Grid",
      spectrum: "89.0 GHz & 36.5 GHz",
      latency: "2.1 hours"
    },
    {
      sensor: "CryoSat-2 / ICESat-2",
      agency: "ESA / NASA",
      resolution: "Altimetry Profiling",
      spectrum: "Ku-band SIRAL & 532nm LiDAR",
      latency: "12 hours"
    },
    {
      sensor: "HYCOM + NCODA Oceanography",
      agency: "Global Ocean Model",
      resolution: "1/12° (~4.5km)",
      spectrum: "Hydrodynamic Baroclinic",
      latency: "6 hours assimilation"
    },
    {
      sensor: "ECMWF ERA5 / IFS Forecast",
      agency: "ECMWF Global",
      resolution: "0.1° (~9km)",
      spectrum: "Numerical Weather Prediction",
      latency: "Hourly forecast updates"
    }
  ];

  // ================= 2. POLAR MAP CANVAS ENGINE =================
  class PolarMap {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      
      this.scale = options.initialScale || 1.0;
      this.panX = 0;
      this.panY = 0;
      this.isDragging = false;
      this.lastMouse = { x: 0, y: 0 };
      this.forecastHours = 0;
      
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

      this.particles = [];
      this.initParticles();
      
      this.selectedIceberg = null;
      this.selectedStation = null;
      this.selectedVessel = null;
      this.activeRoute = null;
      this.vesselSimProgress = 0;

      this.onSelectEntity = options.onSelectEntity || (() => {});
      this.onCoordHover = options.onCoordHover || (() => {});

      this.setupEvents();
      this.resize();
      window.addEventListener("resize", () => this.resize());
      
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    resize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.width = rect.width || 800;
      this.height = rect.height || 640;
      
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
          this.onCoordHover(geo);
          this.checkHover(mouseCanvasX, mouseCanvasY);
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

      this.canvas.addEventListener("click", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        this.handleClick(mx, my);
      });
    }

    geoToScreen(lat, lon) {
      const cx = this.width / 2 + this.panX;
      const cy = this.height / 2 + this.panY;
      const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;
      
      const clampedLat = Math.min(-50, Math.max(-90, lat));
      const distRatio = (90 - Math.abs(clampedLat)) / 40;
      const r = distRatio * baseRadius;
      
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
      while (lon < -180) lon -= 360;

      return {
        lat: Math.max(-90, Math.min(-50, lat)),
        lon,
        sic: this.calculateSIC(lat, lon, this.forecastHours)
      };
    }

    calculateSIC(lat, lon, forecastHours = 0) {
      if (lat < -85) return 100;
      if (lat > -58) return 0;
      
      const t = (-lat - 58) / (85 - 58);
      let base = Math.pow(t, 1.4) * 98;

      const lonRad = (lon * Math.PI) / 180;
      const sectorMod = 
        Math.sin(lonRad + 0.5) * 12 + 
        Math.cos(lonRad * 2) * 8 +
        Math.sin(lonRad * 3 - 0.8) * 6;

      const timeWave = Math.sin((lon * 0.05) + (forecastHours * 0.04)) * 7;
      let sic = Math.round(base + sectorMod + timeWave);
      return Math.max(0, Math.min(100, sic));
    }

    initParticles() {
      this.particles = [];
      for (let i = 0; i < 180; i++) {
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

    setData({ icebergs, stations, vessels, activeRoute }) {
      this.icebergs = icebergs || [];
      this.stations = stations || [];
      this.vessels = vessels || [];
      if (activeRoute !== undefined) this.activeRoute = activeRoute;
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

    focusOn(lat, lon) {
      this.scale = 2.2;
      const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;
      const distRatio = (90 - Math.abs(lat)) / 40;
      const r = distRatio * baseRadius;
      const angleRad = (lon - 90) * (Math.PI / 180);
      
      this.panX = -r * Math.cos(angleRad);
      this.panY = -r * Math.sin(angleRad);
    }

    animate() {
      this.updateParticles();
      this.render();
      requestAnimationFrame(this.animate);
    }

    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      // Background
      const cx = this.width / 2 + this.panX;
      const cy = this.height / 2 + this.panY;
      const baseRadius = (Math.min(this.width, this.height) * 0.44) * this.scale;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
      grad.addColorStop(0, "#081226");
      grad.addColorStop(0.5, "#060d1b");
      grad.addColorStop(1, "#03060c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Graticule
      if (this.layers.graticule) {
        ctx.save();
        ctx.strokeStyle = "rgba(79, 172, 254, 0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);

        const lats = [-80, -70, -60, -50];
        lats.forEach((lat) => {
          const distRatio = (90 - Math.abs(lat)) / 40;
          const r = distRatio * baseRadius;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "rgba(79, 172, 254, 0.4)";
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.fillText(`${Math.abs(lat)}°S`, cx + 6, cy - r + 12);
        });

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

      // Sea Ice Heatmap
      if (this.layers.seaIce) {
        ctx.save();
        const latSteps = [-78, -74, -70, -66, -62, -58];
        const lonSteps = 36;
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
            if (sic < 15) continue;

            const startAngle = (startLon - 90) * (Math.PI / 180);
            const endAngle = (endLon - 90) * (Math.PI / 180);

            let fill;
            if (sic >= 85) fill = `rgba(240, 249, 255, ${0.45 + (sic / 100) * 0.35})`;
            else if (sic >= 60) fill = `rgba(0, 229, 255, ${0.30 + (sic / 100) * 0.30})`;
            else if (sic >= 35) fill = `rgba(0, 168, 255, ${0.20 + (sic / 100) * 0.25})`;
            else fill = `rgba(0, 110, 220, 0.18)`;

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

      // Antarctic Continent Outline
      ctx.save();
      const antarcticPoly = [
        { lat: -63.5, lon: -57.5 },
        { lat: -64.2, lon: -61.0 },
        { lat: -65.5, lon: -64.2 },
        { lat: -68.0, lon: -67.5 },
        { lat: -71.5, lon: -73.0 },
        { lat: -73.0, lon: -85.0 },
        { lat: -73.5, lon: -100.0 },
        { lat: -74.2, lon: -115.0 },
        { lat: -74.8, lon: -130.0 },
        { lat: -76.0, lon: -145.0 },
        { lat: -77.5, lon: -160.0 },
        { lat: -78.2, lon: -175.0 },
        { lat: -78.8, lon: 180.0 },
        { lat: -77.8, lon: 170.0 },
        { lat: -75.0, lon: 165.0 },
        { lat: -71.0, lon: 168.0 },
        { lat: -67.5, lon: 155.0 },
        { lat: -66.5, lon: 140.0 },
        { lat: -66.0, lon: 125.0 },
        { lat: -65.5, lon: 110.0 },
        { lat: -66.2, lon: 95.0 },
        { lat: -66.8, lon: 85.0 },
        { lat: -69.2, lon: 76.0 },
        { lat: -67.5, lon: 60.0 },
        { lat: -68.5, lon: 45.0 },
        { lat: -69.8, lon: 30.0 },
        { lat: -70.5, lon: 12.0 },
        { lat: -70.2, lon: -5.0 },
        { lat: -72.0, lon: -20.0 },
        { lat: -75.0, lon: -35.0 },
        { lat: -78.0, lon: -50.0 },
        { lat: -75.5, lon: -60.0 },
        { lat: -70.0, lon: -62.0 },
        { lat: -66.0, lon: -62.5 }
      ];

      ctx.beginPath();
      antarcticPoly.forEach((pt, idx) => {
        const scr = this.geoToScreen(pt.lat, pt.lon);
        if (idx === 0) ctx.moveTo(scr.x, scr.y);
        else ctx.lineTo(scr.x, scr.y);
      });
      ctx.closePath();

      const landGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260 * this.scale);
      landGrad.addColorStop(0, "#1e3355");
      landGrad.addColorStop(0.7, "#142642");
      landGrad.addColorStop(1, "#0d1b30");
      ctx.fillStyle = landGrad;
      ctx.shadowColor = "rgba(0, 242, 254, 0.4)";
      ctx.shadowBlur = 18;
      ctx.fill();

      ctx.strokeStyle = "#4facfe";
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.stroke();

      // South Pole
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("SOUTH POLE 90°S", cx, cy + 13);
      ctx.restore();

      // Particles
      ctx.save();
      this.particles.forEach((p) => {
        if ((p.type === "current" && !this.layers.currents) ||
            (p.type === "wind" && !this.layers.winds)) return;

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

      // Routes
      if (this.layers.routes && this.activeRoute) {
        const r = this.activeRoute;
        // Direct route
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

        // AI route
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

          // Simulation Vessel
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

      // Icebergs
      if (this.layers.icebergs && this.icebergs) {
        this.icebergs.forEach((berg) => {
          const scr = this.geoToScreen(berg.lat, berg.lon);
          ctx.save();

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
          }

          if (berg.threatLevel === "CRITICAL") {
            const pulse = (Math.sin(performance.now() * 0.004) + 1) * 6;
            ctx.strokeStyle = "rgba(255, 82, 82, 0.4)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(scr.x, scr.y, 10 + pulse, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = "#ff4757";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.fillRect(scr.x - 5, scr.y - 4, 10, 8);
          ctx.strokeRect(scr.x - 5, scr.y - 4, 10, 8);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "left";
          ctx.fillText(berg.id, scr.x + 9, scr.y + 3);
          ctx.restore();
        });
      }

      // Stations
      if (this.layers.stations && this.stations) {
        this.stations.forEach((st) => {
          const scr = this.geoToScreen(st.lat, st.lon);
          ctx.save();
          ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(scr.x, scr.y, 5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(scr.x, scr.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#e2e8f0";
          ctx.font = "10px 'Inter', sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(st.name.replace(" Station", ""), scr.x + 8, scr.y + 3);
          ctx.restore();
        });
      }

      // Vessels
      if (this.layers.vessels && this.vessels) {
        this.vessels.forEach((v) => {
          const scr = this.geoToScreen(v.currentLat, v.currentLon);
          ctx.save();
          ctx.translate(scr.x, scr.y);
          const headingRad = (v.heading * Math.PI) / 180;
          ctx.rotate(headingRad);

          ctx.fillStyle = "#38ef7d";
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(5, 7);
          ctx.lineTo(0, 4);
          ctx.lineTo(-5, 7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.fillStyle = "#38ef7d";
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "left";
          ctx.fillText(`${v.name} (${v.speedKts}kt)`, scr.x + 10, scr.y - 2);
          ctx.restore();
        });
      }

      // Compass Rose
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
      ctx.restore();
    }

    handleClick(x, y) {
      if (this.icebergs) {
        for (let berg of this.icebergs) {
          const scr = this.geoToScreen(berg.lat, berg.lon);
          if (Math.hypot(scr.x - x, scr.y - y) <= 14) {
            this.selectedIceberg = berg;
            this.onSelectEntity({ type: "iceberg", data: berg });
            return;
          }
        }
      }
      if (this.stations) {
        for (let st of this.stations) {
          const scr = this.geoToScreen(st.lat, st.lon);
          if (Math.hypot(scr.x - x, scr.y - y) <= 12) {
            this.selectedStation = st;
            this.onSelectEntity({ type: "station", data: st });
            return;
          }
        }
      }
      if (this.vessels) {
        for (let v of this.vessels) {
          const scr = this.geoToScreen(v.currentLat, v.currentLon);
          if (Math.hypot(scr.x - x, scr.y - y) <= 14) {
            this.selectedVessel = v;
            this.onSelectEntity({ type: "vessel", data: v });
            return;
          }
        }
      }
    }

    checkHover(x, y) {
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
  }

  // ================= 3. ROUTE PLANNER ENGINE =================
  class RoutePlanner {
    constructor() {
      this.currentPlan = null;
    }

    static distanceNM(lat1, lon1, lat2, lon2) {
      const R = 3440.065;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    static calculateIceResistance(vessel, iceThicknessM, sicPct, speedKts) {
      if (sicPct < 15 || iceThicknessM <= 0.05) return 120;
      const polarSpec = POLAR_CLASS_SPECS[vessel.polarClass] || POLAR_CLASS_SPECS["PC-4"];
      const beam = vessel.beamM || 22;
      const displacement = vessel.displacementT || 12000;

      const h = iceThicknessM * (sicPct / 100);
      const Rc = 0.5 * 1000 * 9.81 * Math.pow(h, 2) * beam;
      const Rb = 0.047 * 500000 * Math.pow(h, 1.5) * Math.pow(beam, 0.8);
      const Rs = 1.1 * 1025 * 9.81 * displacement * Math.pow(h, 1.2) * (speedKts / 10);

      const totalResistanceKN = ((Rc + Rb + Rs) / 1000) * polarSpec.resistanceFactor;
      return Math.max(120, Math.round(totalResistanceKN));
    }

    generateRoutePlan(config) {
      const {
        departureId,
        stationId,
        vesselId,
        safetyWeight = 0.6,
        icebergAvoidanceNM = 15,
        maxSafeSIC = 75
      } = config;

      const departure = DEPARTURE_PORTS.find((p) => p.id === departureId) || DEPARTURE_PORTS[0];
      const destination = ANTARCTIC_STATIONS.find((s) => s.id === stationId) || ANTARCTIC_STATIONS[0];
      const vessel = POLAR_VESSELS.find((v) => v.id === vesselId) || POLAR_VESSELS[0];
      const polarSpec = POLAR_CLASS_SPECS[vessel.polarClass] || POLAR_CLASS_SPECS["PC-4"];

      const totalDirectDistNM = Math.round(
        RoutePlanner.distanceNM(departure.lat, departure.lon, destination.lat, destination.lon)
      );

      const directWaypoints = this.buildDirectRoute(departure, destination, vessel, totalDirectDistNM);
      const aiWaypoints = this.buildAIOptimizedRoute(departure, destination, vessel, totalDirectDistNM, safetyWeight);
      const bypassWaypoints = this.buildBypassRoute(departure, destination, vessel, totalDirectDistNM);

      const aiMetrics = this.computeRouteMetrics(aiWaypoints, vessel, polarSpec);
      const directMetrics = this.computeRouteMetrics(directWaypoints, vessel, polarSpec);
      const bypassMetrics = this.computeRouteMetrics(bypassWaypoints, vessel, polarSpec);

      const fuelSavedMT = Math.max(0, directMetrics.totalFuelBurnT - aiMetrics.totalFuelBurnT);
      const fuelCostSavedUSD = Math.round(fuelSavedMT * 785);
      const co2SavedMT = (fuelSavedMT * vessel.carbonFactor).toFixed(1);
      const fuelSavingPct = ((fuelSavedMT / directMetrics.totalFuelBurnT) * 100).toFixed(1);

      this.currentPlan = {
        departure,
        destination,
        vessel,
        directWaypoints,
        aiWaypoints,
        bypassWaypoints,
        aiMetrics,
        directMetrics,
        bypassMetrics,
        savings: {
          fuelSavedMT: Math.round(fuelSavedMT),
          fuelCostSavedUSD,
          co2SavedMT,
          fuelSavingPct
        },
        generatedAt: new Date().toISOString()
      };

      return this.currentPlan;
    }

    buildDirectRoute(dep, dest, vessel, totalDistNM) {
      const steps = 14;
      const waypoints = [];
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const lat = dep.lat + (dest.lat - dep.lat) * frac;
        const lon = dep.lon + (dest.lon - dep.lon) * frac;
        
        let sic = 0;
        if (lat < -58) {
          const iceProg = (-lat - 58) / (-dest.lat - 58);
          sic = Math.min(92, Math.round(iceProg * 88));
        }

        waypoints.push({
          idx: i + 1,
          name: i === 0 ? `DEP: ${dep.name}` : i === steps ? `ARR: ${dest.name}` : `WP-DIR-${i}`,
          lat: Number(lat.toFixed(3)),
          lon: Number(lon.toFixed(3)),
          sic,
          iceThicknessM: (sic / 100) * 1.8,
          speedKts: sic > 70 ? 4.5 : sic > 40 ? 8.0 : 13.5,
          distLegNM: Math.round(totalDistNM / steps)
        });
      }
      return waypoints;
    }

    buildAIOptimizedRoute(dep, dest, vessel, totalDistNM, safetyWeight) {
      const steps = 15;
      const waypoints = [];
      const lateralShift = (dest.lon - dep.lon > 0 ? 1 : -1) * (14 + safetyWeight * 12);

      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        let lat = dep.lat + (dest.lat - dep.lat) * frac;
        let lon = dep.lon + (dest.lon - dep.lon) * frac;
        if (frac > 0.25 && frac < 0.90) {
          const detourFactor = Math.sin((frac - 0.25) / 0.65 * Math.PI);
          lon += lateralShift * detourFactor;
        }

        let sic = 0;
        if (lat < -60) {
          const iceProg = (-lat - 60) / (-dest.lat - 60);
          sic = Math.min(62, Math.round(iceProg * 55));
        }

        const speedKts = sic > 50 ? 8.2 : sic > 25 ? 11.5 : 13.8;

        waypoints.push({
          idx: i + 1,
          name: i === 0 ? `DEP: ${dep.name}` : i === steps ? `ARR: ${dest.name}` : `WP-AI-${i}`,
          lat: Number(lat.toFixed(3)),
          lon: Number(lon.toFixed(3)),
          sic,
          iceThicknessM: (sic / 100) * 0.9,
          speedKts,
          distLegNM: Math.round((totalDistNM * 1.04) / steps)
        });
      }
      return waypoints;
    }

    buildBypassRoute(dep, dest, vessel, totalDistNM) {
      const steps = 14;
      const waypoints = [];
      const lateralBypass = (dest.lon - dep.lon > 0 ? 1 : -1) * 32;

      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        let lat = dep.lat + (dest.lat - dep.lat) * frac;
        let lon = dep.lon + (dest.lon - dep.lon) * frac;
        if (frac > 0.15 && frac < 0.85) {
          lon += lateralBypass * Math.sin((frac - 0.15) / 0.70 * Math.PI);
        }
        const sic = lat < -68 ? 40 : 0;

        waypoints.push({
          idx: i + 1,
          name: i === 0 ? `DEP: ${dep.name}` : i === steps ? `ARR: ${dest.name}` : `WP-BYPASS-${i}`,
          lat: Number(lat.toFixed(3)),
          lon: Number(lon.toFixed(3)),
          sic,
          iceThicknessM: (sic / 100) * 0.6,
          speedKts: 12.5,
          distLegNM: Math.round((totalDistNM * 1.22) / steps)
        });
      }
      return waypoints;
    }

    computeRouteMetrics(waypoints, vessel, polarSpec) {
      let totalDistNM = 0;
      let totalTimeHours = 0;
      let totalFuelBurnT = 0;
      let maxSIC = 0;
      let avgSIC = 0;
      let maxResistanceKN = 0;

      waypoints.forEach((wp) => {
        totalDistNM += wp.distLegNM;
        const legHours = wp.distLegNM / wp.speedKts;
        totalTimeHours += legHours;

        const dailyRate = wp.sic > 40 ? vessel.fuelConsumptionIceTonneDay : vessel.fuelConsumptionOpenTonneDay;
        const hourlyRate = dailyRate / 24;
        
        const resistanceKN = RoutePlanner.calculateIceResistance(vessel, wp.iceThicknessM, wp.sic, wp.speedKts);
        if (resistanceKN > maxResistanceKN) maxResistanceKN = resistanceKN;

        const resistanceLoadFactor = 1.0 + (resistanceKN / 4000);
        totalFuelBurnT += hourlyRate * legHours * resistanceLoadFactor;

        if (wp.sic > maxSIC) maxSIC = wp.sic;
        avgSIC += wp.sic;
      });

      avgSIC = Math.round(avgSIC / waypoints.length);
      const transitDays = (totalTimeHours / 24).toFixed(1);

      let besetmentRiskPct = 0;
      if (maxSIC > polarSpec.maxSafeSIC) {
        besetmentRiskPct = Math.min(85, Math.round(15 + (maxSIC - polarSpec.maxSafeSIC) * 2.8));
      } else {
        besetmentRiskPct = Math.max(2, Math.round((maxSIC / polarSpec.maxSafeSIC) * 12));
      }

      const structuralRiskScore = Math.min(10, (1 + (maxResistanceKN / 600)).toFixed(1));

      return {
        totalDistNM,
        totalTimeHours: Math.round(totalTimeHours),
        transitDays,
        totalFuelBurnT: Math.round(totalFuelBurnT),
        maxSIC,
        avgSIC,
        maxResistanceKN,
        besetmentRiskPct,
        structuralRiskScore
      };
    }

    exportGeoJSON() {
      if (!this.currentPlan) return null;
      const plan = this.currentPlan;

      return {
        type: "FeatureCollection",
        metadata: {
          system: "POLARIS-AI Antarctic Decision Support System",
          vessel: plan.vessel.name,
          departure: plan.departure.name,
          destination: plan.destination.name,
          fuelSavingTons: plan.savings.fuelSavedMT,
          co2AvoidedTons: plan.savings.co2SavedMT
        },
        features: [
          {
            type: "Feature",
            properties: {
              name: "POLARIS AI-Optimized Safe & Fuel Route",
              transitDays: plan.aiMetrics.transitDays,
              fuelBurnT: plan.aiMetrics.totalFuelBurnT
            },
            geometry: {
              type: "LineString",
              coordinates: plan.aiWaypoints.map((wp) => [wp.lon, wp.lat])
            }
          }
        ]
      };
    }
  }

  // ================= 4. ICEBERG SIMULATOR ENGINE =================
  class IcebergSimulator {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
      this.state = {
        bergType: "tabular",
        massMegatons: 1100000,
        keelDepthM: 280,
        freeboardM: 40,
        lengthM: 60000,
        windSpeedKts: 28,
        windDirDeg: 240,
        currentSpeedKts: 0.85,
        currentDirDeg: 45,
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
      if (!this.canvas || !this.canvas.parentElement) return;
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
      const V_wind = s.windSpeedKts * 0.514444;
      const windRad = ((s.windDirDeg + 180) % 360) * (Math.PI / 180);
      const V_curr = s.currentSpeedKts * 0.514444;
      const currRad = (s.currentDirDeg * Math.PI) / 180;
      const V_curr_x = V_curr * Math.sin(currRad);
      const V_curr_y = V_curr * Math.cos(currRad);

      const coriolisDeflectionRad = -0.45;
      const windInducedDrift = V_wind * 0.024;
      
      const V_ice_x = (V_curr_x * 0.82) + windInducedDrift * Math.sin(windRad + coriolisDeflectionRad);
      const V_ice_y = (V_curr_y * 0.82) + windInducedDrift * Math.cos(windRad + coriolisDeflectionRad);

      const driftSpeedMs = Math.hypot(V_ice_x, V_ice_y);
      const driftSpeedKts = Number((driftSpeedMs / 0.514444).toFixed(2));
      let driftHeadingDeg = Math.round((Math.atan2(V_ice_x, V_ice_y) * (180 / Math.PI) + 360) % 360);

      const deltaT = Math.max(0, s.waterTempC - (-1.8));
      const basalMeltMDay = (0.05 + 0.12 * deltaT + 0.04 * driftSpeedMs).toFixed(2);
      const massLossTonsDay = Math.round(s.massMegatons * 1e6 * 0.0003 * (1 + deltaT));
      const rollRisk = s.keelDepthM < 60 && s.bergType !== "tabular" ? "HIGH (Capsizing Hazard)" : "STABLE";

      return {
        driftSpeedKts,
        driftHeadingDeg,
        basalMeltMDay,
        massLossTonsDay,
        rollRisk
      };
    }

    renderVectorDiagram() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const cx = this.width / 2;
      const cy = this.height / 2;

      ctx.clearRect(0, 0, this.width, this.height);

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

      // Current Force Vector (Cyan)
      const currRad = (this.state.currentDirDeg * Math.PI) / 180;
      const currLen = 50 * Math.min(2.0, this.state.currentSpeedKts);
      this.drawArrow(ctx, cx, cy, cx + currLen * Math.sin(currRad), cy - currLen * Math.cos(currRad), "#00f2fe", "F_ocean");

      // Wind Drag Vector (Yellow)
      const windRad = (((this.state.windDirDeg + 180) % 360) * Math.PI) / 180;
      const windLen = 35 * Math.min(2.0, this.state.windSpeedKts / 20);
      this.drawArrow(ctx, cx, cy, cx + windLen * Math.sin(windRad), cy - windLen * Math.cos(windRad), "#ffd600", "F_wind");

      // Coriolis Deflection (Orange)
      const corLen = 28;
      const corAngle = currRad - Math.PI / 2;
      this.drawArrow(ctx, cx, cy, cx + corLen * Math.sin(corAngle), cy - corLen * Math.cos(corAngle), "#ff9800", "F_coriolis");

      // Resultant Drift Vector (Red)
      const resRad = (driftData.driftHeadingDeg * Math.PI) / 180;
      const resLen = 75 * Math.min(2.0, driftData.driftSpeedKts);
      this.drawArrow(ctx, cx, cy, cx + resLen * Math.sin(resRad), cy - resLen * Math.cos(resRad), "#ff4757", `DRIFT: ${driftData.driftSpeedKts} kt @ ${driftData.driftHeadingDeg}°`, true);

      // Icon
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

      ctx.font = isBold ? "bold 10px 'JetBrains Mono', monospace" : "9px 'JetBrains Mono', monospace";
      ctx.fillText(label, toX + 6, toY - 4);
      ctx.restore();
    }
  }

  // ================= 5. CHARTS ENGINE =================
  class PolarisCharts {
    static renderRouteProfileChart(canvasId, waypointsAI, waypointsDirect, maxSafeSIC = 75) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width || 500;
      const h = 180;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const padLeft = 45;
      const padRight = 20;
      const padTop = 25;
      const padBottom = 30;
      const chartW = w - padLeft - padRight;
      const chartH = h - padTop - padBottom;

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let pct = 0; pct <= 100; pct += 25) {
        const y = padTop + chartH - (pct / 100) * chartH;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${pct}%`, padLeft - 6, y + 3);
      }

      // Limit Line
      const limitY = padTop + chartH - (maxSafeSIC / 100) * chartH;
      ctx.strokeStyle = "rgba(255, 82, 82, 0.7)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, limitY);
      ctx.lineTo(padLeft + chartW, limitY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff5252";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`POLAR CLASS LIMIT (${maxSafeSIC}%)`, padLeft + 6, limitY - 4);

      // Direct Route Line
      if (waypointsDirect && waypointsDirect.length > 0) {
        ctx.strokeStyle = "#ffab00";
        ctx.lineWidth = 2;
        ctx.beginPath();
        waypointsDirect.forEach((wp, idx) => {
          const x = padLeft + (idx / (waypointsDirect.length - 1)) * chartW;
          const y = padTop + chartH - (wp.sic / 100) * chartH;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      // AI Route Line with Gradient Fill
      if (waypointsAI && waypointsAI.length > 0) {
        const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
        grad.addColorStop(0, "rgba(0, 242, 254, 0.35)");
        grad.addColorStop(1, "rgba(0, 242, 254, 0.0)");

        ctx.beginPath();
        waypointsAI.forEach((wp, idx) => {
          const x = padLeft + (idx / (waypointsAI.length - 1)) * chartW;
          const y = padTop + chartH - (wp.sic / 100) * chartH;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.lineTo(padLeft + chartW, padTop + chartH);
        ctx.lineTo(padLeft, padTop + chartH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = "#00f2fe";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        waypointsAI.forEach((wp, idx) => {
          const x = padLeft + (idx / (waypointsAI.length - 1)) * chartW;
          const y = padTop + chartH - (wp.sic / 100) * chartH;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        waypointsAI.forEach((wp, idx) => {
          const x = padLeft + (idx / (waypointsAI.length - 1)) * chartW;
          const y = padTop + chartH - (wp.sic / 100) * chartH;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "9px 'Inter', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Departure Port", padLeft, padTop + chartH + 16);
      ctx.textAlign = "right";
      ctx.fillText("Antarctic Station", padLeft + chartW, padTop + chartH + 16);
    }

    static renderModelAccuracyChart(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width || 480;
      const h = 200;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const padLeft = 45;
      const padRight = 20;
      const padTop = 25;
      const padBottom = 35;
      const chartW = w - padLeft - padRight;
      const chartH = h - padTop - padBottom;

      const leadDays = ["T+1d", "T+2d", "T+3d", "T+5d", "T+7d", "T+10d", "T+14d"];
      const iceNetMAE = [3.2, 4.1, 5.0, 6.8, 8.5, 10.4, 12.8];
      const baselineSEAS5 = [6.8, 8.5, 10.2, 13.9, 17.4, 21.0, 24.6];
      const maxVal = 28;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      for (let v = 0; v <= maxVal; v += 7) {
        const y = padTop + chartH - (v / maxVal) * chartH;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${v}%`, padLeft - 6, y + 3);
      }

      ctx.strokeStyle = "rgba(255, 171, 0, 0.8)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      baselineSEAS5.forEach((val, idx) => {
        const x = padLeft + (idx / (leadDays.length - 1)) * chartW;
        const y = padTop + chartH - (val / maxVal) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "#00f2fe";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      iceNetMAE.forEach((val, idx) => {
        const x = padLeft + (idx / (leadDays.length - 1)) * chartW;
        const y = padTop + chartH - (val / maxVal) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      leadDays.forEach((day, idx) => {
        const x = padLeft + (idx / (leadDays.length - 1)) * chartW;
        const val = iceNetMAE[idx];
        const y = padTop + chartH - (val / maxVal) * chartH;

        ctx.fillStyle = "#38ef7d";
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(day, x, padTop + chartH + 16);
      });

      ctx.font = "9px 'Inter', sans-serif";
      ctx.fillStyle = "#00f2fe";
      ctx.fillText("■ IceNet 2.0 Spatiotemporal (ConvLSTM)", padLeft + 6, padTop - 8);
      ctx.fillStyle = "#ffab00";
      ctx.fillText("-- Climatology Baseline (ECMWF SEAS5)", padLeft + 220, padTop - 8);
    }
  }

  // ================= 6. DOM EVENT HANDLERS & BOOTSTRAP =================
  let polarMap = null;
  let routePlanner = null;
  let icebergSim = null;

  function initApp() {
    polarMap = new PolarMap("polarCanvas", {
      onSelectEntity: handleEntitySelect,
      onCoordHover: handleCoordHover
    });

    routePlanner = new RoutePlanner();
    icebergSim = new IcebergSimulator("driftVectorCanvas");

    polarMap.setData({
      icebergs: TRACKED_ICEBERGS,
      stations: ANTARCTIC_STATIONS,
      vessels: POLAR_VESSELS
    });

    setupTabs();
    setupGISControls();
    setupRoutePlannerControls();
    setupIcebergSimControls();
    setupDigitalTwin();
    renderSatelliteTable();
    renderStationsGrid();
    setupDemoButton();

    // Default route: Cape Town -> Maitri
    const initialPlan = routePlanner.generateRoutePlan({
      departureId: "cape_town",
      stationId: "maitri",
      vesselId: "rv_bharati",
      safetyWeight: 0.6
    });

    window.currentRoutePlan = initialPlan;
    updateRouteUI(initialPlan);
    polarMap.setData({
      icebergs: TRACKED_ICEBERGS,
      stations: ANTARCTIC_STATIONS,
      vessels: POLAR_VESSELS,
      activeRoute: initialPlan
    });

    PolarisCharts.renderRouteProfileChart("routeProfileChart", initialPlan.aiWaypoints, initialPlan.directWaypoints, 65);
    PolarisCharts.renderModelAccuracyChart("modelAccuracyChart");

    startTelemetryPulse();
  }

  function setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab-btn");
    const panes = document.querySelectorAll(".tab-pane");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.getAttribute("data-tab");
        tabs.forEach((t) => t.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        tab.classList.add("active");
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");

        if (targetId === "tab-gis") {
          setTimeout(() => polarMap.resize(), 50);
        } else if (targetId === "tab-iceberg") {
          setTimeout(() => icebergSim.resize(), 50);
        } else if (targetId === "tab-route") {
          setTimeout(() => {
            if (window.currentRoutePlan) {
              PolarisCharts.renderRouteProfileChart(
                "routeProfileChart",
                window.currentRoutePlan.aiWaypoints,
                window.currentRoutePlan.directWaypoints
              );
            }
          }, 50);
        } else if (targetId === "tab-ai") {
          setTimeout(() => PolarisCharts.renderModelAccuracyChart("modelAccuracyChart"), 50);
        }
      });
    });
  }

  function setupGISControls() {
    document.getElementById("btnZoomIn")?.addEventListener("click", () => {
      polarMap.scale = Math.min(6.0, polarMap.scale * 1.25);
    });
    document.getElementById("btnZoomOut")?.addEventListener("click", () => {
      polarMap.scale = Math.max(0.6, polarMap.scale * 0.8);
    });
    document.getElementById("btnResetMap")?.addEventListener("click", () => {
      polarMap.resetView();
    });

    document.getElementById("btnFocusA23a")?.addEventListener("click", () => {
      polarMap.focusOn(-61.25, -48.30);
      const a23a = TRACKED_ICEBERGS.find((b) => b.id === "A-23a");
      if (a23a) handleEntitySelect({ type: "iceberg", data: a23a });
    });
    document.getElementById("btnFocusWeddell")?.addEventListener("click", () => {
      polarMap.focusOn(-72.0, -45.0);
    });
    document.getElementById("btnFocusRoss")?.addEventListener("click", () => {
      polarMap.focusOn(-76.0, 175.0);
    });

    document.querySelectorAll(".layer-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layer = btn.getAttribute("data-layer");
        const isActive = btn.classList.contains("active");
        if (isActive) {
          btn.classList.remove("active");
          polarMap.setLayer(layer, false);
        } else {
          btn.classList.add("active");
          polarMap.setLayer(layer, true);
        }
      });
    });

    const timeScrubber = document.getElementById("timeScrubber");
    const scrubberText = document.getElementById("scrubberValueText");
    timeScrubber?.addEventListener("input", (e) => {
      const hours = Number(e.target.value);
      polarMap.setForecastHours(hours);
      if (hours === 0) {
        scrubberText.textContent = "NOWCAST (T+0h)";
      } else {
        const days = (hours / 24).toFixed(hours % 24 === 0 ? 0 : 1);
        scrubberText.textContent = `T+${hours}h (+${days}d)`;
      }
    });

    document.getElementById("scenarioCapeToMaitri")?.addEventListener("click", () => {
      switchToRoutePlanner("cape_town", "maitri", "rv_bharati");
    });
    document.getElementById("scenarioUshuaiaToRothera")?.addEventListener("click", () => {
      switchToRoutePlanner("ushuaia", "rothera", "rv_polarstern");
    });
    document.getElementById("scenarioHobartToMcMurdo")?.addEventListener("click", () => {
      switchToRoutePlanner("hobart", "mcmurdo", "rv_palmer");
    });
  }

  function handleCoordHover(geo) {
    if (!geo) return;
    const latEl = document.getElementById("readoutLat");
    const lonEl = document.getElementById("readoutLon");
    const sicEl = document.getElementById("readoutSIC");
    const sstEl = document.getElementById("readoutSST");

    if (latEl) latEl.textContent = `${Math.abs(geo.lat).toFixed(2)}°S`;
    if (lonEl) lonEl.textContent = geo.lon >= 0 ? `${geo.lon.toFixed(2)}°E` : `${Math.abs(geo.lon).toFixed(2)}°W`;
    if (sicEl) sicEl.textContent = `${geo.sic}%`;

    const approxSST = (Math.max(-1.8, (geo.lat + 60) * 0.45 - 1.2)).toFixed(1);
    if (sstEl) sstEl.textContent = `${approxSST}°C`;
  }

  function handleEntitySelect({ type, data }) {
    const badge = document.getElementById("inspectorTypeBadge");
    const nameEl = document.getElementById("inspectName");
    const originEl = document.getElementById("inspectOrigin");
    const areaEl = document.getElementById("inspectArea");
    const keelEl = document.getElementById("inspectKeel");
    const driftEl = document.getElementById("inspectDrift");
    const massEl = document.getElementById("inspectMass");
    const threatEl = document.getElementById("inspectThreat");
    const notesEl = document.getElementById("inspectNotes");

    if (type === "iceberg") {
      if (badge) {
        badge.textContent = `ICEBERG: ${data.threatLevel}`;
        badge.className = `threat-badge threat-${data.threatLevel.toLowerCase()}`;
      }
      if (nameEl) nameEl.textContent = data.name;
      if (originEl) originEl.textContent = `Origin: ${data.origin}`;
      if (areaEl) areaEl.textContent = `${data.areaKm2.toLocaleString()} km²`;
      if (keelEl) keelEl.textContent = `${data.thicknessM} meters`;
      if (driftEl) driftEl.textContent = `${data.driftSpeedKts} kts @ ${data.driftHeadingDeg}°`;
      if (massEl) massEl.textContent = `${(data.massMegatons / 1000).toFixed(2)} Billion Tons`;
      if (threatEl) threatEl.textContent = data.threatLevel;
      if (notesEl) notesEl.textContent = data.notes;
    } else if (type === "station") {
      if (badge) {
        badge.textContent = "ANTARCTIC RESEARCH BASE";
        badge.className = "threat-badge threat-moderate";
      }
      if (nameEl) nameEl.textContent = data.name;
      if (originEl) originEl.textContent = `Operator: ${data.country}`;
      if (areaEl) areaEl.textContent = `Coords: ${data.lat}°S, ${data.lon}°`;
      if (keelEl) keelEl.textContent = `Current Ice: ${data.sicCurrent}% SIC`;
      if (driftEl) driftEl.textContent = `Local Wind: ${data.wind}`;
      if (massEl) massEl.textContent = `Air Temp: ${data.temp}°C`;
      if (threatEl) threatEl.textContent = data.status;
      if (notesEl) notesEl.textContent = `Resupply Shipping Window: ${data.resupplyWindow}. Required Vessel Ice Class: ${data.polarClassReq}.`;
    } else if (type === "vessel") {
      if (badge) {
        badge.textContent = `VESSEL: ${data.polarClass}`;
        badge.className = "threat-badge threat-moderate";
      }
      if (nameEl) nameEl.textContent = data.name;
      if (originEl) originEl.textContent = `Flag / Operator: ${data.flag} - ${data.operator}`;
      if (areaEl) areaEl.textContent = `Displacement: ${data.displacementT.toLocaleString()} T`;
      if (keelEl) keelEl.textContent = `Hull Stress: ${data.hullStressPct}% (Impact: ${data.bowImpactKN} kN)`;
      if (driftEl) driftEl.textContent = `Speed: ${data.speedKts} kts @ ${data.heading}°`;
      if (massEl) massEl.textContent = `Engine Output: ${data.enginePowerMW} MW`;
      if (threatEl) threatEl.textContent = `Surrounding Ice: ${data.iceConcentrationSurrounding}%`;
      if (notesEl) notesEl.textContent = `Destination: ${data.destination}. Continuous icebreaking capacity: ${data.iceBreakingCapM}m solid sheet at 5 knots.`;
    }
  }

  function setupRoutePlannerControls() {
    const depSelect = document.getElementById("selectDeparture");
    const stSelect = document.getElementById("selectStation");
    const vesSelect = document.getElementById("selectVessel");
    const safetySlider = document.getElementById("safetyWeightSlider");
    const safetyValText = document.getElementById("safetyWeightVal");
    const bufferSlider = document.getElementById("icebergBufferSlider");
    const bufferValText = document.getElementById("icebergBufferVal");
    const maxSicSlider = document.getElementById("maxSicSlider");
    const maxSicValText = document.getElementById("maxSicVal");
    const computeBtn = document.getElementById("btnComputeRoute");
    const simBtn = document.getElementById("btnSimulateVoyage");
    const exportBtn = document.getElementById("btnExportGeoJSON");

    // Update ship preview card when vessel selection changes
    const updateShipPreview = (vesId) => {
      const pName = document.getElementById("routeShipPreviewName");
      const pBadge = document.getElementById("routeShipPreviewBadge");
      const pSpecs = document.getElementById("routeShipPreviewSpecs");
      if (!pName) return;

      if (vesId === "rv_polarstern") {
        pName.textContent = "R/V Polarstern (Alfred Wegener Institute)";
        pBadge.textContent = "PC-2 HEAVY ICEBREAKER";
        pSpecs.textContent = "118m Length • 17,300T Displacement • 14.7 MW Diesel-Electric • 1.5m Ice Capacity";
      } else if (vesId === "rv_att") {
        pName.textContent = "RRS Sir David Attenborough (BAS UK)";
        pBadge.textContent = "PC-4 POLAR RESEARCH VESSEL";
        pSpecs.textContent = "129m Length • 15,000T Displacement • 16.0 MW Propulsion • 1.0m Ice Capacity";
      } else if (vesId === "rv_palmer") {
        pName.textContent = "RV Nathaniel B. Palmer (USAP USA)";
        pBadge.textContent = "PC-3 ICE-STRENGTHENED VESSEL";
        pSpecs.textContent = "94m Length • 6,600T Displacement • 9.5 MW Engine • 1.0m Ice Capacity";
      } else {
        pName.textContent = "MV Bharati Resupply (NCPOR India)";
        pBadge.textContent = "PC-5 MEDIUM ICEBREAKER";
        pSpecs.textContent = "132m Length • 14,200T Displacement • 12.8 MW Propulsion • 0.8m Icebreaking";
      }
    };

    vesSelect?.addEventListener("change", (e) => {
      updateShipPreview(e.target.value);
    });

    safetySlider?.addEventListener("input", (e) => {
      const val = Number(e.target.value);
      safetyValText.textContent = `${val}% Safety / ${100 - val}% Fuel`;
    });

    bufferSlider?.addEventListener("input", (e) => {
      bufferValText.textContent = `${e.target.value} NM`;
    });

    maxSicSlider?.addEventListener("input", (e) => {
      maxSicValText.textContent = `${e.target.value}% Limit`;
    });

    const runRouteCalc = () => {
      const safetyW = Number(safetySlider.value) / 100;
      const plan = routePlanner.generateRoutePlan({
        departureId: depSelect.value,
        stationId: stSelect.value,
        vesselId: vesSelect.value,
        safetyWeight: safetyW,
        icebergAvoidanceNM: Number(bufferSlider.value),
        maxSafeSIC: Number(maxSicSlider.value)
      });

      window.currentRoutePlan = plan;
      updateRouteUI(plan);
      polarMap.setData({
        icebergs: TRACKED_ICEBERGS,
        stations: ANTARCTIC_STATIONS,
        vessels: POLAR_VESSELS,
        activeRoute: plan
      });

      PolarisCharts.renderRouteProfileChart(
        "routeProfileChart",
        plan.aiWaypoints,
        plan.directWaypoints,
        Number(maxSicSlider.value)
      );
    };

    computeBtn?.addEventListener("click", runRouteCalc);

    simBtn?.addEventListener("click", () => {
      document.getElementById("navGisTab")?.click();
      polarMap.vesselSimProgress = 0.01;
      let progress = 0.0;
      const interval = setInterval(() => {
        progress += 0.008;
        polarMap.vesselSimProgress = progress;
        if (progress >= 1.0) {
          clearInterval(interval);
          polarMap.vesselSimProgress = 1.0;
        }
      }, 40);
    });

    exportBtn?.addEventListener("click", () => {
      const geojson = routePlanner.exportGeoJSON();
      if (!geojson) return;
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `POLARIS_Voyage_${geojson.metadata.vessel.replace(/\s+/g, "_")}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function updateRouteUI(plan) {
    document.getElementById("bannerFuelSaved").textContent = `${plan.savings.fuelSavedMT} MT`;
    document.getElementById("bannerCostSaved").textContent = `$${plan.savings.fuelCostSavedUSD.toLocaleString()}`;
    document.getElementById("bannerCO2Saved").textContent = `${plan.savings.co2SavedMT} MT`;
    document.getElementById("bannerPctSaved").textContent = `${plan.savings.fuelSavingPct}%`;

    document.getElementById("aiDist").textContent = `${plan.aiMetrics.totalDistNM.toLocaleString()} NM`;
    document.getElementById("aiDays").textContent = `${plan.aiMetrics.transitDays} Days`;
    document.getElementById("aiFuel").textContent = `${plan.aiMetrics.totalFuelBurnT} MT`;
    document.getElementById("aiMaxSic").textContent = `${plan.aiMetrics.maxSIC}%`;
    document.getElementById("aiBesetment").textContent = `${plan.aiMetrics.besetmentRiskPct}% (Low)`;
    document.getElementById("aiStress").textContent = `${plan.aiMetrics.structuralRiskScore} / 10 (Safe)`;

    document.getElementById("dirDist").textContent = `${plan.directMetrics.totalDistNM.toLocaleString()} NM`;
    document.getElementById("dirDays").textContent = `${plan.directMetrics.transitDays} Days`;
    document.getElementById("dirFuel").textContent = `${plan.directMetrics.totalFuelBurnT} MT (+${Math.round(plan.savings.fuelSavingPct)}%)`;
    document.getElementById("dirMaxSic").textContent = `${plan.directMetrics.maxSIC}% (Heavy Pack)`;
    document.getElementById("dirBesetment").textContent = `${plan.directMetrics.besetmentRiskPct}% (HIGH RISK)`;
    document.getElementById("dirStress").textContent = `${plan.directMetrics.structuralRiskScore} / 10 (Critical)`;

    document.getElementById("bypDist").textContent = `${plan.bypassMetrics.totalDistNM.toLocaleString()} NM`;
    document.getElementById("bypDays").textContent = `${plan.bypassMetrics.transitDays} Days`;
    document.getElementById("bypFuel").textContent = `${plan.bypassMetrics.totalFuelBurnT} MT`;
    document.getElementById("bypMaxSic").textContent = `${plan.bypassMetrics.maxSIC}%`;
    document.getElementById("bypBesetment").textContent = `${plan.bypassMetrics.besetmentRiskPct}% (Low)`;

    const tbody = document.getElementById("waypointsTableBody");
    if (tbody) {
      tbody.innerHTML = "";
      plan.aiWaypoints.forEach((wp) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>#${wp.idx}</strong></td>
          <td>${wp.name}</td>
          <td>${Math.abs(wp.lat)}°S</td>
          <td>${wp.lon >= 0 ? wp.lon + "°E" : Math.abs(wp.lon) + "°W"}</td>
          <td><span style="color: ${wp.sic > 50 ? 'var(--accent-amber)' : 'var(--accent-cyan)'};">${wp.sic}%</span></td>
          <td>${wp.iceThicknessM.toFixed(2)} m</td>
          <td>${wp.speedKts} kts</td>
          <td>${Math.round(180 + wp.sic * 18)} kN</td>
          <td>${wp.distLegNM} NM</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  function setupIcebergSimControls() {
    const bergSelect = document.getElementById("simSelectBerg");
    const windSpeed = document.getElementById("simWindSpeedSlider");
    const windDir = document.getElementById("simWindDirSlider");
    const currSpeed = document.getElementById("simCurrentSpeedSlider");
    const currDir = document.getElementById("simCurrentDirSlider");
    const tempSlider = document.getElementById("simTempSlider");
    const leadSlider = document.getElementById("simLeadSlider");

    const windSpeedVal = document.getElementById("simWindSpeedVal");
    const windDirVal = document.getElementById("simWindDirVal");
    const currSpeedVal = document.getElementById("simCurrentSpeedVal");
    const currDirVal = document.getElementById("simCurrentDirVal");
    const tempVal = document.getElementById("simTempSpeedVal");
    const leadVal = document.getElementById("simLeadVal");

    const updateSim = () => {
      const selectedId = bergSelect.value;
      let berg = TRACKED_ICEBERGS.find((b) => b.id === selectedId);
      let mass = berg ? berg.massMegatons : 50000;
      let keel = berg ? berg.thicknessM : 180;
      let type = selectedId === "custom_pinnacle" ? "pinnacle" : "tabular";

      const driftResult = icebergSim.updateParams({
        bergType: type,
        massMegatons: mass,
        keelDepthM: keel,
        windSpeedKts: Number(windSpeed.value),
        windDirDeg: Number(windDir.value),
        currentSpeedKts: Number(currSpeed.value),
        currentDirDeg: Number(currDir.value),
        waterTempC: Number(tempSlider.value),
        forecastHours: Number(leadSlider.value)
      });

      document.getElementById("simDriftSpeed").textContent = `${driftResult.driftSpeedKts} kts`;
      document.getElementById("simDriftHeading").textContent = `Azimuth: ${driftResult.driftHeadingDeg}°`;
      document.getElementById("simBasalMelt").textContent = `${driftResult.basalMeltMDay} m/day`;
      document.getElementById("simMassLoss").textContent = `${(driftResult.massLossTonsDay / 1000).toFixed(0)}k T/day`;
      document.getElementById("simRollRisk").textContent = driftResult.rollRisk;
    };

    windSpeed?.addEventListener("input", (e) => {
      windSpeedVal.textContent = `${e.target.value} kts`;
      updateSim();
    });
    windDir?.addEventListener("input", (e) => {
      windDirVal.textContent = `${e.target.value}°`;
      updateSim();
    });
    currSpeed?.addEventListener("input", (e) => {
      currSpeedVal.textContent = `${e.target.value} kts`;
      updateSim();
    });
    currDir?.addEventListener("input", (e) => {
      currDirVal.textContent = `${e.target.value}°`;
      updateSim();
    });
    tempSlider?.addEventListener("input", (e) => {
      tempVal.textContent = `${e.target.value}°C`;
      updateSim();
    });
    leadSlider?.addEventListener("input", (e) => {
      leadVal.textContent = `${e.target.value} Hours`;
      updateSim();
    });
    bergSelect?.addEventListener("change", updateSim);

    updateSim();
  }

  function setupDigitalTwin() {
    document.getElementById("twinSelectPolarstern")?.addEventListener("click", () => {
      setDigitalTwinVessel("R/V Polarstern (AWI)", "PC-2", 1850, 185, 74, 28.4);
    });
    document.getElementById("twinSelectAttenborough")?.addEventListener("click", () => {
      setDigitalTwinVessel("RRS Sir David Attenborough (BAS)", "PC-4", 820, 95, 62, 24.1);
    });
    document.getElementById("twinSelectBharati")?.addEventListener("click", () => {
      setDigitalTwinVessel("MV Bharati Resupply (NCPOR)", "PC-5", 2150, 210, 82, 31.2);
    });
  }

  function setDigitalTwinVessel(name, polarClass, impact, stress, load, fuel) {
    document.getElementById("twinVesselBadge").textContent = `${name.toUpperCase()} (${polarClass})`;
    document.getElementById("gaugeBowImpact").textContent = `${impact.toLocaleString()} kN`;
    document.getElementById("gaugeHullStress").textContent = `${stress} MPa`;
    document.getElementById("gaugeEngineLoad").textContent = `${load}% RPM`;
    document.getElementById("gaugeFuelRate").textContent = `${fuel} MT/day`;
  }

  function startTelemetryPulse() {
    setInterval(() => {
      const impactEl = document.getElementById("gaugeBowImpact");
      const stressEl = document.getElementById("gaugeHullStress");
      if (!impactEl || !stressEl) return;

      const baseImpact = parseInt(impactEl.textContent.replace(/[^0-9]/g, ""), 10) || 1850;
      const jitterImpact = Math.round(baseImpact + (Math.random() - 0.5) * 60);
      impactEl.textContent = `${jitterImpact.toLocaleString()} kN`;

      const baseStress = parseInt(stressEl.textContent.replace(/[^0-9]/g, ""), 10) || 185;
      const jitterStress = Math.round(baseStress + (Math.random() - 0.5) * 4);
      stressEl.textContent = `${jitterStress} MPa`;
    }, 3000);
  }

  function renderSatelliteTable() {
    const tbody = document.getElementById("satelliteTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    SATELLITE_DATA_FEEDS.forEach((feed) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${feed.sensor}</strong><br><span style="font-size: 0.68rem; color: var(--text-muted);">${feed.spectrum}</span></td>
        <td>${feed.agency}</td>
        <td>${feed.resolution}</td>
        <td><span class="text-cyan">${feed.latency}</span></td>
        <td><span class="live-indicator" style="padding: 2px 8px; font-size: 0.68rem;"><span class="live-pulse-dot"></span> STREAMING</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderStationsGrid() {
    const container = document.getElementById("stationsGridContainer");
    if (!container) return;
    container.innerHTML = "";

    ANTARCTIC_STATIONS.forEach((st) => {
      const card = document.createElement("div");
      card.className = "station-station-card";
      card.innerHTML = `
        <div class="station-name-row">
          <div>
            <div class="station-title">${st.name}</div>
            <div class="station-country">${st.country}</div>
          </div>
          <span class="threat-badge threat-moderate">${st.polarClassReq}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.76rem; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Ice Condition:</span>
            <span class="text-cyan">${st.iceCondition}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Current SIC:</span>
            <strong style="color: ${st.sicCurrent > 70 ? 'var(--accent-coral)' : 'var(--accent-cyan)'};">${st.sicCurrent}%</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Weather:</span>
            <span>${st.temp}°C • ${st.wind}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Resupply Window:</span>
            <strong class="text-emerald">${st.resupplyWindow}</strong>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.08);">
            Status: ${st.status}
          </div>
        </div>
        <button class="btn-secondary" style="width: 100%; margin-top: 12px; justify-content: center;">
          Plan Resupply Route ➔
        </button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        switchToRoutePlanner("cape_town", st.id, "rv_bharati");
      });

      container.appendChild(card);
    });
  }

  function switchToRoutePlanner(depId, stId, vesId) {
    document.getElementById("navRouteTab")?.click();
    const dep = document.getElementById("selectDeparture");
    const st = document.getElementById("selectStation");
    const ves = document.getElementById("selectVessel");

    if (dep) dep.value = depId;
    if (st) st.value = stId;
    if (ves) ves.value = vesId;

    document.getElementById("btnComputeRoute")?.click();
  }

  function setupDemoButton() {
    document.getElementById("quickDemoBtn")?.addEventListener("click", () => {
      switchToRoutePlanner("cape_town", "maitri", "rv_bharati");
      setTimeout(() => {
        document.getElementById("btnSimulateVoyage")?.click();
      }, 400);
    });

    // Hero banner interactive buttons
    document.getElementById("heroBtnPlanRoute")?.addEventListener("click", () => {
      document.getElementById("navRouteTab")?.click();
    });

    document.getElementById("heroBtnTrackA23a")?.addEventListener("click", () => {
      document.getElementById("navGisTab")?.click();
      document.getElementById("btnFocusA23a")?.click();
    });

    document.getElementById("heroBtnHullTwin")?.addEventListener("click", () => {
      document.getElementById("navTwinTab")?.click();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
