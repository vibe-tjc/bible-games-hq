import { CITIES, JOURNEYS } from "../../data/paulJourneys";
import type { CityId, Journey, Stop } from "../../data/paulJourneys";
import { createSvgRenderer } from "./svgRenderer";
import { createMapRenderer } from "./mapRenderer";
import type { Renderer, RendererDeps } from "./types";

export type PaulGame = {
  start(): void;
  destroy(): void;
};

export function createPaulGame(root: HTMLElement): PaulGame {
  /* ===== SCOPED QUERY HELPER ===== */
  const $ = <T extends Element = HTMLElement>(sel: string) =>
    root.querySelector<T>(sel);

  /* ===== TIMER TRACKING ===== */
  const timers = new Set<number>();
  const rafs = new Set<number>();

  function ST(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }

  function RAF(fn: FrameRequestCallback): number {
    const id = requestAnimationFrame((t) => {
      rafs.delete(id);
      fn(t);
    });
    rafs.add(id);
    return id;
  }

  function clearTracked(id: number): void {
    timers.delete(id);
    clearTimeout(id);
  }

  /* ===== STATE ===== */
  let J: Journey | null = null;
  let cur = 0;
  let miss = 0;
  let hintsUsed = 0;
  let score = 0;
  let combo = 0;
  let challenge = false;
  let soundOn = true;
  let mapMode: "svg" | "real" = "svg";
  const logRows: Stop[] = [];

  const REDUCE = () => matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ===== AUDIO ===== */
  let actx: AudioContext | null = null;

  function tone(
    f: number,
    d: number,
    type?: OscillatorType,
    when?: number,
    g?: number,
  ): void {
    if (!soundOn) return;
    try {
      actx =
        actx ||
        new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      const o = actx.createOscillator();
      const ga = actx.createGain();
      o.type = type ?? "sine";
      o.frequency.value = f;
      o.connect(ga);
      ga.connect(actx.destination);
      const t = actx.currentTime + (when ?? 0);
      ga.gain.setValueAtTime(g ?? 0.05, t);
      ga.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.start(t);
      o.stop(t + d);
    } catch {
      /* ignore */
    }
  }

  const sOK = () => {
    tone(620, 0.12);
    tone(940, 0.16, "sine", 0.09);
  };
  const sNo = () => tone(150, 0.2, "sawtooth", 0, 0.045);
  const sWin = () =>
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.26, "triangle", i * 0.12, 0.05));

  /* ===== RENDERER SETUP ===== */
  const rendererDeps: RendererDeps = {
    root,
    onCityClick: (id: CityId) => onClick(id),
    isChallenge: () => challenge,
    reduceMotion: REDUCE,
  };

  const svgEl = $<SVGSVGElement>("svg.paul-map");
  const svgRenderer: Renderer = createSvgRenderer(svgEl!, rendererDeps);

  let mapRenderer: (Renderer & { destroy(): void }) | null = null;

  let R: Renderer = svgRenderer;

  /* ===== HUD ===== */
  function setQuestRaw(t: string): void {
    const el = $("#qTxt");
    if (el) el.textContent = t;
  }

  let questHintTimer = 0;
  function setQuest(html?: string, isHint?: boolean, sticky?: boolean): void {
    const q = $("#quest");
    const t = $("#qTxt");
    if (!q || !t) return;
    q.classList.toggle("hint", !!isHint);
    if (html) {
      t.innerHTML = html;
    } else if (J) {
      const n = cur + 1;
      t.innerHTML =
        n < J.stops.length
          ? `下一站 ▸ 找出並點選 <b>第 ${n} 站</b>`
          : "旅程完成!";
    }
    if (isHint && !sticky) {
      clearTracked(questHintTimer);
      questHintTimer = ST(() => {
        q.classList.remove("hint");
        setQuest();
      }, 4200);
    }
  }

  function updateScore(): void {
    const hScore = $("#hScore");
    const hStars = $("#hStars");
    if (hScore) hScore.textContent = score.toLocaleString();
    const st = starCount();
    if (hStars)
      hStars.innerHTML = [1, 2, 3]
        .map((i) => (i <= st ? "<b>★</b>" : "<s>★</s>"))
        .join("");
  }

  function starCount(): number {
    const bad = miss + hintsUsed;
    return bad === 0 ? 3 : bad <= 2 ? 2 : 1;
  }

  function floatPts(txt: string): void {
    const xy = R.paulXY();
    const d = document.createElement("div");
    d.className = "float";
    d.textContent = txt;
    const stage = $("#stage");
    if (stage) {
      const r = stage.getBoundingClientRect();
      d.style.left = xy.x - r.left + "px";
      d.style.top = xy.y - r.top + "px";
      stage.appendChild(d);
    }
    ST(() => d.remove(), 1050);
  }

  let comboT = 0;
  function showCombo(t: string): void {
    const c = $("#combo");
    if (!c) return;
    c.textContent = t + " 🔥";
    c.classList.add("show");
    clearTracked(comboT);
    comboT = ST(() => c.classList.remove("show"), 1100);
  }

  function flash(): void {
    const f = $("#flash");
    if (!f) return;
    f.classList.add("on");
    ST(() => f.classList.remove("on"), 130);
  }

  /* ===== GAME LOGIC ===== */
  function kmBetween(a: (typeof CITIES)[CityId], b: (typeof CITIES)[CityId]): number {
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const mLat = (((a.lat + b.lat) / 2) * Math.PI) / 180;
    const dLng = (((b.lng - a.lng) * Math.PI) / 180) * Math.cos(mLat);
    return Math.sqrt(dLat * dLat + dLng * dLng) * 6371;
  }

  function hintText(tgt: Stop, level: number): string {
    const a = CITIES[J!.stops[cur].p];
    const b = CITIES[tgt.p];
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    let dir: string;
    if (ang >= -22.5 && ang < 22.5) dir = "東";
    else if (ang < 67.5 && ang >= 22.5) dir = "東北";
    else if (ang < 112.5 && ang >= 67.5) dir = "北";
    else if (ang < 157.5 && ang >= 112.5) dir = "西北";
    else if (ang >= -67.5 && ang < -22.5) dir = "東南";
    else if (ang >= -112.5 && ang < -67.5) dir = "南";
    else if (ang >= -157.5 && ang < -112.5) dir = "西南";
    else dir = "西";
    const km = kmBetween(a, b);
    const near = km < 180 ? "很近" : km < 480 ? "不遠" : "還有一段路";
    const way = tgt.leg === "sea" ? "要<b>渡海</b>" : "走<b>陸路</b>";
    let h = `不對喔。下一站在 <b>${a.zh}</b> 的 <b>${dir}方</b>,${near},${way}。`;
    if (level >= 2) h += `線索:${tgt.ft.slice(0, 14)}…`;
    if (level >= 3) h += " (已標出位置)";
    return h;
  }

  function reached(id: CityId): boolean {
    for (let i = 0; i <= cur; i++) if (J!.stops[i].p === id) return true;
    return false;
  }

  function showDlg(idx: number, s: Stop): void {
    const p = CITIES[s.p];
    const isStart = s.leg === "start";
    const dNm = $("#dNm");
    const dRf = $("#dRf");
    const dMeta = $("#dMeta");
    const dFt = $("#dFt");
    const dlg = $("#dlg");
    if (dNm)
      dNm.innerHTML = `<span class="idx">${idx + 1}</span>${p.zh}<span class="en">${p.en}</span>`;
    if (dRf) dRf.textContent = s.ref;
    if (dMeta)
      dMeta.textContent =
        (isStart ? "起點" : s.leg === "sea" ? "海路" : "陸路") +
        (p.reg ? " · " + p.reg : "");
    if (dFt) dFt.textContent = s.ft;
    if (dlg) dlg.classList.add("show");
  }

  function hideDlg(): void {
    const dlg = $("#dlg");
    if (dlg) dlg.classList.remove("show");
  }

  function burst(c: HTMLCanvasElement | null): void {
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const r = c.getBoundingClientRect();
    c.width = r.width;
    c.height = r.height;
    const cols = ["#d9a441", "#f6cb60", "#b23b22", "#2a8f7e", "#fbf4e2"];
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      g: number;
      col: string;
      s: number;
      rot: number;
      vr: number;
    };
    const ps: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      ps.push({
        x: c.width / 2 + (Math.random() - 0.5) * 160,
        y: c.height * 0.28,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * -10 - 3,
        g: 0.32,
        col: cols[i % 5],
        s: 5 + Math.random() * 7,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.3,
      });
    }
    const t0 = performance.now();
    (function fr(now: number) {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = false;
      ps.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < c.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      if (now - t0 < 3600 && alive) RAF(fr);
      else ctx.clearRect(0, 0, c.width, c.height);
    })(t0);
  }

  function openMenu(): void {
    const winOv = $("#winOv");
    const startOv = $("#startOv");
    if (winOv) winOv.classList.add("hidden");
    hideDlg();
    if (startOv) startOv.classList.remove("hidden");
  }

  function win(): void {
    sWin();
    const st = starCount();
    const winSheet = $("#winSheet");
    if (!winSheet) return;
    winSheet.innerHTML = `<canvas id="confetti"></canvas><h2>旅程完成!</h2><p class="lead">你完整連出了 <b>${J!.title}</b> 的宣道路線。</p>
   <div class="winstars">${[1, 2, 3].map((i) => (i <= st ? "<b>★</b>" : "<s>★</s>")).join("")}</div>
   <div class="winrow"><div><b>${score.toLocaleString()}</b>分數</div><div><b>${J!.stops.length}</b>地點</div><div><b>${miss}</b>連錯</div></div>
   <div class="win-verse">${J!.verse}</div>
   <div class="jsel"><button class="jcard" id="winReplay" style="text-align:center"><span class="jt">再玩一次這段旅程</span></button><button class="jcard" id="winMenu" style="text-align:center;border-left-color:var(--crimson)"><span class="jt">回到旅程選單</span></button></div>`;
    const winOv = $("#winOv");
    if (winOv) winOv.classList.remove("hidden");
    const winReplay = $("#winReplay");
    const winMenuBtn = $("#winMenu");
    if (winReplay) winReplay.addEventListener("click", () => startJourney(J!.id));
    if (winMenuBtn) winMenuBtn.addEventListener("click", openMenu);
    burst($<HTMLCanvasElement>("#confetti"));
  }

  function openLog(): void {
    if (!J) return;
    const logTitle = $("#logTitle");
    const logBody = $("#logBody");
    const logOv = $("#logOv");
    if (logTitle) logTitle.textContent = J.title + " · 旅程記錄";
    if (logBody)
      logBody.innerHTML = logRows
        .map((s, i) => {
          const p = CITIES[s.p];
          return `<div class="logitem"><span class="lr">${s.ref}</span><div class="lt">${i + 1}. ${p.zh} <span style="font-size:11px;color:var(--ink-faint)">${p.en}</span></div><div class="lf">${s.ft}</div></div>`;
        })
        .join("");
    if (logOv) logOv.classList.remove("hidden");
  }

  function buildDots(): void {
    const box = $("#hDots");
    if (!box || !J) return;
    box.innerHTML = "";
    for (let i = 0; i < J.stops.length; i++) box.appendChild(document.createElement("i"));
    paintDots();
  }

  function paintDots(): void {
    root.querySelectorAll("#hDots i").forEach((d, i) => {
      d.classList.toggle("on", i <= cur);
      d.classList.toggle("now", i === cur);
    });
  }

  function success(idx: number): void {
    const s = J!.stops[idx];
    const from = J!.stops[cur];
    combo++;
    const gain = 100 + (combo >= 2 ? (combo - 1) * 25 : 0);
    score += gain;
    R.drawRoute(from.p, s.p, s.leg === "sea", true);
    R.clearRing();
    floatPts("+" + gain);
    if (combo >= 2) showCombo("連擊 ×" + combo);
    sOK();
    R.movePaul(s.p, () => R.markVisited(s.p));
    cur = idx;
    paintDots();
    updateScore();
    logRows.push(s);
    showDlg(idx, s);
    if (cur === J!.stops.length - 1)
      ST(() => {
        hideDlg();
        win();
      }, 1400);
  }

  function fail(id: CityId, tgt: Stop): void {
    miss++;
    combo = 0;
    sNo();
    R.shake(id);
    flash();
    setQuest(hintText(tgt, miss), true);
    updateScore();
    if (miss >= 3) R.ring(tgt.p);
  }

  function onClick(id: CityId): void {
    if (!J) return;
    const next = cur + 1;
    if (next >= J.stops.length) return;
    const tgt = J.stops[next];
    if (id === tgt.p) success(next);
    else if (reached(id))
      setQuest(`這是已抵達的地點。請找出 <b>第 ${next + 1} 站</b>。`, true, true);
    else fail(id, tgt);
  }

  /* ===== MAP SWITCHING ===== */
  function updateMapBtn(): void {
    const btn = $("#bMap");
    if (btn) btn.textContent = mapMode === "svg" ? "真實地圖" : "繪製地圖";
  }

  function rebuildScene(): void {
    R.reset();
    const seen = new Set<CityId>();
    const ids: CityId[] = [];
    J!.stops.forEach((s) => {
      if (!seen.has(s.p)) {
        seen.add(s.p);
        ids.push(s.p);
        R.addCity(s.p);
      }
    });
    for (let i = 0; i <= cur; i++) R.markVisited(J!.stops[i].p);
    for (let i = 1; i <= cur; i++)
      R.drawRoute(J!.stops[i - 1].p, J!.stops[i].p, J!.stops[i].leg === "sea", false);
    R.placePaul(J!.stops[cur].p);
    R.fit(ids);
  }

  function toggleMap(): void {
    if (mapMode === "svg") {
      const leafEl = $<HTMLElement>(".paul-leaf");
      if (!leafEl) {
        setQuest("真實地圖需要 WebGL / 網路,已留在繪製地圖。", true);
        return;
      }
      if (mapRenderer) {
        // already created — reuse
        mapMode = "real";
        R = mapRenderer;
        R.show();
        R.after();
        if (J) rebuildScene();
        else {
          // fit to default view — mapRenderer handles its own init position
        }
        updateMapBtn();
        if (J) setQuest();
      } else {
        setQuestRaw("載入真實地圖中…");
        mapRenderer = createMapRenderer(
          leafEl,
          rendererDeps,
          {
            onReady: () => {
              mapMode = "real";
              R = mapRenderer!;
              R.show();
              R.after();
              if (J) rebuildScene();
              updateMapBtn();
              if (J) setQuest();
            },
            onError: () => {
              mapRenderer = null;
              setQuest("真實地圖需要 WebGL / 網路,已留在繪製地圖。", true);
            },
          },
        );
      }
    } else {
      mapMode = "svg";
      R = svgRenderer;
      R.show();
      if (J) rebuildScene();
      updateMapBtn();
      if (J) setQuest();
    }
  }

  /* ===== JOURNEY FLOW ===== */
  function startJourney(ji: number): void {
    J = JOURNEYS[ji];
    cur = 0;
    miss = 0;
    hintsUsed = 0;
    score = 0;
    combo = 0;
    challenge = ($<HTMLInputElement>("#challenge")?.checked) ?? false;
    const startOv = $("#startOv");
    const winOv = $("#winOv");
    if (startOv) startOv.classList.add("hidden");
    if (winOv) winOv.classList.add("hidden");
    hideDlg();
    logRows.length = 0;
    logRows.push(J.stops[0]);
    const hLv = $("#hLv");
    const hRf = $("#hRf");
    if (hLv) hLv.textContent = J.title;
    if (hRf) hRf.textContent = J.ref;
    buildDots();
    updateScore();
    R.show();
    R.after();
    rebuildScene();
    setQuest();
  }

  function buildJsel(): void {
    const sel = $("#jsel");
    if (!sel) return;
    sel.innerHTML = "";
    JOURNEYS.forEach((j) => {
      const b = document.createElement("button");
      b.className = "jcard";
      b.innerHTML = `<div><span class="jt">${j.title}</span><span class="jr">${j.ref}</span></div><div class="jd">${j.desc}</div><div class="jmeta">路線:${j.route} · 共 ${j.stops.length} 站</div>`;
      b.onclick = () => startJourney(j.id);
      sel.appendChild(b);
    });
  }

  /* ===== RESIZE HANDLER ===== */
  function onResize(): void {
    if (mapMode === "real" && mapRenderer) mapRenderer.after();
  }

  /* ===== START (public) ===== */
  function start(): void {
    buildJsel();
    R = svgRenderer;
    svgRenderer.show();
    updateMapBtn();

    const bMap = $("#bMap");
    const dCont = $("#dCont");
    const bMenu = $("#bMenu");
    const bRe = $("#bRe");
    const bLog = $("#bLog");
    const logClose = $("#logClose");
    const bHint = $("#bHint");
    const bSound = $("#bSound");
    const startOv = $("#startOv");

    if (bMap) bMap.onclick = toggleMap;
    if (dCont)
      dCont.onclick = () => {
        hideDlg();
        setQuest();
      };
    if (bMenu) bMenu.onclick = openMenu;
    if (bRe) bRe.onclick = () => { if (J) startJourney(J.id); };
    if (bLog) bLog.onclick = openLog;
    if (logClose)
      logClose.onclick = () => {
        const logOv = $("#logOv");
        if (logOv) logOv.classList.add("hidden");
      };
    if (bHint)
      bHint.onclick = () => {
        if (!J || cur >= J.stops.length - 1) return;
        hintsUsed++;
        const lvl = Math.min(3, hintsUsed + 1);
        setQuest(hintText(J.stops[cur + 1], lvl >= 2 ? 2 : 1), true, true);
        if (hintsUsed >= 2) R.ring(J.stops[cur + 1].p);
        updateScore();
      };
    if (bSound)
      bSound.onclick = (e) => {
        soundOn = !soundOn;
        const target = e.target as HTMLButtonElement;
        target.textContent = soundOn ? "♪" : "×";
        target.style.opacity = soundOn ? "1" : "0.5";
      };

    if (startOv) startOv.classList.remove("hidden");

    window.addEventListener("resize", onResize);
  }

  /* ===== DESTROY (public) ===== */
  function destroy(): void {
    window.removeEventListener("resize", onResize);

    for (const id of timers) clearTimeout(id);
    timers.clear();

    for (const id of rafs) cancelAnimationFrame(id);
    rafs.clear();

    mapRenderer?.destroy();
    mapRenderer = null;

    actx?.close();
    actx = null;

    // Clear svg map so createSvgRenderer can rebuild cleanly on re-mount
    const svgMap = $<SVGSVGElement>("svg.paul-map");
    if (svgMap) svgMap.replaceChildren();

    const leafEl = $<HTMLElement>(".paul-leaf");
    if (leafEl) leafEl.replaceChildren();
  }

  return { start, destroy };
}
