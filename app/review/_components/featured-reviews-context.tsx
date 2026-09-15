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
  return (
    <FeaturedReviewsContext.Provider
      value={{ featuredReviews, refreshFeatured }}
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
