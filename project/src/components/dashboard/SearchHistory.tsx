import { ExternalLink, Clock, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useToast } from "@/hooks/use-toast";

interface SearchHistoryProps {
  onViewResults: (searchId: string, status?: string) => void;
}

const isCompleted = (status: string) => status === "complete" || status === "completed";
const isProcessing = (status: string) => status === "searching" || status === "analyzing" || status === "pending";

export function SearchHistory({ onViewResults }: SearchHistoryProps) {
  const { searches, loading, deleteSearch: removeSearch } = useSearchHistory();
  const { toast } = useToast();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "searching":
        return <Badge className="bg-blue-500">Searching</Badge>;
      case "analyzing":
        return <Badge className="bg-purple-500">Analyzing</Badge>;
      case "pending":
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDelete = async (searchId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this search and all its associated conversations?"
    );
    if (!confirmed) return;

    try {
      await removeSearch(searchId);
      toast({
        title: "Search deleted",
        description: "The search has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search History
        </h1>
        <p className="text-gray-600">
          View and manage your previous searches
        </p>
      </div>

      {/* Searches List */}
      {searches.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No searches yet
            </h3>
            <p className="text-gray-600">
              Start by entering your product URL to find relevant conversations
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
          <div
            key={search.id}
            onClick={() => onViewResults(search.id, search.status)}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {search.productUrl}
                      </h3>
                      {getStatusBadge(search.status)}
                    </div>
                    
                    {search.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {search.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(search.createdAt)}
                      </div>
                      {isCompleted(search.status) && (
                        <span>
                          <strong className="text-gray-900">{search.resultsCount}</strong> leads found
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted(search.status) && (
                      <Button
                        onClick={() => onViewResults(search.id, search.status)}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        View Results
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    {isProcessing(search.status) && (
                      <Button
                        onClick={() => onViewResults(search.id, search.status)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        View Progress
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(search.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {search.status === "failed" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    This search failed to complete. Please try again.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

