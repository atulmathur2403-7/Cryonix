import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Fade, Grow, Slide } from '@mui/material';

// ─── Apple-style spring easing ────
const appleEase = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const springEase = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ─── Animated Page Wrapper — fades + slides entire page on mount ────
interface AnimatedPageProps {
  children: React.ReactNode;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <Fade in={show} timeout={600}>
      <Box
        sx={{
          animation: show ? 'pageReveal 0.7s ' + springEase : 'none',
          '@keyframes pageReveal': {
            from: { opacity: 0, transform: 'translateY(24px) scale(0.99)' },
            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
          },
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};

// ─── Scroll-triggered reveal (Apple-style) ────
interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 40,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const getTransform = useCallback(() => {
    switch (direction) {
      case 'up': return `translateY(${distance}px)`;
      case 'down': return `translateY(-${distance}px)`;
      case 'left': return `translateX(${distance}px)`;
      case 'right': return `translateX(-${distance}px)`;
    }
  }, [direction, distance]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0) scale(1)' : `${getTransform()} scale(0.98)`,
        transition: `opacity 0.8s ${appleEase} ${delay}ms, transform 0.8s ${springEase} ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Box>
  );
};

// ─── Parallax float (subtle Y offset on scroll) ────
interface ParallaxFloatProps {
  children: React.ReactNode;
  speed?: number; // 0.1 = subtle, 0.3 = pronounced
}

export const ParallaxFloat: React.FC<ParallaxFloatProps> = ({ children, speed = 0.15 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(center * speed);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <Box ref={ref} sx={{ transform: `translateY(${offset}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
      {children}
    </Box>
  );
};

// ─── Staggered children — each child fades in with a delay ────
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({ children, delay = 80 }) => (
  <>
    {React.Children.map(children, (child, i) => (
      <Grow in timeout={400 + i * delay} key={i}>
        <Box>{child}</Box>
      </Grow>
    ))}
  </>
);

// ─── Hover-lift utilities ────
export const hoverSx = (elevation: 'sm' | 'md' | 'lg' = 'md') => {
  const shadows: Record<string, string> = {
    sm: '0 4px 16px rgba(0,0,0,0.06)',
    md: '0 12px 40px rgba(0,0,0,0.08)',
    lg: '0 20px 60px rgba(0,0,0,0.12)',
  };
  const lifts: Record<string, string> = { sm: '-2px', md: '-6px', lg: '-10px' };
  return {
    transition: `all 0.4s ${springEase}`,
    '&:hover': {
      transform: `translateY(${lifts[elevation]})`,
      boxShadow: shadows[elevation],
    },
  };
};

// ─── Glass card style ────
export const glassSx = (isDark: boolean = false) => ({
  background: isDark ? 'rgba(28,28,30,0.6)' : 'rgba(255,255,255,0.6)',
  backdropFilter: 'saturate(180%) blur(20px)',
  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
});

// ─── Scale-on-hover for buttons/icons ────
export const scaleOnHover = {
  transition: `transform 0.25s ${springEase}`,
  '&:hover': { transform: 'scale(1.05)' },
  '&:active': { transform: 'scale(0.97)' },
};

// ─── Pulse animation for live indicators ────
export const pulseAnimation = {
  animation: 'pulse 2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.6, transform: 'scale(1.15)' },
  },
};

// ─── Shimmer / gradient sweep for loading states ────
export const shimmerSx = {
  overflow: 'hidden',
  position: 'relative' as const,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  },
};

// ─── Gradient text utility ────
export const gradientTextSx = (from: string = '#1a3fc4', to: string = '#7C5CFC') => ({
  background: `linear-gradient(135deg, ${from}, ${to})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

// ─── Slide-in from side ────
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({ children, direction = 'up', delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Slide direction={direction} in={show} timeout={500} mountOnEnter>
      <Box>{children}</Box>
    </Slide>
  );
};

// ─── Fade-in with custom delay ────
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  timeout?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, timeout = 600 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Fade in={show} timeout={timeout}>
      <Box>{children}</Box>
    </Fade>
  );
};

// ─── Grow-in with delay ────
interface GrowInProps {
  children: React.ReactNode;
  delay?: number;
}

export const GrowIn: React.FC<GrowInProps> = ({ children, delay = 0 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Grow in={show} timeout={500}>
      <Box>{children}</Box>
    </Grow>
  );
};

// ─── Animated counter (counts from 0 to target) ────
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}
    </span>
  );
};

// ─── Floating gradient orbs (decorative background) ────
interface FloatingOrbsProps {
  count?: number;
  colors?: string[];
}

export const FloatingOrbs: React.FC<FloatingOrbsProps> = ({
  count = 3,
  colors = ['#1a3fc4', '#7C5CFC', '#34C759'],
}) => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          width: { xs: 200, md: 300 + i * 80 },
          height: { xs: 200, md: 300 + i * 80 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors[i % colors.length]}20, transparent 70%)`,
          top: `${15 + i * 25}%`,
          left: `${10 + i * 30}%`,
          animation: `orbFloat${i} ${8 + i * 4}s ease-in-out infinite`,
          [`@keyframes orbFloat${i}`]: {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: `translate(${30 - i * 20}px, ${-20 + i * 15}px) scale(1.05)` },
            '66%': { transform: `translate(${-20 + i * 10}px, ${15 - i * 10}px) scale(0.95)` },
          },
        }}
      />
    ))}
  </Box>
);

// ─── Progress ring (circular progress) ────
interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#1a3fc4',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} opacity={0.1} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      {children && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

// ─── Marquee — auto-scrolling horizontal content ────
interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({ children, speed = 30, pauseOnHover = true }) => (
  <Box sx={{
    overflow: 'hidden', width: '100%', position: 'relative',
    '&:hover .marquee-track': pauseOnHover ? { animationPlayState: 'paused' } : {},
  }}>
    <Box
      className="marquee-track"
      sx={{
        display: 'flex', gap: 3, width: 'max-content',
        animation: `marquee ${speed}s linear infinite`,
        '@keyframes marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      }}
    >
      {children}
      {children}
    </Box>
  </Box>
);

// ─── Glow border effect ────
export const glowBorderSx = (color: string = '#1a3fc4') => ({
  position: 'relative' as const,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -1,
    borderRadius: 'inherit',
    padding: '1px',
    background: `linear-gradient(135deg, ${color}40, transparent 50%, ${color}20)`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
});

// ─── Typewriter text effect ────
interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 50, delay = 0 }) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span>
      {displayed}
      <span style={{ opacity: started && displayed.length < text.length ? 1 : 0, animation: 'blink 1s step-end infinite' }}>|</span>
    </span>
  );
};
