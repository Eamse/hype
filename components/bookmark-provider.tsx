'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

type BookmarkContextValue = {
  bookmarkedIds: Set<number>;
  toggleBookmark: (productId: number) => Promise<void>;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!session) {
      setBookmarkedIds(new Set());
      return;
    }
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookmarkedIds(
            new Set(data.map((b: { productId: number }) => b.productId)),
          );
        }
      });
  }, [session]);

  const toggleBookmark = useCallback(async (productId: number) => {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (data.bookmarked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error('useBookmarks must be used within BookmarkProvider');
  }
  return ctx;
}
