import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './StaggeredDrawer.css';

interface StaggeredDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  colors?: string[];
  panelBg?: string;
  itemSelector?: string;
  emptySelector?: string;
}

const StaggeredDrawer: React.FC<StaggeredDrawerProps> = ({
  open,
  onClose,
  children,
  header,
  colors = ['#B19EEF', '#5227FF'],
  panelBg = 'rgba(22,22,23,0.98)',
  itemSelector = '.sd-item',
  emptySelector = '.sd-empty',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const initRef = useRef(false);
  const prevOpenRef = useRef(false);

  // Set initial offscreen positions on mount
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    if (!panel) return;

    const layers = preContainer
      ? Array.from(preContainer.querySelectorAll('.sd-prelayer'))
      : [];

    gsap.set([panel, ...layers], { xPercent: 100 });
    initRef.current = true;
  }, []);

  const getElements = useCallback(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    if (!panel) return null;

    const layers = preContainer
      ? Array.from(preContainer.querySelectorAll('.sd-prelayer'))
      : [];
    const items = Array.from(panel.querySelectorAll(itemSelector));
    const empties = Array.from(panel.querySelectorAll(emptySelector));

    return { panel, layers, items, empties };
  }, [itemSelector, emptySelector]);

  const playOpen = useCallback(() => {
    const els = getElements();
    if (!els) return;
    const { panel, layers, items, empties } = els;

    // Kill any running animations
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    // Reset items to hidden
    if (items.length) gsap.set(items, { y: 30, opacity: 0 });
    if (empties.length) gsap.set(empties, { y: 20, opacity: 0 });

    const tl = gsap.timeline();

    // Staggered layers slide in
    layers.forEach((el, i) => {
      tl.fromTo(
        el,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.5, ease: 'power4.out' },
        i * 0.07,
      );
    });

    const lastLayerTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastLayerTime + (layers.length ? 0.08 : 0);

    // Panel slides in
    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.65, ease: 'power4.out' },
      panelInsertTime,
    );

    // Items stagger in
    const itemsStart = panelInsertTime + 0.65 * 0.15;
    if (items.length) {
      tl.to(
        items,
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power4.out',
          stagger: { each: 0.06, from: 'start' },
        },
        itemsStart,
      );
    }
    if (empties.length) {
      tl.to(
        empties,
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        itemsStart,
      );
    }

    openTlRef.current = tl;
  }, [getElements]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const els = getElements();
    if (!els) return;
    const { panel, layers, items, empties } = els;

    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: 100,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        if (items.length) gsap.set(items, { y: 30, opacity: 0 });
        if (empties.length) gsap.set(empties, { y: 20, opacity: 0 });
      },
    });
  }, [getElements]);

  // React to open prop changes
  useEffect(() => {
    if (!initRef.current) return;
    // Only animate on actual changes
    if (open === prevOpenRef.current) return;
    prevOpenRef.current = open;

    if (open) {
      playOpen();
    } else {
      playClose();
    }
  }, [open, playOpen, playClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Build prelayer elements
  const prelayers = (() => {
    const raw = colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
    const arr = [...raw];
    if (arr.length >= 3) {
      arr.splice(Math.floor(arr.length / 2), 1);
    }
    return arr;
  })();

  return (
    <div
      ref={wrapRef}
      className="staggered-drawer-wrapper"
      data-open={open || undefined}
    >
      {/* Backdrop */}
      <div className="sd-backdrop" onClick={onClose} />

      {/* Staggered color layers */}
      <div ref={preLayersRef} className="sd-prelayers" aria-hidden="true">
        {prelayers.map((c, i) => (
          <div key={i} className="sd-prelayer" style={{ background: c }} />
        ))}
      </div>

      {/* Main panel */}
      <div ref={panelRef} className="sd-panel" style={{ background: panelBg, backdropFilter: 'blur(20px)' }}>
        {header}
        <div className="sd-panel-body">{children}</div>
      </div>
    </div>
  );
};

export default StaggeredDrawer;
