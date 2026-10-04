import assert from "node:assert/strict";
import { LEVELS } from "../src/levels.js";
import { Puzzle } from "../src/physics.js";
function replay(l, wait = 0) {
  const p = new Puzzle(l);
  let waited = false;
  for (const a of l.solution) {
    if (a.type === "waitMs") {
      p.advance(a.ms);
    } else if (a.type === "waitGate") {
      for (let k = 0; k < 1800 && p.ball.position.y < a.y; k++) p.tick();
    } else {
      if (a.type === "rope" && !waited) {
        p.advance(wait * 1000);
        waited = true;
      }
      p.interact(a.type, a.index);
    }
  }
  p.advance(12000);
  return p;
}
assert.equal(LEVELS.length, 100);
const failures = [],
  results = [];
for (const l of LEVELS) {
  assert.ok(l.par <= 6);
  let found;
  for (
    let wait = 0;
    wait <= (l.features.includes("moving") ? 8 : 0);
    wait += 0.25
  ) {
    const p = replay(l, wait);
    if (p.status === "won" && p.rating === 3) {
      found = {
        id: l.id + 1,
        wait,
        stars: p.rating,
        actions: p.actions,
        collected: p.collected,
        time: +p.time.toFixed(2),
      };
      break;
    }
  }
  if (!found) {
    const p = replay(l);
    failures.push({
      id: l.id + 1,
      recipe: l.recipe,
      ball: p.snapshot().ball,
      status: p.status,
      stars: p.rating,
      collected: p.collected,
    });
  } else results.push(found);
}
console.log(
  JSON.stringify({ solved: results.length, failures, results }, null, 2),
);
assert.equal(
  failures.length,
  0,
  "All 100 levels must have a physically verified solution",
);
