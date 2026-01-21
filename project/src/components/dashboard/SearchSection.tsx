import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Platform } from "@/types";

interface SearchSectionProps {
  onSearch: (url: string, platforms: Platform[]) => void;
  onViewHistory?: () => void;
}

import { useSearchStats } from "@/hooks/useSearchStats";

export function SearchSection({ onSearch, onViewHistory }: SearchSectionProps) {
  const [url, setUrl] = useState("");
  // Only Reddit for v1.0 open-source launch
  const selectedPlatforms: Platform[] = ["reddit"];
  const { toast } = useToast();

  const normalizeUrl = (urlString: string): string => {
    // Trim whitespace
    let normalized = urlString.trim();
    
    // If no protocol, add https://
    if (!normalized.match(/^[a-zA-Z]+:\/\//)) {
      normalized = `https://${normalized}`;
    }
    
    return normalized;
  };

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize the URL (add https:// if missing)
    const normalizedUrl = normalizeUrl(url);
    
    if (!isValidUrl(normalizedUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., example.com or https://example.com)",
        variant: "destructive",
      });
      return;
    }

    // Update the input field with normalized URL
    setUrl(normalizedUrl);
    
    // Send normalized URL to search with selected platforms
    onSearch(normalizedUrl, selectedPlatforms);
  };

  const { stats, loading } = useSearchStats();

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Reddit Leads
        </h1>
        <p className="text-gray-600">
          Paste your product URL and we will surface the most relevant Reddit conversations.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product-url" className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <div className="flex gap-3">
              <Input
                id="product-url"
                type="text"
                placeholder="yourproduct.com or https://yourproduct.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-12 text-base"
                required
              />
              <Button type="submit" size="lg" className="gap-2">
                Find Leads
                <img
                  src="https://cdn.brandfetch.io/idkKwm0IT0/theme/dark/id_jo7Lzsf.svg?c=1bxid64Mup7aczewSAYMX&t=1768324733367"
                  alt="Reddit"
                  className="w-5 h-5"
                />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            We'll analyze your product and find Reddit conversations where people are looking for solutions like yours
          </p>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Searches</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.totalSearches}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Leads Found</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.totalLeads}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Searches This Month</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.searchesThisMonth}</div>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="grid grid-cols-1 gap-4 items-stretch">
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
            {onViewHistory && (
              <Button variant="outline" size="sm" onClick={() => onViewHistory?.()}>
                View all Searches
              </Button>
            )}
          </div>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-gray-500">No recent searches.</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[280px]">{search.productUrl}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(search.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary whitespace-nowrap">
                    {search.resultsCount} leads
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

