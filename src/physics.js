import Matter from "matter-js";
const { Engine, Bodies, Body, Constraint, Composite } = Matter;
export const STEP = 1000 / 120;
export class Puzzle {
  constructor(level, onEvent = () => {}) {
    this.level = level;
    this.onEvent = onEvent;
    this.engine = Engine.create({
      gravity: {
        x: 0,
        y: level.features.includes("gravity") ? -1 : 1,
        scale: 0.001,
      },
    });
    this.time = 0;
    this.actions = 0;
    this.status = "playing";
    this.collected = 0;
    this.flags = {};
    this.teleported = false;
    this.springed = false;
    this.particles = [];
    level.features.forEach((f) => (this.flags[f] = false));
    this.ball = Bodies.circle(level.startX, 160, 21, {
      friction: 0.002,
      frictionAir: 0.001,
      restitution: 0.18,
      density: 0.005,
    });
    Composite.add(this.engine.world, this.ball);
    this.ropes = Array.from({ length: level.ropes }, (_, i) =>
      Constraint.create({
        pointA: {
          x: level.startX + (level.ropes === 1 ? 0 : i === 0 ? -55 : 55),
          y: 70,
        },
        bodyB: this.ball,
        length: level.ropes === 1 ? 90 : Math.hypot(55, 90),
        stiffness: 0.98,
        damping: 0.04,
      }),
    );
    Composite.add(this.engine.world, this.ropes);
    this.goal = { x: level.goalX, y: 630 };
    const gateSpacing = level.advancedRelay ? 65 : level.relay ? 72 : 48;
    this.gates = level.gates
      ? level.gates.initial.map((closed, i) => ({
          closed,
          x: level.goalX,
          y: 470 + i * gateSpacing,
          body: Bodies.rectangle(level.goalX, 470 + i * gateSpacing, 106, 14, {
            isStatic: true,
          }),
        }))
      : [];
    for (const g of this.gates)
      if (g.closed) Composite.add(this.engine.world, g.body);
    if (
      level.recipe !== "drop" &&
      !level.swing &&
      !level.features.includes("spring") &&
      !level.features.includes("portal")
    ) {
      const slope = (level.goalX > level.startX ? 1 : -1) * 0.18;
      this.ramp = Bodies.rectangle(
        level.mirror ? 260 : 160,
        level.rampY,
        140,
        18,
        {
          isStatic: true,
          angle: level.features.includes("rotate") ? -slope : slope,
          friction: 0.001,
          restitution: 0,
        },
      );
      this.correctAngle = slope;
      Composite.add(this.engine.world, this.ramp);
    }
    this.guides = [];
    this.cupBodies = [
      Bodies.rectangle(this.goal.x, 661, 94, 14, { isStatic: true }),
      Bodies.rectangle(this.goal.x - 47, 643, 12, 40, { isStatic: true }),
      Bodies.rectangle(this.goal.x + 47, 643, 12, 40, { isStatic: true }),
    ];
    Composite.add(this.engine.world, this.cupBodies);
    this.stars = this.makeStars();
    this.settled = 0;
  }
  makeStars() {
    const l = this.level;
    if (l.swing)
      return [
        { x: l.mirror ? 174 : 246, y: 230 },
        { x: l.mirror ? 152 : 268, y: 380 },
        { x: l.mirror ? 128 : 292, y: 540 },
      ];
    if (l.features.includes("portal"))
      return [
        { x: l.startX, y: 260 },
        { x: l.goalX, y: 470 },
        { x: l.goalX, y: 565 },
      ];
    if (l.features.includes("spring"))
      return [
        { x: l.startX, y: 260 },
        { x: 210, y: 260 },
        { x: l.goalX, y: 565 },
      ];
    if (l.recipe === "drop") return [260, 380, 540].map((y) => ({ x: 210, y }));
    return [
      { x: l.startX, y: 230 },
      { x: 250 + (l.mirror ? -80 : 0), y: l.rampY - 8 },
      { x: l.goalX, y: 545 },
    ];
  }
  interact(type, index = 0) {
    if (this.status !== "playing") return false;
    const l = this.level;
    if (type === "rope") {
      const r = this.ropes[index];
      if (!r) return false;
      Composite.remove(this.engine.world, r);
      this.ropes[index] = null;
    } else if (type === "switch") {
      if (!l.gates?.masks[index]) return false;
      for (const i of l.gates.masks[index]) {
        const g = this.gates[i];
        g.closed = !g.closed;
        if (g.closed) Composite.add(this.engine.world, g.body);
        else Composite.remove(this.engine.world, g.body);
      }
    } else if (type in this.flags) {
      this.flags[type] = !this.flags[type];
      if (type === "rotate" && this.ramp)
        Body.setAngle(
          this.ramp,
          this.flags.rotate ? this.correctAngle : -this.correctAngle,
        );
      if (type === "gravity")
        this.engine.gravity.y = this.flags.gravity ? 1 : -1;
    } else return false;
    this.actions++;
    this.onEvent("tap");
    return true;
  }
  tick() {
    if (this.status !== "playing") return;
    this.time += STEP / 1000;
    const b = this.ball,
      l = this.level,
      free = this.ropes.every((r) => !r);
    if (l.features.includes("moving")) {
      this.goal.x = l.goalX + Math.sin(this.time * l.speed) * 60;
      this.cupBodies.forEach((body, i) =>
        Body.setPosition(body, {
          x: this.goal.x + (i === 1 ? -47 : i === 2 ? 47 : 0),
          y: body.position.y,
        }),
      );
    }
    if (free && b.position.y > 190 && b.position.y < 440) {
      if (l.features.includes("wind") && !this.flags.wind)
        Body.applyForce(b, b.position, {
          x: (l.mirror ? 1 : -1) * 0.0018,
          y: 0,
        });
      if (l.features.includes("magnet") && !this.flags.magnet)
        Body.applyForce(b, b.position, {
          x: (l.mirror ? 1 : -1) * 0.0024,
          y: -0.0003,
        });
    }
    if (
      free &&
      l.features.includes("portal") &&
      !this.teleported &&
      b.position.y > 360 &&
      b.position.y < 430 &&
      Math.abs(b.position.x - l.startX) < 65
    ) {
      if (this.flags.portal) {
        Body.setPosition(b, { x: l.goalX, y: 440 });
        Body.setVelocity(b, { x: 0, y: 3 });
        this.teleported = true;
        this.onEvent("portal");
      }
    }
    if (
      free &&
      l.features.includes("spring") &&
      !this.springed &&
      b.position.y > 340 &&
      b.position.y < 400
    ) {
      if (Math.abs(b.position.x - l.startX) < 55) {
        const vx = (l.goalX - l.startX) / 75;
        Body.setVelocity(b, { x: this.flags.spring ? vx : -vx, y: -6 });
        this.springed = true;
        this.onEvent("spring");
      }
    }
    Engine.update(this.engine, STEP);
    for (const s of this.stars) {
      if (!s.got && Math.hypot(s.x - b.position.x, s.y - b.position.y) < 44) {
        s.got = true;
        this.collected++;
        this.onEvent("star");
      }
    }
    if (
      b.position.y > 610 &&
      b.position.y < 656 &&
      Math.abs(b.position.x - this.goal.x) < 32
    ) {
      this.settled++;
      if (this.settled >= 12) {
        this.status = "won";
        this.rating =
          1 + (this.actions <= l.par ? 1 : 0) + (this.collected === 3 ? 1 : 0);
        this.onEvent("win");
      }
    } else this.settled = 0;
    if (
      b.position.y > 790 ||
      b.position.y < -150 ||
      b.position.x < -90 ||
      b.position.x > 510
    ) {
      this.status = "lost";
      this.onEvent("lose");
    }
  }
  advance(ms) {
    for (let i = 0; i < Math.round(ms / STEP); i++) this.tick();
  }
  snapshot() {
    return {
      coordinates: "420 × 740; origin top-left; x right, y down",
      level: this.level.id + 1,
      status: this.status,
      time: +this.time.toFixed(2),
      actions: this.actions,
      par: this.level.par,
      ball: {
        x: +this.ball.position.x.toFixed(1),
        y: +this.ball.position.y.toFixed(1),
        vx: +this.ball.velocity.x.toFixed(2),
        vy: +this.ball.velocity.y.toFixed(2),
      },
      goal: this.goal,
      ropes: this.ropes.map((r, i) =>
        r ? { index: i, anchor: r.pointA } : null,
      ),
      flags: this.flags,
      gates: this.gates.map((g) => ({ closed: g.closed, x: g.x, y: g.y })),
      stars: this.stars,
      rating: this.rating,
    };
  }
}
