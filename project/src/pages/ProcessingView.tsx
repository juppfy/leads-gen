import { useParams, useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useConversations } from "@/hooks/useConversations";
import { ProcessingState } from "@/components/dashboard/ProcessingState";
import { WebsitePreview } from "@/components/dashboard/WebsitePreview";
import { KeywordsDisplay } from "@/components/dashboard/KeywordsDisplay";
import { LiveConversations } from "@/components/dashboard/LiveConversations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProcessingView() {
  const { searchId } = useParams<{ searchId: string }>();
  const navigate = useNavigate();
  const { search, loading: searchLoading } = useSearch(searchId || null);
  const { conversations } = useConversations(searchId || null);
  const { toast } = useToast();
  const [hasShownToast, setHasShownToast] = useState(false);

  // Show success toast when complete (don't auto-redirect)
  useEffect(() => {
    if (search && search.status === "complete" && !hasShownToast) {
      setHasShownToast(true);
      toast({
        title: "✅ Search Complete!",
        description: "All Reddit posts have been found. Click to view full results.",
        duration: 8000,
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate(`/dashboard/${searchId}/allleads`)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            View All
          </Button>
        ),
      });
    }
  }, [search, searchId, navigate, toast, hasShownToast]);

  if (searchLoading || !search) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isComplete = search.status === "complete";
  const hasWebsiteInfo = search.websiteInfo && Object.keys(search.websiteInfo).length > 0;
  const hasKeywords = search.keywords && search.keywords.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="font-semibold text-gray-900">Finding Your Leads</h1>
                <p className="text-sm text-gray-500">{search.productUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Grid Layout */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Column: Progress State or Success (25%) - Distinct Background */}
          <div className="lg:col-span-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4">
            {isComplete ? (
              <Card className="p-6 h-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Search Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Found {conversations.length} relevant Reddit posts
                </p>
                <Button 
                  onClick={() => navigate(`/dashboard/${searchId}/allleads`)}
                  size="lg"
                  className="gap-2 w-full"
                >
                  <Eye className="w-5 h-5" />
                  View All Results
                </Button>
              </Card>
            ) : (
              <ProcessingState searchId={searchId!} />
            )}
          </div>

          {/* Middle Column: Website Info + Keywords (35%) */}
          <div className="lg:col-span-4 space-y-6 overflow-y-auto">
            {/* Website Preview */}
            <WebsitePreview 
              websiteInfo={search.websiteInfo}
              productUrl={search.productUrl}
              isLoading={!hasWebsiteInfo}
            />

            {/* Keywords Display */}
            <KeywordsDisplay 
              keywords={search.keywords || []}
              isLoading={!hasKeywords}
            />
          </div>

          {/* Right Column: Reddit Posts (40%) */}
          <div className="lg:col-span-5 h-full">
            <LiveConversations 
              conversations={conversations}
              isComplete={isComplete}
              searchId={searchId!}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

