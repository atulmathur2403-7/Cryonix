import React, { useEffect, useState } from 'react';
import { Box, Fade, Grow, Slide } from '@mui/material';

// ─── Animated Page Wrapper — fades + slides entire page on mount ────
interface AnimatedPageProps {
  children: React.ReactNode;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <Fade in={show} timeout={500}>
      <Box
        sx={{
          animation: show ? 'slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          '@keyframes slideUp': {
            from: { opacity: 0, transform: 'translateY(18px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};

// ─── Staggered children — each child fades in with a delay ────
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number; // ms between each child, default 80
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

// ─── Hover-lift Card wrapper ────
interface HoverCardProps {
  children: React.ReactNode;
  elevation?: 'sm' | 'md' | 'lg';
}

export const hoverSx = (elevation: 'sm' | 'md' | 'lg' = 'md') => {
  const shadows: Record<string, string> = {
    sm: '0 4px 12px rgba(0,0,0,0.08)',
    md: '0 8px 30px rgba(0,0,0,0.12)',
    lg: '0 12px 40px rgba(0,0,0,0.16)',
  };
  const lifts: Record<string, string> = { sm: '-2px', md: '-4px', lg: '-6px' };
  return {
    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    '&:hover': {
      transform: `translateY(${lifts[elevation]})`,
      boxShadow: shadows[elevation],
    },
  };
};

// ─── Scale-on-hover for buttons/icons ────
export const scaleOnHover = {
  transition: 'transform 0.2s ease',
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
    <Slide direction={direction} in={show} timeout={450} mountOnEnter>
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

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, timeout = 500 }) => {
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
