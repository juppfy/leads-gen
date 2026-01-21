import { useState, useEffect } from 'react';
import { Search } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function usePaginatedSearchHistory(pageSize: number = 10) {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/search?limit=${pageSize}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch search history');
        }

        const data = await response.json();
        setSearches(data);
        setHasMore(data.length === pageSize);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [pageSize]);

  const loadMore = async () => {
    // TODO: Implement pagination with offset
    console.log('Load more not implemented yet');
  };

  return { searches, loading, error, hasMore, loadMore };
}
