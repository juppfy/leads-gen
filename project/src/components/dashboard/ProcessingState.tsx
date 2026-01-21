import { Loader2, Search, Brain, MessageSquare, CheckCircle2 } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";

interface ProcessingStateProps {
  searchId: string;
}

export function ProcessingState({ searchId }: ProcessingStateProps) {
  const { search, loading } = useSearch(searchId);

  if (loading || !search) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine step status based on search state
  const hasWebsiteInfo = search.websiteInfo && Object.keys(search.websiteInfo).length > 0;
  const hasKeywords = search.keywords && search.keywords.length > 0;
  const hasConversations = (search.resultsCount || 0) > 0;
  const isComplete = search.status === "complete";

  // Determine selected platforms
  const selectedPlatforms = Object.entries(search.platforms || {})
    .filter(([_, p]: any) => (p as any)?.selected)
    .map(([name]) => name);
  const onlyLinkedIn = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'linkedin';
  const onlyTwitter = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'twitter';

  const steps = [
    {
      icon: Search,
      title: "Analyzing your product",
      description: hasWebsiteInfo 
        ? `Analyzed: ${search.websiteInfo?.title || 'Product information extracted'}`
        : "Extracting key information from your website",
      status: hasWebsiteInfo ? "completed" : "active",
    },
    {
      icon: Brain,
      title: "Generating keywords",
      description: hasKeywords
        ? `Generated ${search.keywords.length} keywords`
        : "Creating relevant search terms using AI",
      status: hasKeywords ? "completed" : hasWebsiteInfo ? "active" : "pending",
    },
    {
      icon: MessageSquare,
      title: "Finding conversations",
      description: hasConversations
        ? `Found ${search.resultsCount} conversation${search.resultsCount !== 1 ? 's' : ''} so far...`
        : onlyLinkedIn
          ? "Searching LinkedIn posts"
          : onlyTwitter
            ? "Searching X (Twitter) posts"
            : "Searching across selected platforms",
      status: isComplete ? "completed" : hasKeywords ? "active" : "pending",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Finding Your Leads
        </h2>
        <p className="text-sm text-gray-600">
          Analyzing and searching...
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex-1">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isCompleted = step.status === "completed";
            const isPending = step.status === "pending";

            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isActive ? "bg-primary text-white" : ""}
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${isPending ? "bg-gray-100 text-gray-400" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isActive ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3
                    className={`
                      text-lg font-semibold mb-1
                      ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}
                    `}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`
                      text-sm
                      ${isActive || isCompleted ? "text-gray-600" : "text-gray-400"}
                    `}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          Estimated time: <strong>1-2 minutes</strong>
        </p>
      </div>
    </div>
  );
}


