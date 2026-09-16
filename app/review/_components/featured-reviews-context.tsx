'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

export type FeaturedReview = {
  id: number;
  name: string;
  country: string;
  productType: string;
  location: string;
  directorLabel: string | null;
  content: string;
  shootingDate: string;
};

type FeaturedReviewsContextValue = {
  featuredReviews: FeaturedReview[];
  refreshFeatured: () => Promise<void>;
  applyOptimisticFeatured: (
    added: FeaturedReview[],
    removedIds: number[],
  ) => void;
};

const FeaturedReviewsContext =
  createContext<FeaturedReviewsContextValue | null>(null);

export function FeaturedReviewsProvider({
  initialFeatured,
  children,
}: {
  initialFeatured: FeaturedReview[];
  children: ReactNode;
}) {
  const [featuredReviews, setFeaturedReviews] =
    useState<FeaturedReview[]>(initialFeatured);
  async function refreshFeatured() {
    const res = await fetch('/api/reviews/featured');
    if (res.ok) setFeaturedReviews(await res.json());
  }
  function applyOptimisticFeatured(
    added: FeaturedReview[],
    removedIds: number[],
  ) {
    setFeaturedReviews((prev) => {
      const removedSet = new Set(removedIds);
      const kept = prev.filter((r) => !removedSet.has(r.id));
      const addedFiltered = added.filter(
        (r) => !kept.some((k) => k.id === r.id),
      );
      return [...addedFiltered, ...kept].slice(0, 4);
    });
  }
  return (
    <FeaturedReviewsContext.Provider
      value={{ featuredReviews, refreshFeatured, applyOptimisticFeatured }}
    >
      {children}
    </FeaturedReviewsContext.Provider>
  );
}

export function useFeaturedReviews() {
  const ctx = useContext(FeaturedReviewsContext);
  if (!ctx) {
    throw new Error(
      'useFeaturedReviews must be used within FeaturedReviewsProvider',
    );
  }
  return ctx;
}
