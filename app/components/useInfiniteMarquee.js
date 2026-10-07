'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useInfiniteMarquee — Arc / stack carousel
 *
 * Cards sit on a parabolic arc: center card is largest, edges shrink + drop.
 * Dragging shifts a continuous float offset; cards wrap infinitely.
 * Auto-scroll advances slowly; pauses on hover.
 * Touch uses native listeners (passive:false) to avoid React synthetic lag.
 */
export function useInfiniteMarquee({ items: rawItems = [], speed = 0.010 } = {}) {
  const containerRef = useRef(null);
  const offsetRef    = useRef(0);
  const rafRef       = useRef(null);
  const lastTsRef    = useRef(null);
  const pausedRef    = useRef(false);
  const draggingRef  = useRef(false);

  const dragStartX   = useRef(0);
  const dragStartOff = useRef(0);
  const prevClientX  = useRef(0);
  const prevTime     = useRef(0);
  const velocityRef  = useRef(0);
  const movedRef     = useRef(false);

  const [isDragging, setIsDragging]       = useState(false);
  const [computedItems, setComputedItems] = useState([]);

  const DRAG_THRESHOLD = 14;   // px
  const PX_PER_STEP    = 160; // px drag = 1 card step

  // ── Arc geometry ──────────────────────────────────────────────────────────
  const getCardStyle = useCallback((slotOffset, totalVisible) => {
    const abs  = Math.abs(slotOffset);
    const norm = abs / (totalVisible / 2); // 0=center, 1=edge

    const scale      = 1 - norm * 0.75;
    const arcHeight  = 100;
    const translateY = norm * norm * arcHeight;
    const spreadPx   = 140;
    const leftShift  = -100; // tweak this pixel value up or down as needed
  const translateX = (slotOffset * spreadPx) + leftShift;
    const maxRotate  = 10;
    const rotate     = slotOffset * (maxRotate / (totalVisible / 2));
    const zIndex     = Math.round((1 - norm) * 100);
    const opacity    = norm > 0.95 ? 1 - (norm - 0.95) * 20 : 1;

    return {
      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
      zIndex,
      opacity,
    };
  }, []);

  // ── Build positioned items ────────────────────────────────────────────────
  const computeItems = useCallback(() => {
    if (!rawItems.length) return [];
    const n       = rawItems.length;
    const VISIBLE = Math.min(n, 9);
    const half    = Math.floor(VISIBLE / 2);
    const result  = [];

    for (let slot = -half; slot <= half; slot++) {
      const floatIndex = -offsetRef.current + slot;
      const itemIndex  = ((Math.round(floatIndex) % n) + n) % n;
      const fracSlot   = slot + (offsetRef.current - Math.round(offsetRef.current));
      const style      = getCardStyle(fracSlot, VISIBLE);
      result.push({ item: rawItems[itemIndex], style, key: `${slot}-${itemIndex}`, slot });
    }
    return result;
  }, [rawItems, getCardStyle]);

  // ── rAF loop ──────────────────────────────────────────────────────────────
  const runFrame = useCallback((ts) => {
    if (!pausedRef.current && !draggingRef.current) {
      if (lastTsRef.current !== null) {
        const dt = Math.min(ts - lastTsRef.current, 50);
        offsetRef.current += speed * (dt / 16);
      }
      lastTsRef.current = ts;
    } else {
      lastTsRef.current = null;
    }
    setComputedItems(computeItems());
    rafRef.current = requestAnimationFrame(runFrame);
  }, [speed, computeItems]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(runFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [runFrame]);

  // ── Hover pause ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pause  = () => { if (!draggingRef.current) pausedRef.current = true; };
    const resume = () => { if (!draggingRef.current) pausedRef.current = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    return () => {
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, []);

  // ── Momentum ──────────────────────────────────────────────────────────────
  const applyMomentum = useCallback(() => {
    let v = velocityRef.current;
    if (Math.abs(v) < 0.002) return;
    const decay = () => {
      if (Math.abs(v) < 0.001 || draggingRef.current) return;
      offsetRef.current += v;
      v *= 0.92;
      requestAnimationFrame(decay);
    };
    requestAnimationFrame(decay);
  }, []);

  // ── Mouse — window-level, no pointer capture ──────────────────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - dragStartX.current;
      if (!movedRef.current && Math.abs(dx) >= DRAG_THRESHOLD) movedRef.current = true;

      const now = performance.now();
      const dt  = Math.max(now - prevTime.current, 1);
      velocityRef.current = -((e.clientX - prevClientX.current) / PX_PER_STEP) / dt * 16;
      prevClientX.current = e.clientX;
      prevTime.current    = now;
      offsetRef.current   = dragStartOff.current + dx / PX_PER_STEP;
    };

    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      pausedRef.current   = false;
      setIsDragging(false);
      applyMomentum();
      setTimeout(() => { movedRef.current = false; }, 0);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [applyMomentum]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    draggingRef.current  = true;
    movedRef.current     = false;
    dragStartX.current   = e.clientX;
    dragStartOff.current = offsetRef.current;
    prevClientX.current  = e.clientX;
    prevTime.current     = performance.now();
    velocityRef.current  = 0;
    lastTsRef.current    = null;
    setIsDragging(true);
  }, []);

  // ── Touch — native listeners on the container (passive:false to allow preventDefault) ──
  // This avoids React's synthetic event batching delay that causes touch lag.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      draggingRef.current  = true;
      movedRef.current     = false;
      dragStartX.current   = e.touches[0].clientX;
      dragStartOff.current = offsetRef.current;
      prevClientX.current  = e.touches[0].clientX;
      prevTime.current     = performance.now();
      velocityRef.current  = 0;
      lastTsRef.current    = null;
      setIsDragging(true);
    };

    const onTouchMove = (e) => {
      if (!draggingRef.current) return;
      const dx = e.touches[0].clientX - dragStartX.current;
      if (!movedRef.current && Math.abs(dx) >= DRAG_THRESHOLD) movedRef.current = true;

      // Prevent page scroll while dragging horizontally
      if (movedRef.current) e.preventDefault();

      const now = performance.now();
      const dt  = Math.max(now - prevTime.current, 1);
      velocityRef.current = -((e.touches[0].clientX - prevClientX.current) / PX_PER_STEP) / dt * 16;
      prevClientX.current = e.touches[0].clientX;
      prevTime.current    = now;
      offsetRef.current   = dragStartOff.current + dx / PX_PER_STEP;
    };

    const onTouchEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);
      applyMomentum();
      setTimeout(() => { movedRef.current = false; }, 0);
    };

    // passive:false so we can call preventDefault() in onTouchMove
    el.addEventListener('touchstart',  onTouchStart, { passive: true });
    el.addEventListener('touchmove',   onTouchMove,  { passive: false });
    el.addEventListener('touchend',    onTouchEnd,   { passive: true });
    el.addEventListener('touchcancel', onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [applyMomentum]);

  const wasDragged = useCallback(() => movedRef.current, []);

  return {
    containerRef,
    computedItems,
    isDragging,
    wasDragged,
    containerProps: {
      onMouseDown,
      // Touch is handled via native listeners above — no React props needed
    },
  };
}