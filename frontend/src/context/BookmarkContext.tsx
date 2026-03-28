import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Video } from '../types';

interface BookmarkContextType {
  bookmarks: Video[];
  isBookmarked: (videoId: string) => boolean;
  toggleBookmark: (video: Video) => void;
  removeBookmark: (videoId: string) => void;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType>({
  bookmarks: [],
  isBookmarked: () => false,
  toggleBookmark: () => {},
  removeBookmark: () => {},
  clearBookmarks: () => {},
});

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('mentr-bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const persist = (items: Video[]) => {
    localStorage.setItem('mentr-bookmarks', JSON.stringify(items));
  };

  const isBookmarked = useCallback(
    (videoId: string) => bookmarks.some((b) => b.id === videoId),
    [bookmarks]
  );

  const toggleBookmark = useCallback((video: Video) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === video.id);
      const next = exists ? prev.filter((b) => b.id !== video.id) : [...prev, video];
      persist(next);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((videoId: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== videoId);
      persist(next);
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    localStorage.removeItem('mentr-bookmarks');
  }, []);

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, removeBookmark, clearBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
};
