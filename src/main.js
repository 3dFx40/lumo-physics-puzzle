import "@fontsource/heebo/hebrew-500.css";
import "@fontsource/heebo/hebrew-700.css";
import "@fontsource/heebo/latin-900.css";
import "./style.css";
import { LEVELS, WORLDS } from "./levels.js";
import { Puzzle, STEP } from "./physics.js";
import { draw, targets } from "./draw.js";
import { sound } from "./audio.js";
import { Capacitor } from "@capacitor/core";
const isNative = Capacitor.isNativePlatform();
const KEY = "lumo-save-v1";
let save;
try {
  save = JSON.parse(localStorage.getItem(KEY) || "null");
} catch {}
if (!save || !Array.isArray(save.stars))
  save = { stars: Array(100).fill(0), last: 0, sound: true, haptic: true };
save.stars = Array.from({ length: 100 }, (_, i) =>
  Math.max(0, Math.min(3, Number(save.stars[i]) || 0)),
);
save.last = Math.min(99, Math.max(0, Number(save.last) || 0));
let puzzle,
  current = save.last,
  paused = false,
  overlay = null,
  shownWorld = Math.floor(current / 10),
  hint = false,
  clock = 0;
const app = document.querySelector("#app");
app.innerHTML = `<main class="shell"><aside class="intro"><div class="eyebrow">A LITTLE PUZZLE. A BIG JOURNEY.</div><div class="wordmark">LUMO<span style="color:#ed815c">.</span></div><h1>מחשבה קטנה.<br>דרך גדולה הביתה.</h1><p>שחררו חבל. סובבו גשר.<br>מצאו את הדרך של לומו הביתה.<br>פשוט להתחיל. מעניין להמשיך.</p><div class="smallline"></div><div class="meta"><div><b>100</b><span>פאזלים</span></div><div><b>10</b><span>עולמות</span></div><div><b id="total-stars">0</b><span>כוכבים שלכם</span></div></div><div class="progress-line"><i id="progress"></i></div><div class="footer-note">לגעת. לחשוב. לשחרר.</div></aside><section class="phone" aria-label="משחק לומו"><div class="hud"><button id="map" class="circle" aria-label="בחירת שלבים">☷</button><div class="hud-title"><strong>LUMO</strong><small id="level-number"></small></div><button id="restart" class="circle" aria-label="התחלה מחדש">↻</button></div><div class="board-label"><small id="world-label"></small><h2 id="level-title"></h2></div><div class="canvas-wrap"><canvas id="game" aria-label="געו בחבלים ובמנגנונים כדי להביא את לומו לבית" width="840" height="1480"></canvas></div><div class="game-bottom"><button id="hint" class="hint-pill"><b>✧</b><span id="hint-text"></span><b>?</b></button></div><div id="layers"></div></section><aside class="rail"><h3>המסע שלכם</h3><div class="world-list" id="world-list"></div><div class="tools"><button id="settings">☷ העדפות</button><button id="pause">Ⅱ הפסקה</button></div><p class="footer-note">נוצר בשביל רגע של מחשבה.<br>בלי שעון שמלחיץ. בלי חיים שנגמרים.</p></aside></main>`;
const canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d");
ctx.scale(2, 2);
const layers = document.querySelector("#layers");
new ResizeObserver(() => {
  const box = document.querySelector(".canvas-wrap").getBoundingClientRect(),
    w = Math.min(box.width, (box.height * 420) / 740);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${(w * 740) / 420}px`;
}).observe(document.querySelector(".canvas-wrap"));
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    toast("השמירה אינה זמינה בדפדפן הזה.");
  }
}
function unlocked(id) {
  return id === 0 || save.stars[id - 1] > 0 || save.stars[id] > 0;
}
function event(type) {
  sound(type, save.sound);
  if (save.haptic && ["tap", "star", "win"].includes(type))
    navigator.vibrate?.(type === "win" ? [25, 30, 35] : 12);
  if (type === "win") {
    save.stars[current] = Math.max(save.stars[current], puzzle.rating);
    save.last = current === 99 ? 99 : current + 1;
    persist();
    updateUI();
    setTimeout(() => {
      if (puzzle.status === "won" && !overlay) result();
    }, 650);
  }
  if (type === "lose")
    setTimeout(() => {
      if (puzzle.status === "lost" && !overlay) result();
    }, 400);
}
function load(id) {
  current = id;
  save.last = id;
  persist();
  puzzle = new Puzzle(LEVELS[id], event);
  hint = false;
  paused = false;
  overlay = null;
  layers.innerHTML = "";
  updateUI();
}
function updateUI() {
  const l = LEVELS[current],
    w = WORLDS[l.world];
  document.querySelector("#level-number").textContent =
    `${String(current + 1).padStart(2, "0")} / 100`;
  document.querySelector("#world-label").textContent =
    `עולם ${l.world + 1} · ${w.name}`;
  document.querySelector("#level-title").textContent = l.name;
  document.querySelector("#hint-text").textContent = hint
    ? l.hint
    : current === 0
      ? "געו בחבל. לומו כבר ימצא את הדרך."
      : "קחו רגע לחשוב · רמז בלחיצה";
  const total = save.stars.reduce((a, b) => a + b, 0);
  document.querySelector("#total-stars").textContent = total;
  document.querySelector("#progress").style.width = `${total / 3}%`;
  document.querySelector("#world-list").innerHTML = WORLDS.map(
    (w) =>
      `<button class="world-row ${w.id === l.world ? "active" : ""}" data-world="${w.id}"><div class="world-dot">${String(w.id + 1).padStart(2, "0")}</div><div><span>${w.name}</span><small>${save.stars.slice(w.id * 10, w.id * 10 + 10).reduce((a, b) => a + b, 0)} / 30 ✦</small></div></button>`,
  ).join("");
  document
    .querySelectorAll("[data-world]")
    .forEach((b) => (b.onclick = () => map(+b.dataset.world)));
}
function show(html, mode) {
  paused = true;
  overlay = mode;
  layers.innerHTML = `<div class="overlay ${mode === "result" || mode === "pause" ? "modal" : ""}">${html}</div>`;
  if (mode === "settings" && isNative) {
    document.querySelector("#install").hidden = true;
    document.querySelector("#full").hidden = true;
  }
}
function close() {
  paused = false;
  overlay = null;
  layers.innerHTML = "";
  if (puzzle.status !== "playing") result();
}
function map(w = LEVELS[current].world) {
  shownWorld = w;
  show(
    `<div class="overlay-head"><div><h2>הדרך הביתה</h2><p>עשרה עולמות. מאה רגעים של מחשבה.</p></div><button class="circle" id="close-map" aria-label="סגירה">×</button></div><div class="world-tabs">${WORLDS.map((w) => `<button data-tab="${w.id}" class="${w.id === shownWorld ? "selected" : ""}" aria-label="${w.name}">${w.id + 1}</button>`).join("")}</div><div class="map-hero"><small>עולם ${w + 1} · ${WORLDS[w].mechanic}</small><h2>${WORLDS[w].name}</h2><p>${WORLDS[w].subtitle}</p></div><div class="level-grid">${LEVELS.slice(
      w * 10,
      w * 10 + 10,
    )
      .map(
        (l) =>
          `<button class="level-tile ${l.id === current ? "current" : ""}" data-level="${l.id}" ${unlocked(l.id) ? "" : "disabled"}><b>${unlocked(l.id) ? String(l.id + 1).padStart(2, "0") : "⌁"}</b><small>${l.name}</small><span>${"★".repeat(save.stars[l.id])}${"☆".repeat(3 - save.stars[l.id])}</span></button>`,
      )
      .join(
        "",
      )}</div><button class="secondary" id="map-settings">צליל, מגע והתקנה</button>`,
    "map",
  );
  document.querySelector("#close-map").onclick = close;
  document
    .querySelectorAll("[data-tab]")
    .forEach((b) => (b.onclick = () => map(+b.dataset.tab)));
  document
    .querySelectorAll("[data-level]")
    .forEach((b) => (b.onclick = () => load(+b.dataset.level)));
  document.querySelector("#map-settings").onclick = settings;
}
function result() {
  const win = puzzle.status === "won",
    l = LEVELS[current];
  show(
    `<div class="celebrate">${win ? "★".repeat(puzzle.rating) + "☆".repeat(3 - puzzle.rating) : "↻"}</div><h2>${win ? (current === 99 ? "לומו הגיע הביתה!" : "מצאנו את הדרך!") : "רעיון חדש?"}</h2><p>${win ? (current === 99 ? "מאה פאזלים מאחוריכם. אפשר לחזור ולאסוף את כל הכוכבים." : puzzle.rating === 3 ? "פתרון נקי. כל הניצוצות בדרך." : "אפשר לנסות שוב ולמצוא פתרון נקי יותר.") : "כל ניסיון מקרב לפתרון. לומו מוכן לעוד סיבוב."}</p><div class="stat-row"><div><b>${puzzle.actions}</b><small>פעולות · יעד ${l.par}</small></div><div><b>${puzzle.collected}/3</b><small>ניצוצות</small></div></div>${win && current < 99 ? '<button class="primary" id="next">לשלב הבא ←</button>' : ""}<button class="${win ? "secondary" : "primary"}" id="again">ננסה שוב ↻</button><button class="secondary" id="result-map">בחירת שלבים</button><p style="font-size:11px">★ להגיע לבית · ★ עד ${l.par} פעולות · ★ כל הניצוצות</p>`,
    "result",
  );
  document.querySelector("#again").onclick = () => load(current);
  document.querySelector("#result-map").onclick = () => map();
  document.querySelector("#next")?.addEventListener("click", () => {
    const next = current + 1;
    load(next);
    if (next % 10 === 0) worldIntro();
  });
}
function worldIntro() {
  const w = WORLDS[LEVELS[current].world];
  show(
    `<div class="celebrate">✧</div><p>עולם ${w.id + 1} מתוך 10</p><h2>${w.name}</h2><p>${w.subtitle}<br>המכניקה החדשה: ${w.mechanic}</p><button class="primary" id="world-start">ממשיכים במסע ←</button>`,
    "pause",
  );
  document.querySelector("#world-start").onclick = close;
}
let deferredInstall;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
});
function settings() {
  show(
    `<div class="overlay-head"><h2>בקצב שלכם</h2><button class="circle" id="settings-close">×</button></div><p>רגע של מחשבה, בכל מקום.</p><button class="check-row" id="sound-toggle"><span>צלילי המשחק</span><b>${save.sound ? "פועל" : "כבוי"}</b></button><button class="check-row" id="haptic-toggle"><span>משוב במגע</span><b>${save.haptic ? "פועל" : "כבוי"}</b></button><button class="secondary" id="install">התקנה למסך הבית</button><button class="secondary" id="full">מסך מלא</button><p>ההתקדמות נשמרת במכשיר הזה באופן אוטומטי. המשחק עובד גם ללא חיבור לאחר הטעינה הראשונה.</p><p>כוכב ראשון: להגיע לבית.<br>כוכב שני: לעמוד ביעד הפעולות.<br>כוכב שלישי: לאסוף את כל שלושת הניצוצות.</p><button class="secondary" id="export">גיבוי התקדמות</button><label class="secondary" style="text-align:center;cursor:pointer">שחזור גיבוי<input type="file" id="import" accept="application/json" style="display:none"></label><p id="settings-message"></p>`,
    "settings",
  );
  document.querySelector("#settings-close").onclick = close;
  document.querySelector("#sound-toggle").onclick = () => {
    save.sound = !save.sound;
    persist();
    settings();
  };
  document.querySelector("#haptic-toggle").onclick = () => {
    save.haptic = !save.haptic;
    persist();
    settings();
  };
  document.querySelector("#install").onclick = async () => {
    if (deferredInstall) {
      await deferredInstall.prompt();
      deferredInstall = null;
    } else
      document.querySelector("#settings-message").textContent =
        "ב־Chrome ב־Android: פתחו את תפריט הדפדפן ובחרו ״הוספה למסך הבית״ או ״התקנת אפליקציה״.";
  };
  document.querySelector("#full").onclick = fullscreen;
  document.querySelector("#export").onclick = () => {
    if (isNative) {
      nativeBackup();
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(save)], { type: "application/json" }),
    );
    a.download = "lumo-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  document.querySelector("#import").onchange = async (e) => {
    try {
      const s = JSON.parse(await e.target.files[0].text());
      if (
        !Array.isArray(s.stars) ||
        s.stars.length !== 100 ||
        !s.stars.every((n) => Number.isInteger(n) && n >= 0 && n <= 3)
      )
        throw Error();
      save.stars = s.stars;
      persist();
      updateUI();
      document.querySelector("#settings-message").textContent =
        "ההתקדמות שוחזרה.";
    } catch {
      document.querySelector("#settings-message").textContent =
        "קובץ הגיבוי אינו תקין.";
    }
  };
}
function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  layers.append(el);
  setTimeout(() => el.remove(), 3000);
}
function nativeBackup() {
  show(
    '<div class="overlay-head"><h2>גיבוי ההתקדמות</h2></div><p>העתיקו את הגיבוי ושמרו אותו כקובץ טקסט. לשחזור בחרו בקובץ דרך ״שחזור גיבוי״.</p><textarea id="backup-text" readonly dir="ltr" style="width:100%;height:220px;border:0;border-radius:16px;padding:16px"></textarea><button class="primary" id="backup-copy">העתקת הגיבוי</button><button class="secondary" id="backup-back">חזרה להעדפות</button>',
    "backup",
  );
  const area = document.querySelector("#backup-text");
  area.value = JSON.stringify(save);
  document.querySelector("#backup-copy").onclick = async () => {
    area.focus();
    area.select();
    try {
      await navigator.clipboard.writeText(area.value);
      toast("הגיבוי הועתק.");
    } catch {
      toast("הטקסט מסומן. בחרו ״העתקה״ בתפריט המכשיר.");
    }
  };
  document.querySelector("#backup-back").onclick = settings;
}
function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else
    document
      .querySelector(".phone")
      .requestFullscreen?.()
      .catch(() => {});
}
document.querySelector("#map").onclick = () => map();
document.querySelector("#restart").onclick = () => load(current);
document.querySelector("#hint").onclick = () => {
  hint = !hint;
  updateUI();
};
document.querySelector("#settings").onclick = settings;
document.querySelector("#pause").onclick = () => {
  show(
    '<h2>רגע לנשום</h2><p>המסע יחכה לכם.</p><button class="primary" id="resume">חוזרים למשחק</button><button class="secondary" id="pause-settings">העדפות</button>',
    "pause",
  );
  document.querySelector("#resume").onclick = close;
  document.querySelector("#pause-settings").onclick = settings;
};
function point(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) * 420) / r.width,
    y: ((e.clientY - r.top) * 740) / r.height,
  };
}
let drag = null;
function segmentDistance(pt, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    t = Math.max(
      0,
      Math.min(
        1,
        ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / (dx * dx + dy * dy || 1),
      ),
    );
  return Math.hypot(pt.x - a.x - t * dx, pt.y - a.y - t * dy);
}
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (paused) return;
  canvas.setPointerCapture(e.pointerId);
  const pt = point(e);
  drag = pt;
  const target = targets(puzzle)
    .filter((t) => t.type !== "rope")
    .find((t) => Math.hypot(pt.x - t.x, pt.y - t.y) < t.r + 7);
  if (target) {
    puzzle.interact(target.type, target.index);
    drag = null;
    return;
  }
  puzzle.ropes.forEach((r, i) => {
    if (r && segmentDistance(pt, r.pointA, puzzle.ball.position) < 24)
      puzzle.interact("rope", i);
  });
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag || paused) return;
  const pt = point(e);
  puzzle.ropes.forEach((r, i) => {
    if (r) {
      for (let k = 0; k <= 10; k++) {
        const q = {
          x: drag.x + ((pt.x - drag.x) * k) / 10,
          y: drag.y + ((pt.y - drag.y) * k) / 10,
        };
        if (segmentDistance(q, r.pointA, puzzle.ball.position) < 10) {
          puzzle.interact("rope", i);
          break;
        }
      }
    }
  });
  drag = pt;
});
canvas.addEventListener("pointerup", () => (drag = null));
canvas.addEventListener("pointercancel", () => (drag = null));
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") load(current);
  if (e.key.toLowerCase() === "f") fullscreen();
  if (e.key === "Escape" && overlay) close();
});
window.lumoBack = () => {
  if (overlay) close();
  else map();
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !paused && puzzle.status === "playing")
    document.querySelector("#pause").click();
});
let last = 0,
  acc = 0;
function frame(now) {
  const delta = Math.min(50, now - last || 16);
  last = now;
  clock += delta / 1000;
  if (!paused) {
    acc += delta;
    while (acc >= STEP) {
      puzzle.tick();
      acc -= STEP;
    }
  }
  draw(ctx, puzzle, WORLDS[LEVELS[current].world], clock);
  requestAnimationFrame(frame);
}
load(current);
requestAnimationFrame(frame);
window.render_game_to_text = () =>
  JSON.stringify({
    mode: overlay || puzzle.status,
    paused,
    ...puzzle.snapshot(),
  });
window.advanceTime = (ms) => {
  if (!paused) puzzle.advance(ms);
  draw(ctx, puzzle, WORLDS[LEVELS[current].world], clock);
};
// Read-only data and the same interaction path for deterministic QA.
if (import.meta.env.DEV)
  window.lumoTest = {
    load,
    interact: (t, i) => puzzle.interact(t, i),
    targets: () => targets(puzzle),
    levels: LEVELS,
    get puzzle() {
      return puzzle;
    },
  };
if ("serviceWorker" in navigator && !import.meta.env.DEV)
  navigator.serviceWorker.register("/sw.js").catch(() => {});
