/**
 * POLARIS-AI Antarctic Maritime Dataset & State Store
 * Accurate scientific coordinates, station metadata, iceberg registries, and polar class parameters.
 */

export const ANTARCTIC_STATIONS = [
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

export const DEPARTURE_PORTS = [
  { id: "ushuaia", name: "Ushuaia, Argentina", lat: -54.801, lon: -68.303, distFactor: 1.0 },
  { id: "punta_arenas", name: "Punta Arenas, Chile", lat: -53.163, lon: -70.917, distFactor: 1.08 },
  { id: "cape_town", name: "Cape Town, South Africa", lat: -33.924, lon: 18.424, distFactor: 2.1 },
  { id: "hobart", name: "Hobart, Australia", lat: -42.882, lon: 147.327, distFactor: 1.85 },
  { id: "christchurch", name: "Christchurch / Lyttelton, NZ", lat: -43.603, lon: 172.719, distFactor: 1.7 }
];

export const TRACKED_ICEBERGS = [
  {
    id: "A-23a",
    name: "Iceberg A-23a (Megaberg)",
    origin: "Filchner-Ronne Ice Shelf (Calved 1986)",
    areaKm2: 3820,
    thicknessM: 340,
    massMegatons: 1100000,
    lat: -61.25,
    lon: -48.30,
    driftSpeedKts: 0.65,
    driftHeadingDeg: 38,
    threatLevel: "CRITICAL",
    notes: "World's largest tabular iceberg drifting into the Southern Ocean 'Iceberg Alley'. Sub-surface keel poses extreme collision and sonar hazard to Drake Passage vessels.",
    trajectoryHistory: [
      { lat: -64.10, lon: -51.20, day: -15 },
      { lat: -63.20, lon: -50.10, day: -10 },
      { lat: -62.15, lon: -49.20, day: -5 },
      { lat: -61.25, lon: -48.30, day: 0 }
    ],
    forecastTrajectory: [
      { lat: -60.30, lon: -47.10, hours: 24, prob: 98 },
      { lat: -59.40, lon: -45.90, hours: 48, prob: 92 },
      { lat: -58.35, lon: -44.50, hours: 72, prob: 84 },
      { lat: -56.80, lon: -42.80, hours: 120, prob: 71 }
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
    trajectoryHistory: [
      { lat: -58.20, lon: -41.30, day: -15 },
      { lat: -57.10, lon: -39.20, day: -10 },
      { lat: -56.30, lon: -37.80, day: -5 },
      { lat: -55.80, lon: -36.40, day: 0 }
    ],
    forecastTrajectory: [
      { lat: -55.10, lon: -35.20, hours: 24, prob: 96 },
      { lat: -54.30, lon: -33.90, hours: 48, prob: 89 },
      { lat: -53.40, lon: -32.50, hours: 72, prob: 79 }
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
    trajectoryHistory: [
      { lat: -75.60, lon: -30.50, day: -15 },
      { lat: -75.75, lon: -32.20, day: -10 },
      { lat: -75.85, lon: -33.60, day: -5 },
      { lat: -75.90, lon: -34.80, day: 0 }
    ],
    forecastTrajectory: [
      { lat: -76.05, lon: -36.10, hours: 24, prob: 95 },
      { lat: -76.15, lon: -37.50, hours: 48, prob: 88 },
      { lat: -76.25, lon: -39.00, hours: 72, prob: 81 }
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
    trajectoryHistory: [
      { lat: -73.60, lon: -107.50, day: -15 },
      { lat: -73.50, lon: -107.80, day: -10 },
      { lat: -73.45, lon: -108.00, day: -5 },
      { lat: -73.40, lon: -108.20, day: 0 }
    ],
    forecastTrajectory: [
      { lat: -73.25, lon: -108.70, hours: 24, prob: 94 },
      { lat: -73.05, lon: -109.30, hours: 48, prob: 87 },
      { lat: -72.80, lon: -110.10, hours: 72, prob: 80 }
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
    trajectoryHistory: [
      { lat: -65.50, lon: 74.80, day: -15 },
      { lat: -65.60, lon: 73.60, day: -10 },
      { lat: -65.65, lon: 72.70, day: -5 },
      { lat: -65.70, lon: 71.90, day: 0 }
    ],
    forecastTrajectory: [
      { lat: -65.75, lon: 70.90, hours: 24, prob: 97 },
      { lat: -65.80, lon: 69.80, hours: 48, prob: 90 },
      { lat: -65.82, lon: 68.60, hours: 72, prob: 82 }
    ]
  }
];

export const POLAR_VESSELS = [
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
    iceBreakingCapM: 1.5, // Continuous icebreaking at 5 kts
    fuelConsumptionOpenTonneDay: 28,
    fuelConsumptionIceTonneDay: 58,
    carbonFactor: 3.206, // MT CO2 per MT MGO
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

export const POLAR_CLASS_SPECS = {
  "PC-1": { label: "PC-1 Year-round in all polar waters", iceThickM: 3.0, maxSafeSIC: 100, resistanceFactor: 0.70 },
  "PC-2": { label: "PC-2 Year-round in moderate multi-year ice", iceThickM: 2.0, maxSafeSIC: 95, resistanceFactor: 0.82 },
  "PC-3": { label: "PC-3 Year-round in second-year ice w/ old inclusions", iceThickM: 1.5, maxSafeSIC: 85, resistanceFactor: 1.00 },
  "PC-4": { label: "PC-4 Year-round in thick first-year ice", iceThickM: 1.2, maxSafeSIC: 75, resistanceFactor: 1.22 },
  "PC-5": { label: "PC-5 Year-round in medium first-year ice", iceThickM: 0.8, maxSafeSIC: 65, resistanceFactor: 1.55 },
  "PC-6": { label: "PC-6 Summer/autumn in medium first-year ice", iceThickM: 0.6, maxSafeSIC: 50, resistanceFactor: 2.10 },
  "PC-7": { label: "PC-7 Summer/autumn in thin first-year ice", iceThickM: 0.4, maxSafeSIC: 35, resistanceFactor: 3.20 }
};

export const SATELLITE_DATA_FEEDS = [
  {
    sensor: "Sentinel-1A/B SAR",
    agency: "ESA Copernicus",
    resolution: "10m - 50m EW/IW",
    spectrum: "C-Band Radar (5.405 GHz)",
    latency: "38 mins (NRT)",
    coverage: "Antarctic Margin & Ice Shelves",
    status: "ACTIVE_STREAMING",
    metrics: "Surface roughness, Lead detection, Ice floe sizing"
  },
  {
    sensor: "AMSR2 Passive Microwave",
    agency: "JAXA GCOM-W1",
    resolution: "6.25km Grid",
    spectrum: "89.0 GHz & 36.5 GHz",
    latency: "2.1 hours",
    coverage: "Pan-Antarctic Complete Daily",
    status: "ACTIVE_STREAMING",
    metrics: "Sea Ice Concentration (0-100%), Freeze/Melt onset"
  },
  {
    sensor: "CryoSat-2 / ICESat-2",
    agency: "ESA / NASA",
    resolution: "Altimetry Profiling",
    spectrum: "Ku-band SIRAL & 532nm ATLAS LiDAR",
    latency: "12 hours",
    coverage: "Circumpolar Freeboard",
    status: "ACTIVE_STREAMING",
    metrics: "Sea Ice Thickness (SIT) & Snow Depth"
  },
  {
    sensor: "HYCOM + NCODA Oceanography",
    agency: "Global Ocean Model",
    resolution: "1/12° (~4.5km)",
    spectrum: "Hydrodynamic Baroclinic",
    latency: "6 hours assimilation",
    coverage: "Southern Ocean 50°S-85°S",
    status: "ACTIVE_STREAMING",
    metrics: "Current vectors (U/V), Salinity, SST, Dynamic Height"
  },
  {
    sensor: "ECMWF ERA5 / IFS Forecast",
    agency: "ECMWF Global",
    resolution: "0.1° (~9km)",
    spectrum: "Numerical Weather Prediction",
    latency: "Hourly forecast updates",
    coverage: "Pan-Antarctic Atmosphere",
    status: "ACTIVE_STREAMING",
    metrics: "10m Wind vectors, Surface pressure, 2m Air Temp, Swell"
  }
];
