import { useState, useEffect } from 'react';
import { Search } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useSearch(searchId: string | null) {
  const [search, setSearch] = useState<Search | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchId) {
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchSearch = async () => {
      try {
        const response = await fetch(`${API_URL}/api/search/${searchId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch search');
        }

        const data = await response.json();
        setSearch(data);
        setError(null);

        // Stop polling if search is completed or failed
        if (data.status === 'complete' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();

    // Poll every 2 seconds while search is active
    interval = setInterval(fetchSearch, 2000);

    return () => clearInterval(interval);
  }, [searchId]);

  return { search, loading, error };
}
