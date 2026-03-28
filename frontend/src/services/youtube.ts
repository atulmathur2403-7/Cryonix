import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

const getApiKey = () => process.env.REACT_APP_YOUTUBE_API_KEY || '';

export interface YouTubeShort {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    channelId: string;
    thumbnails: {
      high: { url: string };
      medium: { url: string };
      default: { url: string };
    };
    publishedAt: string;
  };
}

interface YouTubeVideoStats {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export const youtubeApi = {
  getTrendingShorts: async (maxResults = 12): Promise<YouTubeShort[]> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return getMockShorts(maxResults);
    }

    try {
      const searchRes = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: '#shorts',
          type: 'video',
          videoDuration: 'short',
          order: 'viewCount',
          maxResults,
          key: apiKey,
        },
      });

      const videoIds = searchRes.data.items
        .map((item: YouTubeSearchItem) => item.id.videoId)
        .join(',');

      const statsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          part: 'statistics',
          id: videoIds,
          key: apiKey,
        },
      });

      const statsMap = new Map<string, YouTubeVideoStats['statistics']>();
      statsRes.data.items.forEach((item: YouTubeVideoStats) => {
        statsMap.set(item.id, item.statistics);
      });

      return searchRes.data.items.map((item: YouTubeSearchItem) => {
        const stats = statsMap.get(item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          publishedAt: item.snippet.publishedAt,
          viewCount: stats?.viewCount || '0',
          likeCount: stats?.likeCount || '0',
          commentCount: stats?.commentCount || '0',
        };
      });
    } catch {
      return getMockShorts(maxResults);
    }
  },

  getShortsByQuery: async (query: string, maxResults = 20): Promise<YouTubeShort[]> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return getMockShorts(maxResults);
    }

    try {
      const searchRes = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: `${query} #shorts`,
          type: 'video',
          videoDuration: 'short',
          order: 'relevance',
          maxResults,
          key: apiKey,
        },
      });

      const videoIds = searchRes.data.items
        .map((item: YouTubeSearchItem) => item.id.videoId)
        .join(',');

      const statsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          part: 'statistics',
          id: videoIds,
          key: apiKey,
        },
      });

      const statsMap = new Map<string, YouTubeVideoStats['statistics']>();
      statsRes.data.items.forEach((item: YouTubeVideoStats) => {
        statsMap.set(item.id, item.statistics);
      });

      return searchRes.data.items.map((item: YouTubeSearchItem) => {
        const stats = statsMap.get(item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          publishedAt: item.snippet.publishedAt,
          viewCount: stats?.viewCount || '0',
          likeCount: stats?.likeCount || '0',
          commentCount: stats?.commentCount || '0',
        };
      });
    } catch {
      return getMockShorts(maxResults);
    }
  },
};

let mockCallCount = 0;

const allMockShorts: YouTubeShort[] = [
  { id: 'dQw4w9WgXcQ', title: 'How to Crack UPSC in 6 Months', channelTitle: 'Study Pro', channelId: 'ch1', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg', publishedAt: '2025-12-01T00:00:00Z', viewCount: '2400000', likeCount: '180000', commentCount: '4200' },
  { id: 'jNQXAC9IVRw', title: '5 Resume Tips That Got Me Into Google', channelTitle: 'Career Hacks', channelId: 'ch2', thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hq720.jpg', publishedAt: '2025-11-15T00:00:00Z', viewCount: '1800000', likeCount: '95000', commentCount: '3100' },
  { id: '9bZkp7q19f0', title: 'Interview Question That Breaks Everyone', channelTitle: 'Mock Master', channelId: 'ch3', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hq720.jpg', publishedAt: '2025-10-20T00:00:00Z', viewCount: '5200000', likeCount: '320000', commentCount: '8500' },
  { id: 'kJQP7kiw5Fk', title: 'Study Technique That Changed My Life', channelTitle: 'Brain Boost', channelId: 'ch4', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hq720.jpg', publishedAt: '2025-09-10T00:00:00Z', viewCount: '3100000', likeCount: '210000', commentCount: '5600' },
  { id: 'RgKAFK5djSk', title: 'Why 90% Fail Competitive Exams', channelTitle: 'Exam Edge', channelId: 'ch5', thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/hq720.jpg', publishedAt: '2025-08-25T00:00:00Z', viewCount: '4700000', likeCount: '290000', commentCount: '7200' },
  { id: 'OPf0YbXqDm0', title: 'Morning Routine of IAS Toppers', channelTitle: 'UPSC Daily', channelId: 'ch6', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hq720.jpg', publishedAt: '2025-07-14T00:00:00Z', viewCount: '1200000', likeCount: '78000', commentCount: '2300' },
  { id: 'fJ9rUzIMcZQ', title: 'Negotiate Salary Like a Pro', channelTitle: 'Money Moves', channelId: 'ch7', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hq720.jpg', publishedAt: '2025-06-05T00:00:00Z', viewCount: '890000', likeCount: '56000', commentCount: '1800' },
  { id: '2Vv-BfVoq4g', title: 'Best Free Resources for Coding', channelTitle: 'Code Quick', channelId: 'ch8', thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hq720.jpg', publishedAt: '2025-05-22T00:00:00Z', viewCount: '670000', likeCount: '42000', commentCount: '1500' },
  { id: 'hT_nvWreIhg', title: 'Public Speaking in 60 Seconds', channelTitle: 'Speak Easy', channelId: 'ch9', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hq720.jpg', publishedAt: '2025-04-18T00:00:00Z', viewCount: '1500000', likeCount: '110000', commentCount: '3800' },
  { id: 'CevxZvSJLk8', title: 'Memory Trick for Exam Day', channelTitle: 'Brain Boost', channelId: 'ch4', thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/hq720.jpg', publishedAt: '2025-03-30T00:00:00Z', viewCount: '920000', likeCount: '67000', commentCount: '2100' },
  { id: 'JGwWNGJdvx8', title: 'LinkedIn Profile That Gets Noticed', channelTitle: 'Career Hacks', channelId: 'ch2', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hq720.jpg', publishedAt: '2025-02-12T00:00:00Z', viewCount: '780000', likeCount: '48000', commentCount: '1200' },
  { id: 'YQHsXMglC9A', title: 'How I Scored 99 Percentile in CAT', channelTitle: 'MBA Ready', channelId: 'ch10', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/hq720.jpg', publishedAt: '2025-01-08T00:00:00Z', viewCount: '2100000', likeCount: '150000', commentCount: '4500' },
  { id: 'e-ORhEE9VVg', title: 'Top 3 Books for Data Science', channelTitle: 'Data Daily', channelId: 'ch11', thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hq720.jpg', publishedAt: '2025-12-20T00:00:00Z', viewCount: '540000', likeCount: '32000', commentCount: '900' },
  { id: 'tgbNymZ7vqY', title: 'Fitness Routine for Exam Season', channelTitle: 'Study Fit', channelId: 'ch12', thumbnail: 'https://i.ytimg.com/vi/tgbNymZ7vqY/hq720.jpg', publishedAt: '2025-11-28T00:00:00Z', viewCount: '320000', likeCount: '21000', commentCount: '600' },
  { id: 'LXb3EKWsInQ', title: 'How to Stay Focused for 10 Hours', channelTitle: 'Brain Boost', channelId: 'ch4', thumbnail: 'https://i.ytimg.com/vi/LXb3EKWsInQ/hq720.jpg', publishedAt: '2025-10-05T00:00:00Z', viewCount: '1900000', likeCount: '140000', commentCount: '3500' },
  { id: 'PkZNo7MFNFg', title: 'Quick Maths Tricks for Banking Exams', channelTitle: 'Exam Edge', channelId: 'ch5', thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hq720.jpg', publishedAt: '2025-09-18T00:00:00Z', viewCount: '2800000', likeCount: '195000', commentCount: '5100' },
  { id: 'M7lc1UVf-VE', title: 'GD Tips That Impressed the Panel', channelTitle: 'MBA Ready', channelId: 'ch10', thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hq720.jpg', publishedAt: '2025-08-12T00:00:00Z', viewCount: '430000', likeCount: '27000', commentCount: '800' },
  { id: 'lp-EO5I60KA', title: 'Cold Emailing Strategy That Works', channelTitle: 'Career Hacks', channelId: 'ch2', thumbnail: 'https://i.ytimg.com/vi/lp-EO5I60KA/hq720.jpg', publishedAt: '2025-07-28T00:00:00Z', viewCount: '610000', likeCount: '38000', commentCount: '1100' },
  { id: 'pt8VYOfr8To', title: 'Meditation Before Exams', channelTitle: 'Calm Mind', channelId: 'ch13', thumbnail: 'https://i.ytimg.com/vi/pt8VYOfr8To/hq720.jpg', publishedAt: '2025-06-15T00:00:00Z', viewCount: '750000', likeCount: '52000', commentCount: '1600' },
  { id: 'bo_efYhYU2A', title: 'System Design in 60 Seconds', channelTitle: 'Code Quick', channelId: 'ch8', thumbnail: 'https://i.ytimg.com/vi/bo_efYhYU2A/hq720.jpg', publishedAt: '2025-05-03T00:00:00Z', viewCount: '1300000', likeCount: '89000', commentCount: '2700' },
];

function getMockShorts(maxResults = 12): YouTubeShort[] {
  const batch = mockCallCount++;
  // On first call return first slice, on subsequent calls return next slices with unique IDs
  const start = batch * maxResults;
  const pool = allMockShorts;
  const result: YouTubeShort[] = [];
  for (let i = 0; i < maxResults; i++) {
    const srcIdx = (start + i) % pool.length;
    const src = pool[srcIdx];
    // For items beyond the first cycle, give them unique IDs by appending batch number
    const uniqueId = start + i >= pool.length ? `${src.id}_${batch}_${i}` : src.id;
    result.push({ ...src, id: uniqueId });
  }
  return result;
}
