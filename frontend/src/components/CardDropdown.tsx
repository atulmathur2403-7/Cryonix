import React, { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './CardDropdown.css';

export interface CardDropdownItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

export interface CardDropdownProps {
  items: CardDropdownItem[];
  sectionLabel: string;
  visible: boolean;
  topOffset: number;
  isDark: boolean;
  primaryColor: string;
  cardColors: string[];
  onNavigate: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onBackdropClick: () => void;
  ease?: string;
}

const CardDropdown: React.FC<CardDropdownProps> = ({
  items,
  sectionLabel,
  visible,
  topOffset,
  isDark,
  primaryColor,
  cardColors,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
  onBackdropClick,
  ease = 'power3.out',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const setCardRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      cardsRef.current[i] = el;
    },
    [],
  );

  // Animate on visibility or items change
  useEffect(() => {
    const panel = panelRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!panel) return;

    // Kill any running tweens on these targets
    gsap.killTweensOf(panel);
    if (cards.length > 0) gsap.killTweensOf(cards);

    if (visible && cards.length > 0) {
      // Set starting state then animate in
      gsap.set(panel, { height: 0, opacity: 0, display: 'block' });
      gsap.set(cards, { y: 30, opacity: 0, scale: 0.92 });

      gsap.to(panel, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease,
      });
      gsap.to(cards, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease,
        stagger: 0.07,
        delay: 0.12,
      });
    } else {
      // Animate out
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      });
      if (cards.length > 0) {
        gsap.to(cards, {
          y: 15,
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          ease: 'power2.in',
        });
      }
    }
  }, [visible, items, ease]);

  const bgColor = isDark ? 'rgba(22,22,23,0.96)' : 'rgba(251,251,253,0.96)';
  const textColor = isDark ? '#f5f5f7' : '#1d1d1f';
  const backdropBg = isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`card-dropdown-backdrop ${visible ? 'visible' : ''}`}
        style={{
          top: topOffset,
          background: backdropBg,
          backdropFilter: visible ? 'blur(12px)' : 'blur(0px)',
          WebkitBackdropFilter: visible ? 'blur(12px)' : 'blur(0px)',
        }}
        onClick={onBackdropClick}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`card-dropdown-panel${visible ? ' active' : ''}`}
        style={{
          top: topOffset,
          height: 0,
          opacity: 0,
          background: bgColor,
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: visible ? '0 16px 48px rgba(0,0,0,0.14)' : 'none',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="card-dropdown-inner">
          {/* Left section label */}
          <div className="cd-section-label">
            <span className="cd-section-title" style={{ color: textColor }}>
              {sectionLabel}
            </span>
            <span
              className="cd-section-viewall"
              style={{ color: primaryColor }}
              onClick={() => onNavigate(items[0]?.path || '/')}
            >
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {/* Cards */}
          {items.map((item, idx) => {
            const cardBg = cardColors[idx % cardColors.length];
            // Determine text color based on card background brightness
            const cardTextColor = isLightColor(cardBg) ? '#111' : '#fff';
            return (
              <div
                key={item.label}
                ref={setCardRef(idx)}
                className="cd-card"
                style={{ backgroundColor: cardBg, color: cardTextColor }}
                onClick={() => onNavigate(item.path)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ opacity: 0.8 }}>{item.icon}</span>
                  <span className="cd-card-label">{item.label}</span>
                </div>
                <span className="cd-card-desc">{item.description}</span>
                <div className="cd-card-links">
                  <span className="cd-card-link" onClick={(e) => { e.stopPropagation(); onNavigate(item.path); }}>
                    <svg className="cd-card-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                    Go
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/** Simple luminance check for card text color */
function isLightColor(hex: string): boolean {
  // Handle rgba/named colors - default to dark bg
  if (!hex.startsWith('#')) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export default CardDropdown;
