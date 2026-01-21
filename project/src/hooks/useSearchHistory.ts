import { useState, useEffect } from 'react';
import { Search } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useSearchHistory() {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/search`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch search history');
        }

        const data = await response.json();
        setSearches(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteSearch = async (searchId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/search/${searchId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete search');
      }

      setSearches(searches.filter(s => s.id !== searchId));
    } catch (error) {
      console.error('Error deleting search:', error);
      throw error;
    }
  };

  return { searches, loading, error, deleteSearch };
}
