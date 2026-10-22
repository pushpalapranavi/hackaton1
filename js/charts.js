/**
 * POLARIS-AI High-Tech Canvas Data Visualization Engine
 * Custom polar charts for Sea-Ice Concentration profiles, Fuel & Carbon metrics,
 * AI Model Lead-Time MAE, and Real-time Hull Stress Telemetry.
 */

export class PolarisCharts {
  /**
   * Draw Route Ice Concentration Profile Chart
   */
  static renderRouteProfileChart(canvasId, waypointsAI, waypointsDirect, maxSafeSIC = 75) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
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

    // Grid lines
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

    // Safe SIC limit line (Red dashed)
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

    // Direct Route Line (Amber)
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

    // AI Route Line (Cyan with glow fill)
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

      // Line stroke
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

      // Points
      waypointsAI.forEach((wp, idx) => {
        const x = padLeft + (idx / (waypointsAI.length - 1)) * chartW;
        const y = padTop + chartH - (wp.sic / 100) * chartH;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // X Axis Labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "9px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Departure Port", padLeft, padTop + chartH + 16);
    ctx.textAlign = "right";
    ctx.fillText("Antarctic Station", padLeft + chartW, padTop + chartH + 16);
  }

  /**
   * Render AI Model Accuracy & Lead-Time MAE Chart
   */
  static renderModelAccuracyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
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
    const iceNetMAE = [3.2, 4.1, 5.0, 6.8, 8.5, 10.4, 12.8]; // IceNet ConvLSTM
    const baselineSEAS5 = [6.8, 8.5, 10.2, 13.9, 17.4, 21.0, 24.6]; // Climatology/SEAS5

    const maxVal = 28;

    // Grid
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

    // Baseline Curve (Dashed Grey/Amber)
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

    // IceNet 2.0 (Solid Cyan with shadow)
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

    // Data points & X-axis
    leadDays.forEach((day, idx) => {
      const x = padLeft + (idx / (leadDays.length - 1)) * chartW;
      const val = iceNetMAE[idx];
      const y = padTop + chartH - (val / maxVal) * chartH;

      ctx.fillStyle = "#38ef7d";
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // X label
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(day, x, padTop + chartH + 16);
    });

    // Legend
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = "#00f2fe";
    ctx.fillText("■ IceNet 2.0 Spatiotemporal (ConvLSTM)", padLeft + 6, padTop - 8);
    ctx.fillStyle = "#ffab00";
    ctx.fillText("-- Climatology Baseline (ECMWF SEAS5)", padLeft + 220, padTop - 8);
  }
}
