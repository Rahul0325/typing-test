/* ==========================================================================
   A Formal Proposal — for Natallia
   ========================================================================== */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad = (n, l = 3) => String(Math.round(n)).padStart(l, "0");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const INK = "#1B1F17";
  const G = (name) => `assets/ghosts/${name}.png`;

  /* ------------------------------------------------------------------
     Smooth scroll
     ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const stopScroll = () => (lenis ? lenis.stop() : (document.body.style.overflow = "hidden"));
  const startScroll = () => (lenis ? lenis.start() : (document.body.style.overflow = ""));
  const scrollToEl = (el, offset = 0) =>
    lenis ? lenis.scrollTo(el, { offset, duration: 1.4 }) : el.scrollIntoView({ behavior: "smooth" });

  /* ------------------------------------------------------------------
     Toasts
     ------------------------------------------------------------------ */
  const toastBox = $(".toasts");
  let toastCount = 0;
  function toast(msg, label) {
    toastCount++;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <img class="toast-head" src="${G("toast")}" alt="" />
      <div>
        <div class="toast-label mono">${label || `Notice Nº ${pad(toastCount)}`}</div>
        <div class="toast-msg">${msg}</div>
      </div>`;
    toastBox.appendChild(el);
    while (toastBox.children.length > 3) toastBox.firstElementChild.remove();
    gsap.fromTo(el, { y: 50, opacity: 0, scale: 0.9, rotation: rand(-3, 3) },
      { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.8)" });
    gsap.fromTo(el.querySelector(".toast-head"), { y: 16, opacity: 0, rotation: -10 },
      { y: 0, opacity: 1, rotation: 0, duration: 0.9, delay: 0.15, ease: "back.out(2.4)" });
    gsap.to(el, { y: 20, opacity: 0, duration: 0.5, ease: "power2.in", delay: 4, onComplete: () => el.remove() });
    return el;
  }

  // An egg's ghost gets the stage to itself: shoo away any toasts still showing.
  function clearToasts() {
    [...toastBox.children].forEach((el) => {
      gsap.killTweensOf(el);
      gsap.to(el, { y: 20, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => el.remove() });
    });
  }

  /* ------------------------------------------------------------------
     Cursor
     ------------------------------------------------------------------ */
  const cursor = $(".cursor");
  const cursorLabel = $(".cursor-label");
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  if (finePointer) {
    const dotX = gsap.quickTo(".cursor-dot", "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(".cursor-dot", "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(".cursor-ring", "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(".cursor-ring", "y", { duration: 0.55, ease: "power3" });
    let dirty = true;
    addEventListener("pointermove", (e) => {
      pointer.x = e.clientX; pointer.y = e.clientY;
      dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
      dirty = true;
    });
    addEventListener("scroll", () => (dirty = true), { passive: true });
    gsap.ticker.add(() => {
      if (!dirty) return;
      dirty = false;
      const el = document.elementFromPoint(pointer.x, pointer.y);
      cursor.classList.toggle("on-dark", !!(el && el.closest(".r3, .cta, .footer, .boo-stage, .scoreboard")));
    });
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], a, button");
      if (!t) return;
      cursor.classList.add("is-hover");
      cursorLabel.textContent = t.dataset.cursor || "";
    });
    document.addEventListener("pointerout", (e) => {
      const t = e.target.closest("[data-cursor], a, button");
      if (t && !t.contains(e.relatedTarget)) cursor.classList.remove("is-hover");
    });
  }

  /* ------------------------------------------------------------------
     Loader — an intro (resolves when done) and an out
     ------------------------------------------------------------------ */
  gsap.set(".nav", { opacity: 0, y: -20 });

  // a message typed live at 100 WPM (120ms per character)
  const LOADER = {
    intro: async () => {
      const lines = $$(".type-l");
      const texts = ["Hi Natallia.", "This is 100 WPM.", "Your turn."];
      const wpm = $(".type-wpm");
      gsap.from(".type-meta, .type-foot", { opacity: 0, y: 10, duration: 0.8, ease: "power3.out" });
      await wait(600);
      for (let i = 0; i < texts.length; i++) {
        lines[i].classList.add("typing");
        for (const ch of texts[i]) {
          lines[i].textContent += ch;
          wpm.textContent = pad(100 + rand(-7, 7));
          await wait(reduce ? 10 : 120 * rand(0.55, 1.45));
        }
        wpm.textContent = "100";
        if (i < texts.length - 1) { await wait(420); lines[i].classList.remove("typing"); }
      }
      await wait(900);
    },
    out: () => gsap.timeline()
      .to(".type-l", { yPercent: -40, opacity: 0, stagger: 0.07, duration: 0.5, ease: "power3.in" })
      .to(".type-meta, .type-foot", { opacity: 0, duration: 0.3 }, "<")
      .to(".loader", { clipPath: "inset(50% 0% 50% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.1")
      .add(heroIn, "-=0.6")
      .set(".loader", { display: "none" }),
  };

  /* ------------------------------------------------------------------
     Setup (after fonts, so line splits are accurate)
     ------------------------------------------------------------------ */
  const LANDING = PROPOSAL();

  function setup() {
    LANDING.setup();

    $$("[data-split]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ln" });
      gsap.from(split.lines, {
        yPercent: 115, rotation: 2, transformOrigin: "0 100%",
        duration: 1.4, stagger: 0.1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    $$("[data-fade]").filter((el) => !el.closest(".hero")).forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
    });

    $$(".reason-num").forEach((n) => {
      gsap.fromTo(n, { yPercent: 18 }, {
        yPercent: -18, ease: "none",
        scrollTrigger: { trigger: n.closest(".reason"), start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    setupTrust();
    setupRivalry();
    setupGlass($(".glass-wrap"));
    setupCameos();
    setupPromise();
    setupFooter();
    ScrollTrigger.refresh();
  }

  function heroIn() {
    document.body.classList.remove("is-loading");
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    startScroll();
    const tl = gsap.timeline();
    LANDING.enter(tl);
    tl.to(".nav", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.3);
  }

  /* ------------------------------------------------------------------
     Landing — big serif headline, marquee, intro
     ------------------------------------------------------------------ */
  function PROPOSAL() {
    let heroLines = [];
    return {
      setup() {
        heroLines = $$(".hero-title .hl").flatMap((hl) =>
          SplitText.create(hl, { type: "lines", mask: "lines", linesClass: "ln" }).lines);
        gsap.set(heroLines, { yPercent: 115, rotation: 3, transformOrigin: "0 100%" });
        const intro = SplitText.create("[data-words]", { type: "words", wordsClass: "word" });
        gsap.to(intro.words, {
          opacity: 1, stagger: 0.1, ease: "none",
          scrollTrigger: { trigger: ".intro-text", start: "top 78%", end: "bottom 50%", scrub: true },
        });
        setupMarquee();
      },
      enter(tl) {
        tl.to(heroLines, { yPercent: 0, rotation: 0, duration: 1.6, stagger: 0.12, ease: "expo.out" }, 0)
          .to(".hero [data-fade]", { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "power3.out" }, 0.45)
          .fromTo(".hero-dot", { scale: 0, display: "inline-block", transformOrigin: "50% 80%" },
            { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.35)" }, 0.7);
      },
    };
  }

  function setupMarquee() {
    const track = $(".marquee-track");
    if (!track) return;
    let x = 0, dir = 1, half = track.scrollWidth / 2;
    addEventListener("resize", () => (half = track.scrollWidth / 2));
    const skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
    gsap.ticker.add((_, dt) => {
      const v = lenis ? lenis.velocity : 0;
      if (v > 0.5) dir = 1; else if (v < -0.5) dir = -1;
      x -= (0.045 * dt + Math.abs(v) * 0.35) * dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      gsap.set(track, { x });
      skew(gsap.utils.clamp(-8, 8, -v * 0.25));
    });
  }

  /* ------------------------------------------------------------------
     Reason 01 — friendship meter: fills to "you are here",
     then a dashed projection runs to "Actual besties"
     ------------------------------------------------------------------ */
  function setupTrust() {
    const HERE = 0.42, NEXT = 0.66; // projection only goes up one level
    const fill = $(".trust-fill"), proj = $(".trust-proj"), pin = $(".trust-pin");
    const val = $(".trust-val"), note = $(".trust-note"), ticks = $$(".trust-ticks > span");
    const marks = [0, 0.33, 0.66, 1];

    const hl = $(".mp-hl");

    ScrollTrigger.create({
      trigger: ".r1", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: (self) => {
        const p = gsap.utils.clamp(0, 1, self.progress * 1.1);
        const a = gsap.utils.clamp(0, 1, p / 0.5);
        const b = gsap.utils.clamp(0, 1, (p - 0.58) / 0.36);
        const solid = HERE * a;
        const projected = b > 0 ? HERE + (NEXT - HERE) * b : 0;
        gsap.set(fill, { scaleX: solid });
        gsap.set(proj, { scaleX: projected });
        gsap.set(pin, { left: `${solid * 100}%`, opacity: a > 0.05 ? 1 : 0 });
        gsap.set(note, { opacity: b, y: (1 - b) * 10 });
        val.textContent = b > 0 ? `042% → ${pad(42 + (NEXT - HERE) * 100 * b)}%` : `${pad(42 * a)}%`;
        ticks.forEach((t, i) => {
          t.classList.toggle("lit", solid >= marks[i] - 0.001 && a > 0);
          t.classList.toggle("soon", solid < marks[i] && projected >= marks[i] - 0.001);
        });
        // highlighter swipes in as the projection lands on the next level
        gsap.set(hl, { scaleX: gsap.utils.clamp(0, 1, (b - 0.7) / 0.3), skewX: -12 });
      },
    });
  }

  /* ------------------------------------------------------------------
     Reason 02 — the split-flap scoreboard
     ------------------------------------------------------------------ */
  function setupRivalry() {
    const me = $$(".sb-me .flap i"), her = $$(".sb-her .flap i");
    const DIGITS = "0123456789";
    const flip = (el, ch) => {
      el.textContent = ch;
      gsap.fromTo(el, { rotationX: -85, opacity: 0.4 }, { rotationX: 0, opacity: 1, duration: 0.14, ease: "power2.out" });
    };
    const spin = (el, final, steps, delay) => new Promise((res) => {
      let n = 0;
      const go = () => {
        if (n++ >= steps) { flip(el, final); return res(); }
        flip(el, DIGITS[Math.floor(Math.random() * 10)]);
        setTimeout(go, 70);
      };
      setTimeout(go, delay * 1000);
    });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.timeline()
        .from(".sb-ghost", { y: 40, rotation: -12, opacity: 0, duration: 0.9, ease: "back.out(2)" })
        .to(".sb-ghost", { y: -3, duration: 0.14, yoyo: true, repeat: 15, ease: "sine.inOut" });
      [..."100"].forEach((c, i) => spin(me[i], c, 8 + i * 4, i * 0.1));
      Promise.all(her.map((el, i) => spin(el, "?", 22 + i * 6, 0.3 + i * 0.1))).then(() => {
        gsap.fromTo(".sb-her .flaps", { scale: 1.06 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        // every few seconds her side hopefully shuffles… and lands on ??? again
        setInterval(() => her.forEach((el, i) => spin(el, "?", 6 + i * 2, i * 0.05)), 4200);
      });
    };
    ScrollTrigger.create({ trigger: ".scoreboard", start: "top 75%", onEnter: play });
  }

  /* ------------------------------------------------------------------
     Reason 03 — the matcha glass sloshes as she scrolls
     ------------------------------------------------------------------ */
  // glass geometry: rim at y=40, floor at y=388
  const GL = { TOP: 40, BOT: 388, H: 348 };
  const glassWall = (y) => { const k = (y - GL.TOP) * 0.0663; return [34 + k, 226 - k]; };
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  // a wobbly liquid surface: level y, tilt as slope, two travelling waves
  const surfaceY = (x, y, slope, amp, t) =>
    y + (x - 130) * slope + amp * Math.sin(x * 0.055 + t * 2.6) + amp * 0.45 * Math.sin(x * 0.12 - t * 3.4);
  const surfacePts = (y, slope, amp, t) => {
    const pts = [];
    for (let x = 10; x <= 250; x += 8) pts.push([x, surfaceY(x, y, slope, amp, t)]);
    return pts;
  };
  const ptsD = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y.toFixed(2)}`).join(" ");
  const iceCube = (parent, size) => {
    const g = svgEl("g", {}, parent);
    svgEl("rect", { x: -size / 2, y: -size / 2, width: size, height: size, rx: size * 0.2, fill: "#fff", opacity: 0.5 }, g);
    svgEl("path", { d: `M${-size * 0.28} ${-size * 0.22} Q${-size * 0.28} ${-size * 0.3} ${-size * 0.16} ${-size * 0.3} H${size * 0.05}`, stroke: "#fff", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.8 }, g);
    return g;
  };
  const glassGhost = (el, show) => show
    ? gsap.fromTo(el, { opacity: 0, y: 40, rotation: -20 }, { opacity: 1, y: 0, rotation: -8, duration: 1, ease: "back.out(2)", overwrite: true })
    : gsap.to(el, { opacity: 0, y: 40, duration: 0.4, overwrite: true });
  // run a per-frame loop only while reason 03 is on screen and this variant is showing
  const glassLoop = (root, tick) => {
    let onScreen = false;
    ScrollTrigger.create({ trigger: ".r3", start: "top bottom", end: "bottom top", onToggle: (s) => (onScreen = s.isActive) });
    gsap.ticker.add((time, dt) => { if (onScreen && !root.hidden) tick(time, Math.min(dt, 50) / 1000); });
  };
  const r3Progress = (fn) => {
    const st = ScrollTrigger.create({
      trigger: ".r3", start: "top top", end: "bottom bottom",
      onUpdate: (self) => fn(gsap.utils.clamp(0, 1, (self.progress - 0.05) / 0.8), self),
    });
    fn(gsap.utils.clamp(0, 1, (st.progress - 0.05) / 0.8), st);
  };

  /* the surface is a damped spring driven by scroll speed; the glass leans to the mouse */
  function setupGlass(root) {
    const q = (s) => $(s, root);
    const body = q(".gp-body"), liquid = q(".gp-liquid"), back = q(".gp-back"), surf = q(".gp-surf");
    const air = q(".gp-air"), wet = q(".gp-wet"), grad = q(".gp-grad");
    const meter = q(".gx-val"), ghost = q(".gx-ghost");
    const FULL = 0.92;
    const st = { lv: 0, lvV: 0, lvT: 0, s: 0, sV: 0, amp: 0.8, vel: 0, tilt: 0, tiltT: 0 };
    let ghostShown = false;

    const bubbles = Array.from({ length: 16 }, () => ({
      el: svgEl("circle", { r: rand(1.2, 3.2), opacity: rand(0.35, 0.7) }, q(".gp-bubbles")),
      x: rand(70, 190), y: rand(200, 388), v: rand(18, 46), ph: rand(0, 6),
    }));
    const ice = [[92, -10, 42], [138, 12, 46], [178, -4, 38]].map(([x, r, s], i) => ({ x, r, i, g: iceCube(q(".gp-ice"), s), s }));

    // condensation on the outside of the glass; now and then a drop runs down
    const dropsG = q(".gp-drops");
    const drops = Array.from({ length: 26 }, () => {
      const y = rand(70, 360), [l, r] = glassWall(y);
      return svgEl("ellipse", { cx: rand(l + 10, r - 10), cy: y, rx: rand(1.4, 3), ry: rand(1.8, 3.8), opacity: rand(0.25, 0.55) }, dropsG);
    });
    const runDrop = () => {
      if (root.hidden || reduce) return;
      const d = drops[(Math.random() * drops.length) | 0], x = +d.getAttribute("cx"), y = +d.getAttribute("cy");
      const dist = Math.min(rand(50, 150), 370 - y), trail = svgEl("line", { x1: x, y1: y, x2: x, y2: y, stroke: "#F7F3EA", "stroke-width": +d.getAttribute("rx") * 0.9, "stroke-linecap": "round", opacity: 0.28 }, dropsG);
      gsap.timeline({ onComplete: () => trail.remove() })
        .to(d, { attr: { cy: y + dist }, duration: 1.8, ease: "power2.in" })
        .to(trail, { attr: { y2: y + dist }, duration: 1.8, ease: "power2.in" }, 0)
        .to([trail, d], { opacity: 0, duration: 0.8 }, ">-0.2")
        .set(d, { attr: { cy: rand(70, 200) } })
        .to(d, { opacity: rand(0.25, 0.55), duration: 1.2 });
    };
    (function loop() { runDrop(); gsap.delayedCall(rand(1.4, 3), loop); })();

    if (finePointer && !reduce) addEventListener("pointermove", (e) => (st.tiltT = (e.clientX / innerWidth - 0.5) * 6));

    const rows = $$(".rc-row:not(.rc-bonus)");
    r3Progress((f, self) => {
      st.lvT = f * FULL;
      rows.forEach((r, i) => r.classList.toggle("lit", f >= [0.12, 0.5, 0.9][i]));
      if (self.getVelocity) st.vel = self.getVelocity();
      if (reduce) st.lv = st.lvT;
      if (f >= 0.98 && !ghostShown) glassGhost(ghost, (ghostShown = true));
      else if (f < 0.9 && ghostShown) glassGhost(ghost, (ghostShown = false));
    });

    glassLoop(root, (time, dt) => {
      if (reduce) st.vel = 0;
      // level: a stiff spring, so a hard stop overshoots a touch
      st.lvV += ((st.lvT - st.lv) * 60 - st.lvV * 11) * dt;
      st.lv = gsap.utils.clamp(0, 1, st.lv + st.lvV * dt);
      // tilt of the glass toward the mouse, and the liquid staying level against it
      st.tilt += (st.tiltT - st.tilt) * (1 - Math.exp(-dt * 3));
      const tiltSlope = -Math.tan((st.tilt * Math.PI) / 180);
      // slosh: an underdamped spring chasing the scroll speed, so it wobbles after she stops
      const target = gsap.utils.clamp(-1, 1, st.vel / 2600) * 0.17 + tiltSlope;
      st.sV += ((target - st.s) * 95 - st.sV * 5.5) * dt;
      st.s += st.sV * dt;
      st.amp += ((reduce ? 0 : 0.8 + Math.min(6, Math.abs(st.vel) / 450)) - st.amp) * (1 - Math.exp(-dt * 1.6));
      st.vel *= Math.exp(-dt * 6);

      body.setAttribute("transform", `rotate(${st.tilt.toFixed(3)} 130 392)`);
      const sy = GL.BOT - st.lv * GL.H, has = st.lv > 0.003;
      const pts = surfacePts(sy, st.s, st.amp, time), top = ptsD(pts);
      const backPts = surfacePts(sy - 7, st.s * 0.8, st.amp * 0.7, time + 1.3);
      liquid.setAttribute("d", has ? `${top} L250 440 L10 440 Z` : "");
      back.setAttribute("d", has ? `${ptsD(backPts)} L250 440 L10 440 Z` : "");
      surf.setAttribute("d", has ? top : "");
      wet.setAttribute("d", has ? `${top} L250 470 L10 470 Z` : "M0 0");
      air.setAttribute("d", has ? `M10 -500 L250 -500 L250 ${pts[pts.length - 1][1]} ${ptsD(pts.slice().reverse()).replace(/^M/, "L")} Z` : "M-100 -600 H400 V700 H-100 Z");
      grad.setAttribute("y1", sy.toFixed(1));
      grad.setAttribute("y2", GL.BOT);

      bubbles.forEach((b) => {
        b.y -= b.v * dt;
        const x = b.x + Math.sin(time * 2 + b.ph) * 2;
        if (b.y < surfaceY(x, sy, st.s, st.amp, time) + 5) {
          b.y = GL.BOT - rand(0, 12);
          const [l, r] = glassWall(b.y);
          b.x = rand(l + 12, r - 12);
        }
        b.el.setAttribute("cx", x.toFixed(1));
        b.el.setAttribute("cy", b.y.toFixed(1));
        b.el.style.display = has && st.lv > 0.08 ? "" : "none";
      });

      ice.forEach((c) => {
        const x = c.x + Math.sin(time * 0.5 + c.i * 2) * 6;
        const y = Math.min(GL.BOT - c.s / 2 - 2, surfaceY(x, sy, st.s, st.amp, time) + 6 + c.i * 3);
        const slope = (surfaceY(x + 6, sy, st.s, st.amp, time) - surfaceY(x - 6, sy, st.s, st.amp, time)) / 12;
        const r = c.r + (Math.atan(slope) * 180) / Math.PI + Math.sin(time * 1.1 + c.i) * 3;
        c.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)})`);
      });

      dropsG.style.opacity = Math.min(1, st.lv * 2.2);
      meter.textContent = pad(gsap.utils.clamp(0, 100, (st.lv / FULL) * 100));
    });
  }

  /* ------------------------------------------------------------------
     Ghost cameos
     ------------------------------------------------------------------ */
  function setupCameos() {
    gsap.to(".pin-ghost", { rotation: 6, y: -3, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "50% 100%" });
    gsap.fromTo(".oath-ghost", { opacity: 0, y: 40, rotation: 14 }, {
      opacity: 1, y: 0, rotation: 0, duration: 1.1, ease: "back.out(1.8)",
      scrollTrigger: { trigger: ".oath", start: "top 75%" },
    });
    ScrollTrigger.create({
      trigger: ".cta-row", start: "top 85%", once: true,
      onEnter: () => gsap.timeline()
        .fromTo(".cta-point", { opacity: 0, x: -40, rotation: -10 }, { opacity: 1, x: 0, rotation: 0, duration: 1, ease: "back.out(1.8)" })
        .to(".cta-point", { x: 10, duration: 0.7, yoyo: true, repeat: -1, ease: "sine.inOut" }),
    });
  }

  /* ------------------------------------------------------------------
     Milk of choice (she's lactose intolerant — every tier is dairy-free)
     ------------------------------------------------------------------ */
  const MILK = {
    oat: { color: "#EFE6D2", line: "Oat it is. Excellent taste." },
    almond: { color: "#F4EDE2", line: "Almond. Very sophisticated." },
    soy: { color: "#F3EED8", line: "Soy. A timeless classic." },
    coconut: { color: "#FBF9F3", line: "Coconut. Tropical matcha. Bold." },
  };
  let milk = localStorage.getItem("proposal-milk");
  if (!MILK[milk]) milk = "oat";
  function setMilk(m, announce) {
    milk = m;
    localStorage.setItem("proposal-milk", m);
    $$(".milk-name").forEach((e) => (e.textContent = m));
    $$(".milk-opt").forEach((b) => b.classList.toggle("on", b.dataset.milk === m));
    $$(".milk-layer, .milk-fill").forEach((e) => e.setAttribute("fill", MILK[m].color));
    $$(".milk-stop").forEach((e) => e.setAttribute("stop-color", MILK[m].color));
    if (announce) {
      toast(MILK[m].line, "Order updated");
      gsap.fromTo(".glass", { rotation: -4 }, { rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.3)", transformOrigin: "50% 100%" });
    }
  }
  setMilk(milk);
  $$(".milk-opt").forEach((b) => b.addEventListener("click", () => setMilk(b.dataset.milk, true)));

  /* ------------------------------------------------------------------
     Contract — the sneaky typing test
     ------------------------------------------------------------------ */
  const TARGET = "I solemnly swear I will take the typing test";
  const oath = $(".oath"), oathText = $(".oath-text"), input = $(".oath-input"), result = $(".result");
  input.maxLength = TARGET.length;
  oathText.innerHTML = [...TARGET].map((c) => `<span class="ch">${c}</span>`).join("") + `<span class="ch end">​</span>`;
  const chars = $$(".ch", oathText);
  let startTime = null;
  $(".oath-date").textContent = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  gsap.fromTo(".oath-line", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".oath", start: "top 80%" } });

  function renderOath() {
    const v = input.value;
    chars.forEach((ch, i) => {
      ch.classList.remove("ok", "bad", "caret");
      if (i < v.length) ch.classList.add(v[i].toLowerCase() === TARGET[i].toLowerCase() ? "ok" : "bad");
      if (i === v.length) ch.classList.add("caret");
    });
  }
  renderOath();

  oath.addEventListener("click", () => input.focus());
  input.addEventListener("focus", () => oath.classList.add("focused"));
  input.addEventListener("blur", () => oath.classList.remove("focused"));
  const PASTE_LINES = [
    "Pasting? In this economy? Type it yourself, Natallia.",
    "Two fingers is fine. Zero fingers is cheating.",
    "The ghost saw that. The ghost is disappointed.",
    "Ctrl+V is not a typing speed.",
  ];
  let pastes = 0;
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    toast(PASTE_LINES[Math.min(pastes++, PASTE_LINES.length - 1)], "Violation detected");
  });
  input.addEventListener("input", () => {
    if (input.value.length && startTime === null) startTime = performance.now();
    if (!input.value.length) startTime = null;
    renderOath();
    if (input.value.length >= TARGET.length) finishOath();
  });

  let oathVisible = false;
  ScrollTrigger.create({ trigger: ".oath", start: "top 85%", end: "bottom 15%", onToggle: (s) => (oathVisible = s.isActive) });
  addEventListener("keydown", (e) => {
    if (!oathVisible || oath.classList.contains("done") || document.activeElement === input) return;
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) input.focus();
  });

  function finishOath() {
    const minutes = Math.max(performance.now() - startTime, 800) / 60000;
    const v = input.value;
    const correct = [...v].filter((c, i) => c.toLowerCase() === TARGET[i].toLowerCase()).length;
    const accuracy = correct / TARGET.length;
    const wpm = Math.round(correct / 5 / minutes);
    if (accuracy === 1) setTimeout(() => found("oath"), 3200);

    oath.classList.add("done");
    input.blur();

    let kicker, tier;
    if (accuracy < 0.7) kicker = "That was… creative spelling.";
    else if (wpm < 25) kicker = "Slow and steady wins the matcha.";
    else if (wpm < 60) kicker = "Well, well, well. Not so slow, are we?";
    else if (wpm < 100) kicker = "Okay, who taught you to type like that?";
    else kicker = "Excuse me?? 👻";

    if (wpm >= 100) tier = "Tier III unlocked → matcha every week for a month. I'm… scared.";
    else if (wpm > 45) tier = "Tier II unlocked → 2× iced matcha + a pastry.";
    else tier = "Tier I unlocked → 1 iced matcha.";

    $(".result-kicker").textContent = kicker;
    $(".result-ghost").src = G(wpm >= 100 ? "shocked" : "cheer");
    $(".result-tier").textContent = `${tier} (${milk} milk, naturally · accuracy ${Math.round(accuracy * 100)}%)`;
    result.classList.add("show");
    ScrollTrigger.refresh();

    const num = $(".result-num"), c = { v: 0 };
    gsap.timeline()
      .fromTo(result.children, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" })
      .to(c, { v: wpm, duration: 1.8, ease: "expo.out", onUpdate: () => (num.textContent = pad(c.v, 2)) }, 0.15)
      .fromTo(".result-ghost", { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.45)" }, 1.2);

    scrollToEl(result, -120);
  }

  $(".result-retry").addEventListener("click", () => {
    input.value = ""; startTime = null;
    oath.classList.remove("done");
    renderOath();
    gsap.to(result, {
      opacity: 0, duration: 0.4, onComplete: () => {
        result.classList.remove("show"); gsap.set(result, { opacity: 1 });
        ScrollTrigger.refresh();
        scrollToEl(oath, -200);
        input.focus({ preventScroll: true });
      },
    });
  });

  /* ------------------------------------------------------------------
     CTA — magnetic button + the "No thanks" button's little journey
     ------------------------------------------------------------------ */
  const ctaBtn = $(".cta-btn");
  if (finePointer) {
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: "elastic.out(1, 0.35)" });
      });
    });
  }

  const noBtn = $(".no-btn"), noWrap = $(".no-wrap"), noZone = $(".no-zone");
  const NO_STEPS = [
    "No thanks", "Nope", "Are you sure?", "Really??", "Think of the matcha 🍵",
    "Catch me if you can", "You're persistent…", "ok fine :(",
  ];
  const LAST = NO_STEPS.length - 1;
  let dodges = 0, noPos = { x: 0, y: 0 }, carried = false, dodgeBusy = false;

  // The wrapper does the travelling; the button itself only squashes and tilts,
  // so the two never fight over the same transform.
  function dodge(e) {
    if (dodges >= LAST || carried || dodgeBusy) return;
    dodgeBusy = true;
    dodges++;
    const final = dodges === LAST, spin = dodges === 5;
    const label = NO_STEPS[dodges];

    // measure the new label so the target is clamped to the zone correctly
    const old = noBtn.textContent;
    noBtn.textContent = label;
    const w = noBtn.offsetWidth;
    noBtn.textContent = old;

    const z = noZone.getBoundingClientRect();
    const maxX = Math.max(0, z.width / 2 - w / 2), maxY = z.height / 2 + 20;
    const px = (e && e.clientX != null ? e.clientX : pointer.x) - (z.left + z.width / 2);
    const py = (e && e.clientY != null ? e.clientY : pointer.y) - (z.top + z.height / 2);
    let next = { x: 0, y: 0 };
    if (!final) {
      let best = -1;
      for (let i = 0; i < 30; i++) {
        const c = { x: rand(-maxX, maxX), y: rand(-maxY, maxY) };
        const moved = Math.hypot(c.x - noPos.x, c.y - noPos.y);
        const score = Math.hypot(c.x - px, c.y - py) + moved * 0.4 - (moved < 110 ? 1000 : 0);
        if (score > best) { best = score; next = c; }
      }
    }
    const dir = Math.sign(next.x - noPos.x) || 1;
    noPos = next;

    gsap.killTweensOf([noWrap, noBtn]);
    const dur = spin ? 0.8 : 0.5;
    const tl = gsap.timeline();
    tl.to(noBtn, { scaleX: 1.25, scaleY: 0.8, skewX: -10 * dir, duration: 0.08, ease: "power2.out" })
      .to(noWrap, { x: next.x, y: next.y, duration: dur, ease: "expo.out" }, 0)
      .to(noBtn, { rotation: final ? 0 : spin ? 360 * dir : rand(-10, 10), y: 0, duration: dur, ease: "expo.out" }, 0)
      .add(() => (noBtn.textContent = label), 0.1)
      .to(noBtn, { scaleX: 1, scaleY: 1, skewX: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" }, 0.12);
    if (spin) tl.set(noBtn, { rotation: 0 });
    if (dodges === 3) tl.to(noBtn, { rotation: "+=8", duration: 0.05, yoyo: true, repeat: 7, ease: "none" }, 0.5); // nervous
    if (final) tl.to(noBtn, { rotation: 9, y: 34, duration: 1.1, ease: "bounce.out" }, 0.35);                   // sulks

    gsap.to(ctaBtn, { scale: 1 + dodges * 0.05, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    gsap.fromTo(".cta-point", { rotation: -10 }, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });

    // short cooldown, then dodge again if the cursor is already sitting on it
    gsap.delayedCall(0.35, () => {
      dodgeBusy = false;
      if (finePointer && !final && noBtn.matches(":hover")) dodge();
    });
  }

  function carryAway() {
    carried = true;
    gsap.killTweensOf([noWrap, noBtn]);
    const r = noBtn.getBoundingClientRect();
    const carrier = document.createElement("div");
    carrier.className = "carrier";
    carrier.innerHTML = `<img class="carrier-ghost" src="${G("carrier")}" alt="" />`;
    const clone = noBtn.cloneNode(true);
    clone.removeAttribute("style");
    carrier.appendChild(clone);
    document.body.appendChild(carrier);
    const c = clone.getBoundingClientRect();
    gsap.set(carrier, { x: r.left + r.width / 2 - (c.left + c.width / 2), y: r.top + r.height / 2 - (c.top + c.height / 2) });
    gsap.set(clone, { rotation: 9 });
    noWrap.style.visibility = "hidden";
    const ghost = carrier.querySelector(".carrier-ghost");

    // point is awarded only once the ghost has flown off and its toast has had its moment
    gsap.timeline({ onComplete: () => { carrier.remove(); setTimeout(() => found("no"), 2000); } })
      .from(ghost, { x: -innerWidth * 0.6, y: -220, rotation: -12, duration: 1.1, ease: "power3.out" })
      .to(clone, { rotation: -3, duration: 0.4, ease: "back.out(3)" })
      .to(ghost, { y: -6, duration: 0.14, yoyo: true, repeat: 3, ease: "sine.inOut" }, "<")
      .add(() => toast("The ghost has confiscated the “No” button. Sorry, rules are rules.", "Update"))
      .to(carrier, { x: `+=${innerWidth * 0.8}`, y: `-=${r.top + 260}`, rotation: -10, duration: 1.8, ease: "power2.in" }, "+=0.2")
      .to(".no-note", { opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.8")
      .to(ctaBtn, { scale: "+=0.08", duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, "-=0.4");
  }

  // Plays it cool until she actually clicks it. After that, it's personal.
  if (finePointer) noBtn.addEventListener("pointerenter", (e) => dodges > 0 && dodge(e));
  noBtn.addEventListener("click", (e) => {
    if (carried) return;
    if (dodges < LAST) return dodge(e);
    carryAway();
  });

  /* ------------------------------------------------------------------
     Footer
     ------------------------------------------------------------------ */
  function setupPromise() {
    gsap.fromTo(".rc-mem-hl", { scaleX: 0, skewX: -12 }, {
      scaleX: 1, skewX: -12, duration: 0.9, ease: "expo.inOut", delay: 0.3,
      scrollTrigger: { trigger: ".rc-promise", start: "top 80%", toggleActions: "play none none reverse" },
    });
  }

  function setupFooter() {
    const letters = $$(".footer-word span");
    gsap.from(letters, {
      yPercent: 100, rotation: 10, duration: 1.4, stagger: 0.07, ease: "expo.out",
      scrollTrigger: { trigger: ".footer-word", start: "top 95%" },
    });
    letters.forEach((l) => l.addEventListener("pointerenter", () => {
      if (gsap.isTweening(l)) return;
      gsap.timeline().to(l, { yPercent: -14, rotation: rand(-8, 8), duration: 0.3, ease: "power3.out" })
        .to(l, { yPercent: 0, rotation: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
    }));
    // the b-o-o keycaps "type themselves" every few seconds
    const keys = $$(".psst kbd");
    const press = gsap.timeline({ repeat: -1, repeatDelay: 2.6, paused: true });
    keys.forEach((k, i) => press.to(k, { y: 2, borderBottomWidth: 1, color: "#F3EEE3", duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, i * 0.16));
    ScrollTrigger.create({ trigger: ".psst", start: "top bottom", onToggle: (self) => (self.isActive ? press.play() : press.pause()) });
  }
  const timeEl = $(".footer-time");
  const tick = () => (timeEl.textContent = new Date().toLocaleTimeString([], { weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  tick(); setInterval(tick, 1000);

  /* ------------------------------------------------------------------
     Easter egg: escalating clicks → BOO
     ------------------------------------------------------------------ */
  const FIRST_RUN = {
    3: "There's nothing here. Go away.",
    6: "Don't you have something better to do?",
    9: "You could be texting me right now… but you're choosing to click on this button like a mad woman.",
    12: "Natallia. I'm serious. Nothing is going to happen...",
    14: "Жопа! There is nothing here.",
    15: "Last warning. I mean it this time.",
  };
  const REPEAT_RUN = {
    3: "You've already met the ghost. Go take the test.",
    6: "The ghost is napping. Please keep it down.",
    9: "Fine. You asked for this.",
  };
  let eggClicks = 0, seenGhost = false;
  $$("[data-egg]").forEach((el) => el.addEventListener("click", () => {
    if (booActive) return;
    eggClicks++;
    gsap.fromTo(el, { rotation: 0 }, { rotation: rand(-10, 10), duration: 0.08, yoyo: true, repeat: 3, ease: "none", clearProps: "rotation" });
    const script = seenGhost ? REPEAT_RUN : FIRST_RUN;
    const booAt = seenGhost ? 10 : 16;
    if (script[eggClicks]) toast(script[eggClicks]);
    if (eggClicks >= booAt) { eggClicks = 0; boo(true); }
  }));

  const stage = $(".boo-stage"), booWord = $(".boo-word");
  let booActive = false;
  function boo(real) {
    if (booActive) return;
    booActive = true;
    seenGhost = true;
    stopScroll();
    stage.classList.add("active");
    gsap.to(".toast", { opacity: 0, y: 20, duration: 0.3, onComplete() { this.targets().forEach((t) => t.remove()); } });
    booWord.innerHTML = [..."Booooo"].map((c) => `<span>${c}</span>`).join("");
    const letters = $$("span", booWord);
    const ghost = $(".boo-ghost");

    const wobble = gsap.to(letters, {
      y: -24, duration: 0.5, ease: "sine.inOut",
      stagger: { each: 0.08, repeat: -1, yoyo: true }, paused: true,
    });
    const float = gsap.to(ghost, { y: -18, rotation: 4, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true });

    gsap.timeline()
      .set(".boo-sorry", { opacity: 0, y: 20 })
      .set(".boo-img", { opacity: 1, scale: 1 })
      .set(".boo-sorry-img", { opacity: 0 })
      .to(".boo-backdrop", { opacity: 1, duration: 0.3, ease: "power2.out" })
      .fromTo(ghost, { scale: 0.05, rotation: -40, y: 260, opacity: 1 },
        { scale: 1, rotation: 0, y: 0, duration: 0.9, ease: "back.out(1.7)" }, 0.1)
      .to(".boo-img", { scale: 1.08, transformOrigin: "50% 70%", duration: 0.22, yoyo: true, repeat: 5, ease: "sine.inOut" }, 0.5)
      .fromTo(letters, { yPercent: 130, opacity: 0, rotation: () => rand(-30, 30) },
        { yPercent: 0, opacity: 1, rotation: 0, duration: 0.8, stagger: 0.06, ease: "back.out(3)" }, 0.45)
      .add(() => { wobble.play(); float.play(); })
      .fromTo(stage, { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: "none", clearProps: "x" }, 0.5);

    const exit = () => {
      stage.removeEventListener("click", exit);
      clearTimeout(autoExit);
      wobble.kill(); float.kill();
      gsap.timeline({
        onComplete: () => {
          stage.classList.remove("active");
          booActive = false;
          startScroll();
          toast("Okay. Now go take the typing test. 🍵", "The ghost says");
          if (real) found("boo");
        },
      })
        .to(letters, { yPercent: 130, opacity: 0, stagger: 0.03, duration: 0.4, ease: "power3.in" })
        .to(ghost, { scale: 0.6, y: 20, duration: 0.6, ease: "power3.out" }, 0.1)
        .to(".boo-img", { opacity: 0, duration: 0.35 }, 0.2)
        .to(".boo-sorry-img", { opacity: 1, duration: 0.35 }, 0.2)
        .to(".boo-sorry", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.3)
        .to(ghost, { y: -innerHeight, rotation: 18, duration: 1.6, ease: "power2.in" }, 1.6)
        .to(".boo-sorry", { opacity: 0, duration: 0.4 }, 2.2)
        .to(".boo-backdrop", { opacity: 0, duration: 0.6 }, 2.5);
    };
    const autoExit = setTimeout(exit, 3400);
    setTimeout(() => stage.addEventListener("click", exit), 900);
  }

  /* ------------------------------------------------------------------
     Easter egg: type "boo" → peeking ghost
     ------------------------------------------------------------------ */
  let peeking = false;
  function peek(text = "boo!", done) {
    if (peeking || booActive) return;
    peeking = true;
    if (done) clearToasts();
    $(".peek-bubble").textContent = text;
    gsap.timeline({ onComplete: () => { peeking = false; gsap.set(".peek", { visibility: "hidden" }); done?.(); } })
      .set(".peek", { top: `${rand(26, 62)}vh`, visibility: "visible", rotation: 0, transformOrigin: "0% 50%" })
      .fromTo(".peek", { xPercent: -105 }, { xPercent: 0, duration: 0.7, ease: "back.out(1.6)" })
      .fromTo(".peek-bubble", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(3)" }, "-=0.2")
      .to(".peek", { rotation: 5, duration: 0.28, yoyo: true, repeat: 3, ease: "sine.inOut" })
      .to(".peek-bubble", { opacity: 0, scale: 0.6, duration: 0.25 }, "+=0.35")
      .to(".peek", { xPercent: -105, duration: 0.5, ease: "power3.in" });
  }

  /* Easter egg: type "kiwi" → the kiwi ghost pops up for a snack */
  const KIWI_LINES = ["did someone say kiwi? 🥝", "kiwi #2. you really love these huh", "ok this one's mine. 🥝", "no more kiwis. go take the test."];
  let kiwiOn = false, kiwiCount = 0;
  function kiwi(done) {
    if (kiwiOn || booActive) return;
    kiwiOn = true;
    if (done) clearToasts();
    $(".kiwi-bubble").textContent = KIWI_LINES[kiwiCount++ % KIWI_LINES.length];
    gsap.timeline({ onComplete: () => { kiwiOn = false; gsap.set(".kiwi", { visibility: "hidden" }); done?.(); } })
      .set(".kiwi", { visibility: "visible", left: `${rand(2, 7)}vw` }) // hug the left edge, clear of the toasts
      .fromTo(".kiwi", { yPercent: 110, rotation: -8 }, { yPercent: 4, rotation: 0, duration: 0.75, ease: "back.out(1.7)" })
      .fromTo(".kiwi-bubble", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(3)" }, "-=0.2")
      .to(".kiwi-ghost", { y: -8, scaleY: 0.96, transformOrigin: "50% 100%", duration: 0.2, yoyo: true, repeat: 7, ease: "sine.inOut" }, "<") // munch
      .to(".kiwi-bubble", { opacity: 0, scale: 0.7, duration: 0.25 }, "+=0.9")
      .to(".kiwi", { yPercent: 110, rotation: 6, duration: 0.5, ease: "power3.in" });
  }

  // Mango: the ghost leans in from the right, hugging one, and flings a few
  // spare mangoes about. (Some of us have always been on the right side.)
  const MANGO_LINES = ["a mango? from <em>you?</em> 🥭", "welcome back to the mango side.", "we don't talk about the dark years.", "fine. one more. then the test."];
  let mangoOn = false, mangoCount = 0;
  function mango(done) {
    if (mangoOn || booActive) return;
    mangoOn = true;
    if (done) clearToasts();
    const box = $(".mango");
    $(".mango-bubble").innerHTML = MANGO_LINES[mangoCount++ % MANGO_LINES.length];
    const bits = Array.from({ length: 5 }, () => {
      const b = document.createElement("span");
      b.className = "mango-bit";
      b.textContent = "🥭";
      box.appendChild(b);
      return b;
    });
    gsap.timeline({ onComplete: () => { mangoOn = false; bits.forEach((b) => b.remove()); gsap.set(box, { visibility: "hidden" }); done?.(); } })
      .set(box, { visibility: "visible", top: `${rand(22, 52)}vh` })
      .fromTo(box, { xPercent: 110, rotation: 18 }, { xPercent: 8, rotation: -10, duration: 0.9, ease: "back.out(1.6)" })
      .fromTo(".mango-bubble", { opacity: 0, scale: 0.5, rotation: 10 }, { opacity: 1, scale: 1, rotation: 10, duration: 0.45, ease: "back.out(3)" }, "-=0.25")
      .to(".mango-ghost", { rotation: 8, transformOrigin: "50% 90%", duration: 0.28, yoyo: true, repeat: 5, ease: "sine.inOut" }, "<") // happy sway
      .add(() => bits.forEach((b, i) => {
        gsap.timeline()
          .fromTo(b, { x: 0, y: 0, scale: 0.3, opacity: 1, rotation: 0 },
            { x: rand(-260, -60), y: rand(-160, -40), scale: rand(0.8, 1.2), rotation: rand(-200, 200), duration: 0.55, delay: i * 0.07, ease: "power2.out" })
          .to(b, { y: "+=" + rand(220, 340), rotation: "+=" + rand(-90, 90), opacity: 0, duration: 0.9, ease: "power2.in" });
      }), "<0.2")
      .to(".mango-bubble", { opacity: 0, scale: 0.7, duration: 0.25 }, "+=1.6")
      .to(box, { xPercent: 110, rotation: 14, duration: 0.55, ease: "power3.in" });
  }

  // Secret words, typed anywhere on the page. Stays out of the way of real typing:
  // ignored in any field, while the oath is on screen (those keys belong to the
  // sneaky typing test), with modifiers held, or while the panel is open.
  let keyBuf = "";
  addEventListener("keydown", (e) => {
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
    const t = e.target;
    const inField = t && t.closest && t.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
    if (inField || document.activeElement === input || (oathVisible && !oath.classList.contains("done"))) {
      keyBuf = "";
      return;
    }
    keyBuf = (keyBuf + e.key.toLowerCase()).slice(-8);
    // eggs are awarded once each ghost has left, so the toast never competes with it
    if (keyBuf.endsWith("boo")) { keyBuf = ""; peek("boo!", () => found("peek")); }
    else if (keyBuf.endsWith("kiwi")) { keyBuf = ""; kiwi(() => found("kiwi")); }
    else if (keyBuf.endsWith("mango")) { keyBuf = ""; mango(() => found("mango")); }
  });

  /* ------------------------------------------------------------------
     Easter egg: idle → a ghost drifts by with a matcha
     ------------------------------------------------------------------ */
  let idleTimer, drifting = false;
  const idleLines = ["just checking in…", "the test is still there", "matcha? 🍵", "boo (quietly)"];
  let idleIdx = 0;
  function drift(force) {
    if (drifting || booActive || (document.hidden && force !== true)) return resetIdle();
    drifting = true;
    $(".idle-bubble").textContent = idleLines[idleIdx++ % idleLines.length];
    const bob = gsap.to(".idle-ghost", { y: -16, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.fromTo(".idle", { x: -160, visibility: "visible", top: `${rand(18, 55)}vh` }, {
      x: innerWidth + 160, duration: 11, ease: "none",
      onComplete: () => { bob.kill(); gsap.set(".idle", { visibility: "hidden" }); drifting = false; resetIdle(); if (force !== true) found("idle"); },
    });
  }
  function resetIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(drift, 30000); }
  ["pointermove", "keydown", "wheel", "touchstart", "scroll"].forEach((ev) => addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  /* ------------------------------------------------------------------
     Easter egg: tab title
     ------------------------------------------------------------------ */
  const baseTitle = document.title;
  const awayTitles = ["👻 come back…", "🍵 the matcha is getting cold", "👻 booooo"];
  let awayIdx = 0;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? awayTitles[awayIdx++ % awayTitles.length] : baseTitle;
  });

  /* ------------------------------------------------------------------
     Easter egg counter — top right. Find all seven, earn +1 matcha.
     ------------------------------------------------------------------ */
  const EGGS = {
    boo: "The BOO. You clicked the thing that said do not click.",
    peek: "You typed “boo”. It said boo back.",
    kiwi: "Kiwi. Of course you typed kiwi.",
    mango: "Mango. Correct answer. Took you a few years, but correct.",
    idle: "You went quiet, so the ghost came to check on you.",
    no: "You tried to say no. The ghost took the button.",
    oath: "You typed the oath perfectly. Suspiciously well, actually.",
  };
  const EGG_KEY = "proposal-eggs", EGG_TOTAL = Object.keys(EGGS).length;
  let eggsFound = [];
  try { eggsFound = (JSON.parse(localStorage.getItem(EGG_KEY)) || []).filter((k) => EGGS[k]); } catch (e) { /* ignore */ }
  const eggsEl = $(".eggs"), eggsN = $(".eggs-n"), eggsDots = $(".eggs-dots");
  $(".eggs-total").textContent = EGG_TOTAL;
  eggsDots.innerHTML = Object.keys(EGGS).map(() => "<i></i>").join("");

  function renderEggs() {
    eggsN.textContent = eggsFound.length;
    $$("i", eggsDots).forEach((d, i) => d.classList.toggle("on", i < eggsFound.length));
    const all = eggsFound.length >= EGG_TOTAL;
    eggsEl.classList.toggle("all", all);
    $(".eggs-label").innerHTML = all ? "+1 matcha earned" : `Eggs <b class="eggs-n">${eggsFound.length}</b>/${EGG_TOTAL}`;
    $(".rc-bonus").hidden = !all;
    $(".rc-bonus").classList.toggle("lit", all);
  }
  renderEggs();
  gsap.set(eggsEl, { opacity: eggsFound.length ? 1 : 0.55 });

  function found(id) {
    if (!EGGS[id] || eggsFound.includes(id)) return;
    eggsFound.push(id);
    localStorage.setItem(EGG_KEY, JSON.stringify(eggsFound));
    renderEggs();
    const dot = $$("i", eggsDots)[eggsFound.length - 1];
    gsap.timeline()
      .to(eggsEl, { opacity: 1, duration: 0.2 })
      .fromTo(eggsEl, { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 0)
      .fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" }, 0.1);
    const n = eggsFound.length;
    setTimeout(() => toast(EGGS[id], `Easter egg ${n} of ${EGG_TOTAL}`), 700);
    if (n === EGG_TOTAL) setTimeout(celebrate, 2600);
  }

  // Clicking the counter gives a nudge toward an egg she hasn't found yet
  // (easiest first; repeat clicks cycle through what's left).
  const HINTS = {
    peek: "The footer has been trying to tell you something.",
    kiwi: "It shares its name with a bird. Type it. Anywhere.",
    mango: "Some people hated this fruit for a couple of years... I can't fathom why.",
    boo: "Some buttons ask you not to click them. Some people don't listen.",
    no: "Not convinced? Try saying no. Really commit to it.",
    oath: "Sign the oath. Neatly. No typos.",
    idle: "Sometimes the best move is to do nothing at all. For a while.",
  };
  let hintIdx = 0, hintEl;
  eggsEl.addEventListener("click", () => {
    const left = Object.keys(HINTS).filter((k) => !eggsFound.includes(k));
    hintEl?.remove();
    hintEl = left.length
      ? toast(HINTS[left[hintIdx++ % left.length]], `Hint · ${left.length} left`)
      : toast("You found them all. Go claim your matcha. 🍵", "No hints needed");
  });

  function celebrate() {
    const win = $(".eggs-win");
    stopScroll();
    win.classList.add("active");
    const close = () => {
      win.removeEventListener("click", close);
      gsap.to(win, { opacity: 0, duration: 0.5, onComplete: () => { win.classList.remove("active"); gsap.set(win, { clearProps: "opacity" }); startScroll(); } });
    };
    gsap.timeline()
      .fromTo(win, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(".eggs-win-card", { y: 60, scale: 0.92 }, { y: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.05)
      .fromTo(".eggs-win-ghost", { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 1.1, ease: "elastic.out(1, 0.45)" }, 0.25)
      .fromTo(".eggs-win-card > *:not(.eggs-win-ghost)", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.4)
      .add(() => win.addEventListener("click", close), 1);
    setTimeout(close, 6500);
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  const fontsReady = Promise.race([document.fonts.ready, wait(3000)]);
  Promise.all([fontsReady.then(setup), LOADER.intro()]).then(LOADER.out);
})();
