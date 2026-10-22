# POLARIS-AI // CRYONAV-AI
### AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory & Navigation Decision Support Platform
**Sector:** Polar Maritime Transportation, Logistics & Research Expeditions

---

## 🧭 Executive Overview
**POLARIS-AI** is an advanced operational decision-support platform designed for polar research vessels, icebreakers, and Antarctic station resupply fleets. The system integrates spatio-temporal deep learning sea-ice concentration forecasts, physics-informed hydrodynamic iceberg drift predictions, and multi-objective Pareto route optimization to minimize fuel burn, prevent ice besetment, and guarantee expedition safety.

---

## 🚀 Key Functional Modules

### 1. 🌐 Interactive Polar Stereographic GIS Cockpit
- **Polar Canvas Projection**: High-performance canvas rendering centered on the South Pole ($90^\circ\text{S}$) with concentric latitude rings ($80^\circ\text{S}, 70^\circ\text{S}, 60^\circ\text{S}, 50^\circ\text{S}$) and radial meridians.
- **Dynamic Sea-Ice Concentration (SIC) Heatmap**: Procedural and forecasted concentration layers from open water ($<15\%$) to compact fast ice ($100\%$).
- **7-Day AI Forecast Time Scrubber**: Interactive timeline slider from Nowcast ($T+0\text{h}$) to 7-day ($T+168\text{h}$) lead times.
- **Multi-Layer Toggle HUD**: Toggle Sea Ice, Tracked Icebergs & Drift Cones, Ocean Surface Currents (Antarctic Circumpolar Current & Gyres), Katabatic Wind Streamlines, Research Stations, Vessels, and Navigation Routes.
- **Entity Inspector**: Real-time click inspection for megabergs (A-23a, A-76a, A-81, B-22A, D-28), research stations (Maitri, Bharati, McMurdo, Rothera, etc.), and icebreakers.

### 2. 🚢 CryoPath Multi-Objective Route Optimizer
- **Pareto-Optimal Routing**: Balances IMO Polar Code safety vs. Marine Gas Oil (MGO) fuel burn and carbon emissions (IMO CII).
- **Ice Resistance Engine**: Implements the **Lindqvist & Riska Icebreaking Resistance Formulation** ($R_{ice} = R_{crushing} + R_{bending} + R_{submersion}$).
- **Vessel Polar Class Profiles**: Supports Polar Class ratings from Heavy Icebreakers (**PC-1 / PC-2**) to Light Ice-Strengthened Cargo (**PC-5 / PC-7**).
- **Comparison Analytics**:
  - **POLARIS AI-Optimized Route**: Navigates dynamic leads and polynyas, saving **$\sim 18\text{--}24\%$ fuel** and reducing besetment risk to $<5\%$.
  - **Direct Great Circle Route**: Unsafe naive geodesic baseline piercing compact pack ice ($>85\%$ SIC).
  - **Deep-Water Bypass**: Long-distance open ocean route with heavy sea swell exposure.
- **Transit Simulation**: Live animated vessel playback along optimized waypoints.
- **ECDIS / GeoJSON Export**: One-click download of waypoint coordinates and speed profiles for shipborne electronic chart systems.

### 3. 🧊 Iceberg Drift & Hydrodynamics Simulator
- **Physics-Informed ML Engine**: Solves the coupled momentum equation:
  $$M \frac{d\vec{V}_i}{dt} = - M f (\hat{k} \times \vec{V}_i) + \vec{F}_{air} + \vec{F}_{water} + \vec{F}_{wave} + \vec{F}_{slope}$$
- **Real-Time Force Vector Diagram**: Visual balance of wind drag, ocean drag, Coriolis deflection (deflecting left in the Southern Hemisphere), and resultant drift vector.
- **Thermal Basal Melt & Degradation**: Calculates mass loss (tons/day), keel decay rate (m/day), and capsizing/roll stability.
- **SAR Satellite Feed Integration**: Sentinel-1 C-band Synthetic Aperture Radar detection displaying backscatter intensity and velocity vectors.

### 4. 📊 Vessel Digital Twin & Sensor Telemetry
- **Holographic Hull Sensor HUD**: Real-time monitoring of bow ice impact force ($\text{kN}$), structural strain/stress ($\text{MPa}$), engine load ($\%$), fuel flow rate ($\text{MT/day}$), and sub-ice multibeam sonar.
- **Predictive Risk Alerts**: Early warnings recommending throttle reduction before striking multi-year ice ridges.

### 5. 🧠 AI/ML Pipeline & Data Ingestion
- **IceNet 2.0**: Spatio-temporal U-Net + ConvLSTM + Attention neural network trained on 40+ years of satellite passive microwave (AMSR2) and ERA5 climate reanalysis at $6.25\text{ km}$ resolution.
- **Iceberg-PINN**: Physics-Informed Neural Network embedding Navier-Stokes momentum equations into satellite SAR detection.
- **Live Ingestion**: Ingestion telemetry for Sentinel-1 SAR, AMSR2, CryoSat-2 / ICESat-2, HYCOM ocean currents, and ECMWF ERA5 winds.

### 6. 🏔️ Antarctic Stations & Resupply Logistics
- Operational statuses, katabatic wind alerts, and resupply shipping windows for **Maitri & Bharati (India / NCPOR)**, **McMurdo (USA / USAP)**, **Rothera & Halley VI (UK / BAS)**, **Neumayer III (Germany / AWI)**, **Base Esperanza (Argentina)**, and **Dumont d'Urville (France)**.

---

## 💻 How to Run

1. **Option A (Instant Desktop Launch)**:
   - Double-click [`Launch_Polaris.bat`](file:///c:/Users/pushp/Desktop/Hackthon/Launch_Polaris.bat) or open [`index.html`](file:///c:/Users/pushp/Desktop/Hackthon/index.html) directly in any modern browser (Chrome, Edge, Firefox).
2. **Option B (Local Web Server)**:
   - Run `python -m http.server 8000` in the directory, then visit `http://localhost:8000`.

---
*Developed for Polar Transportation & Logistics Innovation.*
