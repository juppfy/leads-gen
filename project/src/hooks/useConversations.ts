import { useState, useEffect } from 'react';
import { Conversation } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useConversations(searchId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchId) {
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`${API_URL}/api/search/${searchId}/conversations`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        // Adapt backend shape (flat upvotes/comments) to frontend Conversation type
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({
          ...c,
          engagement: {
            upvotes: c.upvotes ?? c.engagement?.upvotes ?? 0,
            comments: c.comments ?? c.engagement?.comments ?? 0,
          },
        }));
        setConversations(mapped);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Poll every 3 seconds to get new conversations
    interval = setInterval(fetchConversations, 3000);

    return () => clearInterval(interval);
  }, [searchId]);

  return { conversations, loading, error };
}
