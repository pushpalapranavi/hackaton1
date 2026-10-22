/**
 * POLARIS-AI Master Application Controller
 * Orchestrates GIS canvas rendering, route planning, hydrodynamic iceberg simulation,
 * telemetry feeds, interactive charts, and user events.
 */

import { ANTARCTIC_STATIONS, DEPARTURE_PORTS, TRACKED_ICEBERGS, POLAR_VESSELS, SATELLITE_DATA_FEEDS } from "./data.js";
import { PolarMap } from "./polarMap.js";
import { RoutePlanner } from "./routePlanner.js";
import { IcebergSimulator } from "./icebergSim.js";
import { PolarisCharts } from "./charts.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Subsystems
  const polarMap = new PolarMap("polarCanvas", {
    onSelectEntity: handleEntitySelect,
    onCoordHover: handleCoordHover
  });

  const routePlanner = new RoutePlanner();
  const icebergSim = new IcebergSimulator("driftVectorCanvas");

  // Load initial data into polar map
  polarMap.setData({
    icebergs: TRACKED_ICEBERGS,
    stations: ANTARCTIC_STATIONS,
    vessels: POLAR_VESSELS
  });

  // Setup DOM Event Listeners & Views
  setupNavigationTabs(polarMap, icebergSim);
  setupGISControls(polarMap);
  setupRoutePlanner(polarMap, routePlanner);
  setupIcebergSim(icebergSim);
  setupDigitalTwin();
  renderSatelliteTable();
  renderStationsGrid(polarMap);
  setupDemoVoyageButton(polarMap, routePlanner);

  // Initial Route Plan calculation
  const initialPlan = routePlanner.generateRoutePlan({
    departureId: "cape_town",
    stationId: "maitri",
    vesselId: "rv_bharati",
    safetyWeight: 0.6,
    fuelWeight: 0.4
  });
  updateRouteUI(initialPlan);
  polarMap.setData({
    icebergs: TRACKED_ICEBERGS,
    stations: ANTARCTIC_STATIONS,
    vessels: POLAR_VESSELS,
    activeRoute: initialPlan
  });

  // Initial Charts
  PolarisCharts.renderRouteProfileChart(
    "routeProfileChart",
    initialPlan.aiWaypoints,
    initialPlan.directWaypoints,
    65
  );
  PolarisCharts.renderModelAccuracyChart("modelAccuracyChart");

  // Periodic Telemetry Jitter for Live HUD
  startTelemetryPulse();
});

/**
 * Tab Navigation Controller
 */
function setupNavigationTabs(polarMap, icebergSim) {
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

      // Handle resize on newly visible canvases
      if (targetId === "tab-gis") {
        setTimeout(() => polarMap.resize(), 50);
      } else if (targetId === "tab-iceberg") {
        setTimeout(() => icebergSim.resize(), 50);
      } else if (targetId === "tab-route") {
        setTimeout(() => {
          const plan = window.currentRoutePlan;
          if (plan) {
            PolarisCharts.renderRouteProfileChart(
              "routeProfileChart",
              plan.aiWaypoints,
              plan.directWaypoints
            );
          }
        }, 50);
      } else if (targetId === "tab-ai") {
        setTimeout(() => PolarisCharts.renderModelAccuracyChart("modelAccuracyChart"), 50);
      }
    });
  });
}

/**
 * Polar GIS Map Controls & Scrubber
 */
function setupGISControls(polarMap) {
  // Zoom Buttons
  document.getElementById("btnZoomIn")?.addEventListener("click", () => {
    polarMap.scale = Math.min(6.0, polarMap.scale * 1.25);
  });
  document.getElementById("btnZoomOut")?.addEventListener("click", () => {
    polarMap.scale = Math.max(0.6, polarMap.scale * 0.8);
  });
  document.getElementById("btnResetMap")?.addEventListener("click", () => {
    polarMap.resetView();
  });

  // Focus shortcuts
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

  // Layer Toggles
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

  // Forecast Scrubber
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

  // Scenario Buttons
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

/**
 * Handle hover on polar map
 */
function handleCoordHover(geo) {
  const latEl = document.getElementById("readoutLat");
  const lonEl = document.getElementById("readoutLon");
  const sicEl = document.getElementById("readoutSIC");
  const sstEl = document.getElementById("readoutSST");

  if (!geo) return;
  if (latEl) latEl.textContent = `${Math.abs(geo.lat).toFixed(2)}°S`;
  if (lonEl) lonEl.textContent = geo.lon >= 0 ? `${geo.lon.toFixed(2)}°E` : `${Math.abs(geo.lon).toFixed(2)}°W`;
  if (sicEl) sicEl.textContent = `${geo.sic}%`;

  // Approximate sea surface temperature based on latitude
  const approxSST = (Math.max(-1.8, (geo.lat + 60) * 0.45 - 1.2)).toFixed(1);
  if (sstEl) sstEl.textContent = `${approxSST}°C`;
}

/**
 * Handle selection of map entities (Iceberg, Station, Vessel)
 */
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

/**
 * Route Planner Setup & Execution
 */
function setupRoutePlanner(polarMap, routePlanner) {
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

  // Slider text updates
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

  // Calculate Route Action
  const runRouteCalc = () => {
    const safetyW = Number(safetySlider.value) / 100;
    const plan = routePlanner.generateRoutePlan({
      departureId: depSelect.value,
      stationId: stSelect.value,
      vesselId: vesSelect.value,
      safetyWeight: safetyW,
      fuelWeight: 1 - safetyW,
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

  // Simulate Voyage Animation
  simBtn?.addEventListener("click", () => {
    // Switch to GIS cockpit tab to watch the vessel transit
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

  // Export GeoJSON
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
  // Savings banner
  document.getElementById("bannerFuelSaved").textContent = `${plan.savings.fuelSavedMT} MT`;
  document.getElementById("bannerCostSaved").textContent = `$${plan.savings.fuelCostSavedUSD.toLocaleString()}`;
  document.getElementById("bannerCO2Saved").textContent = `${plan.savings.co2SavedMT} MT`;
  document.getElementById("bannerPctSaved").textContent = `${plan.savings.fuelSavingPct}%`;

  // AI Route Card
  document.getElementById("aiDist").textContent = `${plan.aiMetrics.totalDistNM.toLocaleString()} NM`;
  document.getElementById("aiDays").textContent = `${plan.aiMetrics.transitDays} Days`;
  document.getElementById("aiFuel").textContent = `${plan.aiMetrics.totalFuelBurnT} MT`;
  document.getElementById("aiMaxSic").textContent = `${plan.aiMetrics.maxSIC}%`;
  document.getElementById("aiBesetment").textContent = `${plan.aiMetrics.besetmentRiskPct}% (Low)`;
  document.getElementById("aiStress").textContent = `${plan.aiMetrics.structuralRiskScore} / 10 (Safe)`;

  // Direct Route Card
  document.getElementById("dirDist").textContent = `${plan.directMetrics.totalDistNM.toLocaleString()} NM`;
  document.getElementById("dirDays").textContent = `${plan.directMetrics.transitDays} Days`;
  document.getElementById("dirFuel").textContent = `${plan.directMetrics.totalFuelBurnT} MT (+${Math.round(plan.savings.fuelSavingPct)}%)`;
  document.getElementById("dirMaxSic").textContent = `${plan.directMetrics.maxSIC}% (Heavy Pack)`;
  document.getElementById("dirBesetment").textContent = `${plan.directMetrics.besetmentRiskPct}% (HIGH RISK)`;
  document.getElementById("dirStress").textContent = `${plan.directMetrics.structuralRiskScore} / 10 (Critical)`;

  // Deep Bypass Route Card
  document.getElementById("bypDist").textContent = `${plan.bypassMetrics.totalDistNM.toLocaleString()} NM`;
  document.getElementById("bypDays").textContent = `${plan.bypassMetrics.transitDays} Days`;
  document.getElementById("bypFuel").textContent = `${plan.bypassMetrics.totalFuelBurnT} MT`;
  document.getElementById("bypMaxSic").textContent = `${plan.bypassMetrics.maxSIC}%`;
  document.getElementById("bypBesetment").textContent = `${plan.bypassMetrics.besetmentRiskPct}% (Low)`;

  // Populate Waypoint Table
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

/**
 * Iceberg Hydrodynamics Simulator Setup
 */
function setupIcebergSim(icebergSim) {
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

    // Update readout metrics
    document.getElementById("simDriftSpeed").textContent = `${driftResult.driftSpeedKts} kts`;
    document.getElementById("simDriftHeading").textContent = `Azimuth: ${driftResult.driftHeadingDeg}°`;
    document.getElementById("simBasalMelt").textContent = `${driftResult.basalMeltMDay} m/day`;
    document.getElementById("simMassLoss").textContent = `${(driftResult.massLossTonsDay / 1000).toFixed(0)}k T/day`;
    document.getElementById("simRollRisk").textContent = driftResult.rollRisk;
  };

  // Bind change events
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

  // Initial calculation
  updateSim();
}

/**
 * Vessel Digital Twin HUD Setup
 */
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

/**
 * Periodic telemetry jitter for realistic HUD
 */
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

/**
 * Render Satellite & Sensor Ingestion Pipeline Table
 */
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

/**
 * Render Antarctic Stations Logistics Cards
 */
function renderStationsGrid(polarMap) {
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
          <span style="color: var(--text-muted);">Weather / Katabatic:</span>
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
      <button class="btn-secondary" style="width: 100%; margin-top: 12px; justify-content: center;" data-station-id="${st.id}">
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

/**
 * Quick Demo Voyage action button
 */
function setupDemoVoyageButton(polarMap, routePlanner) {
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
