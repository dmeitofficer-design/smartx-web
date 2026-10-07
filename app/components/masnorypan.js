'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// ── Responsive config ───────────────────────────────────────────────────────

const CONFIG = {
  desktop: { CARD_W: 200, CARD_H: 120, GAP_X: 24, GAP_Y: 20, ROWS: 2 },
  tablet:  { CARD_W: 150, CARD_H: 90,  GAP_X: 16, GAP_Y: 12, ROWS: 2 },
  mobile:  { CARD_W: 120, CARD_H: 80,  GAP_X: 12, GAP_Y: 10, ROWS: 1 },
};

function getConfig() {
  if (typeof window === 'undefined') return CONFIG.desktop;
  const w = window.innerWidth;
  if (w <= 480) return CONFIG.mobile;
  if (w <= 768) return CONFIG.tablet;
  return CONFIG.desktop;
}

// ── Pure layout functions ───────────────────────────────────────────────────

function buildLayout(items, rows, CARD_W, CARD_H, GAP_X, GAP_Y) {
  if (!items.length) return { cards: [], tileW: 1, tileH: 1 };
  const cols  = Math.ceil(items.length / rows);
  const cards = items.map((item, i) => ({
    item,
    x: (i % cols) * (CARD_W + GAP_X),
    y: Math.floor(i / cols) * (CARD_H + GAP_Y),
    w: CARD_W,
    h: CARD_H,
    key: `c${i}`,
  }));
  return { cards, tileW: cols * (CARD_W + GAP_X), tileH: rows * (CARD_H + GAP_Y) };
}

function getTiles(px, py, layout, el, CARD_W, CARD_H) {
  if (!el || !layout.cards.length) return [];
  const { cards, tileW, tileH } = layout;
  const vw = el.offsetWidth;
  const vh = el.offsetHeight;
  const normX  = ((px % tileW) + tileW) % tileW;
  const normY  = ((py % tileH) + tileH) % tileH;
  const tilesX = Math.ceil(vw / tileW) + 1;
  const tilesY = Math.ceil(vh / tileH) + 1;
  const result = [];
  const bufX = CARD_W;
  const bufY = CARD_H;

  for (let tx = 0; tx < tilesX; tx++) {
    for (let ty = 0; ty < tilesY; ty++) {
      const ox = tx * tileW - normX;
      const oy = ty * tileH - normY;
      for (const c of cards) {
        const sx = c.x + ox;
        const sy = c.y + oy;
        if (sx + c.w < -bufX || sx > vw + bufX) continue;
        if (sy + c.h < -bufY || sy > vh + bufY) continue;
        result.push({
          item: c.item,
          w: c.w,
          h: c.h,
          key: `${c.key}-${tx}-${ty}`,
          transform: `translate3d(${sx}px,${sy}px,0)`,
        });
      }
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useInfiniteGrid({ items: rawItems = [], rows: propRows } = {}) {
  const [isMobile, setIsMobile]   = useState(false);
  const [tiles, setTiles]         = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const panX         = useRef(0);
  const panY         = useRef(0);
  const layoutRef    = useRef({ cards: [], tileW: 1, tileH: 1 });
  const configRef    = useRef(getConfig());

  const draggingRef = useRef(false);
  const dragStartX  = useRef(0);
  const dragStartY  = useRef(0);
  const dragPanX    = useRef(0);
  const dragPanY    = useRef(0);
  const prevX       = useRef(0);
  const prevY       = useRef(0);
  const prevTime    = useRef(0);
  const velX        = useRef(0);
  const velY        = useRef(0);
  const movedRef    = useRef(false);
  const rafMom      = useRef(null);
  const rafThrottle = useRef(null);
  const pendingPos  = useRef({ x: 0, y: 0 });

  // ── Mobile detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // ── Commit (stable) ──────────────────────────────────────────────────────
  const commit = useCallback((px, py) => {
    const cfg = configRef.current;
    setTiles(getTiles(px, py, layoutRef.current, containerRef.current, cfg.CARD_W, cfg.CARD_H));
  }, []);

  // ── Throttled commit for drag ────────────────────────────────────────────
  const throttledCommit = useCallback((px, py) => {
    pendingPos.current = { x: px, y: py };
    if (rafThrottle.current) return;
    rafThrottle.current = requestAnimationFrame(() => {
      rafThrottle.current = null;
      commit(pendingPos.current.x, pendingPos.current.y);
    });
  }, [commit]);

  // ── Rebuild layout when items/rows change ────────────────────────────────
  const itemsLen = rawItems.length;
  useEffect(() => {
    if (isMobile) return;
    const cfg = configRef.current;
    const effectiveRows = propRows ?? cfg.ROWS;
    layoutRef.current = buildLayout(rawItems, effectiveRows, cfg.CARD_W, cfg.CARD_H, cfg.GAP_X, cfg.GAP_Y);
    commit(panX.current, panY.current);
  }, [isMobile, itemsLen, propRows, commit]);

  // ── Initial paint ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    commit(0, 0);
  }, [isMobile, commit]);

  // ── Handle resize / responsive switch ────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const onResize = () => {
      const next = getConfig();
      const prev = configRef.current;
      if (next.CARD_W !== prev.CARD_W || next.ROWS !== prev.ROWS) {
        configRef.current = next;
        const effectiveRows = propRows ?? next.ROWS;
        layoutRef.current = buildLayout(rawItems, effectiveRows, next.CARD_W, next.CARD_H, next.GAP_X, next.GAP_Y);
        commit(panX.current, panY.current);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMobile, rawItems, propRows, commit]);

  // ── Momentum ─────────────────────────────────────────────────────────────
  const applyMomentum = useCallback(() => {
    if (rafMom.current) cancelAnimationFrame(rafMom.current);
    let vx = velX.current;
    let vy = velY.current;
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) return;
    const step = () => {
      if ((Math.abs(vx) < 0.2 && Math.abs(vy) < 0.2) || draggingRef.current) return;
      panX.current += vx;
      panY.current += vy;
      vx *= 0.90;
      vy *= 0.90;
      commit(panX.current, panY.current);
      rafMom.current = requestAnimationFrame(step);
    };
    rafMom.current = requestAnimationFrame(step);
  }, [commit]);

  // ── Mouse ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const THRESH = 4;
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - dragStartX.current;
      const dy = e.clientY - dragStartY.current;
      if (!movedRef.current && Math.abs(dx) + Math.abs(dy) >= THRESH)
        movedRef.current = true;
      const now = performance.now();
      const dt  = Math.max(now - prevTime.current, 1);
      velX.current     = (e.clientX - prevX.current) / dt * 16;
      velY.current     = (e.clientY - prevY.current) / dt * 16;
      prevX.current    = e.clientX;
      prevY.current    = e.clientY;
      prevTime.current = now;
      panX.current     = dragPanX.current + dx;
      panY.current     = dragPanY.current + dy;
      throttledCommit(panX.current, panY.current);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      applyMomentum();
      setTimeout(() => { movedRef.current = false; }, 50);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [isMobile, throttledCommit, applyMomentum]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault(); // ← stop native link-drag / text-selection from starting
    if (rafMom.current) cancelAnimationFrame(rafMom.current);
    if (rafThrottle.current) cancelAnimationFrame(rafThrottle.current);
    draggingRef.current = true;
    movedRef.current    = false;
    dragStartX.current  = e.clientX;
    dragStartY.current  = e.clientY;
    dragPanX.current    = panX.current;
    dragPanY.current    = panY.current;
    prevX.current       = e.clientX;
    prevY.current       = e.clientY;
    prevTime.current    = performance.now();
    velX.current = 0;
    velY.current = 0;
    setIsDragging(true);
  }, []);

  // ── Touch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    const THRESH = 4;

    const onStart = (e) => {
      if (rafMom.current) cancelAnimationFrame(rafMom.current);
      if (rafThrottle.current) cancelAnimationFrame(rafThrottle.current);
      const t = e.touches[0];
      draggingRef.current = true;
      movedRef.current    = false;
      dragStartX.current  = t.clientX;
      dragStartY.current  = t.clientY;
      dragPanX.current    = panX.current;
      dragPanY.current    = panY.current;
      prevX.current       = t.clientX;
      prevY.current       = t.clientY;
      prevTime.current    = performance.now();
      velX.current = 0;
      velY.current = 0;
      setIsDragging(true);
    };
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const t  = e.touches[0];
      const dx = t.clientX - dragStartX.current;
      const dy = t.clientY - dragStartY.current;
      if (!movedRef.current && Math.abs(dx) + Math.abs(dy) >= THRESH)
        movedRef.current = true;
      if (movedRef.current) e.preventDefault();
      const now = performance.now();
      const dt  = Math.max(now - prevTime.current, 1);
      velX.current     = (t.clientX - prevX.current) / dt * 16;
      velY.current     = (t.clientY - prevY.current) / dt * 16;
      prevX.current    = t.clientX;
      prevY.current    = t.clientY;
      prevTime.current = now;
      panX.current     = dragPanX.current + dx;
      panY.current     = dragPanY.current + dy;
      throttledCommit(panX.current, panY.current);
    };
    const onEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      applyMomentum();
      setTimeout(() => { movedRef.current = false; }, 50);
    };

    el.addEventListener('touchstart',  onStart, { passive: true });
    el.addEventListener('touchmove',   onMove,  { passive: false });
    el.addEventListener('touchend',    onEnd,   { passive: true });
    el.addEventListener('touchcancel', onEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart',  onStart);
      el.removeEventListener('touchmove',   onMove);
      el.removeEventListener('touchend',    onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [isMobile, throttledCommit, applyMomentum]);

  const wasDragged = useCallback(() => movedRef.current, []);

  return {
    containerRef,
    tiles: isMobile ? [] : tiles,
    isDragging: isMobile ? false : isDragging,
    wasDragged: isMobile ? () => false : wasDragged,
    isMobile,
    containerProps: isMobile ? {} : { onMouseDown },
  };
}

export { useInfiniteGrid as useInfiniteMarquee };