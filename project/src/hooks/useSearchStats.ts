import { useEffect, useState } from "react";

type RecentSearch = {
  id: string;
  productUrl: string;
  createdAt: any;
  resultsCount: number;
};

type SearchStats = {
  totalSearches: number;
  activeSearches: number;
  totalLeads: number;
  searchesThisMonth: number;
  recent: RecentSearch[];
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useSearchStats() {
  const [stats, setStats] = useState<SearchStats>({
    totalSearches: 0,
    activeSearches: 0,
    totalLeads: 0,
    searchesThisMonth: 0,
    recent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/search/stats`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          totalSearches: data.totalSearches ?? 0,
          activeSearches: data.activeSearches ?? 0,
          totalLeads: data.totalLeads ?? 0,
          searchesThisMonth: data.searchesThisMonth ?? 0,
          recent: Array.isArray(data.recent) ? data.recent : [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
