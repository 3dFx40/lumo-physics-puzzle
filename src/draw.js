export const targets = (p) => {
  const l = p.level,
    out = [];
  p.ropes.forEach((r, index) => {
    if (r)
      out.push({
        type: "rope",
        index,
        x: (r.pointA.x + p.ball.position.x) / 2,
        y: (r.pointA.y + p.ball.position.y) / 2,
        r: 34,
      });
  });
  const spots = {
    rotate: [l.mirror ? 260 : 160, l.rampY],
    spring: [l.startX, 370],
    wind: [l.mirror ? 355 : 65, 280],
    magnet: [l.mirror ? 355 : 65, 210],
    portal: [l.startX, 390],
    gravity: [210, 205],
  };
  l.features.forEach((type) => {
    if (spots[type])
      out.push({ type, x: spots[type][0], y: spots[type][1], r: 29 });
  });
  l.gates?.masks.forEach((_, index) =>
    out.push({ type: "switch", index, x: 65 + index * 76, y: 585, r: 27 }),
  );
  return out;
};
const garden = new Image();
garden.src = "/garden.png";
const sprite = new Image();
sprite.src = "/lumo.png";
function rr(c, x, y, w, h, r, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function circle(c, x, y, r, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
function star(c, x, y, r, fill) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5,
      rad = i % 2 ? r * 0.48 : r;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}
export function draw(c, p, world, clock) {
  c.clearRect(0, 0, 420, 740);
  c.fillStyle = world.bg;
  c.fillRect(0, 0, 420, 740);
  if (garden.complete && garden.naturalWidth) {
    c.globalAlpha = 0.8;
    c.drawImage(garden, 0, 0, 420, 740);
    c.globalAlpha = 1;
    c.fillStyle = world.bg + "38";
    c.fillRect(0, 0, 420, 740);
  }
  const l = p.level,
    b = p.ball.position;
  // Quiet atmospheric pollen, independent of physics.
  for (let i = 0; i < 8; i++) {
    circle(
      c,
      30 + ((i * 67) % 390),
      230 + ((i * 79) % 480) + Math.sin(clock * 0.5 + i) * 5,
      1.5,
      "#fff9e5",
    );
  }
  if (l.features.includes("wind") && !p.flags.wind) {
    c.strokeStyle = "#8aaab660";
    c.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(85, 245 + i * 20);
      c.bezierCurveTo(160, 225 + i * 20, 250, 265 + i * 20, 335, 245 + i * 20);
      c.stroke();
    }
  }
  if (l.features.includes("magnet") && !p.flags.magnet) {
    const x = l.mirror ? 355 : 65;
    c.strokeStyle = "#aa92b044";
    for (let r = 45; r < 130; r += 28) {
      c.beginPath();
      c.arc(x, 210, r, -1.2, 1.2);
      c.stroke();
    }
  }
  if (p.ramp) {
    c.save();
    c.translate(p.ramp.position.x, p.ramp.position.y);
    c.rotate(p.ramp.angle);
    c.shadowColor = "#24493d20";
    c.shadowBlur = 12;
    c.shadowOffsetY = 6;
    rr(c, -70, -9, 140, 18, 8, world.accent);
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    rr(c, -66, -9, 132, 4, 2, "#ffffff35");
    for (let i = 0; i < 3; i++) {
      rr(c, -55 + i * 40, 0, 25, 1, 1, "#24493d12");
    }
    c.restore();
  }
  for (const guide of p.guides) {
    rr(c, guide.position.x - 6, 335, 12, 330, 5, world.accent);
    rr(c, guide.position.x - 5, 335, 3, 325, 2, "#ffffff30");
  }
  // Circuit lines explain the puzzle rather than hide its rules.
  l.gates?.masks.forEach((mask, i) => {
    c.strokeStyle = ["#b89767", "#8aaba9", "#b49aaf"][i];
    c.lineWidth = 1.5;
    c.setLineDash([3, 5]);
    mask.forEach((j) => {
      c.beginPath();
      c.moveTo(65 + i * 76, 585);
      c.lineTo(65 + i * 76, 560 - j * 12);
      c.lineTo(l.goalX - 45, 560 - j * 12);
      c.lineTo(l.goalX - 45, p.gates[j].y);
      c.stroke();
    });
    c.setLineDash([]);
  });
  for (const g of p.gates) {
    c.globalAlpha = g.closed ? 1 : 0.22;
    rr(c, g.x - 53, g.y - 7, 106, 14, 6, g.closed ? "#bd846e" : "#7ca78c");
    if (g.closed) {
      c.strokeStyle = "#efd5b8";
      c.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.moveTo(g.x - 43 + i * 20, g.y - 5);
        c.lineTo(g.x - 33 + i * 20, g.y + 5);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }
  for (const s of p.stars) {
    if (!s.got) {
      c.save();
      c.translate(s.x, s.y);
      c.rotate(Math.sin(clock * 2 + s.y) * 0.06);
      c.shadowColor = "#a88e4930";
      c.shadowBlur = 6;
      c.shadowOffsetY = 3;
      star(c, 0, 0, 13, "#e7b64a");
      c.shadowBlur = 0;
      star(c, -1, -2, 10, "#f2cc6a");
      c.restore();
    }
  }
  const gx = p.goal.x,
    gy = p.goal.y;
  c.save();
  c.shadowColor = "#26463720";
  c.shadowBlur = 14;
  c.shadowOffsetY = 6;
  rr(c, gx - 47, gy, 94, 40, 12, "#ca775a");
  c.shadowBlur = 0;
  c.shadowOffsetY = 0;
  c.fillStyle = "#e59a72";
  c.beginPath();
  c.ellipse(gx, gy, 47, 13, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#9b5844";
  c.beginPath();
  c.ellipse(gx, gy, 38, 8, 0, 0, Math.PI * 2);
  c.fill();
  star(c, gx, gy + 24, 8, "#e9ac82");
  c.restore();
  for (const r of p.ropes) {
    if (!r) continue;
    c.strokeStyle = "#967550";
    c.lineWidth = 5;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(r.pointA.x, r.pointA.y);
    c.lineTo(b.x, b.y);
    c.stroke();
    c.strokeStyle = "#d3b184";
    c.lineWidth = 2;
    c.stroke();
    circle(c, r.pointA.x, r.pointA.y, 5, "#667d68");
  }
  for (const t of targets(p)) {
    if (t.type === "rope") continue;
    const enabled =
      t.type === "switch" ? p.gates.every((g) => !g.closed) : p.flags[t.type];
    const color =
      t.type === "rotate" ? world.accent : enabled ? "#719c83" : "#fff7e5";
    c.save();
    c.shadowColor = "#24493d12";
    c.shadowBlur = 8;
    c.shadowOffsetY = 3;
    circle(c, t.x, t.y, 25, color);
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    c.fillStyle = enabled ? "#fff7e5" : "#24493d";
    c.strokeStyle = c.fillStyle;
    c.lineWidth = 3;
    c.lineCap = "round";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold 23px Arial";
    if (t.type === "rotate") c.fillText("↻", t.x, t.y + 1);
    if (t.type === "wind") c.fillText(enabled ? "−" : "≋", t.x, t.y);
    if (t.type === "magnet") c.fillText("∩", t.x, t.y);
    if (t.type === "gravity") c.fillText(enabled ? "↓" : "↑", t.x, t.y);
    if (t.type === "portal") {
      c.strokeStyle = enabled ? "#fbefd4" : "#8ca9a6";
      c.beginPath();
      c.ellipse(t.x, t.y, 12, 19, 0, 0, Math.PI * 2);
      c.stroke();
      circle(c, l.goalX, 440, 24, enabled ? "#82afa360" : "#82afa322");
    }
    if (t.type === "spring") {
      c.beginPath();
      c.moveTo(t.x - 14, t.y + 9);
      for (let i = 0; i < 5; i++)
        c.lineTo(t.x - 12 + i * 6, t.y + (i % 2 ? -8 : 8));
      c.lineTo(t.x + 16, t.y + 9);
      c.stroke();
      c.font = "bold 14px Arial";
      c.fillText(
        enabled ? (l.mirror ? "←" : "→") : l.mirror ? "→" : "←",
        t.x,
        t.y - 15,
      );
    }
    if (t.type === "switch") {
      circle(c, t.x, t.y, 11, ["#b89767", "#8aaba9", "#b49aaf"][t.index]);
      c.font = "bold 11px Arial";
      c.fillStyle = "#fff";
      c.fillText(String(t.index + 1), t.x, t.y);
    }
    c.restore();
  }
  // Lumo: visible geometry matches the collision circle exactly.
  c.save();
  c.translate(b.x, b.y);
  c.rotate(Math.max(-0.25, Math.min(0.25, p.ball.velocity.x * 0.05)));
  c.shadowColor = "#79533b30";
  c.shadowBlur = 12;
  c.shadowOffsetY = 6;
  const grad = c.createRadialGradient(-8, -10, 2, 0, 0, 25);
  grad.addColorStop(0, "#f5a478");
  grad.addColorStop(1, "#e67a55");
  circle(c, 0, 0, 21, grad);
  c.shadowBlur = 0;
  c.shadowOffsetY = 0;
  for (const x of [-8, 8]) {
    circle(c, x, -3, 6, "#fff6df");
    circle(c, x + 1, -2, 4, "#24493d");
    circle(c, x + 2, -4, 1.4, "#fff");
  }
  c.strokeStyle = "#723f32";
  c.lineWidth = 1.8;
  c.beginPath();
  c.arc(0, 5, 4, 0, Math.PI);
  c.stroke();
  circle(c, -14, 6, 3, "#e9756466");
  circle(c, 14, 6, 3, "#e9756466");
  if (sprite.complete && sprite.naturalWidth)
    c.drawImage(sprite, -25, -26, 50, 50);
  c.restore();
  c.textAlign = "center";
  c.font = "11px Heebo,Arial";
  c.fillStyle = "#708779";
  c.fillText(`${p.actions} / ${l.par} פעולות`, 210, 706);
  if (p.status === "won") {
    for (let i = 0; i < 28; i++) {
      const a = i * 2.4,
        rad = 30 + ((clock * 45 + i * 7) % 180);
      circle(
        c,
        gx + Math.cos(a) * rad,
        gy - 30 + Math.sin(a) * rad,
        2 + (i % 3),
        ["#e7b64a", "#ed815c", "#78a58c"][i % 3],
      );
    }
  }
}
