import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  Skeleton,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ThumbUp,
  ChatBubbleOutline,
  Share,
  Visibility,
  Search,
  VolumeOff,
  VolumeUp,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { youtubeApi, YouTubeShort } from '../../services/youtube';

function formatCount(n: string | number): string {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 365) return `${Math.floor(days / 365)}y ago`;
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  return 'Today';
}

const TOOLTIP_PROPS = {
  arrow: true,
  enterDelay: 400,
  leaveDelay: 100,
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: 'rgba(30,30,30,0.95)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 1.5,
        px: 1.5,
        py: 0.6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      },
    },
    arrow: {
      sx: { color: 'rgba(30,30,30,0.95)' },
    },
  },
} as const;

const CARD_HEIGHT = 'calc(100vh - 100px)';
const PLAYER_MAX_W = 400;

const ShortsPage: React.FC = () => {
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const isDark = theme.palette.mode === 'dark';

  const initialShortId = searchParams.get('v');

  // Initial fetch
  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      const data = await youtubeApi.getTrendingShorts(12);
      setShorts(data);
      if (initialShortId) {
        const idx = data.findIndex((s) => s.id === initialShortId);
        if (idx >= 0) {
          setActiveIndex(idx);
          setTimeout(() => {
            cardRefs.current.get(idx)?.scrollIntoView({ behavior: 'auto' });
          }, 100);
        }
      }
      setLoading(false);
    };
    fetchShorts();
  }, [initialShortId]);

  // Load more shorts when nearing the end
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const more = await youtubeApi.getTrendingShorts(8);
    // Deduplicate
    setShorts((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const unique = more.filter((s) => !existingIds.has(s.id));
      return [...prev, ...unique];
    });
    setLoadingMore(false);
  }, [loadingMore]);

  // Infinite scroll: load more when reaching last 2 shorts
  useEffect(() => {
    if (shorts.length > 0 && activeIndex >= shorts.length - 3) {
      loadMore();
    }
  }, [activeIndex, shorts.length, loadMore]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const data = await youtubeApi.getShortsByQuery(searchQuery);
    setShorts(data);
    setActiveIndex(0);
    setLoading(false);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }, 50);
  };

  // Scroll to a specific index
  const scrollToIndex = useCallback((index: number) => {
    const card = cardRefs.current.get(index);
    if (card) {
      isScrollingRef.current = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    }
  }, []);

  const goTo = useCallback(
    (direction: 'next' | 'prev') => {
      setActiveIndex((prev) => {
        const next =
          direction === 'next'
            ? Math.min(prev + 1, shorts.length - 1)
            : Math.max(prev - 1, 0);
        scrollToIndex(next);
        return next;
      });
    },
    [shorts.length, scrollToIndex]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); goTo('next'); }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); goTo('prev'); }
      if (e.key === 'm') setIsMuted((p) => !p);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goTo]);

  // IntersectionObserver: detect which card is in view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || shorts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    cardRefs.current.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [shorts]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Search bar (compact) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1,
          px: 2,
          flexShrink: 0,
        }}
      >
        <TextField
          size="small"
          placeholder="Search shorts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              fontSize: '0.85rem',
              bgcolor: 'background.paper',
              width: { xs: '100%', sm: 300 },
            },
          }}
        />
      </Box>

      {/* Vertical scroll container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          '&::-webkit-scrollbar': { width: 0 },
          scrollbarWidth: 'none',
          position: 'relative',
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: CARD_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Skeleton
              variant="rounded"
              sx={{ width: { xs: '90%', sm: PLAYER_MAX_W }, height: '80%', borderRadius: 4 }}
            />
          </Box>
        ) : shorts.length === 0 ? (
          <Box
            sx={{
              height: CARD_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No shorts found
            </Typography>
          </Box>
        ) : (
          <>
            {shorts.map((short, idx) => (
              <Box
                key={`${short.id}-${idx}`}
                data-index={idx}
                ref={(el: HTMLDivElement | null) => {
                  if (el) cardRefs.current.set(idx, el);
                }}
                sx={{
                  height: CARD_HEIGHT,
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Player card + actions wrapper */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: { xs: 1, md: 2 },
                  }}
                >
                  {/* Player */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: 'calc(100vw - 72px)', sm: PLAYER_MAX_W },
                      height: { xs: 'calc(100vh - 160px)', sm: 'min(700px, calc(100vh - 140px))' },
                      maxHeight: 750,
                      borderRadius: 4,
                      overflow: 'hidden',
                      bgcolor: '#000',
                      boxShadow: isDark
                        ? '0 8px 40px rgba(255,255,255,0.06)'
                        : '0 8px 40px rgba(0,0,0,0.15)',
                    }}
                  >
                    {Math.abs(idx - activeIndex) <= 1 ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${short.id}?autoplay=${idx === activeIndex ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${short.id}&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1`}
                        title={short.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${short.thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}

                    {/* Bottom gradient overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Video info */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        color: '#fff',
                        zIndex: 2,
                      }}
                    >
                      <Typography
                        fontWeight={700}
                        sx={{
                          fontSize: '0.95rem',
                          mb: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                        }}
                      >
                        {short.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                          {short.channelTitle[0]}
                        </Avatar>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {short.channelTitle}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          • {timeAgo(short.publishedAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Mute button */}
                    <Tooltip title={isMuted ? 'Unmute' : 'Mute'} {...TOOLTIP_PROPS}>
                      <IconButton
                        onClick={() => setIsMuted(!isMuted)}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          zIndex: 3,
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                          width: 36,
                          height: 36,
                        }}
                      >
                        {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                      </IconButton>
                    </Tooltip>

                    {/* Counter chip */}
                    <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 3 }}>
                      <Chip
                        label={`${idx + 1} / ${shorts.length}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Action buttons (right side) */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      alignItems: 'center',
                      pb: 2,
                    }}
                  >
                    {[
                      { icon: <ThumbUp />, count: formatCount(short.likeCount), label: 'Like' },
                      { icon: <ChatBubbleOutline />, count: formatCount(short.commentCount), label: 'Comment' },
                      { icon: <Share />, count: 'Share', label: 'Share' },
                      { icon: <Visibility />, count: formatCount(short.viewCount), label: 'Views' },
                    ].map((action) => (
                      <Box key={action.label} sx={{ textAlign: 'center' }}>
                        <Tooltip title={action.label} {...TOOLTIP_PROPS}>
                          <IconButton
                            sx={{
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                              width: 44,
                              height: 44,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          sx={{ fontSize: '0.65rem', mt: 0.25 }}
                        >
                          {action.count}
                        </Typography>
                      </Box>
                    ))}

                    {/* Up / Down nav */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 0.5, mt: 1 }}>
                      <Tooltip title="Previous short" {...TOOLTIP_PROPS}>
                        <span>
                          <IconButton
                            onClick={() => goTo('prev')}
                            disabled={idx === 0 && activeIndex === 0}
                            size="small"
                            sx={{
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
                            }}
                          >
                            <KeyboardArrowUp fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Next short" {...TOOLTIP_PROPS}>
                        <span>
                          <IconButton
                            onClick={() => goTo('next')}
                            disabled={activeIndex >= shorts.length - 1}
                            size="small"
                            sx={{
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
                            }}
                          >
                            <KeyboardArrowDown fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Loading more sentinel */}
            <Box
              ref={sentinelRef}
              sx={{
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loadingMore && <CircularProgress size={28} />}
            </Box>
          </>
        )}
      </Box>

      {/* Keyboard hint */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'center',
          py: 0.5,
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          ↑↓ Scroll • M Mute/Unmute
        </Typography>
      </Box>
    </Box>
  );
};

export default ShortsPage;
