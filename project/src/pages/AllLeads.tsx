import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Filter,
  ExternalLink,
  Loader2,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Conversation } from "@/types";

type SortOption = "keyword-order" | "date-desc" | "date-asc";
type FilterOption = "all" | string; // "all" or specific keyword

export default function AllLeads() {
  const { searchId } = useParams<{ searchId: string }>();
  const navigate = useNavigate();
  const { search, loading: searchLoading } = useSearch(searchId || null);
  const { conversations, loading: conversationsLoading } = useConversations(searchId || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("keyword-order");
  const [filterKeyword, setFilterKeyword] = useState<FilterOption>("all");

  const redditLogoLight =
    "https://cdn.brandfetch.io/idkKwm0IT0/w/800/h/164/theme/light/logo.webp?c=1bxid64Mup7aczewSAYMX&t=1721371498208";

  const normalizeKeywordLabel = (raw: string | null | undefined) => {
    if (!raw) return null;
    const s = String(raw).trim();
    // Accept formats like: "keyword group 3", "keyword_group_3", "keywordGroup3", "Group 3"
    const m =
      s.match(/keyword\s*group\s*(\d+)/i) ||
      s.match(/keyword[_\s-]*group[_\s-]*(\d+)/i) ||
      s.match(/\bgroup\s*(\d+)\b/i);
    if (m?.[1]) {
      const idx = Number(m[1]);
      if (Number.isFinite(idx) && idx >= 1 && search?.keywords?.[idx - 1]) {
        return search.keywords[idx - 1];
      }
      return `Keyword ${idx}`;
    }
    return s;
  };

  const getConversationKeyword = (conv: Conversation) => {
    // If keyword is missing (e.g. final batch), don't show a fake group label.
    return normalizeKeywordLabel((conv as any).keyword) || null;
  };

  // Get unique keywords from conversations for filtering
  const uniqueKeywords = useMemo(() => {
    const keywords = new Set<string>();
    conversations.forEach(conv => {
      const k = getConversationKeyword(conv);
      if (k) keywords.add(k);
    });
    return Array.from(keywords);
  }, [conversations, search]);

  // Organize conversations by keyword order
  const conversationsByKeyword = useMemo(() => {
    const grouped: { [key: string]: Conversation[] } = {};
    
    conversations.forEach(conv => {
      const keyword = getConversationKeyword(conv) || "Other";
      if (!grouped[keyword]) {
        grouped[keyword] = [];
      }
      grouped[keyword].push(conv);
    });

    return grouped;
  }, [conversations, search]);

  // Filter and sort conversations
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by keyword
    if (filterKeyword !== "all") {
      filtered = filtered.filter(conv => getConversationKeyword(conv) === filterKeyword);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(query) ||
        conv.excerpt.toLowerCase().includes(query) ||
        conv.keyword?.toLowerCase().includes(query) ||
        conv.subreddit?.toLowerCase().includes(query)
      );
    }

    // Sort conversations
    const sorted = [...filtered];
    switch (sortBy) {
      case "date-desc":
        sorted.sort((a, b) => {
          const dateA = a.postedAt?.toDate?.() || new Date(0);
          const dateB = b.postedAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "date-asc":
        sorted.sort((a, b) => {
          const dateA = a.postedAt?.toDate?.() || new Date(0);
          const dateB = b.postedAt?.toDate?.() || new Date(0);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "keyword-order":
        // Sort by keyword order (as they appear in search.keywords)
        if (search?.keywords) {
          sorted.sort((a, b) => {
            const ka = getConversationKeyword(a) || "";
            const kb = getConversationKeyword(b) || "";
            const indexA = search.keywords.indexOf(ka);
            const indexB = search.keywords.indexOf(kb);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
        }
        break;
    }

    return sorted;
  }, [conversations, searchQuery, sortBy, filterKeyword, search]);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (searchLoading || !search) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="font-semibold text-gray-900 text-lg">All Conversations</h1>
                <p className="text-sm text-gray-500">{search.productUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span><strong>{filteredAndSortedConversations.length}</strong> of <strong>{conversations.length}</strong> conversations</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations, keywords, or subreddits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Keyword Filter */}
            <Select value={filterKeyword} onValueChange={setFilterKeyword}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by keyword" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Keywords</SelectItem>
                {uniqueKeywords.map((keyword) => (
                  <SelectItem key={keyword} value={keyword}>
                    {keyword}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword-order">Keyword Order</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keywords Overview */}
          {search.keywords && search.keywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {search.keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant={filterKeyword === keyword ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setFilterKeyword(filterKeyword === keyword ? "all" : keyword)}
                >
                  <span className="text-xs mr-1">#{index + 1}</span>
                  {keyword}
                  {conversationsByKeyword[keyword] && (
                    <span className="ml-1 text-xs opacity-70">
                      ({conversationsByKeyword[keyword].length})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {conversationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredAndSortedConversations.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No conversations found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterKeyword !== "all"
                ? "Try adjusting your filters or search query"
                : "We couldn't find any relevant conversations for this product"}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <a
                        href={conversation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:underline">
                          {conversation.title}
                        </h3>
                      </a>
                      <p className="text-gray-600 leading-relaxed">
                        {conversation.excerpt}
                      </p>
                    </div>
                    {conversation.relevanceScore && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium shrink-0">
                        <TrendingUp className="w-4 h-4" />
                        {conversation.relevanceScore}%
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center flex-wrap gap-3 text-sm">
                    {String((conversation as any).platform || "").toLowerCase() === "reddit" ? (
                      <img 
                        src={redditLogoLight}
                        alt="Reddit" 
                        className="h-5 w-auto object-contain"
                      />
                    ) : (
                      <Badge className="capitalize">
                        {String((conversation as any).platform || "").toLowerCase()}
                      </Badge>
                    )}
                      {getConversationKeyword(conversation) && (
                        <Badge variant="outline" className="bg-primary/5">
                          {getConversationKeyword(conversation)}
                        </Badge>
                      )}
                      {conversation.subreddit && (
                        <span className="text-gray-600">r/{conversation.subreddit}</span>
                      )}
                      {conversation.assessment && (
                        <Badge
                          variant={conversation.assessment === 'relevant' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {conversation.assessment}
                        </Badge>
                      )}
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(conversation.postedAt)} ({formatTimeAgo(conversation.postedAt)})
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={conversation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          View on Reddit
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

