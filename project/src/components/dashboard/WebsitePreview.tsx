import { Globe, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WebsitePreviewProps {
  websiteInfo?: {
    title?: string;
    cta?: string;
    website_summary?: string;
    target_market_analysis?: string;
    preview_image?: string;
    favicon?: string;
  };
  productUrl: string;
  isLoading?: boolean;
}

export function WebsitePreview({ websiteInfo, productUrl, isLoading }: WebsitePreviewProps) {
  if (isLoading || !websiteInfo) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header with favicon and title */}
        <div className="flex items-start gap-3">
          {websiteInfo.favicon ? (
            <img 
              src={websiteInfo.favicon} 
              alt="Favicon" 
              className="w-10 h-10 rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {websiteInfo.title || "Website Analysis"}
            </h3>
            <a 
              href={productUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
            >
              {new URL(productUrl).hostname}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Preview Image */}
        {websiteInfo.preview_image && (
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={websiteInfo.preview_image} 
              alt="Website preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* CTA */}
        {websiteInfo.cta && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Badge variant="outline" className="mb-2 text-blue-700 border-blue-300">
              Call to Action
            </Badge>
            <p className="text-sm text-gray-700 leading-relaxed">
              {websiteInfo.cta}
            </p>
          </div>
        )}

        {/* Website Summary */}
        {websiteInfo.website_summary && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {websiteInfo.website_summary}
            </p>
          </div>
        )}

        {/* Target Market Analysis */}
        {websiteInfo.target_market_analysis && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Target Market</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {websiteInfo.target_market_analysis}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}


