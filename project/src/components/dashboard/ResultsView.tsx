import { ArrowLeft, ExternalLink, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/hooks/useSearch";
import { useConversations } from "@/hooks/useConversations";

interface ResultsViewProps {
  searchId: string;
  onBackToSearch: () => void;
}

export function ResultsView({ searchId, onBackToSearch }: ResultsViewProps) {
  const { search, loading: searchLoading } = useSearch(searchId);
  const { conversations, loading: conversationsLoading } = useConversations(searchId);

  if (searchLoading || !search) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={onBackToSearch}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <p className="text-gray-600">{search.productUrl}</p>
            </div>

            {search.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {search.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 text-sm text-gray-600 pt-2 border-t">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>
                  <strong className="text-gray-900">{search.resultsCount}</strong> conversations found
                </span>
              </div>
              <div>
                {formatTimeAgo(search.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations */}
      {conversationsLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No conversations found
          </h3>
          <p className="text-gray-600">
            We couldn't find any relevant conversations for this product. Try another search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {conversation.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {conversation.excerpt}
                    </p>
                  </div>
                  {conversation.relevanceScore && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {conversation.relevanceScore}%
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className="capitalize">
                      {conversation.platform}
                    </Badge>
                    {conversation.subreddit && (
                      <span className="text-gray-600">r/{conversation.subreddit}</span>
                    )}
                    {conversation.author && (
                      <span className="text-gray-400">by {conversation.author}</span>
                    )}
                    <span className="text-gray-400">{formatTimeAgo(conversation.postedAt)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>↑ {conversation.engagement.upvotes}</span>
                      <span>💬 {conversation.engagement.comments}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={conversation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        View on {conversation.platform}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

