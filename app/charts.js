// Canvas charts for Hearth Ledger — drawn with the 2D canvas API only, no
// libraries. Both charts size themselves to their element, scale for retina
// displays, and redraw from plain data, so any view can call them after it
// renders its markup.

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(10, Math.round(rect.width));
  const h = Math.max(10, Math.round(rect.height));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function fitText(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `600 ${size}px Georgia, serif`;
  while (size > 9 && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `600 ${size}px Georgia, serif`;
  }
  return size;
}

// A donut of spending by category. slices: [{label, value, color}].
// Returns true when something was drawn, false when every slice is zero.
export function drawDonut(canvas, slices, centerLabel, centerValue) {
  const { ctx, w, h } = setupCanvas(canvas);
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  const cx = w / 2;
  const cy = h / 2;
  const outer = Math.min(w, h) / 2 - 8;
  const inner = outer * 0.62;
  ctx.clearRect(0, 0, w, h);
  if (total <= 0) {
    ctx.fillStyle = '#78716c';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet this month', cx, cy);
    return false;
  }
  let angle = -Math.PI / 2;
  for (const s of slices) {
    if (s.value <= 0) continue;
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  }
  // Cut the hole and ring it.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.strokeStyle = '#faf6ef';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Centre text: label above, value below.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#57534e';
  fitText(ctx, centerLabel, inner * 1.7, 13);
  ctx.font = `600 ${Math.max(10, Math.min(15, inner * 0.16))}px system-ui, sans-serif`;
  ctx.fillText(centerLabel, cx, cy - 4);
  ctx.fillStyle = '#1c1917';
  const vSize = fitText(ctx, centerValue, inner * 1.7, 22);
  ctx.font = `700 ${vSize}px Georgia, serif`;
  ctx.fillText(centerValue, cx, cy + vSize + 2);
  return true;
}

// Grouped bars: bars: [{label, income, spent}]. Draws two bars per month —
// income in green, spending in terracotta — with a value on the tallest bar.
export function drawMonthBars(canvas, bars) {
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const padL = 52;
  const padR = 10;
  const padT = 26;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const maxV = Math.max(1, ...bars.flatMap((b) => [b.income, b.spent]));
  const niceMax = Math.ceil(maxV / 2000) * 2000;
  const y = (v) => padT + plotH - (v / niceMax) * plotH;

  // Gridlines and y labels.
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#78716c';
  for (let g = 0; g <= 4; g += 1) {
    const v = (niceMax / 4) * g;
    const gy = y(v);
    ctx.strokeStyle = g === 0 ? '#a8a29e' : '#e7e5e4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, gy);
    ctx.lineTo(w - padR, gy);
    ctx.stroke();
    ctx.fillText(`$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`, padL - 6, gy + 4);
  }

  const groupW = plotW / bars.length;
  const barW = Math.min(26, (groupW - 18) / 2);
  bars.forEach((b, i) => {
    const gx = padL + i * groupW + groupW / 2;
    // Income bar.
    ctx.fillStyle = '#1e4d3a';
    const ih = (b.income / niceMax) * plotH;
    ctx.fillRect(gx - barW - 2, y(b.income), barW, ih);
    // Spending bar.
    ctx.fillStyle = '#c2410c';
    const sh = (b.spent / niceMax) * plotH;
    ctx.fillRect(gx + 2, y(b.spent), barW, sh);
    // Month label.
    ctx.fillStyle = '#44403c';
    ctx.textAlign = 'center';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(b.label, gx, h - 8);
  });

  // Legend.
  ctx.textAlign = 'left';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#1e4d3a';
  ctx.fillRect(padL, 6, 12, 12);
  ctx.fillStyle = '#44403c';
  ctx.fillText('Income', padL + 17, 16);
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(padL + 78, 6, 12, 12);
  ctx.fillStyle = '#44403c';
  ctx.fillText('Spending', padL + 95, 16);
  return true;
}

// Horizontal bars for the biggest expenses of a month.
// rows: [{label, value}] already sorted largest first.
export function drawTopBars(canvas, rows, maxValue) {
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  if (!rows.length) return false;
  const rowH = h / rows.length;
  const barH = Math.min(18, rowH * 0.42);
  const labelW = 150;
  const valueW = 70;
  const max = Math.max(1, maxValue || rows[0].value);
  rows.forEach((r, i) => {
    const cy = i * rowH + rowH / 2;
    ctx.fillStyle = '#44403c';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    const label = r.label.length > 22 ? r.label.slice(0, 21) + '…' : r.label;
    ctx.fillText(label, 0, cy + 4);
    const barX = labelW;
    const barW = Math.max(2, ((w - labelW - valueW) * r.value) / max);
    ctx.fillStyle = r.color || '#1e4d3a';
    ctx.fillRect(barX, cy - barH / 2, barW, barH);
    ctx.fillStyle = '#1c1917';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText(`$${Math.round(r.value).toLocaleString('en-US')}`, barX + barW + 8, cy + 4);
  });
  return true;
}
