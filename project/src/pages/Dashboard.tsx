import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SearchSection } from "@/components/dashboard/SearchSection";
import { ProcessingState } from "@/components/dashboard/ProcessingState";
import { ResultsView } from "@/components/dashboard/ResultsView";
import { SearchHistory } from "@/components/dashboard/SearchHistory";
import { sendSearchToN8n } from "@/services/searchService";
import { useSearch } from "@/hooks/useSearch";
import { useToast } from "@/hooks/use-toast";
import { Platform } from "@/types";
import { AuthModal } from "@/components/auth/AuthModal";

type DashboardView = "search" | "processing" | "results" | "history";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<DashboardView>("search");
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<{ url: string; platforms: Platform[] } | null>(null);
  const { toast } = useToast();

  const urlFromParams = searchParams.get("url");

  // Listen to current search for real-time updates
  const { search } = useSearch(currentSearchId);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (urlFromParams && user) {
      // Auto-trigger search from landing page (Reddit-only open source v1)
      // Clear URL param to prevent re-triggering.
      setSearchParams({});

      // Kick off the search immediately using the only supported platform.
      // This ensures the n8n flow starts right after auth.
      handleNewSearch(urlFromParams, ["reddit"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFromParams, user]);

  // Auto-switch to results view when search completes
  useEffect(() => {
    if (search && search.status === "complete") {
      setCurrentView("results");
    } else if (search && search.status === "failed") {
      toast({
        title: "Search Failed",
        description: search.errorMessage || "Failed to process your search. Please try again.",
        variant: "destructive",
      });
      setCurrentView("search");
    }
  }, [search, toast]);

  const handleNewSearch = async (url: string, platforms: Platform[]) => {
    try {
      if (!user) {
        setPendingSearch({ url, platforms });
        setShowAuthModal(true);
        return;
      }

      const searchId = await sendSearchToN8n(url, platforms);
      
      const platformNames = platforms.map(p => 
        p === 'twitter' ? 'X/Twitter' : p.charAt(0).toUpperCase() + p.slice(1)
      ).join(', ');
      
      toast({
        title: "Search Started",
        description: `Analyzing your product and finding leads on ${platformNames}...`,
      });

      // Navigate to the new ProcessingView page
      navigate(`/dashboard/${searchId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start search",
        variant: "destructive",
      });
    }
  };

  const handleViewResults = (searchId: string, status?: string) => {
    // Navigate based on search status
    if (status && (status === "searching" || status === "analyzing" || status === "pending")) {
      navigate(`/dashboard/${searchId}`);
    } else {
      navigate(`/dashboard/${searchId}/allleads`);
    }
  };

  const handleBackToSearch = () => {
    setCurrentView("search");
    setCurrentSearchId(null);
  };

  const handleViewHistory = () => {
    setCurrentView("history");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onViewSearch={handleBackToSearch}
        onViewHistory={handleViewHistory}
        currentView={currentView}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {currentView === "search" && (
            <SearchSection onSearch={handleNewSearch} onViewHistory={handleViewHistory} />
          )}
          
          {currentView === "processing" && currentSearchId && (
            <ProcessingState searchId={currentSearchId} />
          )}
          
          {currentView === "results" && currentSearchId && (
            <ResultsView
              searchId={currentSearchId}
              onBackToSearch={handleBackToSearch}
            />
          )}
          
          {currentView === "history" && (
            <SearchHistory onViewResults={handleViewResults} />
          )}
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={async () => {
          setShowAuthModal(false);
          if (pendingSearch) {
            const { url, platforms } = pendingSearch;
            setPendingSearch(null);
            await handleNewSearch(url, platforms);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;

