import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Conversation } from "@/types";
import { useNavigate } from "react-router-dom";

// Platform logos (horizontal variants)
import redditLogo from "../../../media_assets/social_platforms/reddit_horizontal.png";
import linkedinLogo from "../../../media_assets/social_platforms/linkedin_horizontal.png";
import twitterLogo from "../../../media_assets/social_platforms/x_twitter.png";

interface LiveConversationsProps {
  conversations: Conversation[];
  isComplete: boolean;
  searchId: string;
}

const CONVERSATIONS_PER_PAGE = 4;
const MAX_BODY_LENGTH = 150; // Characters to show in excerpt

export function LiveConversations({ conversations, isComplete, searchId }: LiveConversationsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Sort conversations by foundAt (first arrivals first)
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.foundAt?.toMillis?.() || 0;
    const timeB = b.foundAt?.toMillis?.() || 0;
    return timeA - timeB; // Ascending order (earliest first)
  });

  // Reset to page 1 when new conversations arrive
  useEffect(() => {
    const totalPages = Math.ceil(sortedConversations.length / CONVERSATIONS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedConversations.length, currentPage]);

  const totalPages = Math.ceil(sortedConversations.length / CONVERSATIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * CONVERSATIONS_PER_PAGE;
  const endIndex = startIndex + CONVERSATIONS_PER_PAGE;
  const currentConversations = sortedConversations.slice(startIndex, endIndex);

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

  const handleViewAll = () => {
    navigate(`/dashboard/${searchId}/allleads`);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card className="p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
            {currentConversations[0]?.platform === 'linkedin' ? (
              <img src={linkedinLogo} alt="LinkedIn" className="w-8 h-8 object-contain" />
            ) : currentConversations[0]?.platform === 'twitter' ? (
              <img src={twitterLogo} alt="X / Twitter" className="w-8 h-8 object-contain" />
            ) : (
              <img src={redditLogo} alt="Reddit" className="w-8 h-8 object-contain" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900">
            {currentConversations[0]?.platform === 'linkedin'
              ? 'LinkedIn Posts'
              : currentConversations[0]?.platform === 'twitter'
                ? 'X / Twitter Posts'
                : 'Reddit Posts'}
          </h3>
        </div>
        <Badge variant="secondary">
          {sortedConversations.length} found
        </Badge>
      </div>

      {/* Conversations List with Independent Scroll */}
      <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6 space-y-3">
        {currentConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {isComplete ? "No conversations found" : "Searching for conversations..."}
            </p>
          </div>
        ) : (
          currentConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-[180px] flex flex-col"
            >
              {/* Conversation Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">
                  {conversation.title}
                </h4>
                {conversation.keyword && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {truncateText(conversation.keyword, 20)}
                  </Badge>
                )}
              </div>

              {/* Conversation Body - Fixed Height */}
              <p className="text-sm text-gray-600 mb-3 flex-1 overflow-hidden">
                {truncateText(conversation.excerpt, MAX_BODY_LENGTH)}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs mt-auto">
                <div className="flex items-center gap-2 text-gray-500 flex-1 min-w-0">
                  {conversation.platform === 'reddit' && (
                    <img src={redditLogo} alt="Reddit" className="h-4 w-auto" />
                  )}
                  {conversation.platform === 'linkedin' && (
                    <img src={linkedinLogo} alt="LinkedIn" className="h-4 w-auto" />
                  )}
                  {conversation.platform === 'twitter' && (
                    <img src={twitterLogo} alt="X / Twitter" className="h-4 w-auto" />
                  )}
                  {conversation.subreddit && (
                    <span className="truncate">r/{conversation.subreddit}</span>
                  )}
                  <span className="shrink-0">{formatTimeAgo(conversation.postedAt)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs gap-1 shrink-0"
                  asChild
                >
                  <a
                    href={conversation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>

              {/* Assessment Badge if available */}
              {conversation.assessment && (
                <div className="mt-2 pt-2 border-t">
                  <Badge 
                    variant={conversation.assessment === 'relevant' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {conversation.assessment}
                  </Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer with Pagination and View All Button */}
      <div className="mt-4 pt-4 border-t flex-shrink-0 space-y-3">
        {/* Always show pagination and View All if more than 4 conversations */}
        {sortedConversations.length > CONVERSATIONS_PER_PAGE && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[80px] text-center">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleViewAll} 
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                View All ({sortedConversations.length})
              </Button>
            </div>
          </>
        )}

        {/* View All button when complete (if <= 4 posts) */}
        {isComplete && sortedConversations.length > 0 && sortedConversations.length <= CONVERSATIONS_PER_PAGE && (
          <Button 
            onClick={handleViewAll} 
            className="w-full gap-2"
            size="lg"
          >
            <Eye className="w-4 h-4" />
            View All Posts ({sortedConversations.length})
          </Button>
        )}
      </div>
    </Card>
  );
}

