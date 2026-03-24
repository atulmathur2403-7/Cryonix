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
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
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
